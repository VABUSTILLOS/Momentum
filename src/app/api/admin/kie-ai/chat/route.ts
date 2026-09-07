import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, authErrorResponse } from "@/lib/auth/guard";
import { chatCompletion, isKieAiConfigured, kieAiErrorResponse } from "@/lib/ai/kie-ai";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .min(1, "messages es requerido"),
  model: z.string().min(1, "model es requerido"),
  temperature: z.number().min(0).max(2).optional(),
});

// POST /api/admin/kie-ai/chat
// Llamada síncrona de LLM compatible con OpenAI vía Kie.ai. Body: { messages, model, temperature? }.
// Regresa { content }.
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
    const result = await chatCompletion(parsed.data);
    return NextResponse.json({ content: result.content });
  } catch (err) {
    try {
      return kieAiErrorResponse(err);
    } catch {
      console.error("[POST /api/admin/kie-ai/chat]", err);
      return NextResponse.json(
        { error: "No se pudo generar la respuesta del chat" },
        { status: 500 }
      );
    }
  }
}
