/** URL segment under /products/ — used for SEO and Ads landing pages */
export const PRODUCT_CATEGORY_PATHS = [
  'active-components',
  'passive-components',
  'cable-management',
  'test-measuring',
  'specialty-drones',
] as const;

export type ProductCategoryPath = (typeof PRODUCT_CATEGORY_PATHS)[number];

const PATH_TO_SECTION: Record<ProductCategoryPath, string> = {
  'active-components': 'active',
  'passive-components': 'passive',
  'cable-management': 'cable',
  'test-measuring': 'test',
  'specialty-drones': 'specialty',
};

const SECTION_TO_PATH = Object.fromEntries(
  Object.entries(PATH_TO_SECTION).map(([path, id]) => [id, path]),
) as Record<string, ProductCategoryPath>;

export function isProductCategoryPath(slug: string): slug is ProductCategoryPath {
  return (PRODUCT_CATEGORY_PATHS as readonly string[]).includes(slug);
}

export function categoryPathToSectionId(path: ProductCategoryPath): string {
  return PATH_TO_SECTION[path];
}

export function sectionIdToCategoryPath(sectionId: string): ProductCategoryPath | undefined {
  return SECTION_TO_PATH[sectionId];
}

export function productsCategoryHref(sectionId: string): string {
  const p = SECTION_TO_PATH[sectionId];
  return p ? `/products/${p}` : '/products';
}

export function categoryCanonical(path: ProductCategoryPath): string {
  return `https://pdrworld.com/products/${path}`;
}
