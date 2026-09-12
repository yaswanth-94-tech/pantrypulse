-- PantryPulse PostgreSQL Supabase Schema (PRD Section 4.1)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Pantry Inventory Table
create table if not exists public.pantry_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid default '00000000-0000-0000-0000-000000000000'::uuid,
    name text not null,
    category text default 'Pantry',
    storage_location text default 'Fridge',
    shelf_life_days int not null default 5,
    expiry_date timestamptz not null,
    status text default 'active' check (status in ('active', 'consumed', 'wasted', 'shopping_list')),
    created_at timestamptz default now()
);

-- Index for instant sorting by urgency & status
create index if not exists idx_pantry_urgency on public.pantry_items (user_id, expiry_date asc) where status = 'active';
create index if not exists idx_pantry_status on public.pantry_items (status);

-- 2. Recipe Zero-Cost Cache Table
create table if not exists public.recipes_cache (
    id uuid primary key default uuid_generate_v4(),
    ingredient_hash text unique not null,
    recipe_data jsonb not null,
    created_at timestamptz default now()
);

-- Row Level Security (RLS) Setup
alter table public.pantry_items enable row level security;
alter table public.recipes_cache enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can manage own pantry" on public.pantry_items;
drop policy if exists "All authenticated users read cache" on public.recipes_cache;
drop policy if exists "All authenticated users write cache" on public.recipes_cache;
drop policy if exists "Allow public access for dev mode" on public.pantry_items;
drop policy if exists "Allow public cache read/write" on public.recipes_cache;

-- Permissive policies for zero-friction setup & development
create policy "Allow public access for dev mode" 
on public.pantry_items for all 
using (true)
with check (true);

create policy "Allow public cache read/write" 
on public.recipes_cache for all 
using (true)
with check (true);

-- Sample Seed Data for Instant Demonstration
insert into public.pantry_items (name, category, storage_location, shelf_life_days, expiry_date, status)
values
  ('Fresh Baby Spinach', 'Produce', 'Fridge', 3, now() + interval '1 day', 'active'),
  ('Farm Fresh Eggs (6-pack)', 'Dairy', 'Fridge', 14, now() + interval '2 days', 'active'),
  ('Ripe Roma Tomatoes', 'Produce', 'Counter', 4, now() + interval '1 day', 'active'),
  ('Whole Wheat Bread', 'Bakery', 'Pantry', 5, now() + interval '3 days', 'active'),
  ('Cheddar Cheese Block', 'Dairy', 'Fridge', 20, now() + interval '7 days', 'active'),
  ('Greek Yogurt', 'Dairy', 'Fridge', 10, now() + interval '5 days', 'active'),
  ('Avocados (Hass)', 'Produce', 'Counter', 4, now() + interval '2 days', 'active'),
  ('Organic Chicken Breast', 'Meat', 'Fridge', 3, now() + interval '0 days', 'active')
on conflict do nothing;
