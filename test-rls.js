import { createClient } from '@supabase/supabase-js';

const url = 'https://gfzknettmaclomxyimjf.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemtuZXR0bWFjbG9teHlpbWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MTQ2NzksImV4cCI6MjEwMDA5MDY3OX0.0f11BpXLPo6ItGkHgLxi0ihPqCkvmELn0BKK7FCY0qY';

const supabase = createClient(url, anonKey);

async function test() {
  console.log("Testing insert...");
  // Attempt to insert a dummy product without a session
  const { data, error } = await supabase.from('catalog_products').insert({
    slug: 'test-rls-product',
    name: 'Test RLS Product',
    category_id: null,
    status: 'draft'
  }).select().single();
  
  if (error) {
    console.error("Insert failed:", error.message);
  } else {
    console.log("Insert succeeded!", data);
  }

  // Attempt to delete
  console.log("Testing delete...");
  const { data: delData, error: delError } = await supabase.from('catalog_products').delete().eq('slug', 'test-rls-product').select();
  
  if (delError) {
    console.error("Delete failed:", delError.message);
  } else {
    console.log("Delete returned:", delData);
  }
}

test();
