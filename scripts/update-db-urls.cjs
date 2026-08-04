const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfzknettmaclomxyimjf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemtuZXR0bWFjbG9teHlpbWpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDUxNDY3OSwiZXhwIjoyMTAwMDkwNjc5fQ.bQyfGptg_f8LcVAQbNG5wmdsrxyxvqWjDZs8ZoG0MDk';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const OLD_URL = 'https://dontisnmqeigdftjoolm.supabase.co';
const NEW_URL = 'https://gfzknettmaclomxyimjf.supabase.co';

async function updateUrls() {
  console.log('Fetching all products...');
  const { data: products, error } = await supabase.from('catalog_products').select('*');
  
  if (error) {
    console.error('Failed to fetch products:', error);
    return;
  }
  
  let updatedCount = 0;
  
  for (const p of products) {
    let needsUpdate = false;
    let newImgUrl = p.image_url;
    let newMetadata = p.metadata ? { ...p.metadata } : {};
    
    // Check main image_url
    if (newImgUrl && newImgUrl.includes(OLD_URL)) {
      newImgUrl = newImgUrl.replace(OLD_URL, NEW_URL);
      needsUpdate = true;
    }
    
    // Check metadata fields
    if (newMetadata.datasheet_url && newMetadata.datasheet_url.includes(OLD_URL)) {
      newMetadata.datasheet_url = newMetadata.datasheet_url.replace(OLD_URL, NEW_URL);
      needsUpdate = true;
    }
    
    if (newMetadata.gallery_urls && Array.isArray(newMetadata.gallery_urls)) {
      let galleryUpdated = false;
      const newGallery = newMetadata.gallery_urls.map(url => {
        if (url.includes(OLD_URL)) {
          galleryUpdated = true;
          return url.replace(OLD_URL, NEW_URL);
        }
        return url;
      });
      if (galleryUpdated) {
        newMetadata.gallery_urls = newGallery;
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      console.log(`Updating URLs for product ${p.slug}...`);
      const { error: updateError } = await supabase
        .from('catalog_products')
        .update({
          image_url: newImgUrl,
          metadata: newMetadata
        })
        .eq('id', p.id);
        
      if (updateError) {
        console.error(`Failed to update product ${p.slug}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`Successfully updated ${updatedCount} products with new Supabase URLs.`);
}

updateUrls().catch(console.error);
