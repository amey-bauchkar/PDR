import { Router } from 'express';
import * as ProductController from '../controllers/ProductController.js';

const router = Router();

/**
 * Product routes
 */
router.get('/', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProduct);
router.get('/:id/configuration-options', ProductController.getProductConfigurationOptions);
router.get('/category/:categoryId', ProductController.getProductsByCategory);

export default router;
