import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { OrganizationSchema, BreadcrumbSchema } from '../components/Schema';
import '../styles/about.css';
import iso9001Pdf from '../assets/certi/PDR VIDEOTRONICS ISO 9001 2015.pdf';
import iso14001Pdf from '../assets/certi/PDR VIDEOTRONICS ISO 14001 2015.pdf';
import rohsPdf from '../assets/certi/ROHS Compliant.pdf';
import cactPdf from '../assets/certi/PDR CACT Certificate.pdf';
import iecPdf from '../assets/certi/IEC Certificate.pdf';
import nsicPdf from '../assets/certi/NSIC Certificate.pdf';
import udyamPdf from '../assets/certi/Udyam Registration Certificate.pdf';
import mpcbPdf from '../assets/certi/MPCB Certificate.pdf';

export default function About() {
  return (
    <>
      <Seo
        title="About PDR World | Fiber Optic Manufacturer in India Since 1985"
        description="PDR Videotronics India — ISO 9001:2015 certified fiber optic manufacturer in Mumbai. 40+ years building active and passive optical components for telecom and defence."
        canonical="https://pdr-sable.vercel.app/about"
      />
      <OrganizationSchema />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdr-sable.vercel.app/' },
        { name: 'About', url: 'https://pdr-sable.vercel.app/about' },
      ]} />
      {/* HERO SECTION */}
      <section className="ab-hero">
        <div className="container">
          <div className="ab-hero-grid">
            <div className="reveal ab-hero-copy">
              <div className="eyebrow">Our Story - Since 1974 (company incorporated in 1974, fiber optics started in 1985)</div>
              <h1>Leading Fiber Optic Manufacturer in India — PDR Videotronics India Pvt Ltd</h1>
              <p>
                For nearly four decades, PDR has been at the forefront of manufacturing and supplying active and passive fiber optic infrastructure, empowering India's digital backbone from our Mumbai headquarters.
              </p>
            </div>
            <div className="ab-hero-img reveal" style={{ transitionDelay: '0.1s' }}>
              <picture>
                <source srcSet="/images/factory-modern.webp" type="image/webp" />
                <img src="/images/factory-modern.webp" alt="PDR Manufacturing Facility" width="800" height="600" />
              </picture>
              <div className="ab-hero-img-overlay" />
              <div className="ab-est">
                <div className="ab-est-year">1974</div>
                <div className="ab-est-text">Year Established</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="ab-stats-bar reveal">
        <div className="container" style={{ display: 'flex', width: '100%', padding: 0, flexWrap: 'wrap' }}>
          <div className="ab-stat">
            <div className="ab-stat-num">3,000+</div>
            <div className="ab-stat-label">Enterprise Customers</div>
          </div>
          <div className="ab-stat">
            <div className="ab-stat-num">15+</div>
            <div className="ab-stat-label">Countries Exported To</div>
          </div>
          <div className="ab-stat">
            <div className="ab-stat-num">50+</div>
            <div className="ab-stat-label">Product Families</div>
          </div>
          <div className="ab-stat">
            <div className="ab-stat-num">40+</div>
            <div className="ab-stat-label">Years of Excellence</div>
          </div>
        </div>
      </div>

      {/* THE PDR STORY */}
      <section className="section reveal ab-story-section">
        <div className="container">
          <div className="ab-story-grid">
            <div>
              <h2 className="ab-story-title">Building the foundation of modern connectivity.</h2>
              <div className="ab-story-content">
                <p>Established in 1974 in Mumbai, PDR began with a vision to build reliable, high-quality electronic and optical components for the emerging telecommunications sector. As technology evolved, so did we.</p>
                <p>Our philosophy is simple: engineering excellence through manufacturing control. With in-house design, production, testing, and quality assurance, we deliver consistent quality, faster turnaround times, and dependable performance. Every solution is developed with a focus on precision, reliability, and long-term operational success.</p>
              </div>
            </div>
            <div>
              <ul className="ab-values">
                <li className="ab-value">
                  <div className="ab-value-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
                  <div>
                    <h4>Uncompromising Quality</h4>
                    <p>100% factory testing using advanced interferometric equipment.</p>
                  </div>
                </li>
                <li className="ab-value">
                  <div className="ab-value-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
                  <div>
                    <h4>Rapid Delivery</h4>
                    <p>Extensive inventory allows for same-day shipping on standard products.</p>
                  </div>
                </li>
                <li className="ab-value">
                  <div className="ab-value-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg></div>
                  <div>
                    <h4>Custom Engineering</h4>
                    <p>We manufacture to specific client configurations within 24 hours.</p>
                  </div>
                </li>
                <li className="ab-value">
                  <div className="ab-value-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
                  <div>
                    <h4>Dedicated Support</h4>
                    <p>Direct access to our engineering team for technical consultations.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HISTORY & EVOLUTION */}
      <section className="section reveal" id="history">
        <div className="container">
          <div className="sec-head center">
            <div className="eyebrow ab-center-eyebrow">Our Journey</div>
            <h2>Over 50 Years of Engineering & Manufacturing Excellence</h2>
            <p>From our beginnings in 1974 to becoming one of India's trusted manufacturers of fiber optic and communication solutions.</p>
          </div>

          <div className="timeline">
            <div className="tm-item left">
              <div className="tm-content">
                <h3>1974</h3>
                <h4>The Foundation</h4>
                <p>PDR Videotronics India Pvt. Ltd. was established in Mumbai with a vision to develop and manufacture advanced electronic and communication technologies.</p>
              </div>
            </div>
            <div className="tm-item right">
              <div className="tm-content">
                <h3>1985</h3>
                <h4>Fiber Optics Division Established</h4>
                <p>PDR launched its Fiber Optics Division to support the emerging optical communication industry in India. This milestone marked the beginning of our journey in fiber optic connectivity, telecom infrastructure, and network solutions.</p>
              </div>
            </div>
            <div className="tm-item left">
              <div className="tm-content">
                <h3>1995</h3>
                <h4>Manufacturing Expansion</h4>
                <p>To meet the growing demand from telecom operators and enterprise networks, PDR expanded its manufacturing capabilities, strengthening production of fiber optic patch cords, termination boxes, and passive networking solutions.</p>
              </div>
            </div>
            <div className="tm-item right">
              <div className="tm-content">
                <h3>2010</h3>
                <h4>Global Recognition</h4>
                <p>Achieved ISO 9001:2015 certification and expanded exports to over 15 countries. This milestone established PDR as a trusted international partner for fiber optic products, telecom infrastructure, and connectivity solutions.</p>
              </div>
            </div>
            <div className="tm-item left">
              <div className="tm-content">
                <h3>2025 and Beyond</h3>
                <h4>Next-Generation Innovation</h4>
                <p>Pioneering the next era of connectivity with Optical Fiber Drone Communication Solutions, 400G networking technologies, and Remote Fiber Monitoring Systems, enabling secure, reliable, and intelligent network infrastructure across diverse applications.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE & CERTIFICATIONS */}
      <section className="section sec-muted reveal" id="compliance">
        <div className="container">
          <div className="sec-head center">
            <div className="eyebrow ab-center-eyebrow">Compliance &amp; Quality</div>
            <h2>Tested. Verified. Certified.</h2>
            <p>Our manufacturing processes adhere to the strictest global standards, ensuring every component performs flawlessly in mission-critical environments.</p>
          </div>

          <div className="ab-cert-grid">
            <a href={iso9001Pdf} target="_blank" rel="noopener noreferrer" className="ab-cert-card" style={{ display: 'block' }}>
              <div className="ab-cert-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
              <h4>ISO 9001:2015</h4>
              <p>Certified Quality Management System for manufacturing and distribution.</p>
            </a>
            <a href={iso14001Pdf} target="_blank" rel="noopener noreferrer" className="ab-cert-card" style={{ display: 'block' }}>
              <div className="ab-cert-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
              <h4>ISO 14001:2015</h4>
              <p>Certified Environmental Management System ensuring sustainable practices.</p>
            </a>
            <a href={rohsPdf} target="_blank" rel="noopener noreferrer" className="ab-cert-card" style={{ display: 'block' }}>
              <div className="ab-cert-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /></svg></div>
              <h4>RoHS Compliant</h4>
              <p>Products free from hazardous substances, ensuring environmental safety.</p>
            </a>
            <a href={cactPdf} target="_blank" rel="noopener noreferrer" className="ab-cert-card" style={{ display: 'block' }}>
              <div className="ab-cert-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg></div>
              <h4>CACT Certificate</h4>
              <p>Component Approval Centre for Telecommunications certification.</p>
            </a>
            <a href={iecPdf} target="_blank" rel="noopener noreferrer" className="ab-cert-card" style={{ display: 'block' }}>
              <div className="ab-cert-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg></div>
              <h4>IEC Certificate</h4>
              <p>Compliant with International Electrotechnical Commission standards.</p>
            </a>
          </div>
        </div>
      </section>

      {/* MANUFACTURING / MAKE IN INDIA */}
      <section className="ab-mfg reveal">
        <div className="container">
          <div className="ab-mfg-grid">
            <div>
              <div className="eyebrow">Manufacturing Facility</div>
              <h2 className="ab-mfg-title">Made in India. Deployed Worldwide.</h2>
              <p className="ab-mfg-copy">
                Our state-of-the-art manufacturing facility at Filmcity Complex, Goregaon East, is the heart of PDR operations.
                Equipped with clean rooms, precision polishing machines, and advanced interferometers, we maintain absolute control
                over production quality.
              </p>

              <div className="ab-mfg-features">
                <div className="ab-mfg-feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <div>
                    <h4>Interferometric Testing</h4>
                    <p>Every cable assembly is tested for 3D geometry, insertion loss, and return loss.</p>
                  </div>
                </div>
                <div className="ab-mfg-feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                  <div>
                    <h4>Custom Prototyping</h4>
                    <p>In-house tooling allows for rapid prototyping of custom ODFs and enclosures.</p>
                  </div>
                </div>
                <div className="ab-mfg-feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  <div>
                    <h4>Clean Room Assembly</h4>
                    <p>Dust-free environments ensure zero contamination during connector termination.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="ab-hero-img ab-mfg-image">
              <picture>
                <source srcSet="/images/factory-modern.webp" type="image/webp" />
                <img src="/images/factory-modern.webp" alt="PDR Manufacturing Facility Mumbai" width="800" height="600" />
              </picture>
              <div className="ab-hero-img-overlay" />
            </div>
          </div>
        </div>
      </section>

      <section className="section reveal ab-careers-wrap" id="careers">
        <div className="container">
          <div className="ab-careers-card">
            <div className="ab-careers-bar"></div>
            <div className="eyebrow ab-center-eyebrow">Join Our Team</div>
            <h2>Careers at PDR</h2>
            <p>
              PDR Videotronics is constantly seeking innovative engineers, skilled technicians, and driven sales professionals who are
              passionate about shaping the future of global fiber optic infrastructure.
            </p>
            <div className="ab-careers-cta">
              <a className="btn btn-primary" href="mailto:careers@pdrworld.com">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Send your CV
              </a>
              <a className="btn btn-outline" href="https://www.linkedin.com/company/pdr-world-mumbai/" target="_blank" rel="noopener noreferrer">
                View Openings on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container ab-partner-cta">
          <div className="eyebrow ab-center-eyebrow">Partner With Us</div>
          <h2>Ready to upgrade your network?</h2>
          <p>Contact our technical team for product inquiries, custom manufacturing requests, or to become a distributor.</p>
          <div className="ab-partner-actions">
            <Link className="btn btn-primary" to="/contact?inquiry=Technical+Support">Request Technical Consultation</Link>
            <Link className="btn btn-outline" to="/contact?inquiry=Distributorship">Become a Distributor</Link>
          </div>
        </div>
      </section>
    </>
  );
}
