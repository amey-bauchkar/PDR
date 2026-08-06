/**
 * Datasheet upload — sends the PDF to the Vercel serverless API which uploads
 * it using the service role key (bypassing Supabase RLS).
 *
 * This approach works reliably from ANY hosting origin (Hostinger, localhost,
 * Vercel preview) because:
 * 1. The API has `Access-Control-Allow-Origin: *` so CORS never blocks it.
 * 2. The upload is performed server-side with the service role key, so
 *    Supabase Storage RLS policies don't matter.
 */

const UPLOAD_API = 'https://pdr-sable.vercel.app/api/products/datasheet-upload-url';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:application/pdf;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadProductDatasheet(file: File, slug: string): Promise<string> {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('PDF size must be less than 25MB.');
  }

  // Convert file to base64 and send to Vercel API for server-side upload
  const fileData = await fileToBase64(file);

  const response = await fetch(UPLOAD_API, {
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
      fileData,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    let errorMsg = 'Failed to upload datasheet.';
    if (!payload) {
      errorMsg = `Server returned ${response.status} ${response.statusText}`;
    } else if (typeof payload.message === 'string') {
      errorMsg = payload.message;
    } else if (typeof payload.error === 'string') {
      errorMsg = payload.error;
    }
    throw new Error(errorMsg);
  }

  return payload.data.publicUrl;
}
