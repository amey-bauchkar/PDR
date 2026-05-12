import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import {
  CatalogHubCategoryPills,
  ProductsCustomCta,
  ProductsTrustBand,
} from '../components/products/CatalogBlocks';
import { productsCategoryHref } from '../data/productCategoryRoutes';
import '../styles/products.css';

export default function Products() {
  return (
    <>
      <Seo
        title="Product Catalogue | PDR World — Fiber Optic Solutions"
        description="Browse PDR World's full fiber optic catalogue: SFP transceivers, patch cords, ODFs, OTDRs, drones, and more. ISO 9001:2015 certified manufacturing."
        canonical="https://pdrworld.com/products"
      />

      <section className="pr-hero">
        <div className="container">
          <div className="pr-hero-grid">
            <div className="pr-hero-copy">
              <div className="eyebrow">Product Catalogue · 50+ Families</div>
              <h1>The Complete Fiber Optic Ecosystem. Engineered in Mumbai.</h1>
              <p className="pr-hero-subtitle">
                Delivering high-performance active and passive optical solutions with precision manufacturing and rigorous in-house testing
                since 1985.
              </p>
              <ul className="pr-hero-points">
                <li>Engineered &amp; tested in-house in Mumbai</li>
                <li>End-to-end product stack (Active → Maintenance)</li>
                <li>Fast RFQ &amp; enterprise-grade deployment support</li>
              </ul>
              <div className="pr-hero-cta-row">
                <Link className="btn btn-primary" to="/contact">
                  Request a Quote
                </Link>
                <Link className="btn btn-outline" to={productsCategoryHref('passive')}>
                  Browse Passive Components →
                </Link>
              </div>
              <div className="pr-hero-stats">
                {['50+ Product Families', '3,000+ Buyers', 'ISO 9001:2015 Certified', 'Same-day shipping'].map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </div>
            <div className="pr-cat-nav-panel">
              <CatalogHubCategoryPills />
            </div>
          </div>
        </div>
      </section>

      <ProductsTrustBand />
      <ProductsCustomCta />
    </>
  );
}
