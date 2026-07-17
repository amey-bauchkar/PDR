import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Lightweight select for list view - skips features and applications joins.
const PRODUCT_LIST_SELECT = `
  slug, name, status, image_url, tagline, description, title, canonical_url,
  hero_icon_svg, metadata, updated_at,
  category_ref:product_categories(name),
  specs:catalog_product_specs(label, value, position)
`;

// Full select used only after create/update to return complete product data.
const PRODUCT_FULL_SELECT = `
  *,
  category_ref:product_categories(name),
  features:catalog_product_features(feature, position),
  applications:catalog_product_applications(application, position),
  specs:catalog_product_specs(label, value, position)
`;

function mapDbProduct(db) {
  if (!db) return null;

  const features = (db.features || [])
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((f) => f.feature);

  const applications = (db.applications || [])
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((a) => a.application);

  const specs = (db.specs || [])
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((s) => ({ label: s.label, value: s.value }));

  const mainCategory = db.category_ref?.name || 'Active Components';
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
    features,
    applications,
    specs,
    heroIcon: db.hero_icon_svg,
    datasheetUrl: db.metadata?.datasheet_url?.startsWith?.('data:') ? '' : (db.metadata?.datasheet_url || ''),
    galleryUrls: db.metadata?.gallery_urls || [],
    tags: db.metadata?.tags || [],
    updatedAt: db.updated_at,
  };
}

async function getCategoryIdFromName(supabase, categoryName) {
  const fullCategory = (categoryName || 'Active Components').trim();
  const parts = fullCategory.split(' > ');
  const name = parts[0].trim();
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'active-components';

  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('id')
      .ilike('name', name)
      .limit(1);

    if (!error && data && data.length > 0) return data[0].id;
  } catch {
    // Try to create the category below.
  }

  const { data: created, error: createError } = await supabase
    .from('product_categories')
    .upsert({ slug, name, description: `Category for ${name}` }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (createError) {
    console.warn('Failed to create product category:', createError.message);
    return null;
  }

  return created?.id || null;
}

async function handleGet(req, res) {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ success: false, error: 'Database not configured' });
  }

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

    const finalProducts = products.map(p => mapDbProduct({
      ...p,
      category_ref: { name: catsMap.get(p.category_id) },
      specs: specsMap.get(p.id) || [],
      features: featuresMap.get(p.id) || [],
      applications: appsMap.get(p.id) || []
    })).filter(Boolean);

    return res.status(200).json({ success: true, data: finalProducts });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
}

async function handlePost(req, res) {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ success: false, error: 'Database not configured' });
  }

  try {
    const prod = req.body;
    if (!prod || !prod.slug || !prod.name) {
      return res.status(400).json({ success: false, error: 'Missing required fields: slug, name' });
    }

    const categoryId = await getCategoryIdFromName(supabase, prod.category);

    // Extract subcategory from "Main Category > Subcategory"
    const catParts = (prod.category || '').split(' > ');
    const subcategoryName = catParts.length > 1 ? catParts.slice(1).join(' > ').trim() : '';

    const specsMap = (prod.specs || []).reduce((acc, s) => {
      acc[s.label] = s.value;
      return acc;
    }, {});

    const environment = specsMap['Environment'] || specsMap['Installation'] || 'Indoor/Outdoor';
    const mountType = specsMap['Mount Type'] || specsMap['Mounting'] || 'Rack Mount';
    const capacityVal = parseInt(specsMap['Capacity'] || specsMap['Ports'] || '0') || 0;

    // Get current max sort_order
    const { data: maxSortData } = await supabase
      .from('catalog_products')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextSortOrder = maxSortData && maxSortData.length > 0 ? (maxSortData[0].sort_order + 1) : 0;

    const productRow = {
      slug: prod.slug,
      category_id: categoryId,
      name: prod.name,
      title: prod.title || `${prod.name} | PDR World`,
      tagline: prod.tagline || '',
      description: prod.description || '',
      canonical_url: prod.canonical || `https://pdrworld.com/products/${prod.slug}`,
      hero_icon_svg: prod.heroIcon || '',
      image_url: prod.imageUrl || '',
      sort_order: nextSortOrder,
      status: prod.status === 'Active' ? 'published' : (prod.status === 'Draft' ? 'draft' : 'archived'),
      metadata: {
        environment,
        mount_type: mountType,
        capacity: capacityVal,
        specs: specsMap,
        subcategory: subcategoryName,
        datasheet_url: prod.datasheetUrl || '',
        gallery_urls: prod.galleryUrls || [],
        tags: prod.tags || [],
      },
    };

    const { data, error } = await supabase
      .from('catalog_products')
      .insert(productRow)
      .select()
      .single();

    if (error) throw error;
    const dbProdId = data.id;

    // Insert features
    if (prod.features && prod.features.length > 0) {
      const featureRows = prod.features.map((f, idx) => ({
        product_id: dbProdId,
        position: idx,
        feature: f,
      }));
      await supabase.from('catalog_product_features').insert(featureRows);
    }

    // Insert applications
    if (prod.applications && prod.applications.length > 0) {
      const appRows = prod.applications.map((a, idx) => ({
        product_id: dbProdId,
        position: idx,
        application: a,
      }));
      await supabase.from('catalog_product_applications').insert(appRows);
    }

    // Insert new specs
    if (prod.specs && prod.specs.length > 0) {
      const specRows = prod.specs.map((s, idx) => ({
        product_id: dbProdId,
        position: idx,
        label: s.label,
        value: s.value,
      }));
      await supabase.from('catalog_product_specs').insert(specRows);
    }

    prod.updatedAt = productRow.updated_at;
    return res.status(200).json({ success: true, data: prod });
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ success: false, error: 'Failed to create product', message: err.message });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
