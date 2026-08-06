const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2 && !line.startsWith('#')) {
      process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
} catch (e) {}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gfzknettmaclomxyimjf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const OLD_PREFIX = '/cdn/storage';
const NEW_PREFIX = `${supabaseUrl}/storage/v1/object/public`;

async function revertUrls() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error: fetchError } = await supabase
    .from('catalog_products')
    .select('id, image_url, metadata');

  if (fetchError) {
    console.error('Error fetching products:', fetchError);
    process.exit(1);
  }

  console.log(`Found ${products.length} products. Migrating /cdn/storage/ URLs back to canonical Supabase URLs...`);
  
  let updatedCount = 0;

  for (const product of products) {
    let needsUpdate = false;
    let newImageUrl = product.image_url;
    let newMetadata = { ...product.metadata };

    if (newImageUrl && newImageUrl.includes(OLD_PREFIX)) {
      newImageUrl = newImageUrl.replace(OLD_PREFIX, NEW_PREFIX);
      needsUpdate = true;
    }

    if (newMetadata.datasheet_url && newMetadata.datasheet_url.includes(OLD_PREFIX)) {
      newMetadata.datasheet_url = newMetadata.datasheet_url.replace(OLD_PREFIX, NEW_PREFIX);
      needsUpdate = true;
    }

    if (newMetadata.gallery_urls && Array.isArray(newMetadata.gallery_urls)) {
      const newGallery = newMetadata.gallery_urls.map(url => {
        if (url.includes(OLD_PREFIX)) {
          needsUpdate = true;
          return url.replace(OLD_PREFIX, NEW_PREFIX);
        }
        return url;
      });
      newMetadata.gallery_urls = newGallery;
    }

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('catalog_products')
        .update({
          image_url: newImageUrl,
          metadata: newMetadata
        })
        .eq('id', product.id);
        
      if (updateError) {
        console.error(`Failed to update product ${product.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`Successfully restored canonical Supabase Storage URLs on ${updatedCount} products!`);
}

revertUrls();
