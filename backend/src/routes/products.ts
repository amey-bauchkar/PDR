import { Router } from 'express';
import * as ProductController from '../controllers/productController.js';

const router = Router();

/**
 * Product routes
 */
router.get('/', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/category/:categoryId', ProductController.getProductsByCategory);
router.get('/:id/configuration-options', ProductController.getProductConfigurationOptions);
router.get('/:id', ProductController.getProduct);

export default router;
