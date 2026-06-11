import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import {
  CatalogHubCategoryPills,
  ProductsCustomCta,
  ProductsTrustBand,
  CatalogCategorySection
} from '../components/products/CatalogBlocks';
import { BreadcrumbSchema } from '../components/Schema';
import { productsCategoryHrefDeep } from '../data/productCategoryRoutes';
import { mergeWithCatalogue, getAdminProducts } from '../lib/productSync';
import rawCatalogue from '../data/catalogue.json';
import '../styles/products.css';

export default function Products() {
  const location = useLocation();
  const [catalogue, setCatalogue] = useState(() => mergeWithCatalogue(rawCatalogue));

  useEffect(() => {
    // Refresh catalogue when admin makes changes
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

  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  // Extract recently added admin products
  const adminProducts = getAdminProducts().filter((p) => p.status === 'Active');
  const catalogueSlugs = new Set<string>();
  if (rawCatalogue && rawCatalogue.sections) {
    rawCatalogue.sections.forEach((section: any) => {
      if (section.groups) {
        section.groups.forEach((group: any) => {
          if (group.cards) {
            group.cards.forEach((card: any) => {
              if (card.slug) catalogueSlugs.add(card.slug);
            });
          }
        });
      }
    });
  }
  const newAdminProducts = adminProducts.filter((p) => !catalogueSlugs.has(p.slug));
  const newArrivalsSection = newAdminProducts.length > 0 ? {
    id: 'new-arrivals',
    eyebrow: 'New Additions',
    heading: 'Recently Added Products',
    intro: 'The latest products engineered and added to our catalogue.',
    groups: [
      {
        subhead: '',
        cards: newAdminProducts.map((p) => ({
          slug: p.slug,
          tag: p.tagline || 'New',
          img: p.imageUrl || '',
          heroSvg: p.heroIcon || '',
          name: p.name,
          blurb: p.description || '',
          pills: p.specs ? p.specs.slice(0, 3).map((s) => s.value) : [],
          detailsSlug: p.slug,
          addItem: {
            title: p.name,
            specs: p.specs && p.specs.length > 0 ? `${p.specs[0].label}: ${p.specs[0].value}` : 'Standard Specs',
            image: p.imageUrl || '/placeholder.png',
          },
        }))
      }
    ]
  } : null;

  return (
    <>
      <Seo
        title="Fiber Optic Product Catalogue | SFP Transceivers, Patch Cords, ODFs — PDR World"
        description="Browse PDR World's complete fiber optic catalogue: SFP transceivers, patch cords, ODFs, OTDRs, drones, and maintenance tools. ISO 9001:2015 certified. Made in India."
        canonical="https://pdrworld.com/products"
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdrworld.com/' },
        { name: 'Products', url: 'https://pdrworld.com/products' },
      ]} />

      <section className="pr-hero">
        <div className="container">
          <div className="pr-hero-grid">
            <div className="pr-hero-copy">
              <div className="eyebrow">{catalogue.hero.eyebrow || 'Product Catalogue'}</div>
              <h1>{catalogue.hero.title || 'The Complete Fiber Optic Ecosystem. Engineered in Mumbai.'}</h1>
              <p className="pr-hero-subtitle">
                {catalogue.hero.subtitle || 'Founded in 1974, PDR Videotronics India Pvt. Ltd. is a leading name in the optical communication industry. Since launching our Fiber Optics Division in 1985, we have been dedicated to designing and manufacturing high-quality active and passive components that drive reliable, next-generation connectivity.'}
              </p>
              <div className="pr-hero-cta-row">
                <Link className="btn btn-primary" to="/contact">
                  Request a Quote
                </Link>
                <Link className="btn btn-outline" to={productsCategoryHrefDeep('passive')}>
                  Browse Passive Components →
                </Link>
              </div>
            </div>
            <div className="pr-cat-nav-panel">
              <CatalogHubCategoryPills />
            </div>
          </div>
        </div>
      </section>

      {newArrivalsSection && (
        <div style={{ paddingBottom: 60 }}>
          <CatalogCategorySection section={newArrivalsSection as any} alt={true} />
        </div>
      )}

      <ProductsTrustBand />
      <ProductsCustomCta />
    </>
  );
}
