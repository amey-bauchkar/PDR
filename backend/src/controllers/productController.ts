import { Response } from 'express';
import { productService } from '../services/ProductService.js';
import { AuthRequest, asyncHandler } from '../middleware/auth.js';
import { ProductFilter } from '../types/index.js';

/**
 * GET /api/products
 * Get all products with optional filters and pagination
 */
export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const filters: ProductFilter = {
    environment: req.query.environment as string,
    mountType: req.query.mountType as string,
    category: req.query.category as string,
    minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity as string) : undefined,
    maxCapacity: req.query.maxCapacity ? parseInt(req.query.maxCapacity as string) : undefined,
  };

  const result = await productService.getProducts(filters, page, pageSize);

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
