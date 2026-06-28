import seedProducts from '../data/products.json';
import { get, set } from 'idb-keyval';

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
    headers: {
      'Content-Type': 'application/json',
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
 * Add or update a product in local cache AND backend database
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
  
  if (index >= 0) {
    products[index] = savedProduct;
  } else {
    products.unshift(savedProduct);
  }
  
  await saveAdminProducts(products);
};

/**
 * Delete a product by slug in local cache AND backend database
 */
export const deleteProduct = async (slug: string): Promise<void> => {
  await requestJson<{ slug: string }>(`${PRODUCTS_API_URL}/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });

  const products = getAdminProducts().filter((p) => p.slug !== slug);
  await saveAdminProducts(products);
};

/**
 * Fetch all products from backend database and sync to localStorage cache
 */
export const fetchAndSyncProducts = async (): Promise<AdminProduct[]> => {
  try {
    const products = await requestJson<AdminProduct[]>(PRODUCTS_API_URL);
    await saveAdminProducts(products);
    return products;
  } catch (err) {
    console.warn('Failed to sync products from backend, using local cache:', err);
    return getAdminProducts();
  }
};

/**
 * Get products grouped by category (for display)
 * Returns only Active products by default
 */
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
