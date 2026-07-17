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
  tags?: string[];
  heroIcon?: string;
  datasheetUrl?: string;
  galleryUrls?: string[];
};

const STORAGE_KEY = 'pdrworld-admin-products-v4'; // Bumped to v4 to force fresh datasheet sync on all devices
const PRODUCTS_API_URL = '/api/products';

const getDefaultProducts = (): AdminProduct[] => {
  return (seedProducts as Omit<AdminProduct, 'status' | 'updatedAt' | 'updatedBy'>[]).map((item) => ({
    ...item,
    status: 'Active',
  }));
};

let memoryCache: AdminProduct[] | null = null;
let dbSyncSucceeded = false;

// Hardcoded list of slugs that were permanently removed but might still exist in local IndexedDB caches or Supabase.
// This guarantees they never show up on the frontend again.
const DELETED_SLUGS = new Set([
  'lc-uniboot',
  'loop-back-patch-cord',
  'loopback',
  'mini-optical-power-meter',
  'fiber-optic-adapter',
  'easyget-wifi',
  'splice-on-connector',
  'splice-on',
]);

/**
 * Check if the DB sync has succeeded (DB is authoritative)
 */
export const isDbSynced = (): boolean => dbSyncSucceeded;

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
      
      // If v4 is empty, try to migrate from v3/v2 to restore data
      if (localProducts.length === 0) {
        // Try v3 first
        const rawV3 = localStorage.getItem('pdrworld-admin-products-v3');
        if (rawV3) {
          const v3Products = JSON.parse(rawV3) as AdminProduct[];
          localProducts = v3Products;
          console.log('Migrated data from v3 to v4 for fresh datasheet sync.');
        } else {
          // Fallback to v2
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
  if (memoryCache !== null) return memoryCache.filter(p => !DELETED_SLUGS.has(p.slug));
  if (typeof window === 'undefined') return getDefaultProducts().filter(p => !DELETED_SLUGS.has(p.slug));
  const raw = localStorage.getItem(STORAGE_KEY);
  const products = raw ? JSON.parse(raw) : [];
  if (products.length > 0) return products.filter((p: AdminProduct) => !DELETED_SLUGS.has(p.slug));

  // Fallback to v3 first, then v2 for synchronous render if v4 is empty
  const rawV3 = localStorage.getItem('pdrworld-admin-products-v3');
  if (rawV3) {
    const v3Products = JSON.parse(rawV3) as AdminProduct[];
    return v3Products.filter(p => !DELETED_SLUGS.has(p.slug));
  }
  
  const rawV2 = localStorage.getItem('pdrworld-admin-products-v2');
  if (rawV2) {
    const v2Products = JSON.parse(rawV2) as AdminProduct[];
    const seedMap = new Map(seedProducts.map(p => [p.slug, p.category]));
    return v2Products.map(p => ({
      ...p,
      category: seedMap.get(p.slug) || p.category
    })).filter(p => !DELETED_SLUGS.has(p.slug));
  }

  return getDefaultProducts().filter(p => !DELETED_SLUGS.has(p.slug));
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

const mergePreservingDatasheets = (incoming: AdminProduct[]): AdminProduct[] => {
  const currentBySlug = new Map(getAdminProducts().map((product) => [product.slug, product]));
  return incoming.map((product) => {
    const existing = currentBySlug.get(product.slug);
    if (!existing?.datasheetUrl || product.datasheetUrl) return product;
    return { ...product, datasheetUrl: existing.datasheetUrl };
  });
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

  let savedProduct: AdminProduct | null = null;
  try {
    savedProduct = await requestJson<AdminProduct>(
      PRODUCTS_API_URL,
      {
        method: isUpdate ? 'PUT' : 'POST',
        body: JSON.stringify(product),
      }
    );
  } catch (err) {
    console.error("Vercel API failed to save product, trying direct Supabase fallback...", err);
    if (supabase) {
      try {
        let categoryId = null;
        const fullCategory = product.category || 'Active Components';
        const catParts = fullCategory.split(' > ');
        const mainCatName = catParts[0].trim();
        const subcategoryName = catParts.length > 1 ? catParts.slice(1).join(' > ').trim() : '';
        const { data: catData } = await supabase.from('product_categories').select('id').ilike('name', mainCatName).limit(1);
        
        if (catData && catData.length > 0) {
          categoryId = catData[0].id;
        } else {
          const { data: newCat } = await supabase.from('product_categories').upsert({
            slug: mainCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            name: mainCatName,
            description: `Category for ${mainCatName}`
          }, { onConflict: 'slug' }).select('id').single();
          if (newCat) categoryId = newCat.id;
        }

        const specsMap = (product.specs || []).reduce((acc, s) => { acc[s.label] = s.value; return acc; }, {} as any);
        const productRow = {
          slug: product.slug,
          category_id: categoryId,
          name: product.name,
          title: product.title || `${product.name} | PDR World`,
          tagline: product.tagline || '',
          description: product.description || '',
          canonical_url: product.canonical || `https://pdr-sable.vercel.app/products/${product.slug}`,
          hero_icon_svg: product.heroIcon || '',
          image_url: product.imageUrl || '',
          status: product.status === 'Active' ? 'published' : (product.status === 'Draft' ? 'draft' : 'archived'),
          metadata: {
            environment: specsMap['Environment'] || specsMap['Installation'] || 'Indoor/Outdoor',
            mount_type: specsMap['Mount Type'] || specsMap['Mounting'] || 'Rack Mount',
            capacity: parseInt(specsMap['Capacity'] || specsMap['Ports'] || '0') || 0,
            specs: specsMap,
            subcategory: subcategoryName,
            datasheet_url: product.datasheetUrl || '',
            gallery_urls: product.galleryUrls || [],
            tags: product.tags || [],
          },
          updated_at: new Date().toISOString(),
        };

        if (isUpdate) {
          const { data: orig } = await supabase.from('catalog_products').select('id').eq('slug', previousSlug).single();
          if (orig) {
            await supabase.from('catalog_products').update(productRow).eq('id', orig.id);
            const dbProdId = orig.id;
            await supabase.from('catalog_product_features').delete().eq('product_id', dbProdId);
            await supabase.from('catalog_product_applications').delete().eq('product_id', dbProdId);
            await supabase.from('catalog_product_specs').delete().eq('product_id', dbProdId);
            
            if (product.features?.length) await supabase.from('catalog_product_features').insert(product.features.map((f, i) => ({ product_id: dbProdId, position: i, feature: f })));
            if (product.applications?.length) await supabase.from('catalog_product_applications').insert(product.applications.map((a, i) => ({ product_id: dbProdId, position: i, application: a })));
            if (product.specs?.length) await supabase.from('catalog_product_specs').insert(product.specs.map((s, i) => ({ product_id: dbProdId, position: i, label: s.label, value: s.value })));
          } else {
             const { data: inserted } = await supabase.from('catalog_products').insert(productRow).select().single();
             if (inserted) {
                const dbProdId = inserted.id;
                if (product.features?.length) await supabase.from('catalog_product_features').insert(product.features.map((f, i) => ({ product_id: dbProdId, position: i, feature: f })));
                if (product.applications?.length) await supabase.from('catalog_product_applications').insert(product.applications.map((a, i) => ({ product_id: dbProdId, position: i, application: a })));
                if (product.specs?.length) await supabase.from('catalog_product_specs').insert(product.specs.map((s, i) => ({ product_id: dbProdId, position: i, label: s.label, value: s.value })));
             }
          }
        } else {
          const { data: maxSortData } = await supabase.from('catalog_products').select('sort_order').order('sort_order', { ascending: false }).limit(1);
          const nextSortOrder = maxSortData && maxSortData.length > 0 ? (maxSortData[0].sort_order + 1) : 0;
          const { data: inserted } = await supabase.from('catalog_products').insert({ ...productRow, sort_order: nextSortOrder }).select().single();
          if (inserted) {
            const dbProdId = inserted.id;
            if (product.features?.length) await supabase.from('catalog_product_features').insert(product.features.map((f, i) => ({ product_id: dbProdId, position: i, feature: f })));
            if (product.applications?.length) await supabase.from('catalog_product_applications').insert(product.applications.map((a, i) => ({ product_id: dbProdId, position: i, application: a })));
            if (product.specs?.length) await supabase.from('catalog_product_specs').insert(product.specs.map((s, i) => ({ product_id: dbProdId, position: i, label: s.label, value: s.value })));
          }
        }
        
        savedProduct = product;
      } catch (sbErr) {
        console.error("Direct Supabase fallback also failed:", sbErr);
        throw sbErr;
      }
    } else {
      throw err;
    }
  }

  const localProduct = {
    ...product,
    ...(savedProduct || {}),
    updatedAt: savedProduct?.updatedAt || product.updatedAt || new Date().toISOString(),
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
  try {
    await requestJson<{ slug: string }>(`${PRODUCTS_API_URL}?slug=${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error("Vercel API failed to delete product, trying direct Supabase fallback...", err);
    if (supabase) {
      try {
        const { error } = await supabase.from('catalog_products').delete().eq('slug', slug);
        if (error) throw error;
      } catch (sbErr) {
        console.error("Direct Supabase delete fallback failed:", sbErr);
        throw sbErr;
      }
    } else {
      throw err;
    }
  }

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
          .select('id, slug, category_id, name, title, tagline, description, canonical_url, hero_icon_svg, image_url, sort_order, status, metadata, updated_at')
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

      const merged = mergePreservingDatasheets(mapped);
      await saveAdminProducts(merged);
      dbSyncSucceeded = true;
      return merged;
    } catch (err) {
      console.warn('[productSync] Supabase direct fetch failed, trying API fallback:', err);
    }
  }

  // FALLBACK: API route (used if Supabase client not configured)
  try {
    const apiProducts = await requestJson<AdminProduct[]>(PRODUCTS_API_URL);
    if (apiProducts && apiProducts.length > 0) {
      const merged = mergePreservingDatasheets(apiProducts);
      await saveAdminProducts(merged);
      dbSyncSucceeded = true;
      return merged;
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

      // Helper: extract subcategory from "Main Category > Subcategory"
      const getSubcategory = (category: string): string => {
        const parts = category.split(' > ');
        return parts.length > 1 ? parts.slice(1).join(' > ').trim() : '';
      };

      // Pre-group new products by their subcategory for matching against group.subhead
      const productsBySubcat = new Map<string, any[]>();
      const unmatched: any[] = [];
      for (const p of sectionNewProducts) {
        const sub = getSubcategory(p.category).toLowerCase();
        if (sub) {
          if (!productsBySubcat.has(sub)) productsBySubcat.set(sub, []);
          productsBySubcat.get(sub)!.push(p);
        } else {
          unmatched.push(p);
        }
      }

      // Track which products got matched to a group
      const matchedSubs = new Set<string>();

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
                  pills: adminProduct.tags && adminProduct.tags.length > 0 ? adminProduct.tags : card.pills,
                };
              }
              return card;
            })
            .filter((card: any) => {
              // If DB sync succeeded, DB is authoritative — only show products that exist in DB with Active status
              if (dbSyncSucceeded) {
                return adminMap.has(card.slug) && adminMap.get(card.slug)?.status === 'Active';
              }
              // Fallback: if DB unreachable, show all static products (graceful degradation)
              return !adminMap.has(card.slug) || adminMap.get(card.slug)?.status === 'Active';
            });

          // Find new products that match this group's subhead
          const groupSubhead = (group.subhead || '').toLowerCase().trim();
          let productsForThisGroup: any[] = [];

          // Match by subcategory → group.subhead
          for (const [sub, products] of productsBySubcat.entries()) {
            if (groupSubhead && (groupSubhead.includes(sub) || sub.includes(groupSubhead))) {
              productsForThisGroup.push(...products);
              matchedSubs.add(sub);
            }
          }

          // For the first group, also add unmatched products and any subcategory products that didn't match any group
          if (groupIndex === 0) {
            productsForThisGroup.push(...unmatched);
            // After all groups are processed, remaining unmatched subcategory products go here too
            for (const [sub, products] of productsBySubcat.entries()) {
              if (!matchedSubs.has(sub)) {
                // Check if any later group would match — if not, add to first group
                const laterMatch = section.groups.slice(1).some((g: any) => {
                  const gs = (g.subhead || '').toLowerCase().trim();
                  return gs && (gs.includes(sub) || sub.includes(gs));
                });
                if (!laterMatch) {
                  productsForThisGroup.push(...products);
                  matchedSubs.add(sub);
                }
              }
            }
          }

          if (productsForThisGroup.length > 0) {
            const newCards = productsForThisGroup.map((p) => {
              const finalTagline = p.tagline || '';
              const finalDescription = p.description || '';
              const finalSpecs = p.specs && p.specs.length > 0 ? p.specs : [];
              const finalImage = p.imageUrl || '';

              return {
                slug: p.slug,
                tag: finalTagline,
                img: finalImage,
                heroSvg: p.heroIcon || '',
                name: p.name,
                blurb: finalDescription,
                pills: p.tags && p.tags.length > 0 ? p.tags : finalSpecs.slice(0, 3).map((s: any) => s.value),
                detailsSlug: p.slug,
                addItem: {
                  title: p.name,
                  specs: finalSpecs.length > 0 ? `${finalSpecs[0].label}: ${finalSpecs[0].value}` : '',
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

  // Filter out products that don't exist in DB (when DB sync succeeded)
  const filteredRawProducts = dbSyncSucceeded
    ? rawProducts.filter((p) => adminMap.has(p.slug) && adminMap.get(p.slug)?.status === 'Active')
    : rawProducts;

  // Merge existing products, or add new ones
  const merged = filteredRawProducts.map((p) => {
    const adminProd = adminMap.get(p.slug);
    if (adminProd) {
      const finalFeatures = adminProd.features && adminProd.features.length > 0 ? adminProd.features : [];
      const finalApplications = adminProd.applications && adminProd.applications.length > 0 ? adminProd.applications : [];
      const finalSpecs = adminProd.specs && adminProd.specs.length > 0 ? adminProd.specs : [];

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
    const finalTagline = p.tagline || '';
    const finalDescription = p.description || '';
    const finalFeatures = p.features && p.features.length > 0 ? p.features : [];
    const finalApplications = p.applications && p.applications.length > 0 ? p.applications : [];
    const finalSpecs = p.specs && p.specs.length > 0 ? p.specs : [];
    const finalImage = p.imageUrl || '';

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
      related: p.related && p.related.length > 0 ? p.related : [],
      heroIcon: p.heroIcon || '',
      datasheetUrl: p.datasheetUrl || '',
      galleryUrls: p.galleryUrls || [],
    });
  }

  return merged;
};
