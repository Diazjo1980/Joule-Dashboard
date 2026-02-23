-- ============================================================
-- JOULE × ARIBA DASHBOARD — Supabase Schema
-- Run this in: Supabase → SQL Editor → New query
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null default 'consultant', -- 'admin' | 'consultant'
  created_at timestamptz default now()
);

-- 2. CLIENTS
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null, -- used in URL ?client=slug
  created_at timestamptz default now()
);

-- 3. CLIENT ASSIGNMENTS (consultants <-> clients, many-to-many)
create table if not exists client_assignments (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients on delete cascade not null,
  consultant_id uuid references profiles on delete cascade not null,
  role text not null default 'primary', -- 'primary' | 'specialist' | 'backup'
  area text, -- e.g. "IAS/IPS", "Joule BTP", "Work Zone"
  backup_start date,
  backup_end date,
  active boolean default true,
  created_at timestamptz default now(),
  unique(client_id, consultant_id)
);

-- 4. CHECKLIST
create table if not exists client_checklist (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients on delete cascade not null,
  phase text not null,
  item_es text not null,
  item_en text,
  done boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 5. TASKS
create table if not exists client_tasks (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients on delete cascade not null,
  title_es text not null,
  title_en text,
  priority text default 'Media',
  status text default 'Pendiente',
  due date,
  owner text,
  created_at timestamptz default now()
);

-- 6. RESOURCES
create table if not exists client_resources (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients on delete cascade not null,
  title text not null,
  url text not null,
  category text,
  type text default 'url',
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table profiles enable row level security;
alter table clients enable row level security;
alter table client_assignments enable row level security;
alter table client_checklist enable row level security;
alter table client_tasks enable row level security;
alter table client_resources enable row level security;

-- Helper function: check if current user has active access to a client
create or replace function has_client_access(p_client_id uuid)
returns boolean as $$
begin
  -- Admin has access to everything
  if exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    return true;
  end if;
  -- Consultant has direct or active backup access
  return exists (
    select 1 from client_assignments
    where client_id = p_client_id
      and consultant_id = auth.uid()
      and active = true
      and (
        role in ('primary', 'specialist')
        or (
          role = 'backup'
          and (backup_start is null or backup_start <= current_date)
          and (backup_end is null or backup_end >= current_date)
        )
      )
  );
end;
$$ language plpgsql security definer;

-- PROFILES: users can see all profiles (for assignment selects), edit own
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (id = auth.uid());
create policy "profiles_update" on profiles for update using (id = auth.uid());

-- CLIENTS: visible if assigned or admin
create policy "clients_select" on clients for select using (has_client_access(id));
create policy "clients_insert" on clients for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "clients_update" on clients for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "clients_delete" on clients for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ASSIGNMENTS: admin full access; consultant can manage their own assignments (for backup)
create policy "assignments_select" on client_assignments for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or consultant_id = auth.uid()
  or has_client_access(client_id)
);
create policy "assignments_insert" on client_assignments for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or has_client_access(client_id)
);
create policy "assignments_update" on client_assignments for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or has_client_access(client_id)
);
create policy "assignments_delete" on client_assignments for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  or has_client_access(client_id)
);

-- CHECKLIST, TASKS, RESOURCES: access based on client access
create policy "checklist_select" on client_checklist for select using (has_client_access(client_id));
create policy "checklist_insert" on client_checklist for insert with check (has_client_access(client_id));
create policy "checklist_update" on client_checklist for update using (has_client_access(client_id));
create policy "checklist_delete" on client_checklist for delete using (has_client_access(client_id));

create policy "tasks_select" on client_tasks for select using (has_client_access(client_id));
create policy "tasks_insert" on client_tasks for insert with check (has_client_access(client_id));
create policy "tasks_update" on client_tasks for update using (has_client_access(client_id));
create policy "tasks_delete" on client_tasks for delete using (has_client_access(client_id));

create policy "resources_select" on client_resources for select using (has_client_access(client_id));
create policy "resources_insert" on client_resources for insert with check (has_client_access(client_id));
create policy "resources_update" on client_resources for update using (has_client_access(client_id));
create policy "resources_delete" on client_resources for delete using (has_client_access(client_id));

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'consultant')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
