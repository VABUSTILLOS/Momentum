-- ---------------------------------------------------------------------------
-- Momentum — 0001: Roles de usuario (master_admin, proveedor) y profiles
-- Aplicar en: Supabase Dashboard > SQL Editor (o `supabase db push`)
-- ---------------------------------------------------------------------------

-- 1. Enum de roles ----------------------------------------------------------
create type public.app_role as enum ('master_admin', 'proveedor');

-- 2. Tabla de perfiles ------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         public.app_role not null default 'proveedor',
  full_name    text not null default '',
  company_name text,
  phone        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 3. Profile automático al registrarse (rol proveedor por default) ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, company_name, phone)
  values (
    new.id,
    'proveedor',
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'company_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Helper para políticas RLS ----------------------------------------------
create or replace function public.has_role(user_id uuid, required public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = required
  );
$$;

-- 5. Row Level Security -----------------------------------------------------
alter table public.profiles enable row level security;

-- Cada usuario lee su propio perfil
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Master admin lee todos los perfiles
create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.has_role(auth.uid(), 'master_admin'));

-- Cada usuario actualiza su propio perfil (sin cambiarse el rol)
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- Master admin actualiza cualquier perfil (incluye asignar roles)
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.has_role(auth.uid(), 'master_admin'))
  with check (public.has_role(auth.uid(), 'master_admin'));

-- ---------------------------------------------------------------------------
-- Para crear el primer Master Admin, registra un usuario y luego ejecuta:
--   update public.profiles set role = 'master_admin' where id = '<user-uuid>';
-- ---------------------------------------------------------------------------
