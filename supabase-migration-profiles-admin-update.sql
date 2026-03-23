-- Migration: allow admins to update any profile role
-- Run this in the Supabase SQL editor

create policy "profiles_update_admin" on profiles
  for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
