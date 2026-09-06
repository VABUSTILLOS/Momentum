import { NextResponse } from "next/server";

/**
 * Cliente genérico de Kie.ai (https://docs.kie.ai/).
 *
 * Kie.ai es un agregador de modelos (imagen, video, música y LLM) detrás de una
 * sola API key. Los endpoints de generación (imagen/video/música) son
 * ASÍNCRONOS: la llamada de creación regresa un `taskId` y el resultado se
 * obtiene haciendo polling a `GET /api/v1/jobs/recordInfo?taskId=...` (o vía
 * webhook). Las llamadas de chat (LLM) son síncronas y compatibles con OpenAI.
 *
 * Este módulo es el "piloto" reutilizable de Kie.ai (adaptado del PR #14 de
 * hustlealliance) — ver KIE_AI_PILOT.md. Solo usa `fetch` nativo: cero
 * dependencias nuevas. Úsalo únicamente desde código de servidor (route
 * handlers / server components), nunca expongas la API key al cliente.
 */

const KIE_AI_BASE_URL = "https://api.kie.ai";

export class KieAiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "KieAiError";
  }
}

/** Verdadero cuando KIE_AI_API_KEY está configurada. Revísalo antes de llamar al cliente para fallar rápido. */
export function isKieAiConfigured(): boolean {
  return !!process.env.KIE_AI_API_KEY;
}

function getApiKey(): string {
  const key = process.env.KIE_AI_API_KEY;
  if (!key) {
    throw new KieAiError(
      "KIE_AI_API_KEY no está configurada. Agrega tu key en .env (ver .env.example / KIE_AI_PILOT.md).",
      500
    );
  }
  return key;
}

/** Wrapper de fetch: agrega auth + JSON headers, parsea la respuesta y lanza KieAiError en fallos. */
async function kieFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = getApiKey();
  const res = await fetch(`${KIE_AI_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    // Los endpoints de generación/status nunca deben cachearse por el fetch de Next.js.
    cache: "no-store",
  });

  const text = await res.text();
  let json: unknown = undefined;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (!res.ok) {
    const message =
      (json &&
      typeof json === "object" &&
      "message" in json &&
      typeof (json as { message?: unknown }).message === "string"
        ? (json as { message: string }).message
        : null) || `Kie.ai respondió con el status ${res.status}`;
    throw new KieAiError(message, res.status, json);
  }

  return json as T;
}

// ─── Modelos ──────────────────────────────────────────────────────────────

export interface KieAiModel {
  id: string;
  name?: string;
  type?: string;
  [key: string]: unknown;
}

/** GET /api/v1/models — lista los modelos disponibles (imagen/video/música/LLM). */
export async function listModels(): Promise<KieAiModel[]> {
  const data = await kieFetch<{ data?: KieAiModel[]; models?: KieAiModel[] }>("/api/v1/models");
  return data.data ?? data.models ?? [];
}

// ─── Tareas de generación asíncronas (imagen / video / música) ─────────────

export interface CreateTaskResponse {
  taskId: string;
  [key: string]: unknown;
}

/**
 * Inicia una tarea de generación asíncrona en el endpoint del modelo indicado
 * (p. ej. un endpoint de imagen, video o música documentado en docs.kie.ai).
 * Regresa el `taskId` para hacer polling a `recordInfo`.
 */
export async function createGenerationTask(
  modelPath: string,
  input: Record<string, unknown>
): Promise<CreateTaskResponse> {
  const data = await kieFetch<{ data?: CreateTaskResponse; taskId?: string }>(modelPath, {
    method: "POST",
    body: JSON.stringify(input),
  });
  const taskId = data.taskId ?? data.data?.taskId;
  if (!taskId) {
    throw new KieAiError("Kie.ai no devolvió un taskId en la respuesta", 502, data);
  }
  return { ...data.data, taskId };
}

/** Inicia una tarea de generación de imagen. `modelPath` por defecto: endpoint general de imagen. */
export function createImageTask(
  input: { prompt: string; model?: string; [key: string]: unknown },
  modelPath = "/api/v1/gpt4o-image/generate"
) {
  return createGenerationTask(modelPath, input);
}

/** Inicia una tarea de generación de video. `modelPath` por defecto: endpoint general de video. */
export function createVideoTask(
  input: { prompt: string; model?: string; [key: string]: unknown },
  modelPath = "/api/v1/veo/generate"
) {
  return createGenerationTask(modelPath, input);
}

/** Inicia una tarea de generación de música. `modelPath` por defecto: endpoint general de música. */
export function createMusicTask(
  input: { prompt: string; model?: string; [key: string]: unknown },
  modelPath = "/api/v1/suno/generate"
) {
  return createGenerationTask(modelPath, input);
}

export type KieAiTaskState = "waiting" | "queuing" | "generating" | "success" | "fail" | string;

export interface KieAiTaskRecord {
  taskId: string;
  state: KieAiTaskState;
  resultJson?: string;
  failMsg?: string;
  [key: string]: unknown;
}

/** GET /api/v1/jobs/recordInfo?taskId=... — estado/resultado actual de una tarea asíncrona. */
export async function getTaskStatus(taskId: string): Promise<KieAiTaskRecord> {
  const data = await kieFetch<{ data?: KieAiTaskRecord } & Partial<KieAiTaskRecord>>(
    `/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`
  );
  return (data.data ?? data) as KieAiTaskRecord;
}

const TERMINAL_STATES = new Set(["success", "fail", "completed", "failed"]);

/**
 * Hace polling a `recordInfo` hasta que la tarea llega a un estado terminal o
 * se agota el timeout. Prefiere webhooks en producción para tareas largas
 * (video/música); este helper es útil para demos/pilotos de corta duración.
 */
export async function pollTaskUntilComplete(
  taskId: string,
  options: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<KieAiTaskRecord> {
  const { intervalMs = 3000, timeoutMs = 120_000 } = options;
  const start = Date.now();

  for (;;) {
    const record = await getTaskStatus(taskId);
    if (TERMINAL_STATES.has(record.state)) {
      return record;
    }
    if (Date.now() - start >= timeoutMs) {
      throw new KieAiError(`Se agotó el tiempo esperando la tarea ${taskId} de Kie.ai`, 504, record);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

// ─── LLM / chat (síncrono, compatible con OpenAI) ──────────────────────────

export interface KieAiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface KieAiChatResult {
  content: string;
  raw: unknown;
}

/** POST /api/v1/chat/completions — llamada síncrona compatible con chat completions de OpenAI. */
export async function chatCompletion(params: {
  model: string;
  messages: KieAiChatMessage[];
  temperature?: number;
}): Promise<KieAiChatResult> {
  const data = await kieFetch<{
    choices?: { message?: { content?: string } }[];
  }>("/api/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify(params),
  });
  const content = data.choices?.[0]?.message?.content ?? "";
  return { content, raw: data };
}

// ─── Helpers para route handlers ────────────────────────────────────────────

/**
 * Convierte un KieAiError (o el caso "no configurada") en un NextResponse con
 * la forma estándar `{ error }` del repo; relanza cualquier otra cosa.
 * Uso en handlers:
 *   try { ... } catch (err) { return kieAiErrorResponse(err); }
 */
export function kieAiErrorResponse(err: unknown): NextResponse {
  if (err instanceof KieAiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  throw err;
}
