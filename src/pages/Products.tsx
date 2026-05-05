import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import { useRfqCart } from '../components/RfqCartProvider';
import catalogue from '../data/catalogue.json';
import '../styles/products.css';

type Card = {
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

type Group = { subhead: string; cards: Card[] };
type Section = { id: string; eyebrow: string; heading: string; intro: string; groups: Group[] };

const STICKY_HASH = ['#active', '#passive', '#cable', '#test', '#specialty', '#tools'];
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  active: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=800&q=80',
  passive: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  cable: 'https://images.unsplash.com/photo-1581092335878-4f8e1f9d9f8a?auto=format&fit=crop&w=800&q=80',
  test: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  specialty: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
  tools: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
};

const resolveCardImage = (card: Card, sectionId: string) =>
  card.img && card.img.trim().length > 0 ? card.img : CATEGORY_IMAGE_MAP[sectionId] ?? CATEGORY_IMAGE_MAP.passive;

function ProductCard({ card, sectionId }: { card: Card; sectionId: string }) {
  const { addItem } = useRfqCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ title: card.addItem.title, specs: card.addItem.specs, image: card.addItem.image, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="pr-pcard reveal" data-product={card.slug}>
      <div className="pr-pcard-art">
        {card.tag && <span className="pr-prod-tag">{card.tag}</span>}
        {card.img || CATEGORY_IMAGE_MAP[sectionId] ? (
          <img src={resolveCardImage(card, sectionId)} alt={card.name} className="real-img" loading="lazy" />
        ) : (
          <span dangerouslySetInnerHTML={{ __html: card.heroSvg }} />
        )}
      </div>
      <div className="pr-pcard-body">
        <h3>{card.name}</h3>
        <p>{card.blurb}</p>
        {card.pills.length > 0 && (
          <div className="pr-spec-row">
            {card.pills.map((p, i) => (
              <span key={i} className="pr-spec-pill">{p}</span>
            ))}
          </div>
        )}
        <div className="pr-prod-cta">
          <button className="add-to-quote-btn" onClick={handleAdd}>
            {added ? '✓ Added' : 'Add to Quote'}
          </button>
          {card.detailsSlug && <Link to={`/products/${card.detailsSlug}`}>Details →</Link>}
        </div>
      </div>
    </div>
  );
}

function StickyNav() {
  const [active, setActive] = useState('active');
  useEffect(() => {
    const sections = STICKY_HASH.map((h) => document.querySelector<HTMLElement>(h)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const onScroll = () => {
      const y = window.scrollY;
      let current = sections[0].id;
      for (const s of sections) {
        if (y + 120 >= s.offsetTop) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="pr-sticky-nav" id="prStickyNav">
      <div className="container">
        <div className="pr-tab-row">
          {(catalogue.tabs as { target: string; label: string }[]).map((t) => (
            <a
              key={t.target}
              className={`pr-tab${active === t.target ? ' active' : ''}`}
              href={`#${t.target}`}
              data-target={t.target}
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function CategorySection({ section, alt }: { section: Section; alt: boolean }) {
  return (
    <section className={`section reveal${alt ? ' sec-muted' : ''}`} id={section.id}>
      <div className="container">
        <div className="sec-head">
          <div className="eyebrow">{section.eyebrow}</div>
          <h2>{section.heading}</h2>
          <p>{section.intro}</p>
        </div>
        {section.groups.map((g, i) => (
          <div key={i}>
            {g.subhead && <h3 className="pr-sub-head">{g.subhead}</h3>}
            <div className="pr-grid">
              {g.cards.map((c) => (
                <ProductCard key={c.slug} card={c} sectionId={section.id} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SpecialtySection() {
  const { addItem } = useRfqCart();
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    addItem({ title: 'High Power Patchcord', specs: 'Standard Factory Specs', image: '/images/fiber-patch-panel.png', qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  return (
    <section
      className="section reveal"
      id="specialty"
      style={{ background: '#FAFAFA', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}
    >
      <div className="container">
        <div className="sec-head center">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Specialty Products</div>
          <h2>Optical Fiber Drone</h2>
          <p style={{ color: '#475569' }}>
            Next-generation aerial fiber deployment, inspection, and surveillance solutions.
          </p>
        </div>

        <div className="pr-drone-feature">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none" stroke="var(--accent)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
              <path d="M12 12l24 24M12 36l24-24" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="36" cy="36" r="4" />
              <circle cx="12" cy="36" r="4" />
              <circle cx="36" cy="12" r="4" />
              <rect x="20" y="20" width="8" height="8" rx="2" />
            </svg>
          </div>
          <h3 style={{ textAlign: 'center', fontSize: 24, color: '#07008F', marginBottom: 16 }}>Aerial Fiber Deployment</h3>
          <p style={{ textAlign: 'center', color: '#475569', fontSize: 16 }}>
            Engineered for rapid field deployment, remote infrastructure inspection, and secure surveillance across challenging terrains.
          </p>
          <ul className="pr-drone-features">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>{' '}
              Rapid aerial deployment in inaccessible areas
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>{' '}
              High-resolution optical infrastructure inspection
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>{' '}
              Real-time secure surveillance feed
            </li>
          </ul>

          <div className="pr-pcard reveal" data-product="high-power-patchcord" style={{ boxShadow: 'none', border: '1px solid #E2E8F0' }}>
            <div className="pr-pcard-art">
              <span className="pr-prod-tag">High-Power</span>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth="1.5">
                <path d="M8 24h32" />
                <circle cx="24" cy="24" r="8" />
                <path d="M24 16v16" />
              </svg>
            </div>
            <div className="pr-pcard-body">
              <h3>High-Power Patchcord</h3>
              <p>Specialty assembly for laser delivery and sensing applications. Handling 1W–50W power.</p>
              <div className="pr-spec-row">
                <span className="pr-spec-pill">1W–50W</span>
                <span className="pr-spec-pill">SM Fiber</span>
              </div>
              <div className="pr-prod-cta">
                <button className="add-to-quote-btn" onClick={handleAdd}>
                  {added ? '✓ Added' : 'Add to Quote'}
                </button>
                <Link to="/products/high-power-patchcord">Details →</Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/products/drone">Inquire Now</Link>
          <Link className="btn btn-outline" to="/products/drone">Request Datasheet</Link>
        </div>
      </div>
    </section>
  );
}

export default function Products() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  const sections = catalogue.sections as Section[];

  return (
    <>
      <Seo
        title="Product Catalogue | PDR World — Fiber Optic Solutions"
        description="Browse PDR World's full fiber optic catalogue: SFP transceivers, patch cords, ODFs, OTDRs, drones, and more. ISO 9001:2015 certified manufacturing."
        canonical="https://pdrworld.com/products"
      />

      {/* HERO */}
      <section className="pr-hero">
        <div className="container">
          <div className="pr-hero-grid">
            <div className="pr-hero-copy">
              <div className="eyebrow">{catalogue.hero.eyebrow}</div>
              <h1>{catalogue.hero.title}</h1>
              <p className="pr-hero-subtitle">{catalogue.hero.subtitle}</p>
              <ul className="pr-hero-points">
                <li>Engineered and tested in-house in Mumbai</li>
                <li>Full stack from active to maintenance tools</li>
                <li>Fast RFQ support for enterprise deployments</li>
              </ul>
              <div className="pr-hero-cta-row">
                <Link className="btn btn-primary" to="/contact">Request a Quote</Link>
                <a className="btn btn-outline" href="#active">Browse Catalogue ↓</a>
              </div>
              <div className="pr-hero-stats">
                {catalogue.hero.stats.map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </div>
            <div className="pr-cat-nav-panel">
              {catalogue.hero.pills.map((p, i) => (
                <a key={i} className="pr-cat-pill" href={p.href}>
                  <span className="pr-cat-pill-left">
                    <span className="pr-cat-dot"></span>
                    <span className="pr-cat-pill-name">{p.name}</span>
                  </span>
                  <span className="pr-cat-pill-right">
                    {p.meta}{' '}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StickyNav />

      {sections.map((s, i) =>
        s.id === 'specialty' ? <SpecialtySection key={s.id} /> : <CategorySection key={s.id} section={s} alt={i % 2 === 0} />,
      )}

      {/* TRUST BAND */}
      <section className="section reveal pr-trust-band">
        <div className="container">
          <div className="pr-trust-layout">
            <div>
              <div className="eyebrow">Made in Mumbai</div>
              <h2>Manufactured, tested and dispatched from one floor.</h2>
              <p className="pr-trust-copy">
                PDR operates a vertically integrated production facility at Filmcity Complex, Goregaon East — ensuring zero supply chain
                gaps and full quality ownership.
              </p>
              <Link className="btn btn-outline pr-trust-link" to="/about">About Our Manufacturing →</Link>
            </div>
            <div className="pr-trust-grid">
              <div className="pr-trust-tile"><div className="stat-num">40+</div><div className="stat-label">Years Heritage</div></div>
              <div className="pr-trust-tile"><div className="stat-num">50+</div><div className="stat-label">Product Families</div></div>
              <div className="pr-trust-tile"><div className="stat-num">ISO</div><div className="stat-label">9001:2015</div></div>
              <div className="pr-trust-tile"><div className="stat-num">100%</div><div className="stat-label">Factory Tested</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="section">
        <div className="container">
          <div className="pr-custom-cta">
            <div className="eyebrow pr-custom-eyebrow">Need a Custom Configuration?</div>
            <h2>We manufacture to spec.</h2>
            <p className="pr-custom-copy">
              Non-standard lengths, connector types, armour configurations, and private-label assemblies — quoted within 24 hours.
            </p>
            <div className="pr-custom-cta-row">
              <Link className="btn btn-primary" to="/contact?inquiry=Custom+Manufacturing">Submit Your RFQ →</Link>
              <Link className="btn btn-outline" to="/contact?inquiry=Technical+Support">Talk to an Engineer</Link>
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
    </>
  );
}
