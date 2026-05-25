import { supabaseServiceClient as rawSupabaseServiceClient } from '../config/database.js';
const supabaseServiceClient = rawSupabaseServiceClient!;
import { Product, ProductFilter } from '../types/index.js';
import { AppError } from '../types/index.js';

// Helper to lookup category ID by name
async function getCategoryIdFromName(categoryName: string): Promise<number | null> {
  try {
    const { data, error } = await supabaseServiceClient
      .from('product_categories')
      .select('id')
      .ilike('name', categoryName)
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0].id;
  } catch {
    return null;
  }
}

// Mapper from database relational structure to high-fidelity frontend Product structure
function mapDbProduct(db: any): any {
  if (!db) return null;

  const features = (db.features || [])
    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((f: any) => f.feature);

  const applications = (db.applications || [])
    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((a: any) => a.application);

  const specs = (db.specs || [])
    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((s: any) => ({ label: s.label, value: s.value }));

  return {
    id: db.id,
    slug: db.slug,
    name: db.name,
    category: db.category_ref?.name || 'Active Components',
    title: db.title,
    description: db.description,
    canonical: db.canonical_url,
    tagline: db.tagline,
    status: db.status === 'published' ? 'Active' : (db.status === 'draft' ? 'Draft' : 'Archived'),
    imageUrl: db.image_url,
    features,
    applications,
    specs,
    heroIcon: db.hero_icon_svg,
    datasheetUrl: db.metadata?.datasheet_url || '',
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

export class ProductService {
  /**
   * Get all products with optional filters
   */
  async getProducts(filters?: ProductFilter, page?: number, pageSize?: number) {
    try {
      let query = supabaseServiceClient
        .from('catalog_products')
        .select(`
          *,
          category_ref:product_categories(name),
          features:catalog_product_features(feature, position),
          applications:catalog_product_applications(application, position),
          specs:catalog_product_specs(label, value, position)
        `);

      // Apply filters
      if (filters?.environment) {
        query = query.ilike('metadata->environment', `%${filters.environment}%`);
      }
      if (filters?.mountType) {
        query = query.ilike('metadata->mount_type', `%${filters.mountType}%`);
      }
      if (filters?.category) {
        // If category is a name, we resolve it first
        if (isNaN(Number(filters.category))) {
          const catId = await getCategoryIdFromName(filters.category);
          if (catId) query = query.eq('category_id', catId);
        } else {
          query = query.eq('category_id', filters.category);
        }
      }

      // Order by sort order
      query = query.order('sort_order', { ascending: true });

      // Apply Pagination if provided
      if (page && pageSize) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      const mappedItems = (data || []).map(mapDbProduct);

      if (page && pageSize) {
        const total = count || mappedItems.length;
        const totalPages = Math.ceil(total / pageSize);
        return {
          items: mappedItems,
          total,
          page,
          pageSize,
          totalPages,
        };
      }

      return mappedItems;
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
      let query = supabaseServiceClient
        .from('catalog_products')
        .select(`
          *,
          category_ref:product_categories(name),
          features:catalog_product_features(feature, position),
          applications:catalog_product_applications(application, position),
          specs:catalog_product_specs(label, value, position)
        `);

      if (isNaN(Number(identifier))) {
        query = query.eq('slug', identifier);
      } else {
        query = query.eq('id', identifier);
      }

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      }

      return mapDbProduct(data);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Error fetching product:', error);
      throw new AppError(500, 'PRODUCT_FETCH_ERROR', 'Failed to fetch product', error.message);
    }
  }

  /**
   * Create a new product in the database along with its specs/features
   */
  async createProduct(prod: any) {
    try {
      const categoryId = await getCategoryIdFromName(prod.category);
      
      const specsMap = (prod.specs || []).reduce((acc: any, s: any) => {
        acc[s.label] = s.value;
        return acc;
      }, {});

      const environment = specsMap['Environment'] || specsMap['Installation'] || 'Indoor/Outdoor';
      const mountType = specsMap['Mount Type'] || specsMap['Mounting'] || 'Rack Mount';
      const capacityVal = parseInt(specsMap['Capacity'] || specsMap['Ports'] || '0') || 0;

      // Get current max sort_order
      const { data: maxSortData } = await supabaseServiceClient
        .from('catalog_products')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextSortOrder = maxSortData && maxSortData.length > 0 ? (maxSortData[0].sort_order + 1) : 0;

      const productRow = {
        slug: prod.slug,
        category_id: categoryId,
        name: prod.name,
        title: prod.title || `${prod.name} | PDR World`,
        tagline: prod.tagline || '',
        description: prod.description || '',
        canonical_url: prod.canonical || `https://pdrworld.com/products/${prod.slug}`,
        hero_icon_svg: prod.heroIcon || '',
        image_url: prod.imageUrl || '',
        sort_order: nextSortOrder,
        status: prod.status === 'Active' ? 'published' : (prod.status === 'Draft' ? 'draft' : 'archived'),
        metadata: {
          environment,
          mount_type: mountType,
          capacity: capacityVal,
          specs: specsMap,
          datasheet_url: prod.datasheetUrl || ''
        }
      };

      const { data, error } = await supabaseServiceClient
        .from('catalog_products')
        .insert(productRow)
        .select()
        .single();

      if (error) throw error;
      const dbProdId = data.id;

      // Insert features
      if (prod.features && prod.features.length > 0) {
        const featureRows = prod.features.map((f: string, idx: number) => ({
          product_id: dbProdId,
          position: idx,
          feature: f
        }));
        await supabaseServiceClient.from('catalog_product_features').insert(featureRows);
      }

      // Insert applications
      if (prod.applications && prod.applications.length > 0) {
        const appRows = prod.applications.map((a: string, idx: number) => ({
          product_id: dbProdId,
          position: idx,
          application: a
        }));
        await supabaseServiceClient.from('catalog_product_applications').insert(appRows);
      }

      // Insert specs
      if (prod.specs && prod.specs.length > 0) {
        const specRows = prod.specs.map((s: any, idx: number) => ({
          product_id: dbProdId,
          position: idx,
          label: s.label,
          value: s.value
        }));
        await supabaseServiceClient.from('catalog_product_specs').insert(specRows);
      }

      return this.getProduct(data.slug);
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new AppError(500, 'PRODUCT_CREATE_ERROR', 'Failed to create product', error.message);
    }
  }

  /**
   * Update an existing product in the database along with its specs/features
   */
  async updateProduct(slug: string, prod: any) {
    try {
      // Find original product ID
      const { data: orig, error: findError } = await supabaseServiceClient
        .from('catalog_products')
        .select('id')
        .eq('slug', slug)
        .single();

      if (findError || !orig) {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      }

      const dbProdId = orig.id;
      const categoryId = await getCategoryIdFromName(prod.category);

      const specsMap = (prod.specs || []).reduce((acc: any, s: any) => {
        acc[s.label] = s.value;
        return acc;
      }, {});

      const environment = specsMap['Environment'] || specsMap['Installation'] || 'Indoor/Outdoor';
      const mountType = specsMap['Mount Type'] || specsMap['Mounting'] || 'Rack Mount';
      const capacityVal = parseInt(specsMap['Capacity'] || specsMap['Ports'] || '0') || 0;

      const productRow = {
        slug: prod.slug,
        category_id: categoryId,
        name: prod.name,
        title: prod.title || `${prod.name} | PDR World`,
        tagline: prod.tagline || '',
        description: prod.description || '',
        canonical_url: prod.canonical || `https://pdrworld.com/products/${prod.slug}`,
        hero_icon_svg: prod.heroIcon || '',
        image_url: prod.imageUrl || '',
        status: prod.status === 'Active' ? 'published' : (prod.status === 'Draft' ? 'draft' : 'archived'),
        metadata: {
          environment,
          mount_type: mountType,
          capacity: capacityVal,
          specs: specsMap,
          datasheet_url: prod.datasheetUrl || ''
        },
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabaseServiceClient
        .from('catalog_products')
        .update(productRow)
        .eq('id', dbProdId);

      if (updateError) throw updateError;

      // Clear existing features, applications, and specs
      await supabaseServiceClient.from('catalog_product_features').delete().eq('product_id', dbProdId);
      await supabaseServiceClient.from('catalog_product_applications').delete().eq('product_id', dbProdId);
      await supabaseServiceClient.from('catalog_product_specs').delete().eq('product_id', dbProdId);

      // Insert new features
      if (prod.features && prod.features.length > 0) {
        const featureRows = prod.features.map((f: string, idx: number) => ({
          product_id: dbProdId,
          position: idx,
          feature: f
        }));
        await supabaseServiceClient.from('catalog_product_features').insert(featureRows);
      }

      // Insert new applications
      if (prod.applications && prod.applications.length > 0) {
        const appRows = prod.applications.map((a: string, idx: number) => ({
          product_id: dbProdId,
          position: idx,
          application: a
        }));
        await supabaseServiceClient.from('catalog_product_applications').insert(appRows);
      }

      // Insert new specs
      if (prod.specs && prod.specs.length > 0) {
        const specRows = prod.specs.map((s: any, idx: number) => ({
          product_id: dbProdId,
          position: idx,
          label: s.label,
          value: s.value
        }));
        await supabaseServiceClient.from('catalog_product_specs').insert(specRows);
      }

      return this.getProduct(prod.slug);
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw new AppError(500, 'PRODUCT_UPDATE_ERROR', 'Failed to update product', error.message);
    }
  }

  /**
   * Delete a product by slug
   */
  async deleteProduct(slug: string) {
    try {
      const { error } = await supabaseServiceClient
        .from('catalog_products')
        .delete()
        .eq('slug', slug);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw new AppError(500, 'PRODUCT_DELETE_ERROR', 'Failed to delete product', error.message);
    }
  }

  /**
   * Get product configuration options
   */
  async getProductConfigurationOptions(productId: string) {
    try {
      const product = await this.getProduct(productId);
      const { data: options, error } = await supabaseServiceClient
        .from('product_configuration_options')
        .select('*')
        .eq('product_id', product.id);

      if (error) return [];
      return options || [];
    } catch {
      return [];
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string) {
    try {
      const catId = await getCategoryIdFromName(categoryId) || categoryId;
      const { data, error } = await supabaseServiceClient
        .from('catalog_products')
        .select(`
          *,
          category_ref:product_categories(name),
          features:catalog_product_features(feature, position),
          applications:catalog_product_applications(application, position),
          specs:catalog_product_specs(label, value, position)
        `)
        .eq('category_id', catId)
        .eq('status', 'published')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbProduct);
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
        .select(`
          *,
          category_ref:product_categories(name),
          features:catalog_product_features(feature, position),
          applications:catalog_product_applications(application, position),
          specs:catalog_product_specs(label, value, position)
        `)
        .or(`name.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
        .limit(20);

      if (error) throw error;
      return (data || []).map(mapDbProduct);
    } catch (error: any) {
      console.error('Error searching products:', error);
      throw new AppError(500, 'SEARCH_ERROR', 'Failed to search products', error.message);
    }
  }
}

export const productService = new ProductService();

