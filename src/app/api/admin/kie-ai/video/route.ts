import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, authErrorResponse } from "@/lib/auth/guard";
import { createVideoTask, isKieAiConfigured, kieAiErrorResponse } from "@/lib/ai/kie-ai";

const bodySchema = z.object({
  prompt: z.string().min(1, "prompt es requerido").max(4000),
  model: z.string().optional(),
});

// POST /api/admin/kie-ai/video
// Inicia una tarea asíncrona de generación de video en Kie.ai. Body: { prompt, model? }.
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
    const task = await createVideoTask(parsed.data);
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
