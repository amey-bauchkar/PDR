const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://gfzknettmaclomxyimjf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemtuZXR0bWFjbG9teHlpbWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MTQ2NzksImV4cCI6MjEwMDA5MDY3OX0.0f11BpXLPo6ItGkHgLxi0ihPqCkvmELn0BKK7FCY0qY');

async function run() {
  const { data, error } = await supabase.from('catalog_product_features').select('*').limit(1);
  console.log('catalog_product_features:', error || 'exists');
}
run();
