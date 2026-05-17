-- =========================================================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR PRODUCT CATALOG TABLES
-- Run this in your Supabase SQL Editor to allow the backend/admin panel
-- to seamlessly read, create, update, and delete catalog entities.
-- =========================================================================

-- 1. Disable RLS on core catalog tables
alter table public.product_categories disable row level security;
alter table public.catalog_sections disable row level security;
alter table public.catalog_groups disable row level security;
alter table public.catalog_products disable row level security;

-- 2. Disable RLS on catalog child tables
alter table public.catalog_product_features disable row level security;
alter table public.catalog_product_applications disable row level security;
alter table public.catalog_product_specs disable row level security;
alter table public.catalog_product_relations disable row level security;

-- 3. Disable RLS on lead capture and RFQ tables
alter table public.quote_requests disable row level security;
alter table public.quote_request_items disable row level security;
alter table public.contact_inquiries disable row level security;

-- 4. Confirm policies are clean
drop policy if exists "Allow anon read product_categories" on public.product_categories;
drop policy if exists "Allow anon write product_categories" on public.product_categories;
drop policy if exists "Allow anon read catalog_sections" on public.catalog_sections;
drop policy if exists "Allow anon write catalog_sections" on public.catalog_sections;
drop policy if exists "Allow anon read catalog_groups" on public.catalog_groups;
drop policy if exists "Allow anon write catalog_groups" on public.catalog_groups;
drop policy if exists "Allow anon read catalog_products" on public.catalog_products;
drop policy if exists "Allow anon write catalog_products" on public.catalog_products;
