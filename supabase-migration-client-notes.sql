-- Migration: create client_notes table for MS List sync feature
-- Run this in the Supabase SQL editor

create table if not exists client_notes (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table client_notes enable row level security;

create policy "notes_select" on client_notes for select using (has_client_access(client_id));
create policy "notes_insert" on client_notes for insert with check (has_client_access(client_id));
create policy "notes_delete" on client_notes for delete using (has_client_access(client_id));
