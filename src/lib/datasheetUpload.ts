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
    let errorMsg = 'Failed to prepare datasheet upload.';
    
    // Safely extract error message avoiding [object Object]
    const extractMsg = (obj: any): string => {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      if (obj instanceof Error) return obj.message;
      if (typeof obj.message === 'string') return obj.message;
      if (typeof obj.error === 'string') return obj.error;
      try {
        return JSON.stringify(obj);
      } catch (e) {
        return String(obj);
      }
    };

    if (!payload) {
      errorMsg = `Server returned ${response.status} ${response.statusText}`;
    } else if (payload.message) {
      errorMsg = extractMsg(payload.message);
    } else if (payload.error) {
      errorMsg = extractMsg(payload.error);
    }

    throw new Error(errorMsg || 'Failed to prepare datasheet upload.');
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
    let msg = 'Failed to upload datasheet to storage.';
    if (error.message && typeof error.message === 'string') {
      msg = error.message;
    } else if (typeof error === 'string') {
      msg = error;
    } else {
      try {
        msg = JSON.stringify(error);
      } catch (e) {
        msg = String(error);
      }
    }
    throw new Error(msg);
  }

  const cdnUrl = ticket.publicUrl.replace('https://gfzknettmaclomxyimjf.supabase.co/storage/v1/object/public', '/cdn/storage');
  return cdnUrl;
}
