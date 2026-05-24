import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { OrganizationSchema, WebSiteSchema } from '../components/Schema';
import { productsCategoryHref } from '../data/productCategoryRoutes';

const homeCategories = [
  {
    id: 'active',
    title: 'Active Components',
    description: 'High-performance SFP transceivers, bypass switches, and optical protection systems.',
    count: '15+ SKUs',
    image: '/images/sfp-transceiver.webp',
  },
  {
    id: 'passive',
    title: 'Passive Components',
    description: 'Premium patchcords, MPO assemblies, WDMs, and precision splitters.',
    count: '40+ SKUs',
    image: '/images/fiber-patchcord.webp',
  },
  {
    id: 'cable',
    title: 'Cable Management',
    description: 'Modular ODFs, termination boxes, and IP-rated splice closures.',
    count: '12+ SKUs',
    image: '/images/fiber-patch-panel.webp',
  },
  {
    id: 'test',
    title: 'Test & Measuring',
    description: 'OTDRs, optical power meters, fusion splicers, and inspection tools.',
    count: '10+ SKUs',
    image: '/images/fiber-patch-panel.webp',
  },
  {
    id: 'specialty',
    title: 'Specialty',
    description: 'Specialized high-power and custom optical products for critical applications.',
    count: 'Custom Builds',
    image: '/images/hero-infrastructure.webp',
  },
  {
    id: 'tools',
    title: 'Maintenance',
    description: 'Field-ready cleaning kits, fault locators, sleeves, and support accessories.',
    count: 'Tooling Range',
    image: '/images/fiber-patch-panel.webp',
  },
];

export default function Home() {
  return (
    <>
      <Seo
        title="Fiber Optic Manufacturer in India | Active & Passive Components — PDR World"
        description="PDR World is an ISO 9001:2015 certified manufacturer of fiber optic components since 1985. SFP transceivers, patch cords, ODFs, OTDRs, and more. Made in Mumbai."
        canonical="https://pdrworld.com/"
      />
      <OrganizationSchema />
      <WebSiteSchema />

      {/* SECTION 1: PREMIUM HERO */}
      <section className="hp-hero">
        <div className="container">
          <div className="hp-hero-grid">
            <div className="hp-hero-content reveal">
              <h1 style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Fiber Optic Solutions
                <br />
                Engineered for <span style={{ color: '#4A9FD8' }}>Reliability.</span>
              </h1>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.6, marginTop: '24px', opacity: 0.85, maxWidth: '600px' }}>
                <strong>Smart Fiber Monitoring &amp; Telecom Infrastructure Solutions.</strong>
                <br />
                <span style={{ display: 'inline-block', marginTop: '8px' }}>Make in India Fiber Optic Technology for Next-Gen Networks.</span>
              </p>
              <div className="hp-cta-row">
                <Link className="btn btn-primary" to="/contact">Request Quote</Link>
                <Link className="btn btn-outline" to="/products">Browse Products</Link>
              </div>
              <div className="hero-trust-chips">
                <div className="trust-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Made in India
                </div>
                <div className="trust-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  40+ Years Legacy
                </div>
                <div className="trust-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  3000+ Buyers
                </div>
              </div>
            </div>
            <div className="hp-hero-visual hero-image-card reveal d-2">
              <picture>
                <source srcSet="/images/hero-infrastructure.webp" type="image/webp" />
                <img src="/images/hero-infrastructure.webp" alt="PDR Fiber Optic Infrastructure" loading="eager" width="800" height="600" />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST STRIP */}
      <section className="hp-stats-strip">
        <div className="container hp-stats-grid">
          <div className="hp-stat-item reveal d-1">
            <div className="hp-stat-num">40<span>+</span></div>
            <div className="hp-stat-label">Years of Excellence</div>
          </div>
          <div className="hp-stat-item reveal d-2">
            <div className="hp-stat-num">15<span>+</span></div>
            <div className="hp-stat-label">Export Markets</div>
          </div>
          <div className="hp-stat-item reveal d-3">
            <div className="hp-stat-num">500<span>+</span></div>
            <div className="hp-stat-label">Project Deployments</div>
          </div>
          <div className="hp-stat-item reveal d-4">
            <div className="hp-stat-num">100<span>%</span></div>
            <div className="hp-stat-label">Vertical Integration</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PRODUCT PORTFOLIO */}
      <section className="section sec-muted reveal" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Product Portfolio</div>
            <h2>Engineered for every layer of the network.</h2>
            <p>
              From high-speed transceivers to ruggedized outdoor enclosures — PDR manufactures the complete fiber optic stack.
            </p>
          </div>
          <div className="hp-cat-grid">
            {homeCategories.map((category, index) => (
              <div key={category.id} className={`hp-cat-card product-card reveal d-${Math.min(index + 1, 4)}`}>
                <div className="hp-cat-media">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="real-img"
                    loading="lazy"
                    width="400"
                    height="300"
                    onError={(event) => {
                      event.currentTarget.src = '/images/fiber-patchcord.webp';
                    }}
                  />
                </div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <div className="hp-cat-count">{category.count}</div>
                <Link className="btn-link" to={productsCategoryHref(category.id)}>
                  View {category.title} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY PDR */}
      <section className="section reveal sec-muted">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">The PDR Edge</div>
            <h2>Four decades of precision engineering.</h2>
            <p>Direct-from-factory reliability. No middlemen, no compromise on quality.</p>
          </div>
          <div className="why-grid">
            <div className="why-card reveal d-1">
              <div className="num">01</div>
              <h3>Interferometric Testing</h3>
              <p>100% factory verification of 3D geometry and endface quality for zero-defect performance.</p>
            </div>
            <div className="why-card reveal d-2">
              <div className="num">02</div>
              <h3>Rapid Prototyping</h3>
              <p>In-house R&amp;D and tooling allows for 24-hour turnaround on custom fiber configurations.</p>
            </div>
            <div className="why-card reveal d-3">
              <div className="num">03</div>
              <h3>Vertical Integration</h3>
              <p>We control the entire supply chain, from raw materials to final QC, ensuring supply stability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CTA */}
      <section className="section reveal hp-final-cta-wrap">
        <div className="container">
          <div className="hp-final-cta">
            <div className="hp-final-cta-inner">
              <h2>
                Tell us your network requirements.
                <br />
                We&rsquo;ll engineer the solution.
              </h2>
              <p>
                24-hour RFQ turnaround. Direct technical support from our Mumbai facility. Samples available for qualified
                infrastructure projects.
              </p>
              <div className="hp-cta-row hp-final-cta-row">
                <Link className="btn btn-primary" to="/contact">
                  Request Technical Quote
                </Link>
                <Link className="btn btn-outline" to="/about">
                  Explore Facility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
