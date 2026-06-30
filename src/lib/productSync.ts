import seedProducts from '../data/products.json';
import { get, set } from 'idb-keyval';
import { supabase } from './supabase';

export type AdminProduct = {
  slug: string;
  name: string;
  category: string;
  title?: string;
  description?: string;
  canonical?: string;
  tagline?: string;
  status: 'Active' | 'Draft' | 'Archived';
  imageUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
  // Extra detailed fields for ProductDetail integration
  features?: string[];
  applications?: string[];
  specs?: { label: string; value: string }[];
  related?: { slug: string; name: string }[];
  heroIcon?: string;
  datasheetUrl?: string;
  galleryUrls?: string[];
};

const STORAGE_KEY = 'pdrworld-admin-products-v3';
const PRODUCTS_API_URL = '/api/products';

const getDefaultProducts = (): AdminProduct[] => {
  return (seedProducts as Omit<AdminProduct, 'status' | 'updatedAt' | 'updatedBy'>[]).map((item) => ({
    ...item,
    status: 'Active',
  }));
};

let memoryCache: AdminProduct[] | null = null;

/**
 * Initialize product store from IndexedDB on startup
 */
export const initializeProductStore = async (): Promise<void> => {
  try {
    const idbProducts = await get<AdminProduct[]>(STORAGE_KEY);
    if (idbProducts && idbProducts.length > 0) {
      memoryCache = idbProducts;
    } else {
      // Migrate from localStorage if present
      let raw = localStorage.getItem(STORAGE_KEY);
      let localProducts = raw ? JSON.parse(raw) : [];
      
      // If v3 is empty, try to migrate from v2 to restore lost data
      if (localProducts.length === 0) {
        const rawV2 = localStorage.getItem('pdrworld-admin-products-v2');
        if (rawV2) {
          const v2Products = JSON.parse(rawV2) as AdminProduct[];
          // Fix categories using seedProducts
          const seedMap = new Map(seedProducts.map(p => [p.slug, p.category]));
          localProducts = v2Products.map(p => ({
            ...p,
            category: seedMap.get(p.slug) || p.category // restore category if it was corrupted
          }));
          console.log('Migrated data from v2 and restored categories.');
        }
      }

      if (localProducts.length > 0) {
        memoryCache = localProducts;
        await set(STORAGE_KEY, localProducts);
      } else {
        const defaultProducts = getDefaultProducts();
        memoryCache = defaultProducts;
        await set(STORAGE_KEY, defaultProducts);
      }
    }
  } catch (err) {
    console.error("Failed to read from IDB:", err);
    memoryCache = getDefaultProducts();
  }
  // Dispatch update to sync React state immediately after loading
  window.dispatchEvent(new Event('pdrworld-product-update'));
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || payload?.error || `Request failed: ${response.status}`);
  }

  return payload.data as T;
}

/**
 * Get all products from memory cache (or fallback to localStorage if not initialized)
 */
export const getAdminProducts = (): AdminProduct[] => {
  if (memoryCache !== null) return memoryCache;
  if (typeof window === 'undefined') return getDefaultProducts();
  const raw = localStorage.getItem(STORAGE_KEY);
  const products = raw ? JSON.parse(raw) : [];
  if (products.length > 0) return products;

  // Fallback to v2 for synchronous render if v3 is empty
  const rawV2 = localStorage.getItem('pdrworld-admin-products-v2');
  if (rawV2) {
    const v2Products = JSON.parse(rawV2) as AdminProduct[];
    const seedMap = new Map(seedProducts.map(p => [p.slug, p.category]));
    return v2Products.map(p => ({
      ...p,
      category: seedMap.get(p.slug) || p.category
    }));
  }

  return getDefaultProducts();
};

/**
 * Save products to IDB and memory cache
 */
export const saveAdminProducts = async (products: AdminProduct[]): Promise<void> => {
  if (typeof window === 'undefined') return;
  memoryCache = products;
  
  try {
    await set(STORAGE_KEY, products);
  } catch (err) {
    console.error("Failed to save to IDB:", err);
    // Fallback if IDB fails
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch(e) {
      console.warn("localStorage quota exceeded");
    }
  }
  
  window.dispatchEvent(new Event('pdrworld-product-update'));
};

/**
 * Add or update a product in local cache AND backend database.
 * Waits for the API write before updating local cache so all devices see the
 * same confirmed product state.
 */
export const saveProduct = async (product: AdminProduct, previousSlug = product.slug): Promise<void> => {
  const products = getAdminProducts();
  const index = products.findIndex((p) => p.slug === previousSlug || p.slug === product.slug);
  const isUpdate = index >= 0;

  const savedProduct = await requestJson<AdminProduct>(
    isUpdate ? `${PRODUCTS_API_URL}/${encodeURIComponent(previousSlug)}` : PRODUCTS_API_URL,
    {
      method: isUpdate ? 'PUT' : 'POST',
      body: JSON.stringify(product),
    }
  );

  const localProduct = {
    ...product,
    ...savedProduct,
    updatedAt: savedProduct.updatedAt || product.updatedAt || new Date().toISOString(),
  };
  if (index >= 0) {
    products[index] = localProduct;
  } else {
    products.unshift(localProduct);
  }
  await saveAdminProducts(products);
};

/**
 * Delete a product by slug in local cache AND backend database.
 * Waits for the API delete before updating local cache.
 */
export const deleteProduct = async (slug: string): Promise<void> => {
  await requestJson<{ slug: string }>(`${PRODUCTS_API_URL}/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });

  const products = getAdminProducts().filter((p) => p.slug !== slug);
  await saveAdminProducts(products);
};

/**
 * Map a raw Supabase catalog_products row to AdminProduct format.
 */
function mapSupabaseProduct(db: any): AdminProduct | null {
  if (!db) return null;
  const features = (db.features || [])
    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((f: any) => f.feature);
  const applications = (db.applications || [])
    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((a: any) => a.application);
  const specs = (db.specs || [])
    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((s: any) => ({ label: s.label, value: s.value }));
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



/**
 * Fetch all products — uses DIRECT Supabase connection (no serverless cold start!).
 * Falls back to API if Supabase client is not available.
 */
export const fetchAndSyncProducts = async (): Promise<AdminProduct[]> => {
  // PRIMARY: Direct Supabase query from browser — ~200-500ms, no cold start
  if (supabase) {
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
          .select('id, slug, category_id, name, title, tagline, description, canonical_url, hero_icon_svg, image_url, sort_order, status, updated_at')
          .order('sort_order', { ascending: true }),
        supabase.from('catalog_product_specs').select('*'),
        supabase.from('catalog_product_features').select('*'),
        supabase.from('catalog_product_applications').select('*'),
        supabase.from('product_categories').select('id,name')
      ]);

      if (e1 || e2 || e3 || e4 || e5) throw e1 || e2 || e3 || e4 || e5;

      const catsMap = new Map(cats?.map((c: any) => [c.id, c.name]));
      const specsMap = new Map();
      specs?.forEach((s: any) => {
        if (!specsMap.has(s.product_id)) specsMap.set(s.product_id, []);
        specsMap.get(s.product_id).push(s);
      });
      const featuresMap = new Map();
      features?.forEach((f: any) => {
        if (!featuresMap.has(f.product_id)) featuresMap.set(f.product_id, []);
        featuresMap.get(f.product_id).push(f);
      });
      const appsMap = new Map();
      apps?.forEach((a: any) => {
        if (!appsMap.has(a.product_id)) appsMap.set(a.product_id, []);
        appsMap.get(a.product_id).push(a);
      });

      const mapped = products!.map((p: any) => mapSupabaseProduct({
        ...p,
        category_ref: { name: catsMap.get(p.category_id) },
        specs: specsMap.get(p.id) || [],
        features: featuresMap.get(p.id) || [],
        applications: appsMap.get(p.id) || []
      })).filter(Boolean) as AdminProduct[];

      await saveAdminProducts(mapped);
      return mapped;
    } catch (err) {
      console.warn('[productSync] Supabase direct fetch failed, trying API fallback:', err);
    }
  }

  // FALLBACK: API route (used if Supabase client not configured)
  try {
    const apiProducts = await requestJson<AdminProduct[]>(PRODUCTS_API_URL);
    if (apiProducts && apiProducts.length > 0) {
      await saveAdminProducts(apiProducts);
      return apiProducts;
    }
    console.warn('[productSync] API returned empty product list, keeping local cache.');
    return getAdminProducts();
  } catch (err) {
    console.warn('[productSync] Failed to sync products from backend, using local cache:', err);
    return getAdminProducts();
  }
};

export const fetchProductBySlug = async (slug: string): Promise<AdminProduct | null> => {
  try {
    const product = await requestJson<AdminProduct>(`${PRODUCTS_API_URL}/${encodeURIComponent(slug)}`);
    const products = getAdminProducts();
    const index = products.findIndex((p) => p.slug === product.slug);
    if (index >= 0) {
      products[index] = { ...products[index], ...product };
    } else {
      products.unshift(product);
    }
    await saveAdminProducts(products);
    return product;
  } catch (err) {
    console.warn('[productSync] Failed to fetch full product detail:', err);
    return null;
  }
};

export const getProductsByCategory = (includeInactive = false) => {
  const products = getAdminProducts().filter(
    (p) => includeInactive || p.status === 'Active'
  );

  // Group by category
  const grouped = products.reduce(
    (acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    },
    {} as Record<string, AdminProduct[]>
  );

  return grouped;
};

/**
 * Merge admin products with original catalogue for display
 * Admin products override catalogue products with matching slug
 */
export const mergeWithCatalogue = (catalogue: any): any => {
  const adminProducts = getAdminProducts().filter((p) => p.status === 'Active');
  const adminMap = new Map(adminProducts.map((p) => [p.slug, p]));

  // Build a set of all slugs already present in the catalog.json
  const catalogueSlugs = new Set<string>();
  if (catalogue && catalogue.sections) {
    catalogue.sections.forEach((section: any) => {
      if (section.groups) {
        section.groups.forEach((group: any) => {
          if (group.cards) {
            group.cards.forEach((card: any) => {
              if (card.slug) catalogueSlugs.add(card.slug);
            });
          }
        });
      }
    });
  }

  // Identify new admin-added products that aren't in catalog.json
  const newAdminProducts = adminProducts.filter((p) => !catalogueSlugs.has(p.slug));

  // Heuristic to map product categories to section IDs in catalogue.json
  const getSectionId = (category: string): string => {
    const catLower = category.toLowerCase().trim();
    if (catLower.includes('active')) return 'active';
    if (catLower.includes('passive')) return 'passive';
    if (catLower.includes('cable') || catLower.includes('management')) return 'cable';
    if (catLower.includes('test') || catLower.includes('measuring') || catLower.includes('equipment')) return 'test';
    if (catLower.includes('specialty') || catLower.includes('drone')) return 'specialty';
    if (catLower.includes('tool') || catLower.includes('maintenance')) return 'tools';
    return 'passive'; // Fallback to passive
  };

  return {
    ...catalogue,
    sections: catalogue.sections.map((section: any) => {
      // Find all new admin products matching this section
      const sectionNewProducts = newAdminProducts.filter(
        (p) => getSectionId(p.category) === section.id
      );

      return {
        ...section,
        groups: section.groups.map((group: any, groupIndex: number) => {
          const existingCards = group.cards
            .map((card: any) => {
              const adminProduct = adminMap.get(card.slug);
              if (adminProduct) {
                // Override with admin data
                return {
                  ...card,
                  name: adminProduct.name,
                  blurb: adminProduct.description || card.blurb,
                  img: adminProduct.imageUrl || card.img,
                  tag: adminProduct.tagline || card.tag,
                };
              }
              return card;
            })
            .filter((card: any) => !adminMap.has(card.slug) || adminMap.get(card.slug)?.status === 'Active');

          // If there are new products for this section, append them to the first group
          if (groupIndex === 0 && sectionNewProducts.length > 0) {
            const newCards = sectionNewProducts.map((p) => {
              const finalTagline = p.tagline || 'High performance serial optical data communication';
              const finalDescription = p.description || 'High performance serial optical data communication\nCost effective modules\nCompatible with major OEM switches';
              const finalSpecs = p.specs && p.specs.length > 0 ? p.specs : [
                { label: 'Form Factor', value: 'SFP / SFP+ / QSFP' },
                { label: 'Data Rate', value: '155M to 400G' },
                { label: 'Connector', value: 'LC / SC Duplex' },
                { label: 'DOM Support', value: 'Yes' },
              ];
              const finalImage = p.imageUrl || 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=900&q=80';

              return {
                slug: p.slug,
                tag: finalTagline,
                img: finalImage,
                heroSvg: p.heroIcon || '<svg width="120" height="120" viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="1.5"><rect x="8" y="16" width="32" height="16" rx="3"></rect><rect x="4" y="20" width="6" height="8" rx="1"></rect><rect x="38" y="20" width="6" height="8" rx="1"></rect><line x1="14" y1="24" x2="34" y2="24"></line></svg>',
                name: p.name,
                blurb: finalDescription,
                pills: finalSpecs.slice(0, 3).map((s) => s.value),
                detailsSlug: p.slug,
                addItem: {
                  title: p.name,
                  specs: `${finalSpecs[0].label}: ${finalSpecs[0].value}`,
                  image: finalImage,
                },
              };
            });
            return {
              ...group,
              cards: [...newCards, ...existingCards],
            };
          }

          return {
            ...group,
            cards: existingCards,
          };
        }),
      };
    }),
  };
};

/**
 * Merge admin products with original product details list
 * Admin products override catalogue products with matching slug
 */
export const mergeWithProducts = (rawProducts: any[]): any[] => {
  const adminProducts = getAdminProducts().filter((p) => p.status === 'Active');
  const adminMap = new Map(adminProducts.map((p) => [p.slug, p]));

  // Merge existing products, or add new ones
  const merged = rawProducts.map((p) => {
    const adminProd = adminMap.get(p.slug);
    if (adminProd) {
      const finalFeatures = adminProd.features && adminProd.features.length > 0 ? adminProd.features : [
        "High performance serial optical data communication",
        "Cost effective modules",
        "Compatible with major OEM switches"
      ];
      const finalApplications = adminProd.applications && adminProd.applications.length > 0 ? adminProd.applications : [
        "Telecom Networks",
        "Data Centers",
        "Enterprise IT",
        "ISP Infrastructure"
      ];
      const finalSpecs = adminProd.specs && adminProd.specs.length > 0 ? adminProd.specs : [
        { label: 'Form Factor', value: 'SFP / SFP+ / QSFP' },
        { label: 'Data Rate', value: '155M to 400G' },
        { label: 'Connector', value: 'LC / SC Duplex' },
        { label: 'DOM Support', value: 'Yes' },
      ];

      return {
        ...p,
        name: adminProd.name,
        category: adminProd.category,
        title: adminProd.title || p.title,
        description: adminProd.description || p.description,
        canonical: adminProd.canonical || p.canonical,
        tagline: adminProd.tagline || p.tagline,
        imageUrl: adminProd.imageUrl || p.imageUrl,
        features: finalFeatures,
        applications: finalApplications,
        specs: finalSpecs,
        related: adminProd.related || p.related || [],
        heroIcon: adminProd.heroIcon || p.heroIcon,
        datasheetUrl: adminProd.datasheetUrl || p.datasheetUrl || '',
        galleryUrls: adminProd.galleryUrls || p.galleryUrls || [],
      };
    }
    return p;
  });

  // Append new products that aren't in original products.json
  const existingSlugs = new Set(rawProducts.map((p) => p.slug));
  const newAdminProducts = adminProducts.filter((p) => !existingSlugs.has(p.slug));
  for (const p of newAdminProducts) {
    const finalTagline = p.tagline || 'High performance serial optical data communication';
    const finalDescription = p.description || 'High performance serial optical data communication\nCost effective modules\nCompatible with major OEM switches';
    const finalFeatures = p.features && p.features.length > 0 ? p.features : [
      "High performance serial optical data communication",
      "Cost effective modules",
      "Compatible with major OEM switches"
    ];
    const finalApplications = p.applications && p.applications.length > 0 ? p.applications : [
      "Telecom Networks",
      "Data Centers",
      "Enterprise IT",
      "ISP Infrastructure"
    ];
    const finalSpecs = p.specs && p.specs.length > 0 ? p.specs : [
      { label: 'Form Factor', value: 'SFP / SFP+ / QSFP' },
      { label: 'Data Rate', value: '155M to 400G' },
      { label: 'Connector', value: 'LC / SC Duplex' },
      { label: 'DOM Support', value: 'Yes' },
    ];
    const finalImage = p.imageUrl || 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=900&q=80';

    merged.push({
      slug: p.slug,
      name: p.name,
      category: p.category,
      title: p.title || `${p.name} | PDR World`,
      description: finalDescription,
      canonical: p.canonical || `https://pdr-sable.vercel.app/products/${p.slug}`,
      tagline: finalTagline,
      imageUrl: finalImage,
      features: finalFeatures,
      applications: finalApplications,
      specs: finalSpecs,
      related: p.related && p.related.length > 0 ? p.related : [
        { slug: 'smart-sfp', name: 'Smart SFP Transceiver' },
        { slug: 'sfp-400g', name: '400G' },
      ],
      heroIcon: p.heroIcon || '<svg width="120" height="120" viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="1.5"><rect x="8" y="16" width="32" height="16" rx="3"></rect><rect x="4" y="20" width="6" height="8" rx="1"></rect><rect x="38" y="20" width="6" height="8" rx="1"></rect><line x1="14" y1="24" x2="34" y2="24"></line></svg>',
      datasheetUrl: p.datasheetUrl || '',
      galleryUrls: p.galleryUrls || [],
    });
  }

  return merged;
};
