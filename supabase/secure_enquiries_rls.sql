-- ============================================================
-- SECURE ENQUIRIES & QUOTE REQUESTS RLS
-- Run this in Supabase SQL Editor to block anonymous reads
-- ============================================================

-- 1. Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_session_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing permissive read policies
DROP POLICY IF EXISTS "Public read quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Public read quote request items" ON public.quote_request_items;
DROP POLICY IF EXISTS "Public read contact inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Public read quote sessions" ON public.quote_sessions;
DROP POLICY IF EXISTS "Public read quote session items" ON public.quote_session_items;

DROP POLICY IF EXISTS "Allow anon read contact_inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow anon read quote_requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow anon read quote_request_items" ON public.quote_request_items;
DROP POLICY IF EXISTS "Allow anon read quote_sessions" ON public.quote_sessions;
DROP POLICY IF EXISTS "Allow anon read quote_session_items" ON public.quote_session_items;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow public read access" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow public read access" ON public.quote_requests;

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.quote_request_items;

-- 3. Create strict SELECT policies for AUTHENTICATED users only
CREATE POLICY "Allow authenticated read access" 
ON public.contact_inquiries 
FOR SELECT 
TO authenticated 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access" 
ON public.quote_requests 
FOR SELECT 
TO authenticated 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access" 
ON public.quote_request_items 
FOR SELECT 
TO authenticated 
USING (auth.role() = 'authenticated');

-- 4. Re-ensure INSERT policies exist for public submissions
DROP POLICY IF EXISTS "Enable insert for public and anon" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Enable insert for public and anon" ON public.quote_requests;
DROP POLICY IF EXISTS "Enable insert for public and anon" ON public.quote_request_items;

CREATE POLICY "Enable insert for public and anon"
ON public.contact_inquiries
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Enable insert for public and anon"
ON public.quote_requests
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Enable insert for public and anon"
ON public.quote_request_items
FOR INSERT
TO authenticated, anon
WITH CHECK (true);
