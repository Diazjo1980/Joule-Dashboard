-- Migration: allow nullable url and add file_url / file_name to client_resources
-- Run this in the Supabase SQL editor

alter table client_resources
  alter column url drop not null;

alter table client_resources
  add column if not exists file_url text;

alter table client_resources
  add column if not exists file_name text;
