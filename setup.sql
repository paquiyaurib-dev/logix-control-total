create extension if not exists "pgcrypto";

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  nombre text not null,
  rol text not null,
  planta text not null,
  avatar text not null
);

create table if not exists public.materiales (
  id uuid primary key default gen_random_uuid(),
  codigo text not null,
  descripcion text not null,
  categoria text not null,
  familia text not null,
  unidad text not null,
  marca text not null,
  stock_min integer not null default 0,
  stock_max integer not null default 0,
  stock_actual integer not null default 0,
  precio_unitario numeric(12,2) not null default 0,
  ubicacion text not null default '',
  estado text not null default 'Activo',
  ultimo_movimiento date
);

create table if not exists public.proveedores (
  id uuid primary key default gen_random_uuid(),
  ruc text not null default '',
  razon_social text not null,
  contacto text not null default '',
  telefono text not null default '',
  email text not null default ''
);

create table if not exists public.movimientos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  fecha date not null,
  num_documento text not null default '',
  clase_movimiento text not null default '',
  proveedor text,
  material_id uuid references public.materiales(id) on delete set null,
  descripcion text not null default '',
  cantidad integer not null default 0,
  num_vale text not null default '',
  zona_destino text,
  bodeguero text not null default '',
  supervisor text not null default '',
  bodega_origen text not null default '',
  observaciones text not null default '',
  usuario text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.activos (
  id uuid primary key default gen_random_uuid(),
  codigo_patrimonial text not null,
  serie text not null,
  marca text not null,
  modelo text not null,
  categoria text not null,
  ubicacion text not null,
  responsable text not null,
  estado text not null,
  fecha_asignacion date not null,
  historial_transferencias jsonb not null default '[]'::jsonb
);

create table if not exists public.vehiculos (
  id uuid primary key default gen_random_uuid(),
  placa text not null,
  tipo text not null,
  marca text not null,
  modelo text not null,
  anio integer not null default 0,
  operador text not null default '',
  supervisor text not null default '',
  estado text not null,
  km_actual numeric not null default 0,
  horometro_actual numeric not null default 0
);

create table if not exists public.tareos (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id uuid references public.vehiculos(id) on delete set null,
  fecha date not null,
  operador text not null default '',
  supervisor text not null default '',
  km_inicial numeric not null default 0,
  km_final numeric not null default 0,
  horometro_inicial numeric not null default 0,
  horometro_final numeric not null default 0,
  combustible numeric not null default 0,
  actividad text not null default '',
  horas_trabajadas numeric not null default 0,
  observaciones text not null default '',
  placa text not null default ''
);

create table if not exists public.alertas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  titulo text not null,
  subtitulo text not null default '',
  severidad text not null,
  leida boolean not null default false,
  resuelta boolean not null default false,
  fecha timestamptz not null default now(),
  material_id uuid references public.materiales(id) on delete set null,
  vehiculo_id uuid references public.vehiculos(id) on delete set null
);

create table if not exists public.catalogos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  nombre text not null,
  datos jsonb not null default '{}'::jsonb
);

create table if not exists public.despachos (
  id uuid primary key default gen_random_uuid(),
  material_id uuid references public.materiales(id) on delete set null,
  descripcion text not null default '',
  cantidad integer not null default 0,
  labor text not null default '',
  supervisor text not null default '',
  bodega_origen text not null default '',
  fecha date not null,
  observaciones text not null default '',
  usuario text not null default '',
  created_at timestamptz not null default now()
);

alter table public.usuarios enable row level security;
alter table public.materiales enable row level security;
alter table public.proveedores enable row level security;
alter table public.movimientos enable row level security;
alter table public.activos enable row level security;
alter table public.vehiculos enable row level security;
alter table public.tareos enable row level security;
alter table public.alertas enable row level security;
alter table public.catalogos enable row level security;
alter table public.despachos enable row level security;

create table if not exists public.personal (
  id uuid primary key default gen_random_uuid(),
  dni text not null unique,
  nombres text not null,
  apellidos text not null,
  cargo text not null,
  area text not null default '',
  activo boolean not null default true
);

alter table public.personal enable row level security;

drop policy if exists "anon_all_usuarios" on public.usuarios;
create policy "anon_all_usuarios" on public.usuarios for all to anon using (true) with check (true);
drop policy if exists "anon_all_materiales" on public.materiales;
create policy "anon_all_materiales" on public.materiales for all to anon using (true) with check (true);
drop policy if exists "anon_all_proveedores" on public.proveedores;
create policy "anon_all_proveedores" on public.proveedores for all to anon using (true) with check (true);
drop policy if exists "anon_all_movimientos" on public.movimientos;
create policy "anon_all_movimientos" on public.movimientos for all to anon using (true) with check (true);
drop policy if exists "anon_all_activos" on public.activos;
create policy "anon_all_activos" on public.activos for all to anon using (true) with check (true);
drop policy if exists "anon_all_vehiculos" on public.vehiculos;
create policy "anon_all_vehiculos" on public.vehiculos for all to anon using (true) with check (true);
drop policy if exists "anon_all_tareos" on public.tareos;
create policy "anon_all_tareos" on public.tareos for all to anon using (true) with check (true);
drop policy if exists "anon_all_alertas" on public.alertas;
create policy "anon_all_alertas" on public.alertas for all to anon using (true) with check (true);
drop policy if exists "anon_all_catalogos" on public.catalogos;
create policy "anon_all_catalogos" on public.catalogos for all to anon using (true) with check (true);
drop policy if exists "anon_all_despachos" on public.despachos;
create policy "anon_all_despachos" on public.despachos for all to anon using (true) with check (true);
drop policy if exists "anon_all_personal" on public.personal;
create policy "anon_all_personal" on public.personal for all to anon using (true) with check (true);

insert into public.usuarios (username, password, nombre, rol, planta, avatar)
values ('admin', 'admin123', 'Administrador Principal', 'Administrador', 'Planta Principal', 'AP')
on conflict (username) do update
set password = excluded.password,
    nombre = excluded.nombre,
    rol = excluded.rol,
    planta = excluded.planta,
    avatar = excluded.avatar;