import { Router } from 'express';
import * as ProductController from '../controllers/productController.js';

const router = Router();

/**
 * Product routes
 */
router.get('/', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProduct);
router.get('/:id/configuration-options', ProductController.getProductConfigurationOptions);
router.get('/category/:categoryId', ProductController.getProductsByCategory);

// Product CRUD routes
router.post('/', ProductController.createProduct);
router.put('/:slug', ProductController.updateProduct);
router.delete('/:slug', ProductController.deleteProduct);

export default router;
