/**
 * GET /api/products
 * Get all products with optional filters and pagination
 */
export declare const getProducts: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * GET /api/products/:id
 * Get single product by ID or slug
 */
export declare const getProduct: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * GET /api/products/:id/configuration-options
 * Get product configuration options
 */
export declare const getProductConfigurationOptions: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * GET /api/products/category/:categoryId
 * Get products by category
 */
export declare const getProductsByCategory: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * GET /api/products/search
 * Search products
 */
export declare const searchProducts: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * POST /api/products
 * Create a new product
 */
export declare const createProduct: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * PUT /api/products/:slug
 * Update an existing product
 */
export declare const updateProduct: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * DELETE /api/products/:slug
 * Delete product by slug
 */
export declare const deleteProduct: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * POST /api/products/image-upload-url
 * Get a signed URL for image upload
 */
export declare const getImageUploadUrl: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * POST /api/products/datasheet-upload-url
 * Get a signed URL for datasheet upload
 */
export declare const getDatasheetUploadUrl: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * GET /api/products/datasheet-download/:slug
 * Generate a signed download URL for a product's datasheet
 */
export declare const getDatasheetDownloadUrl: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=productController.d.ts.map