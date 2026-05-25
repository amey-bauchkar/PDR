const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing with:');
console.log('URL:', url);

async function run() {
  if (anonKey) {
    try {
      const client = createClient(url, anonKey);
      const catCount = await client.from('product_categories').select('*', { count: 'exact', head: true });
      const secCount = await client.from('catalog_sections').select('*', { count: 'exact', head: true });
      const grpCount = await client.from('catalog_groups').select('*', { count: 'exact', head: true });
      const prodCount = await client.from('catalog_products').select('*', { count: 'exact', head: true });

      console.log('product_categories:', catCount.count);
      console.log('catalog_sections:', secCount.count);
      console.log('catalog_groups:', grpCount.count);
      console.log('catalog_products:', prodCount.count);
    } catch (e) {
      console.error('Anon client threw:', e);
    }
  }

  if (serviceKey) {
    try {
      const client = createClient(url, serviceKey);
      const { data, error } = await client.from('contact_inquiries').select('*').limit(1);
      if (error) {
        console.error('Service client failed:', error.message);
      } else {
        console.log('Service client SUCCESS. Rows found:', data.length);
      }
    } catch (e) {
      console.error('Service client threw:', e);
    }
  }
}

run();
