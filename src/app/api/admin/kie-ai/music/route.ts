import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, authErrorResponse } from "@/lib/auth/guard";
import { createMusicTask, isKieAiConfigured, kieAiErrorResponse } from "@/lib/ai/kie-ai";

const bodySchema = z.object({
  prompt: z.string().min(1, "prompt es requerido").max(4000),
  // Body requerido por POST /api/v1/generate (música tipo Suno):
  // { prompt, customMode, instrumental, model, callBackUrl }. Este piloto llena
  // valores por defecto para `customMode`/`instrumental`/`model`; `callBackUrl`
  // es obligatoria y cae a la env KIEAI_CALLBACK_URL si no viene en el body.
  customMode: z.boolean().optional(),
  instrumental: z.boolean().optional(),
  model: z.enum(["V3_5", "V4", "V4_5", "V4_5PLUS", "V4_5ALL", "V5", "V5_5"]).optional(),
  callBackUrl: z.string().url().optional(),
});

// POST /api/admin/kie-ai/music
// Inicia una tarea asíncrona de generación de música (modelo tipo Suno) en
// Kie.ai. Body: { prompt, customMode?, instrumental?, model?, callBackUrl? }.
// Regresa { taskId }; haz polling a GET /api/admin/kie-ai/status?taskId=... por el resultado.
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  if (!isKieAiConfigured()) {
    return NextResponse.json(
      { error: "KIE_AI_API_KEY no está configurada. Ver .env.example / KIE_AI_PILOT.md." },
      { status: 500 }
    );
  }

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Cuerpo de petición inválido", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const callBackUrl = parsed.data.callBackUrl ?? process.env.KIEAI_CALLBACK_URL;
  if (!callBackUrl) {
    return NextResponse.json(
      {
        error:
          "callBackUrl es requerido para generar música en Kie.ai. Envíalo en el body o define KIEAI_CALLBACK_URL en el entorno (ver .env.example / KIE_AI_PILOT.md).",
      },
      { status: 400 }
    );
  }

  try {
    const task = await createMusicTask({
      prompt: parsed.data.prompt,
      customMode: parsed.data.customMode ?? false,
      instrumental: parsed.data.instrumental ?? false,
      model: parsed.data.model ?? "V4_5",
      callBackUrl,
    });
    return NextResponse.json({ taskId: task.taskId });
  } catch (err) {
    try {
      return kieAiErrorResponse(err);
    } catch {
      console.error("[POST /api/admin/kie-ai/music]", err);
      return NextResponse.json(
        { error: "No se pudo iniciar la generación de música" },
        { status: 500 }
      );
    }
  }
}
