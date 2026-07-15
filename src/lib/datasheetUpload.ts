import { supabase } from './supabase';

const BUCKET = 'product-datasheets';

/**
 * Upload a PDF datasheet directly to Supabase Storage.
 * Returns a public URL that works on ALL devices.
 * No API route needed — goes directly to Supabase (fast).
 */
export async function uploadProductDatasheet(file: File, slug: string): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured for datasheet uploads.');
  }

  const stamp = Date.now();
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'datasheet.pdf';
  const path = `${slug}/${stamp}-${safeName}`;

  // Upload directly to Supabase Storage (much faster than going through API route)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    throw new Error(error.message || 'Failed to upload datasheet.');
  }

  // Get the public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
