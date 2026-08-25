const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2 && !line.startsWith('#')) {
      process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gfzknettmaclomxyimjf.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/products.json'), 'utf8')
);

async function main() {
  console.log(`Starting restore of ${productsData.length} products to Supabase...`);

  // 1. Fetch or create categories
  const categoryCache = new Map();
  const { data: existingCats, error: catFetchErr } = await supabase
    .from('product_categories')
    .select('id, name');

  if (catFetchErr) {
    console.error('Failed to fetch categories:', catFetchErr);
    process.exit(1);
  }

  for (const cat of existingCats || []) {
    categoryCache.set(cat.name.toLowerCase(), cat.id);
  }

  // 2. Iterate each product and upsert into database
  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i];
    const fullCat = p.category || 'Active Components';
    const catParts = fullCat.split(' > ');
    const mainCatName = catParts[0].trim();
    const subCatName = catParts.length > 1 ? catParts.slice(1).join(' > ').trim() : '';

    let categoryId = categoryCache.get(mainCatName.toLowerCase());
    if (!categoryId) {
      const catSlug = mainCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const { data: newCat, error: newCatErr } = await supabase
        .from('product_categories')
        .upsert({ slug: catSlug, name: mainCatName, description: `Category for ${mainCatName}` }, { onConflict: 'slug' })
        .select('id')
        .single();
      if (newCatErr) {
        console.error(`Failed to create category "${mainCatName}":`, newCatErr.message);
      } else {
        categoryId = newCat.id;
        categoryCache.set(mainCatName.toLowerCase(), categoryId);
      }
    }

    const specsMap = (p.specs || []).reduce((acc, s) => {
      acc[s.label] = s.value;
      return acc;
    }, {});

    const productRow = {
      slug: p.slug,
      category_id: categoryId,
      name: p.name,
      title: p.title || `${p.name} | PDR World`,
      tagline: p.tagline || '',
      description: p.description || '',
      canonical_url: p.canonical || `https://pdrworld.com/products/${p.slug}`,
      hero_icon_svg: p.heroIcon || '',
      image_url: p.imageUrl || '',
      status: p.status === 'Active' ? 'published' : (p.status === 'Draft' ? 'draft' : 'archived'),
      sort_order: i + 1,
      metadata: {
        environment: specsMap['Environment'] || specsMap['Installation'] || 'Indoor/Outdoor',
        mount_type: specsMap['Mount Type'] || specsMap['Mounting'] || 'Rack Mount',
        capacity: parseInt(specsMap['Capacity'] || specsMap['Ports'] || '0', 10) || 0,
        specs: specsMap,
        subcategory: subCatName,
        datasheet_url: p.datasheetUrl || '',
        gallery_urls: p.galleryUrls || [],
        tags: p.tags || [],
      },
      updated_at: p.updatedAt || new Date().toISOString(),
    };

    // Upsert catalog_product
    const { data: upsertedProduct, error: prodErr } = await supabase
      .from('catalog_products')
      .upsert(productRow, { onConflict: 'slug' })
      .select('id')
      .single();

    if (prodErr || !upsertedProduct) {
      console.error(`Error saving product "${p.slug}":`, prodErr?.message);
      continue;
    }

    const prodId = upsertedProduct.id;

    // Delete existing child rows and reinsert clean versions
    await Promise.all([
      supabase.from('catalog_product_features').delete().eq('product_id', prodId),
      supabase.from('catalog_product_applications').delete().eq('product_id', prodId),
      supabase.from('catalog_product_specs').delete().eq('product_id', prodId),
    ]);

    if (p.features && p.features.length > 0) {
      await supabase.from('catalog_product_features').insert(
        p.features.map((f, pos) => ({ product_id: prodId, position: pos, feature: f }))
      );
    }

    if (p.applications && p.applications.length > 0) {
      await supabase.from('catalog_product_applications').insert(
        p.applications.map((a, pos) => ({ product_id: prodId, position: pos, application: a }))
      );
    }

    if (p.specs && p.specs.length > 0) {
      await supabase.from('catalog_product_specs').insert(
        p.specs.map((s, pos) => ({ product_id: prodId, position: pos, label: s.label, value: s.value }))
      );
    }

    console.log(`[${i + 1}/${productsData.length}] Synced "${p.name}" (${p.slug})`);
  }

  // Remove any stale test products like newtest456789 if they exist in DB
  await supabase.from('catalog_products').delete().eq('slug', 'newtest456789');

  console.log('Product restore to Supabase complete!');
}

main().catch(console.error);
