import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, authErrorResponse } from "@/lib/auth/guard";
import { createImageTask, isKieAiConfigured, kieAiErrorResponse } from "@/lib/ai/kie-ai";

const bodySchema = z.object({
  prompt: z.string().min(1, "prompt es requerido").max(4000),
  // `size` es obligatorio en el endpoint 4o Image de Kie.ai; este piloto envía
  // "1:1" por defecto. `model` NO es parte del schema → no se envía.
  size: z.enum(["1:1", "3:2", "2:3"]).optional(),
});

// POST /api/admin/kie-ai/image
// Inicia una tarea asíncrona de generación de imagen (endpoint 4o Image) en
// Kie.ai. Body: { prompt, size? } — `size` por defecto "1:1".
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
    const task = await createImageTask({
      prompt: parsed.data.prompt,
      size: parsed.data.size ?? "1:1",
    });
    return NextResponse.json({ taskId: task.taskId });
  } catch (err) {
    try {
      return kieAiErrorResponse(err);
    } catch {
      console.error("[POST /api/admin/kie-ai/image]", err);
      return NextResponse.json(
        { error: "No se pudo iniciar la generación de imagen" },
        { status: 500 }
      );
    }
  }
}
