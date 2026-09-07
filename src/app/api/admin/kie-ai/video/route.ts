import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, authErrorResponse } from "@/lib/auth/guard";
import { createVideoTask, isKieAiConfigured, kieAiErrorResponse } from "@/lib/ai/kie-ai";

const bodySchema = z.object({
  prompt: z.string().min(1, "prompt es requerido").max(4000),
  // `model` es obligatorio en el endpoint Veo de Kie.ai → se envía siempre
  // (por defecto "veo3_fast"). `aspect_ratio` es opcional, por defecto "16:9".
  model: z.string().optional(),
  aspect_ratio: z.string().optional(),
});

// POST /api/admin/kie-ai/video
// Inicia una tarea asíncrona de generación de video (endpoint Veo) en Kie.ai.
// Body: { prompt, model?, aspect_ratio? } — `model` por defecto "veo3_fast",
// `aspect_ratio` por defecto "16:9".
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

  try {
    const task = await createVideoTask({
      prompt: parsed.data.prompt,
      model: parsed.data.model ?? "veo3_fast",
      aspect_ratio: parsed.data.aspect_ratio ?? "16:9",
    });
    return NextResponse.json({ taskId: task.taskId });
  } catch (err) {
    try {
      return kieAiErrorResponse(err);
    } catch {
      console.error("[POST /api/admin/kie-ai/video]", err);
      return NextResponse.json(
        { error: "No se pudo iniciar la generación de video" },
        { status: 500 }
      );
    }
  }
}
