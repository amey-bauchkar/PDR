import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Seo from '../components/Seo';
import {
  CatalogCategorySection,
  CatalogHubCategoryPills,
  CatalogStickyNav,
  type CatalogSection,
  ProductsCustomCta,
  ProductsTrustBand,
} from '../components/products/CatalogBlocks';
import rawCatalogue from '../data/catalogue.json';
import type { ProductCategoryPath } from '../data/productCategoryRoutes';
import { categoryCanonical, categoryPathToSectionId } from '../data/productCategoryRoutes';
import { mergeWithCatalogue } from '../lib/productSync';
import '../styles/products.css';

type Props = { categoryPath: ProductCategoryPath };

export default function ProductsCategory({ categoryPath }: Props) {
  const [catalogue, setCatalogue] = useState(() => mergeWithCatalogue(rawCatalogue));

  useEffect(() => {
    const handleStorageChange = () => {
      setCatalogue(mergeWithCatalogue(rawCatalogue));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pdrworld-product-update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pdrworld-product-update', handleStorageChange);
    };
  }, []);

  const sectionId = categoryPathToSectionId(categoryPath);
  const sections = catalogue.sections as CatalogSection[];
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return <Navigate to="/404" replace />;

  const idx = sections.findIndex((s) => s.id === sectionId);
  const description = section.intro.length > 165 ? `${section.intro.slice(0, 162)}…` : section.intro;

  return (
    <>
      <Seo
        title={`${section.eyebrow} | PDR World`}
        description={description}
        canonical={categoryCanonical(categoryPath)}
      />

      <section className="pr-hero">
        <div className="container">
          <div className="pr-hero-grid">
            <div className="pr-hero-copy">
              <nav
                className="breadcrumb"
                aria-label="Breadcrumb"
                style={{
                  marginBottom: 20,
                  fontSize: 14,
                  color: '#94A3B8',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link to="/">Home</Link>
                <span aria-hidden>›</span>
                <Link to="/products">Products</Link>
                <span aria-hidden>›</span>
                <span style={{ color: '#07008F', fontWeight: 600 }}>{section.eyebrow}</span>
              </nav>
              <div className="eyebrow">{section.eyebrow}</div>
              <h1>{section.heading}</h1>
              <p className="pr-hero-subtitle">{section.intro}</p>
              <div className="pr-hero-cta-row">
                <Link className="btn btn-primary" to="/contact">
                  Request a Quote
                </Link>
                <Link className="btn btn-outline" to="/products">
                  All categories
                </Link>
              </div>
            </div>
            <div className="pr-cat-nav-panel" style={{ alignSelf: 'start' }}>
              <CatalogHubCategoryPills />
            </div>
          </div>
        </div>
      </section>

      <CatalogStickyNav activeSectionId={sectionId} />
      <CatalogCategorySection section={section} alt={idx % 2 === 0} omitIntroHead />
      <ProductsTrustBand />
      <ProductsCustomCta />
    </>
  );
}
