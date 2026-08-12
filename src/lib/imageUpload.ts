/**
 * Product image upload — fetches a Signed Upload URL from Vercel API,
 * then uploads the image directly to Supabase Storage from the browser.
 *
 * Returns a proper https:// public URL (not a data: base64 blob).
 * This ensures images display correctly via resolveCanonicalProductImage().
 */

const UPLOAD_API = '/api/products/image-upload-url';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gfzknettmaclomxyimjf.supabase.co';

export async function uploadProductImage(file: File, slug: string): Promise<string> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be less than 5MB.');
  }

  // Step 1: Get a Signed Upload URL from our Vercel API
  const tokenRes = await fetch(UPLOAD_API, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug,
      fileName: file.name,
      fileSize: file.size,
    }),
  });

  const tokenPayload = await tokenRes.json().catch(() => null);

  if (!tokenRes.ok || !tokenPayload?.success) {
    let errorMsg = 'Failed to initialize image upload.';
    if (!tokenPayload) errorMsg = `Server returned ${tokenRes.status} ${tokenRes.statusText}`;
    else if (typeof tokenPayload.message === 'string') errorMsg = tokenPayload.message;
    else if (typeof tokenPayload.error === 'string') errorMsg = tokenPayload.error;
    throw new Error(errorMsg);
  }

  const { bucket, path, token, publicUrl } = tokenPayload.data;

  // If no token returned, the server handled it directly
  if (!token) return publicUrl;

  // Step 2: Upload directly to Supabase Storage using the signed URL
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/upload/sign/${bucket}/${path}?token=${token}`;

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'image/jpeg',
      'Cache-Control': '3600',
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text().catch(() => '');
    console.error('Supabase image upload failed:', uploadRes.status, errorText);
    throw new Error('Failed to upload image to storage. Please try again.');
  }

  return publicUrl;
}
