// Quick script to check what gallery URLs are stored in the database
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

async function checkGalleryUrls() {
  const { data: products, error } = await supabase
    .from('catalog_products')
    .select('id, slug, name, metadata')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch products:', error.message);
    process.exit(1);
  }

  console.log(`\n=== Gallery URL Analysis for ${products.length} products ===\n`);

  let hasGallery = 0;
  let base64Gallery = 0;
  let httpGallery = 0;

  for (const p of products) {
    const urls = p.metadata?.gallery_urls || [];
    if (urls.length === 0) continue;
    hasGallery++;

    console.log(`\n📦 ${p.name} (${p.slug}):`);
    console.log(`   Gallery images: ${urls.length}`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const type = url.startsWith('data:') ? '🔴 BASE64' : 
                   url.startsWith('http') ? '🟢 HTTP URL' : 
                   '🟡 OTHER';
      const preview = url.startsWith('data:') ? url.substring(0, 50) + '...' : url;
      console.log(`   [${i}] ${type}: ${preview}`);
      
      if (url.startsWith('data:')) base64Gallery++;
      else if (url.startsWith('http')) httpGallery++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Products with galleries: ${hasGallery}`);
  console.log(`Base64 gallery URLs: ${base64Gallery}`);
  console.log(`HTTP gallery URLs: ${httpGallery}`);
}

checkGalleryUrls().catch(console.error);
