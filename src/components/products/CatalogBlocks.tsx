import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRfqCart } from '../RfqCartProvider';
import catalogue from '../../data/catalogue.json';
import { productsCategoryHref } from '../../data/productCategoryRoutes';
import { resolveCanonicalProductImage, getFallbackImage } from '../../lib/imageResolution';

export type CatalogCard = {
  slug: string;
  tag: string;
  img: string;
  heroSvg: string;
  name: string;
  blurb: string;
  pills: string[];
  detailsSlug: string;
  addItem: { title: string; specs: string; image: string };
};

export type CatalogGroup = { subhead: string; cards: CatalogCard[] };
export type CatalogSection = { id: string; eyebrow: string; heading: string; intro: string; groups: CatalogGroup[] };



export function CatalogProductCard({ card, sectionId }: { card: CatalogCard; sectionId: string }) {
  const { addItem } = useRfqCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      title: card.addItem?.title || card.name || 'Product',
      specs: card.addItem?.specs || 'Standard Specs',
      image: resolveCanonicalProductImage(card.slug, undefined, sectionId),
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="pr-pcard product-card reveal" data-product={card.slug || 'unknown'}>
      <div className="pr-pcard-art">
        {card.heroSvg && !card.img ? (
          <span dangerouslySetInnerHTML={{ __html: card.heroSvg }} />
        ) : (
          <img
            src={resolveCanonicalProductImage(card.slug, undefined, sectionId)}
            alt={card.name || 'Product Image'}
            className="real-img"
            loading="lazy"
            width="400"
            height="300"
            onError={(event) => {
              const fallback = getFallbackImage(sectionId);
              if (!event.currentTarget.src.endsWith(fallback)) {
                event.currentTarget.src = fallback;
              }
            }}
          />
        )}
      </div>
      <div className="pr-pcard-body">
        <h3>{card.name || 'Unnamed Product'}</h3>
        <p>{card.blurb || ''}</p>
        {card.pills && card.pills.length > 0 && (
          <div className="pr-spec-row">
            {card.pills.map((p, i) => (
              <span key={i} className="pr-spec-pill">
                {p}
              </span>
            ))}
          </div>
        )}
        <div className="product-actions">
          <button type="button" className="btn-primary" onClick={handleAdd}>
            {added ? '✓ Added' : 'Add to Quote'}
          </button>
          {card.detailsSlug && (
            <Link className="btn-secondary" to={`/products/${card.detailsSlug}`}>
              Details →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** Sticky category tabs — each tab navigates to its own route */
export function CatalogStickyNav({ activeSectionId }: { activeSectionId: string }) {
  return (
    <nav className="pr-sticky-nav" id="prStickyNav">
      <div className="container">
        <div className="pr-tab-row">
          {(catalogue.tabs as { target: string; label: string }[]).map((t) => (
            <Link
              key={t.target}
              className={`pr-tab${activeSectionId === t.target ? ' active' : ''}`}
              to={productsCategoryHref(t.target)}
              data-target={t.target}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function CatalogCategorySection({
  section,
  alt,
  omitIntroHead,
}: {
  section: CatalogSection;
  alt: boolean;
  omitIntroHead?: boolean;
}) {
  return (
    <section className={`section pr-section reveal${alt ? ' sec-muted' : ''}`} id={section.id}>
      <div className="container">
        {!omitIntroHead && (
          <div className="sec-head">
            <div className="eyebrow">{section.eyebrow}</div>
            <h2>{section.heading}</h2>
            <p>{section.intro}</p>
          </div>
        )}
        {section.groups && section.groups.length > 0 ? (
          section.groups.map((g, i) => (
            <div key={i} className="pr-group">
              {g.subhead && <h3 className="pr-sub-head">{g.subhead}</h3>}
              <div className="pr-grid">
                {g.cards && g.cards.length > 0 ? (
                  g.cards
                    .map((c, idx) => <CatalogProductCard key={c.slug || idx} card={c} sectionId={section.id} />)
                ) : (
                  <div>No products available in this category.</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div>No product groups available.</div>
        )}
      </div>
    </section>
  );
}

export function ProductsTrustBand() {
  return (
    <section className="section pr-section reveal pr-trust-band">
      <div className="container">
        <div className="pr-trust-layout">
          <div>
            <div className="eyebrow">Made in Mumbai</div>
            <h2>Manufactured, tested and dispatched from one floor.</h2>
            <p className="pr-trust-copy">
              PDR operates a vertically integrated production facility at Filmcity Complex, Goregaon East — ensuring zero supply chain gaps
              and full quality ownership.
            </p>
            <Link className="btn btn-outline pr-trust-link" to="/about">
              About Our Manufacturing →
            </Link>
          </div>
          <div className="pr-trust-grid">
            <div className="pr-trust-tile">
              <div className="stat-num">40+</div>
              <div className="stat-label">Years Heritage</div>
            </div>
            <div className="pr-trust-tile">
              <div className="stat-num">50+</div>
              <div className="stat-label">Product Families</div>
            </div>
            <div className="pr-trust-tile">
              <div className="stat-num">ISO</div>
              <div className="stat-label">9001:2015</div>
            </div>
            <div className="pr-trust-tile">
              <div className="stat-num">100%</div>
              <div className="stat-label">Factory Tested</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductsCustomCta() {
  return (
    <section className="section pr-section">
      <div className="container">
        <div className="pr-custom-cta">
          <div className="eyebrow pr-custom-eyebrow">Need a Custom Configuration?</div>
          <h2>We manufacture to spec.</h2>
          <p className="pr-custom-copy">
            Non-standard lengths, connector types, armour configurations, and private-label assemblies — quoted within 24 hours.
          </p>
          <div className="pr-custom-cta-row">
            <Link className="btn btn-primary" to="/contact?inquiry=Custom+Manufacturing">
              Submit Your RFQ →
            </Link>
            <Link className="btn btn-outline" to="/contact?inquiry=Technical+Support">
              Talk to an Engineer
            </Link>
            <a
              className="btn btn-outline"
              href="https://wa.me/918419916460?text=Hi, I need a custom fiber optic product quote."
              target="_blank"
              rel="noopener noreferrer"
              style={{ gap: 8 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-1.7-.9-2.9-1.5-4.1-3.5-.3-.5.3-.5.9-1.6.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3zM12 0a12 12 0 0 0-10.4 18l-1.6 6 6.1-1.6A12 12 0 1 0 12 0zm0 22a10 10 0 0 1-5.4-1.6l-.4-.2-3.7 1 1-3.6-.2-.4A10 10 0 1 1 12 22z" />
              </svg>{' '}
              WhatsApp
            </a>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              justifyContent: 'center',
              marginTop: 28,
              fontSize: 13,
              color: 'var(--muted)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>{' '}
              24-hour RFQ turnaround
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>{' '}
              ISO 9001:2015
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>{' '}
              Made in India
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const HUB_TAB_META: Record<string, string> = {
  active: '15+ SKUs',
  passive: '40+ SKUs',
  cable: '12+ SKUs',
  test: '10+ SKUs',
  specialty: 'Custom',
  tools: 'Tooling',
};

export function CatalogHubCategoryPills() {
  return (
    <>
      {(catalogue.tabs as { target: string; label: string }[]).map((t) => (
        <Link key={t.target} className="pr-cat-pill" to={productsCategoryHref(t.target)}>
          <span className="pr-cat-pill-left">
            <span className="pr-cat-dot"></span>
            <span className="pr-cat-pill-name">{t.label}</span>
          </span>
          <span className="pr-cat-pill-right">
            {HUB_TAB_META[t.target] ?? ''}{' '}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
        </Link>
      ))}
    </>
  );
}
