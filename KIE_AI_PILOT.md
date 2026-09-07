# Piloto de integración Kie.ai

Este repo incluye un **piloto** reutilizable de integración con [Kie.ai](https://docs.kie.ai/),
un agregador de modelos de IA (imagen, video, música y LLM/chat) detrás de una
**sola API key**. Adaptado del PR #14 de `VABUSTILLOS/hustlealliance` a la
estructura de Momentum (`src/`, auth con Supabase y rol `master_admin`).

## Cómo funciona

- **Base URL**: `https://api.kie.ai`
- **Auth**: cada petición envía `Authorization: Bearer <KIE_AI_API_KEY>` y
  `Content-Type: application/json`.
- **Imagen / video / música es asíncrono**: la llamada de creación regresa un
  `taskId`. Haz polling a `GET /api/v1/jobs/recordInfo?taskId=<id>` hasta que el
  estado (`state`) sea terminal (`success`/`fail`), o configura un webhook
  (`callBackUrl`) — la ruta de música exige uno.
- **LLM/chat es síncrono** y compatible con chat completions de OpenAI
  (`POST /v1/chat/completions`).

## Endpoints reales de Kie.ai usados por el piloto

| Operación | Endpoint | Body |
|---|---|---|
| Imagen (4o Image) | `POST /api/v1/gpt4o-image/generate` | `{ prompt, size }` — `size`: `1:1`\|`3:2`\|`2:3` |
| Video (Veo) | `POST /api/v1/veo/generate` | `{ prompt, model, aspect_ratio }` — p. ej. `veo3_fast`, `16:9` |
| Música (Suno) | `POST /api/v1/generate` | `{ prompt, customMode, instrumental, model, callBackUrl }` — `model`: `V3_5`\|`V4`\|`V4_5`\|`V4_5PLUS`\|`V4_5ALL`\|`V5`\|`V5_5` |
| Estado de tarea | `GET /api/v1/jobs/recordInfo?taskId=<id>` | — |
| Chat (LLM) | `POST /v1/chat/completions` | `{ model, messages }` (OpenAI-compatible) |

Notas:
- No hay un endpoint público para listar modelos (`GET /api/v1/models` → 404);
  los catálogos viven en [kie.ai/market](https://kie.ai/market) y el
  [playground](https://kie.ai/market) de cada modelo.
- El endpoint de chat es el único que NO lleva el prefijo `api` (`/v1/...`).
- Kie.ai devuelve los errores como `{ code, msg }` (los endpoints estilo OpenAI
  como `{ message }`); `kie-ai.ts` extrae ambos.

## Archivos

| Archivo | Propósito |
|---|---|
| `src/lib/ai/kie-ai.ts` | Cliente genérico server-only: `createImageTask`, `createVideoTask`, `createMusicTask`, `getTaskStatus`, `pollTaskUntilComplete`, `chatCompletion`, `isKieAiConfigured`, `KieAiError` y `kieAiErrorResponse`. Solo `fetch` nativo — cero dependencias nuevas. |
| `src/lib/auth/guard.ts` | `AuthError`, `requireAdmin()` (exige sesión con rol `master_admin`) y `authErrorResponse()`. |
| `src/app/api/admin/kie-ai/image/route.ts` | `POST` — inicia una tarea de generación de imagen (envía `size` `1:1` por defecto). |
| `src/app/api/admin/kie-ai/video/route.ts` | `POST` — inicia una tarea de generación de video (envía `model` `veo3_fast` y `aspect_ratio` `16:9` por defecto). |
| `src/app/api/admin/kie-ai/music/route.ts` | `POST` — inicia una tarea de generación de música (`callBackUrl` del body o `KIEAI_CALLBACK_URL`). |
| `src/app/api/admin/kie-ai/chat/route.ts` | `POST` — completación de chat (LLM) síncrona. |
| `src/app/api/admin/kie-ai/status/route.ts` | `GET` — consulta el estado/resultado de un `taskId` de cualquiera de las tres rutas de generación. |

Todas las rutas exigen un admin autenticado (`requireAdmin()`, rol
`master_admin` en la tabla `profiles`) porque esta es una superficie piloto/de
ejemplo, no una feature para usuarios finales.

> Nota sobre auth: Momentum protege sus páginas con middleware (Supabase SSR).
> Si faltan `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` — modo
> demo con datos mock — `requireAdmin()` se omite, igual que hace
> `src/middleware.ts`. En cualquier caso, la API key de Kie.ai **solo vive en el
> servidor** (variable de entorno) y nunca se expone al cliente.

## Setup

1. Consigue una API key en el dashboard de Kie.ai.
2. Agrega las variables a tu `.env.local` (nunca las subas al repo):
   ```
   KIE_AI_API_KEY=tu-kie-ai-key
   KIEAI_CALLBACK_URL=https://tu-app.example.com/api/webhooks/kie-ai
   ```
   Están documentadas (comentadas, sin valores reales) en `.env.example`.
   `KIEAI_CALLBACK_URL` es opcional si siempre envías `callBackUrl` en el body
   de la ruta de música.
3. Si `KIE_AI_API_KEY` falta, cada ruta regresa un `500` con un mensaje claro en
   lugar de fallar silenciosamente. Si la ruta de música no tiene `callBackUrl`
   (body ni env), regresa un `400` claro.

## Probar los endpoints

Debes estar autenticado como admin (`master_admin`) en el navegador y pasar tu
cookie de sesión, o probar con una sesión `fetch`/`curl` de admin. Los ejemplos
asumen un dev server local (`npm run dev`) y una cookie de admin válida en
`$COOKIE`.

**Generación de imagen** (`size` opcional, por defecto `1:1`):
```bash
curl -X POST http://localhost:3000/api/admin/kie-ai/image \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" \
  -d '{"prompt": "a cozy reading nook, watercolor style", "size": "1:1"}'
# => { "taskId": "..." }
```

**Generación de video** (`model`/`aspect_ratio` opcionales, por defecto
`veo3_fast`/`16:9`):
```bash
curl -X POST http://localhost:3000/api/admin/kie-ai/video \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" \
  -d '{"prompt": "a drone shot flying over a mountain lake", "model": "veo3_fast", "aspect_ratio": "16:9"}'
# => { "taskId": "..." }
```

**Generación de música** (`callBackUrl` requerida: body o env
`KIEAI_CALLBACK_URL`; `model` por defecto `V4_5`):
```bash
curl -X POST http://localhost:3000/api/admin/kie-ai/music \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" \
  -d '{"prompt": "upbeat lo-fi instrumental, 90 bpm", "customMode": false, "instrumental": true, "model": "V4_5", "callBackUrl": "https://tu-app.example.com/api/webhooks/kie-ai"}'
# => { "taskId": "..." }
```

**Consultar el resultado** (usa el `taskId` de cualquiera de las anteriores):
```bash
curl "http://localhost:3000/api/admin/kie-ai/status?taskId=<id>" -H "Cookie: $COOKIE"
# => { "taskId": "...", "state": "success", "resultJson": "...", "resultUrls": [...], ... }
```

**Chat (LLM síncrono):**
```bash
curl -X POST http://localhost:3000/api/admin/kie-ai/chat \
  -H "Content-Type: application/json" -H "Cookie: $COOKIE" \
  -d '{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Say hi in 5 words"}]}'
# => { "content": "..." }
```

Consulta [docs.kie.ai](https://docs.kie.ai/) para los paths/parámetros exactos
de cada modelo y [kie.ai/market](https://kie.ai/market) para el catálogo actual.
Los paths por defecto en `src/lib/ai/kie-ai.ts` ya apuntan a endpoints reales
validados; cada helper acepta un `modelPath` alternativo si quieres probar otro
modelo de la familia.

## Checklist para replicar en otro repo Next.js

1. Copia `src/lib/ai/kie-ai.ts` — tiene cero dependencias extra (`fetch` nativo;
   omite el import de `server-only` si ese paquete no es dependencia del repo).
2. Copia las cinco rutas de `src/app/api/admin/kie-ai/` (o donde ese repo tenga
   sus rutas admin), ajustando el guard de auth para que coincida con el repo
   (`requireAdmin`/`authErrorResponse`).
3. Agrega `KIE_AI_API_KEY` (comentada, sin valor) al `.env.example` del repo y
   el valor real a `.env` / secretos de deploy. Agrega también `KIEAI_CALLBACK_URL`
   si la ruta de música replicada la necesita.
4. Ajusta los esquemas zod y los defaults (`size`, `aspect_ratio`, `model`,
   `callBackUrl`) según el modelo de Kie.ai que ese repo use.
5. Nunca subas la API key real — solo viene del entorno.
