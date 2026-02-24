-- ============================================================
-- MIGRACIÓN: Sub-steps en checklist
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

-- Agregar columna parent_id para sub-steps (2 niveles)
alter table client_checklist
  add column if not exists parent_id uuid references client_checklist(id) on delete cascade;

-- Índice para consultas eficientes por parent
create index if not exists idx_checklist_parent on client_checklist(parent_id);
