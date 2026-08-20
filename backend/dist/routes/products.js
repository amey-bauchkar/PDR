import { Router } from 'express';
import * as ProductController from '../controllers/productController.js';
import { verifyToken } from '../middleware/auth.js';
const router = Router();
/**
 * Product routes — Public (read-only)
 */
router.get('/', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/datasheet-download/:slug', ProductController.getDatasheetDownloadUrl);
router.get('/:id', ProductController.getProduct);
router.get('/:id/configuration-options', ProductController.getProductConfigurationOptions);
router.get('/category/:categoryId', ProductController.getProductsByCategory);
/**
 * Product CRUD routes — Admin only (requires JWT)
 */
router.post('/image-upload-url', verifyToken, ProductController.getImageUploadUrl);
router.post('/datasheet-upload-url', verifyToken, ProductController.getDatasheetUploadUrl);
router.post('/', verifyToken, ProductController.createProduct);
router.put('/:slug', verifyToken, ProductController.updateProduct);
router.delete('/:slug', verifyToken, ProductController.deleteProduct);
export default router;
//# sourceMappingURL=products.js.map