import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth/guard";
import { getTaskStatus, isKieAiConfigured, kieAiErrorResponse } from "@/lib/ai/kie-ai";

// GET /api/admin/kie-ai/status?taskId=...
// Consulta de estado (one-shot) de una tarea asíncrona de Kie.ai (imagen/video/
// música), compartida por las tres rutas de generación. Haz polling desde el
// cliente en lugar de bloquear una serverless function en toda la generación.
export async function GET(request: NextRequest) {
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

  const taskId = request.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "El query param taskId es requerido" }, { status: 400 });
  }

  try {
    const record = await getTaskStatus(taskId);
    return NextResponse.json(record);
  } catch (err) {
    try {
      return kieAiErrorResponse(err);
    } catch {
      console.error("[GET /api/admin/kie-ai/status]", err);
      return NextResponse.json(
        { error: "No se pudo consultar el estado de la tarea" },
        { status: 500 }
      );
    }
  }
}
