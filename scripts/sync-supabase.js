import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncProducts() {
  console.log('Syncing products from Supabase for static build...');

  // Use environment variables (which will be present during Vercel build)
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing. Skipping sync and using existing products.json.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const [
      { data: products, error: e1 },
      { data: specs, error: e2 },
      { data: features, error: e3 },
      { data: apps, error: e4 },
      { data: cats, error: e5 }
    ] = await Promise.all([
      supabase
        .from('catalog_products')
        .select('id, slug, category_id, name, title, tagline, description, canonical_url, hero_icon_svg, image_url, sort_order, status, metadata, updated_at')
        .order('sort_order', { ascending: true }),
      supabase.from('catalog_product_specs').select('*'),
      supabase.from('catalog_product_features').select('*'),
      supabase.from('catalog_product_applications').select('*'),
      supabase.from('product_categories').select('id,name')
    ]);

    if (e1 || e2 || e3 || e4 || e5) throw e1 || e2 || e3 || e4 || e5;

    const catsMap = new Map(cats?.map(c => [c.id, c.name]));
    const specsMap = new Map();
    specs?.forEach(s => {
      if (!specsMap.has(s.product_id)) specsMap.set(s.product_id, []);
      specsMap.get(s.product_id).push(s);
    });
    const featuresMap = new Map();
    features?.forEach(f => {
      if (!featuresMap.has(f.product_id)) featuresMap.set(f.product_id, []);
      featuresMap.get(f.product_id).push(f);
    });
    const appsMap = new Map();
    apps?.forEach(a => {
      if (!appsMap.has(a.product_id)) appsMap.set(a.product_id, []);
      appsMap.get(a.product_id).push(a);
    });

    const finalProducts = products.map(db => {
      const pFeatures = (featuresMap.get(db.id) || [])
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map(f => f.feature);

      const pApps = (appsMap.get(db.id) || [])
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map(a => a.application);

      const pSpecs = (specsMap.get(db.id) || [])
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map(s => ({ label: s.label, value: s.value }));

      const mainCategory = catsMap.get(db.category_id) || 'Active Components';
      const subcategory = db.metadata?.subcategory || '';
      const fullCategory = subcategory ? `${mainCategory} > ${subcategory}` : mainCategory;

      return {
        slug: db.slug,
        name: db.name,
        category: fullCategory,
        title: db.title,
        description: db.description,
        canonical: db.canonical_url,
        tagline: db.tagline,
        status: db.status === 'published' ? 'Active' : (db.status === 'draft' ? 'Draft' : 'Archived'),
        imageUrl: db.image_url,
        features: pFeatures,
        applications: pApps,
        specs: pSpecs,
        heroIcon: db.hero_icon_svg,
        datasheetUrl: db.metadata?.datasheet_url?.startsWith?.('data:') ? '' : (db.metadata?.datasheet_url || ''),
        galleryUrls: db.metadata?.gallery_urls || [],
        tags: db.metadata?.tags || [],
        updatedAt: db.updated_at,
      };
    }).filter(Boolean);

    if (finalProducts.length > 0) {
      const outputPath = path.join(__dirname, '../src/data/products.json');
      fs.writeFileSync(outputPath, JSON.stringify(finalProducts, null, 2), 'utf8');
      console.log(`Successfully synced ${finalProducts.length} products to src/data/products.json!`);
    } else {
      console.warn('No products found in Supabase. Skipping file update.');
    }
  } catch (err) {
    console.error('Failed to sync products from Supabase:', err);
    process.exit(0);
  }
}

syncProducts();
