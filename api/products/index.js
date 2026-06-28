import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const PRODUCT_SELECT = `
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

  return {
    slug: db.slug,
    name: db.name,
    category: db.category_ref?.name || 'Active Components',
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
    datasheetUrl: db.metadata?.datasheet_url || '',
    galleryUrls: db.metadata?.gallery_urls || [],
    updatedAt: db.updated_at,
  };
}

async function getCategoryIdFromName(supabase, categoryName) {
  const name = (categoryName || 'Active Components').trim();
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
    const { data, error } = await supabase
      .from('catalog_products')
      .select(PRODUCT_SELECT)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const products = (data || []).map(mapDbProduct).filter(Boolean);
    return res.status(200).json({ success: true, data: products });
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
        datasheet_url: prod.datasheetUrl || '',
        gallery_urls: prod.galleryUrls || [],
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

    // Insert specs
    if (prod.specs && prod.specs.length > 0) {
      const specRows = prod.specs.map((s, idx) => ({
        product_id: dbProdId,
        position: idx,
        label: s.label,
        value: s.value,
      }));
      await supabase.from('catalog_product_specs').insert(specRows);
    }

    // Fetch the newly created product with all relations
    const { data: created, error: fetchError } = await supabase
      .from('catalog_products')
      .select(PRODUCT_SELECT)
      .eq('slug', prod.slug)
      .single();

    if (fetchError) throw fetchError;

    return res.status(201).json({ success: true, data: mapDbProduct(created) });
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ success: false, error: 'Failed to create product', message: err.message });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
