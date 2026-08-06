import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const match = dataUri.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);
  if (!match) return null;
  const ext = match[1] === 'jpg' ? 'jpeg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  return { buffer, ext, mimeType: `image/${ext}` };
}

async function migrateBase64Images() {
  console.log('=== Migrating Base64 Product Images to Supabase Storage ===\n');

  // 1. Fetch all products from Supabase
  const { data: products, error } = await supabase
    .from('catalog_products')
    .select('id, slug, image_url')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch products:', error.message);
    process.exit(1);
  }

  const base64Products = products.filter(p => p.image_url && p.image_url.startsWith('data:image/'));
  console.log(`Found ${base64Products.length} products with base64 image_url (out of ${products.length} total)\n`);

  if (base64Products.length === 0) {
    console.log('Nothing to migrate!');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const product of base64Products) {
    const parsed = dataUriToBuffer(product.image_url);
    if (!parsed) {
      console.log(`  ⚠️  ${product.slug}: Could not parse data URI, skipping.`);
      failCount++;
      continue;
    }

    const storagePath = `${product.slug}/product-image.${parsed.ext}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, parsed.buffer, {
        contentType: parsed.mimeType,
        cacheControl: '31536000', // 1 year cache
        upsert: true,
      });

    if (uploadError) {
      console.log(`  ❌ ${product.slug}: Upload failed — ${uploadError.message}`);
      failCount++;
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Update the database record
    const { error: updateError } = await supabase
      .from('catalog_products')
      .update({ image_url: publicUrl })
      .eq('id', product.id);

    if (updateError) {
      console.log(`  ❌ ${product.slug}: DB update failed — ${updateError.message}`);
      failCount++;
      continue;
    }

    console.log(`  ✅ ${product.slug}: Migrated → ${publicUrl}`);
    successCount++;
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`  ✅ Migrated: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  Total: ${base64Products.length}`);

  if (successCount > 0) {
    console.log('\nNext step: Run `npm run build:full` to re-sync products.json with the new URLs.');
  }
}

migrateBase64Images().catch(console.error);
