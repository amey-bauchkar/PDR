const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://gfzknettmaclomxyimjf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemtuZXR0bWFjbG9teHlpbWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MTQ2NzksImV4cCI6MjEwMDA5MDY3OX0.0f11BpXLPo6ItGkHgLxi0ihPqCkvmELn0BKK7FCY0qY');

async function run() {
  console.log('Testing create product...');
  const { data, error } = await supabase.from('catalog_products').insert({
    slug: 'errortest',
    name: 'test',
    category_id: 1, // assumes category 1 exists
    status: 'draft'
  }).select();
  console.log('Create error:', error);
  
  if (data) {
    console.log('Created product', data);
    console.log('Testing delete product cascade...');
    const { error: delError } = await supabase.from('catalog_products').delete().eq('id', data[0].id);
    console.log('Delete error:', delError);
  } else {
    // Try to delete a random product that the user tried to delete
    console.log('Trying to delete test2...');
    const { data: p } = await supabase.from('catalog_products').select('id').eq('slug', 'test2').single();
    if (p) {
        console.log('found test2', p.id);
        const { error: delError } = await supabase.from('catalog_products').delete().eq('id', p.id);
        console.log('Delete error for test2:', delError);
    } else {
        console.log('test2 not found');
    }
  }
}
run();
