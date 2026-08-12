/**
 * Datasheet upload — fetches a Signed Upload URL from Vercel API,
 * then uploads the file directly to Supabase from the browser.
 *
 * This approach completely bypasses the 4.5MB Vercel serverless payload limit,
 * allowing uploads up to 25MB without hitting 413 Payload Too Large errors.
 * It also bypasses Supabase RLS because Signed URLs grant temporary write access.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gfzknettmaclomxyimjf.supabase.co';
const UPLOAD_API = `${SUPABASE_URL}/functions/v1/upload-url`;

export async function uploadProductDatasheet(file: File, slug: string): Promise<string> {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('PDF size must be less than 25MB.');
  }

  // Step 1: Get a Signed Upload URL from our Vercel API
  // We send the metadata, but NOT the fileData, so the payload is tiny.
  const tokenRes = await fetch(UPLOAD_API, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'datasheet',
      slug,
      fileName: file.name,
      fileSize: file.size,
    }),
  });

  const tokenPayload = await tokenRes.json().catch(() => null);

  if (!tokenRes.ok || !tokenPayload?.success) {
    let errorMsg = 'Failed to initialize datasheet upload.';
    if (!tokenPayload) errorMsg = `Server returned ${tokenRes.status} ${tokenRes.statusText}`;
    else if (typeof tokenPayload.message === 'string') errorMsg = tokenPayload.message;
    else if (typeof tokenPayload.error === 'string') errorMsg = tokenPayload.error;
    throw new Error(errorMsg);
  }

  const { bucket, path, token, publicUrl } = tokenPayload.data;

  // If the server didn't return a token (e.g. it uploaded it directly), just return the public URL
  if (!token) return publicUrl;

  // Step 2: Upload directly to Supabase Storage using the signed URL
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/upload/sign/${bucket}/${path}?token=${token}`;

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf',
      'Cache-Control': '3600',
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text().catch(() => '');
    console.error('Supabase upload failed:', uploadRes.status, errorText);
    throw new Error('Failed to upload file to storage bucket. Ensure the file is not too large.');
  }

  return publicUrl;
}
