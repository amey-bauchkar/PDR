// Product synchronization between admin panel and main products page

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
};

const STORAGE_KEY = 'pdrworld-admin-products-v2';

/**
 * Get all products from localStorage (admin-managed products)
 */
export const getAdminProducts = (): AdminProduct[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

/**
 * Save products to localStorage
 */
export const saveAdminProducts = (products: AdminProduct[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

/**
 * Add or update a product
 */
export const saveProduct = (product: AdminProduct): void => {
  const products = getAdminProducts();
  const index = products.findIndex((p) => p.slug === product.slug);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  saveAdminProducts(products);
};

/**
 * Delete a product by slug
 */
export const deleteProduct = (slug: string): void => {
  const products = getAdminProducts().filter((p) => p.slug !== slug);
  saveAdminProducts(products);
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

  return {
    ...catalogue,
    sections: catalogue.sections.map((section: any) => ({
      ...section,
      groups: section.groups.map((group: any) => ({
        ...group,
        cards: group.cards
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
          .filter((card: any) => !adminMap.has(card.slug) || adminMap.get(card.slug)?.status === 'Active'),
      })),
    })),
  };
};
