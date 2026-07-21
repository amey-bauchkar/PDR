import { supabase } from './supabase';

type UploadTicket = {
  bucket: string;
  path: string;
  token: string;
  publicUrl: string;
};

async function requestUploadTicket(file: File, slug: string): Promise<UploadTicket> {
  const response = await fetch('/api/products/datasheet-upload-url', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      slug,
      fileName: file.name,
      fileSize: file.size,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || payload?.error || 'Failed to prepare datasheet upload.');
  }

  return payload.data as UploadTicket;
}

export async function uploadProductDatasheet(file: File, slug: string): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured for datasheet uploads.');
  }

  const ticket = await requestUploadTicket(file, slug);
  const { error } = await supabase.storage
    .from(ticket.bucket)
    .uploadToSignedUrl(ticket.path, ticket.token, file, {
      contentType: 'application/pdf',
    });

  if (error) {
    throw new Error(error.message || 'Failed to upload datasheet.');
  }

  const cdnUrl = ticket.publicUrl.replace('https://gfzknettmaclomxyimjf.supabase.co/storage/v1/object/public', '/cdn/storage');
  return cdnUrl;
}
