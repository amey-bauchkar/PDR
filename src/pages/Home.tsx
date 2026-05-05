import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import attenuatorImg from '../assets/images/products/attenuator.png';

const homeCategories = [
  {
    id: 'active',
    title: 'Active Components',
    description: 'High-performance SFP transceivers, bypass switches, and optical protection systems.',
    count: '15+ SKUs',
    image: '/images/sfp-transceiver.png',
  },
  {
    id: 'passive',
    title: 'Passive Components',
    description: 'Premium patchcords, MPO assemblies, WDMs, and precision splitters.',
    count: '40+ SKUs',
    image: attenuatorImg,
  },
  {
    id: 'cable',
    title: 'Cable Management',
    description: 'Modular ODFs, termination boxes, and IP-rated splice closures.',
    count: '12+ SKUs',
    image: '/images/fiber-patch-panel.png',
  },
  {
    id: 'test',
    title: 'Test & Measuring',
    description: 'OTDRs, optical power meters, fusion splicers, and inspection tools.',
    count: '10+ SKUs',
    image: '/images/fiber-patch-panel.png',
  },
  {
    id: 'specialty',
    title: 'Specialty',
    description: 'Specialized high-power and custom optical products for critical applications.',
    count: 'Custom Builds',
    image: '/images/hero-infrastructure.png',
  },
  {
    id: 'tools',
    title: 'Maintenance',
    description: 'Field-ready cleaning kits, fault locators, sleeves, and support accessories.',
    count: 'Tooling Range',
    image: '/images/fiber-patch-panel.png',
  },
];

export default function Home() {
  return (
    <>
      <Seo
        title="PDR World | Industrial Fiber Optic Solutions & Infrastructure — Since 1985"
        description="PDR World (Videotronics India) is an ISO 9001:2015 certified manufacturer of high-performance fiber optic solutions since 1985. Specializing in active and passive components, test equipment, and enterprise infrastructure. Made in India."
        canonical="https://pdrworld.com/"
      />

      {/* SECTION 1: PREMIUM HERO */}
      <section className="hp-hero">
        <div className="container">
          <div className="hp-hero-grid">
            <div className="hp-hero-content reveal">
              <div className="hero-status">
                <span className="live"></span> ISO 9001:2015 Certified Manufacturer
              </div>
              <h1>
                Next-Gen Fiber Infrastructure.
                <br />
                <span>Built for Reliability.</span>
              </h1>
              <p>
                PDR manufactures high-performance optical solutions for telecom, defence, and hyperscale data centers. Engineered in
                Mumbai, trusted worldwide.
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
            <div className="hp-hero-visual reveal d-2">
              <img src="/images/hero-infrastructure.png" alt="PDR Fiber Optic Infrastructure" loading="eager" />
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
                    onError={(event) => {
                      event.currentTarget.src = attenuatorImg || '/placeholder.png';
                    }}
                  />
                </div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <div className="hp-cat-count">{category.count}</div>
                <a className="btn-link" href={`/products#${category.id}`}>
                  Explore Category →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SOLUTIONS */}
      <section className="section reveal" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="sec-head center">
            <div className="eyebrow">Industrial Solutions</div>
            <h2>Field-proven in critical environments.</h2>
            <p>Our infrastructure powers telecom networks, defence operations, and data centers across 15+ countries.</p>
          </div>
          <div className="hp-sol-grid">
            <div className="hp-sol-card reveal d-1">
              <div className="hp-sol-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                  <path d="M2 12c2-3 4-4 6-4s4 1 6 4 4 4 6 4" />
                </svg>
              </div>
              <h3>Telecommunications</h3>
              <p>High-density DAS and FTTH solutions for public networks and metro rail systems.</p>
              <Link className="btn-link" to="/solutions#telecom">Case Study →</Link>
            </div>
            <div className="hp-sol-card reveal d-2">
              <div className="hp-sol-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M2 12h3m14 0h3" />
                </svg>
              </div>
              <h3>Defence &amp; Aerospace</h3>
              <p>MIL-spec components and tactical fiber assemblies for mission-critical operations.</p>
              <Link className="btn-link" to="/solutions#defence">Learn More →</Link>
            </div>
            <div className="hp-sol-card reveal d-3">
              <div className="hp-sol-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3>Enterprise Data Centers</h3>
              <p>Hyperscale cabling and modular patch panels optimized for low-latency performance.</p>
              <Link className="btn-link" to="/solutions#datacentre">Architecture →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: WHY PDR */}
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

      {/* SECTION 6: FINAL CTA */}
      <section className="section reveal hp-final-cta-wrap">
        <div className="container">
          <div className="hp-final-cta">
            <div className="hp-final-cta-inner">
              <div className="hero-status hp-final-status">
                <span className="live"></span> Ready to Deploy Worldwide
              </div>
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
                <a className="btn btn-primary" href="/contact">
                  Request Technical Quote
                </a>
                <a className="btn btn-outline" href="/about">
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
