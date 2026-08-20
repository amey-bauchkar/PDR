/**
 * One-time Supabase DB fix script.
 * Run this ONCE to fix the database so future syncs don't overwrite our products.json fixes.
 * 
 * Fixes:
 * 1. AOC product: title, description, canonical_url
 * 2. Delete test product 'newtest456789'
 * 3. Fix all .html canonical URLs → /products/{slug}
 * 4. Fix any remaining pdr-sable.vercel.app URLs
 * 
 * Usage: node fix-db-issues.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const parts = line.split('=');
      if (parts.length >= 2 && !line.startsWith('#')) {
        process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    }
  }
} catch (e) {
  // ignore
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  console.log('Starting Supabase DB fixes...\n');

  // Fetch all products
  const { data: products, error } = await supabase
    .from('catalog_products')
    .select('id, slug, title, description, canonical_url');
  
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} products in database.\n`);

  let fixedCount = 0;

  // 1. Fix AOC product
  const aoc = products.find(p => p.slug === 'aoc');
  if (aoc) {
    const updates = {};
    if (aoc.title === 'undefined | PDR World' || !aoc.title) {
      updates.title = 'Active Optical Cable (AOC) | PDR World';
    }
    if (!aoc.description) {
      updates.description = 'PDR Active Optical Cables (AOC) deliver high-speed, low-latency connectivity for data centre, HPC, and enterprise switching applications.';
    }
    if (aoc.canonical_url?.includes('undefined')) {
      updates.canonical_url = 'https://pdrworld.com/products/aoc';
    }
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('catalog_products')
        .update(updates)
        .eq('id', aoc.id);
      if (updateError) {
        console.error(`Failed to fix AOC:`, updateError);
      } else {
        console.log(`FIXED AOC: ${JSON.stringify(updates)}`);
        fixedCount++;
      }
    }
  }

  // 2. Delete test product
  const testProduct = products.find(p => p.slug === 'newtest456789');
  if (testProduct) {
    // Delete related data first (specs, features, applications)
    await supabase.from('catalog_product_specs').delete().eq('product_id', testProduct.id);
    await supabase.from('catalog_product_features').delete().eq('product_id', testProduct.id);
    await supabase.from('catalog_product_applications').delete().eq('product_id', testProduct.id);
    
    const { error: deleteError } = await supabase
      .from('catalog_products')
      .delete()
      .eq('id', testProduct.id);
    if (deleteError) {
      console.error(`Failed to delete test product:`, deleteError);
    } else {
      console.log(`DELETED: test product "newtest456789"`);
      fixedCount++;
    }
  }

  // 3. Fix .html canonical URLs
  const htmlProducts = products.filter(p => 
    p.canonical_url && p.canonical_url.match(/^https:\/\/pdrworld\.com\/[^/]+\.html$/)
  );
  console.log(`\nFound ${htmlProducts.length} products with .html canonical URLs`);
  
  for (const p of htmlProducts) {
    const match = p.canonical_url.match(/^https:\/\/pdrworld\.com\/([^/]+)\.html$/);
    if (match) {
      const newCanonical = `https://pdrworld.com/products/${match[1]}`;
      const { error: updateError } = await supabase
        .from('catalog_products')
        .update({ canonical_url: newCanonical })
        .eq('id', p.id);
      if (updateError) {
        console.error(`Failed to fix ${p.slug}:`, updateError);
      } else {
        console.log(`FIXED: ${p.slug}: ${p.canonical_url} → ${newCanonical}`);
        fixedCount++;
      }
    }
  }

  // 4. Fix any remaining pdr-sable.vercel.app URLs
  const vercelProducts = products.filter(p => 
    p.canonical_url && p.canonical_url.includes('pdr-sable.vercel.app')
  );
  if (vercelProducts.length > 0) {
    console.log(`\nFound ${vercelProducts.length} products with old Vercel URLs`);
    for (const p of vercelProducts) {
      const newCanonical = p.canonical_url.replace('pdr-sable.vercel.app', 'pdrworld.com');
      const { error: updateError } = await supabase
        .from('catalog_products')
        .update({ canonical_url: newCanonical })
        .eq('id', p.id);
      if (updateError) {
        console.error(`Failed to fix ${p.slug}:`, updateError);
      } else {
        console.log(`FIXED VERCEL URL: ${p.slug}: → ${newCanonical}`);
        fixedCount++;
      }
    }
  } else {
    console.log('\nNo old Vercel URLs found.');
  }

  console.log(`\nDone! Fixed ${fixedCount} items in Supabase DB.`);
}

fixDatabase();
