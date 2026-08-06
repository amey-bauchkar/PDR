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

async function fixStoragePolicies() {
  console.log('=== Fixing Supabase Storage Buckets & Policies ===\n');

  // 1. Ensure product-images bucket exists and is public
  console.log('1. Checking product-images bucket...');
  const { data: buckets } = await supabase.storage.listBuckets();
  const imgBucket = buckets?.find(b => b.name === 'product-images');

  if (!imgBucket) {
    console.log('   Creating product-images bucket (public)...');
    const { error } = await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
    });
    if (error) {
      console.error('   Failed to create product-images bucket:', error.message);
    } else {
      console.log('   ✅ product-images bucket created!');
    }
  } else {
    console.log('   product-images bucket already exists.');
    const { error } = await supabase.storage.updateBucket('product-images', { public: true });
    if (error) console.warn('   Could not update bucket to public:', error.message);
    else console.log('   ✅ Ensured product-images is public.');
  }

  // 2. Ensure product-datasheets bucket is public and allows uploads
  console.log('\n2. Checking product-datasheets bucket...');
  const dsBucket = buckets?.find(b => b.name === 'product-datasheets');
  if (dsBucket) {
    const { error } = await supabase.storage.updateBucket('product-datasheets', { public: true });
    if (error) console.warn('   Could not update product-datasheets to public:', error.message);
    else console.log('   ✅ Ensured product-datasheets is public.');
  } else {
    console.log('   Creating product-datasheets bucket (public)...');
    const { error } = await supabase.storage.createBucket('product-datasheets', {
      public: true,
      fileSizeLimit: 20 * 1024 * 1024, // 20MB for PDFs
      allowedMimeTypes: ['application/pdf'],
    });
    if (error) console.error('   Failed:', error.message);
    else console.log('   ✅ product-datasheets bucket created!');
  }

  // 3. Test upload permissions with anon key
  console.log('\n3. Testing upload permissions with anon key...');
  
  const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
  
  // Test product-images upload
  const testBlob = new Blob(['test'], { type: 'image/png' });
  const testPath = '_test/policy-check.png';
  
  const { error: imgUpErr } = await anonClient.storage
    .from('product-images')
    .upload(testPath, testBlob, { upsert: true });
  
  if (imgUpErr) {
    console.log(`   ❌ product-images anon upload FAILED: ${imgUpErr.message}`);
    console.log('   → You need to add INSERT policy in Supabase Dashboard:');
    console.log('     Storage → product-images → Policies → New Policy → Allow INSERT for all users');
    
    // Try with service role to confirm bucket works
    const { error: srvErr } = await supabase.storage
      .from('product-images')
      .upload(testPath, testBlob, { upsert: true });
    if (!srvErr) {
      console.log('   ✅ Service role upload works (RLS is blocking anon).');
      await supabase.storage.from('product-images').remove([testPath]);
    }
  } else {
    console.log('   ✅ product-images anon upload works!');
    await supabase.storage.from('product-images').remove([testPath]);
  }

  // Test product-datasheets upload
  const testPdf = new Blob(['%PDF-test'], { type: 'application/pdf' });
  const testDsPath = '_test/policy-check.pdf';
  
  const { error: dsUpErr } = await anonClient.storage
    .from('product-datasheets')
    .upload(testDsPath, testPdf, { upsert: true });
  
  if (dsUpErr) {
    console.log(`   ❌ product-datasheets anon upload FAILED: ${dsUpErr.message}`);
    console.log('   → You need to add INSERT policy in Supabase Dashboard:');
    console.log('     Storage → product-datasheets → Policies → New Policy → Allow INSERT for all users');
  } else {
    console.log('   ✅ product-datasheets anon upload works!');
    await supabase.storage.from('product-datasheets').remove([testDsPath]);
  }

  console.log('\n=== Done! ===');
}

fixStoragePolicies().catch(console.error);
