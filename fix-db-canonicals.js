import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCanonicals() {
  const { data, error } = await supabase.from('catalog_products').select('id, slug, canonical_url');
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  const toUpdate = data.filter(p => p.canonical_url && p.canonical_url.includes('pdr-sable.vercel.app'));
  console.log(`Found ${toUpdate.length} products to fix`);
  
  for (const product of toUpdate) {
    const newCanonical = product.canonical_url.replace('pdr-sable.vercel.app', 'pdrworld.com');
    console.log(`Updating ${product.slug}: ${newCanonical}`);
    
    const { error: updateError } = await supabase
      .from('catalog_products')
      .update({ canonical_url: newCanonical })
      .eq('id', product.id);
      
    if (updateError) {
      console.error(`Failed to update ${product.slug}:`, updateError);
    }
  }
  
  console.log('Done!');
}

fixCanonicals();
