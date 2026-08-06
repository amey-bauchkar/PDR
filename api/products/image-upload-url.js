import { createClient } from '@supabase/supabase-js';

const BUCKET = 'product-images';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function safeFileName(name = 'product-image.webp') {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || 'product-image.webp';
}

async function ensureBucket(supabase) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;
  if (buckets?.some((bucket) => bucket.name === BUCKET)) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  });
  if (error) throw error;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ success: false, error: 'Storage not configured' });
  }

  try {
    const { slug, fileName, fileSize } = req.body || {};
    if (!slug) {
      return res.status(400).json({ success: false, error: 'Missing product slug' });
    }
    if (fileSize && fileSize > 5 * 1024 * 1024) {
      return res.status(413).json({ success: false, error: 'Image size must be less than 5MB.' });
    }

    await ensureBucket(supabase);

    const stamp = Date.now();
    const path = `${slug}/${stamp}-${safeFileName(fileName)}`;

    // Create signed upload URL so the browser can upload directly
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw error;

    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    return res.status(200).json({
      success: true,
      data: {
        bucket: BUCKET,
        path,
        token: data.token,
        publicUrl,
      },
    });
  } catch (err) {
    console.error('Error handling image upload:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to prepare image upload',
      message: err.message,
    });
  }
}
