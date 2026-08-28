# Momentum — Todo para tu evento

Marketplace de proveedores para eventos + Panel de Administración del Proveedor (`/panel-proveedor`).

## Stack
- Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Framer Motion
- Supabase (Postgres + Auth + RLS) para usuarios y roles

## Roles de usuario
- `proveedor` — rol por default al registrarse en `/registro`. Acceso a `/panel-proveedor`.
- `master_admin` — acceso a `/admin` (gestión de usuarios) y `/panel-proveedor`. Se asigna manualmente (ver abajo).

## Configuración de Supabase
1. Crea un proyecto en https://supabase.com.
2. En **SQL Editor**, ejecuta `supabase/migrations/0001_roles.sql` (crea el enum de roles, la tabla `profiles`, el trigger de registro y las políticas RLS).
3. Copia la **Project URL** y la **anon key** (Settings > API) a `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
4. Para crear el primer Master Admin, regístrate en `/registro` y luego ejecuta en el SQL Editor:
   ```sql
   update public.profiles set role = 'master_admin' where id = '<tu-user-uuid>';
   ```

## Rutas protegidas
El middleware (`src/middleware.ts`) refresca la sesión y protege:
- `/panel-proveedor` → requiere sesión (rol `proveedor` o `master_admin`)
- `/admin` → requiere rol `master_admin`
Sin sesión, redirige a `/login`.

## Desarrollo
```bash
npm install
npm run dev
```

## Deploy en Vercel
1. Ve a https://vercel.com/new e importa este repositorio.
2. Vercel detecta Next.js automáticamente — no necesitas cambiar nada.
3. Deploy. Cada push a `main` dispara un redeploy automático.
