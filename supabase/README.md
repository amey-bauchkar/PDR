# Supabase Database Setup

1. Open your Supabase project and run `schema.sql` in the SQL editor.
2. Create the following environment variables in your Vite app:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. The React app uses RPCs for quote cart sync, quote submission, and contact inquiries.
4. Catalog tables are read-only for the public UI. Writes go through `sync_quote_session`, `submit_quote_request`, and `submit_contact_inquiry`.
5. To generate a seed script from the current JSON catalogue, run `node scripts/generate-supabase-seed.mjs`.

## Tables

- `product_categories`
- `catalog_sections`
- `catalog_groups`
- `catalog_products`
- `catalog_product_features`
- `catalog_product_applications`
- `catalog_product_specs`
- `catalog_product_relations`
- `quote_sessions`
- `quote_session_items`
- `quote_requests`
- `quote_request_items`
- `contact_inquiries`

## Hash mapping

Each catalog row includes a generated `hash_key` derived from its slug. That gives you a stable public identifier for routes, cache keys, and UI lookups without exposing internal numeric IDs.
