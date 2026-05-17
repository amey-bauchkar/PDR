import { supabaseServiceClient } from '../config/database.js';
import { Product, ProductFilter } from '../types/index.js';
import { AppError } from '../types/index.js';

export class ProductService {
  /**
   * Get all products with optional filters
   */
  async getProducts(filters?: ProductFilter, page = 1, pageSize = 10) {
    try {
      let query = supabaseServiceClient
        .from('catalog_products')
        .select('*', { count: 'exact' })
        .eq('status', 'published');

      // Apply filters
      if (filters?.environment) {
        query = query.ilike('metadata->environment', `%${filters.environment}%`);
      }
      if (filters?.mountType) {
        query = query.ilike('metadata->mount_type', `%${filters.mountType}%`);
      }
      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        items: data as Product[],
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new AppError(500, 'PRODUCT_FETCH_ERROR', 'Failed to fetch products', error.message);
    }
  }

  /**
   * Get single product by ID or slug
   */
  async getProduct(identifier: string) {
    try {
      let query = supabaseServiceClient.from('catalog_products').select('*');

      // Try to match by slug first, then by ID
      if (isNaN(Number(identifier))) {
        query = query.eq('slug', identifier);
      } else {
        query = query.eq('id', identifier);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      }

      return data as Product;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Error fetching product:', error);
      throw new AppError(500, 'PRODUCT_FETCH_ERROR', 'Failed to fetch product', error.message);
    }
  }

  /**
   * Get product configuration options
   */
  async getProductConfigurationOptions(productId: string) {
    try {
      // Get the product first
      const product = await this.getProduct(productId);

      // Fetch configuration options from database (you'll define this table structure)
      const { data: options, error } = await supabaseServiceClient
        .from('product_configuration_options')
        .select('*')
        .eq('product_id', product.id);

      if (error) throw error;

      return options || [];
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Error fetching configuration options:', error);
      throw new AppError(
        500,
        'CONFIG_FETCH_ERROR',
        'Failed to fetch configuration options',
        error.message
      );
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string) {
    try {
      const { data, error } = await supabaseServiceClient
        .from('catalog_products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'published');

      if (error) throw error;

      return data as Product[];
    } catch (error: any) {
      console.error('Error fetching products by category:', error);
      throw new AppError(500, 'PRODUCT_FETCH_ERROR', 'Failed to fetch products', error.message);
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: string) {
    try {
      const { data, error } = await supabaseServiceClient
        .from('catalog_products')
        .select('*')
        .or(`name.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'published')
        .limit(20);

      if (error) throw error;

      return data as Product[];
    } catch (error: any) {
      console.error('Error searching products:', error);
      throw new AppError(500, 'SEARCH_ERROR', 'Failed to search products', error.message);
    }
  }
}

export const productService = new ProductService();
