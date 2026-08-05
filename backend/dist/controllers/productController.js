import { productService } from '../services/productService.js';
import { asyncHandler } from '../middleware/auth.js';
import { supabaseServiceClient } from '../config/database.js';
const BUCKET = 'product-datasheets';
function safeFileName(name = 'datasheet.pdf') {
    const clean = name
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return clean.endsWith('.pdf') ? clean : `${clean || 'datasheet'}.pdf`;
}
async function ensureBucket(supabase) {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError)
        throw listError;
    if (buckets?.some((bucket) => bucket.name === BUCKET))
        return;
    const { error } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 25 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf'],
    });
    if (error)
        throw error;
}
/**
 * GET /api/products
 * Get all products with optional filters and pagination
 */
export const getProducts = asyncHandler(async (req, res) => {
    const filters = {
        environment: req.query.environment,
        mountType: req.query.mountType,
        category: req.query.category,
        minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity) : undefined,
        maxCapacity: req.query.maxCapacity ? parseInt(req.query.maxCapacity) : undefined,
    };
    let result;
    if (req.query.page) {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        result = await productService.getProducts(filters, page, pageSize);
    }
    else {
        result = await productService.getProducts(filters);
    }
    res.json({
        success: true,
        data: result,
        timestamp: Date.now(),
    });
});
/**
 * GET /api/products/:id
 * Get single product by ID or slug
 */
export const getProduct = asyncHandler(async (req, res) => {
    const product = await productService.getProduct(req.params.id);
    res.json({
        success: true,
        data: product,
        timestamp: Date.now(),
    });
});
/**
 * GET /api/products/:id/configuration-options
 * Get product configuration options
 */
export const getProductConfigurationOptions = asyncHandler(async (req, res) => {
    const options = await productService.getProductConfigurationOptions(req.params.id);
    res.json({
        success: true,
        data: options,
        timestamp: Date.now(),
    });
});
/**
 * GET /api/products/category/:categoryId
 * Get products by category
 */
export const getProductsByCategory = asyncHandler(async (req, res) => {
    const products = await productService.getProductsByCategory(req.params.categoryId);
    res.json({
        success: true,
        data: products,
        timestamp: Date.now(),
    });
});
/**
 * GET /api/products/search
 * Search products
 */
export const searchProducts = asyncHandler(async (req, res) => {
    const query = req.query.q;
    const products = await productService.searchProducts(query);
    res.json({
        success: true,
        data: products,
        timestamp: Date.now(),
    });
});
/**
 * POST /api/products
 * Create a new product
 */
export const createProduct = asyncHandler(async (req, res) => {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json({
        success: true,
        data: newProduct,
        timestamp: Date.now(),
    });
});
/**
 * PUT /api/products/:slug
 * Update an existing product
 */
export const updateProduct = asyncHandler(async (req, res) => {
    const updatedProduct = await productService.updateProduct(req.params.slug, req.body);
    res.json({
        success: true,
        data: updatedProduct,
        timestamp: Date.now(),
    });
});
/**
 * DELETE /api/products/:slug
 * Delete product by slug
 */
export const deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.slug);
    res.json({
        success: true,
        data: { slug: req.params.slug },
        timestamp: Date.now(),
    });
});
/**
 * POST /api/products/datasheet-upload-url
 * Get a signed URL for datasheet upload
 */
export const getDatasheetUploadUrl = asyncHandler(async (req, res) => {
    const { slug, fileName, fileSize } = req.body || {};
    if (!slug) {
        return res.status(400).json({ success: false, error: 'Missing product slug' });
    }
    if (fileSize && fileSize > 25 * 1024 * 1024) {
        return res.status(413).json({ success: false, error: 'PDF size must be less than 25MB.' });
    }
    if (!supabaseServiceClient) {
        return res.status(500).json({ success: false, error: 'Storage not configured' });
    }
    await ensureBucket(supabaseServiceClient);
    const stamp = Date.now();
    const path = `${slug}/${stamp}-${safeFileName(fileName)}`;
    const { data, error } = await supabaseServiceClient.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error)
        throw error;
    const publicUrl = supabaseServiceClient.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    res.status(200).json({
        success: true,
        data: {
            bucket: BUCKET,
            path,
            token: data.token,
            publicUrl,
        },
    });
});
//# sourceMappingURL=productController.js.map