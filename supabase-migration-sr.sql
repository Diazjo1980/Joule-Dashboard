-- ============================================================
-- MIGRACIÓN: Tabla de Service Requests de ServiceNow
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

create table if not exists client_service_requests (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients on delete cascade not null,
  sr_number text not null,
  title text,
  status text default 'Abierto', -- Abierto | En progreso | Resuelto | Cerrado
  priority text default 'Media',  -- Alta | Media | Baja
  notes text,
  created_at timestamptz default now()
);

alter table client_service_requests enable row level security;

create policy "sr_select" on client_service_requests for select using (has_client_access(client_id));
create policy "sr_insert" on client_service_requests for insert with check (has_client_access(client_id));
create policy "sr_update" on client_service_requests for update using (has_client_access(client_id));
create policy "sr_delete" on client_service_requests for delete using (has_client_access(client_id));
