const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gfzknettmaclomxyimjf.supabase.co';

/**
 * Converts a stored object key or legacy proxy path (e.g. "/cdn/storage/products/datasheet-123.pdf")
 * into a full public Supabase Storage URL.
 * Works identically on Vercel, Hostinger, or any static host — no server-side rewrite required.
 */
export function getAssetUrl(key: string | undefined | null): string {
  if (!key) return '';
  // If it's already a full HTTP/HTTPS URL and does not contain /cdn/storage, pass through untouched
  if (key.startsWith('http') && !key.includes('/cdn/storage/')) return key;
  // Replace legacy "/cdn/storage/" prefix with canonical Supabase Storage public path
  if (key.includes('/cdn/storage/')) {
    return key.replace(/^.*\/cdn\/storage\//, `${SUPABASE_URL}/storage/v1/object/public/`);
  }
  // If it's a relative static asset path (e.g. "/datasheets/..." or "/images/..."), keep it
  if (key.startsWith('/') || key.startsWith('./')) return key;
  // Otherwise treat as a raw bucket object key
  return `${SUPABASE_URL}/storage/v1/object/public/${key}`;
}
