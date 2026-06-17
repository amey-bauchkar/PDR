-- ============================================================
-- FIX 1: Allow admin (anon key) to READ contact_inquiries
-- ============================================================
alter table public.contact_inquiries enable row level security;

drop policy if exists "Allow anon read contact_inquiries" on public.contact_inquiries;
create policy "Allow anon read contact_inquiries"
  on public.contact_inquiries for select
  using (true);

-- ============================================================
-- FIX 2: Allow admin (anon key) to READ quote_requests
-- ============================================================
alter table public.quote_requests enable row level security;

drop policy if exists "Allow anon read quote_requests" on public.quote_requests;
create policy "Allow anon read quote_requests"
  on public.quote_requests for select
  using (true);

-- ============================================================
-- FIX 3: Allow admin (anon key) to READ quote_request_items
-- ============================================================
alter table public.quote_request_items enable row level security;

drop policy if exists "Allow anon read quote_request_items" on public.quote_request_items;
create policy "Allow anon read quote_request_items"
  on public.quote_request_items for select
  using (true);

-- ============================================================
-- FIX 4: Allow admin (anon key) to READ quote_sessions
-- ============================================================
alter table public.quote_sessions enable row level security;

drop policy if exists "Allow anon read quote_sessions" on public.quote_sessions;
create policy "Allow anon read quote_sessions"
  on public.quote_sessions for select
  using (true);

-- ============================================================
-- FIX 5: Allow admin (anon key) to READ quote_session_items
-- ============================================================
alter table public.quote_session_items enable row level security;

drop policy if exists "Allow anon read quote_session_items" on public.quote_session_items;
create policy "Allow anon read quote_session_items"
  on public.quote_session_items for select
  using (true);

-- ============================================================
-- FIX 6: Fix digest() function not found in quote functions
-- ============================================================
alter function public.sync_quote_session(text, jsonb)
  set search_path = public, extensions;

alter function public.submit_quote_request(text, jsonb, jsonb)
  set search_path = public, extensions;
