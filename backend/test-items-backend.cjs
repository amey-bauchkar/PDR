require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('quote_request_items')
    .select('*')
    .eq('request_id', '766760fb-20bb-45e1-9bca-eb5bc0b5b18c');
    
  console.log(JSON.stringify(data, null, 2));
}

run();
