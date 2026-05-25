import { Response } from 'express';
import { productService } from '../services/productService.js';
import { AuthRequest, asyncHandler } from '../middleware/auth.js';
import { ProductFilter } from '../types/index.js';

/**
 * GET /api/products
 * Get all products with optional filters and pagination
 */
export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filters: ProductFilter = {
    environment: req.query.environment as string,
    mountType: req.query.mountType as string,
    category: req.query.category as string,
    minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity as string) : undefined,
    maxCapacity: req.query.maxCapacity ? parseInt(req.query.maxCapacity as string) : undefined,
  };

  let result;
  if (req.query.page) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    result = await productService.getProducts(filters, page, pageSize);
  } else {
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
export const getProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
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
export const getProductConfigurationOptions = asyncHandler(async (req: AuthRequest, res: Response) => {
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
export const getProductsByCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
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
export const searchProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = req.query.q as string;
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
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
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
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
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
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  await productService.deleteProduct(req.params.slug);
  res.json({
    success: true,
    data: { slug: req.params.slug },
    timestamp: Date.now(),
  });
});

