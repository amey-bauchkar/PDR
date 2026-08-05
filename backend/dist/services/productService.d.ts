import { ProductFilter } from '../types/index.js';
export declare class ProductService {
    /**
     * Get all products with optional filters
     */
    getProducts(filters?: ProductFilter, page?: number, pageSize?: number): Promise<any[] | {
        items: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    /**
     * Get single product by ID or slug
     */
    getProduct(identifier: string): Promise<any>;
    /**
     * Create a new product in the database along with its specs/features
     */
    createProduct(prod: any): Promise<any>;
    /**
     * Update an existing product in the database along with its specs/features
     */
    updateProduct(slug: string, prod: any): Promise<any>;
    /**
     * Delete a product by slug
     */
    deleteProduct(slug: string): Promise<boolean>;
    /**
     * Get product configuration options
     */
    getProductConfigurationOptions(productId: string): Promise<any[]>;
    /**
     * Get products by category
     */
    getProductsByCategory(categoryId: string): Promise<any[]>;
    /**
     * Search products
     */
    searchProducts(query: string): Promise<any[]>;
}
export declare const productService: ProductService;
//# sourceMappingURL=productService.d.ts.map