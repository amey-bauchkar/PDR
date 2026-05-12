import { Navigate, useParams } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import ProductsCategory from './ProductsCategory';
import { isProductCategoryPath } from '../data/productCategoryRoutes';

export default function ProductRoute() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/products" replace />;
  if (isProductCategoryPath(slug)) return <ProductsCategory categoryPath={slug} />;
  return <ProductDetail />;
}
