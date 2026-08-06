// Migration script: Convert base64 gallery URLs to Supabase Storage URLs
const fs = require('fs');
const path = require('path');

// Load .env
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const parts = line.split('=');
      if (parts.length >= 2 && !line.startsWith('#')) {
        process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    }
  }
} catch (e) { /* ignore */ }

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BUCKET = 'product-images';

function dataUriToBuffer(dataUri) {
  const match = dataUri.match(/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,(.+)$/);
  if (!match) return null;
  const ext = match[1] === 'jpg' ? 'jpeg' : match[1] === 'svg+xml' ? 'svg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  return { buffer, ext, mimeType: `image/${match[1]}` };
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some(b => b.name === BUCKET)) return;
  
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  });
  if (error) throw error;
}

async function migrateGalleryImages() {
  console.log('=== Migrating Base64 Gallery Images to Supabase Storage ===\n');

  await ensureBucket();

  // Fetch all products
  const { data: products, error } = await supabase
    .from('catalog_products')
    .select('id, slug, name, metadata')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch products:', error.message);
    process.exit(1);
  }

  let totalMigrated = 0;
  let totalFailed = 0;
  let productsFixed = 0;

  for (const product of products) {
    const galleryUrls = product.metadata?.gallery_urls || [];
    if (galleryUrls.length === 0) continue;

    // Check if any are base64
    const hasBase64 = galleryUrls.some(url => url.startsWith('data:'));
    if (!hasBase64) continue;

    console.log(`\n📦 ${product.name} (${product.slug}): ${galleryUrls.length} gallery images`);

    const newUrls = [];
    let productSuccess = true;

    for (let i = 0; i < galleryUrls.length; i++) {
      const url = galleryUrls[i];

      // If it's already a proper URL, keep it
      if (!url.startsWith('data:')) {
        newUrls.push(url);
        console.log(`   [${i}] ⏭️  Already a URL, keeping`);
        continue;
      }

      // Parse the base64 data
      const parsed = dataUriToBuffer(url);
      if (!parsed) {
        console.log(`   [${i}] ⚠️  Could not parse data URI, skipping`);
        newUrls.push(url); // keep original to not lose data
        totalFailed++;
        productSuccess = false;
        continue;
      }

      const storagePath = `${product.slug}/gallery-${i}-${Date.now()}.${parsed.ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, parsed.buffer, {
          contentType: parsed.mimeType,
          cacheControl: '31536000',
          upsert: true,
        });

      if (uploadError) {
        console.log(`   [${i}] ❌ Upload failed: ${uploadError.message}`);
        newUrls.push(url); // keep original
        totalFailed++;
        productSuccess = false;
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;

      newUrls.push(publicUrl);
      console.log(`   [${i}] ✅ Migrated → ${publicUrl}`);
      totalMigrated++;
    }

    // Update the metadata with new gallery URLs
    const updatedMetadata = { ...product.metadata, gallery_urls: newUrls };
    const { error: updateError } = await supabase
      .from('catalog_products')
      .update({ metadata: updatedMetadata })
      .eq('id', product.id);

    if (updateError) {
      console.log(`   ❌ DB update failed: ${updateError.message}`);
    } else if (productSuccess) {
      console.log(`   ✅ Product metadata updated`);
      productsFixed++;
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`  Products fixed: ${productsFixed}`);
  console.log(`  Gallery images migrated: ${totalMigrated}`);
  console.log(`  Failed: ${totalFailed}`);
}

migrateGalleryImages().catch(console.error);
