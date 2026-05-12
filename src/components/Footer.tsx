import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand" to="/">
            <div className="logo-container">
              <img src={logo} alt="PDR World" className="logo footer-logo" />
              <span className="brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
                PDR World
                <small>Videotronics India · Since 1985</small>
              </span>
            </div>
          </Link>
          <p>
            <strong>Together in Progress</strong> — India's longstanding manufacturer of active &amp; passive fiber optic infrastructure —
            supplying telecom operators, defence, hyperscale, ISPs, OEMs, researchers and global distributors from Mumbai since 1985.
            Products available through a growing nationwide reseller and distributor network.
          </p>
          <span className="made-in">🇮🇳 Engineered &amp; Made in India</span>
          <div className="social-row" aria-label="Social">
            <a href="https://www.linkedin.com/company/pdr-world-mumbai/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" />
              </svg>
            </a>
            <a href="https://www.facebook.com/PDRVideo" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/pdr.mumbai/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
              </svg>
            </a>
            <a href="https://www.youtube.com/channel/UCTOAYCstGJNZulaOF0TXGlg" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4>Products</h4>
          <ul>
            <li><Link to="/products/passive-components">Passive Components</Link></li>
            <li><Link to="/products/active-components">Active Components</Link></li>
            <li><Link to="/products/cable-management">Cable Management</Link></li>
            <li><Link to="/products/test-measuring">Test &amp; Measuring</Link></li>
            <li><Link to="/products/specialty-drones">Specialty &amp; Drones</Link></li>
            <li><Link to="/products/maintenance-tools">Maintenance Tools</Link></li>
          </ul>
        </div>

        <div>
          <h4>Industries</h4>
          <ul>
            <li><Link to="/solutions#telecom">Telecom Operators</Link></li>
            <li><Link to="/solutions#defence">Defence &amp; Govt</Link></li>
            <li><Link to="/solutions#datacentre">Data Centres</Link></li>
            <li><Link to="/solutions#5g">5G &amp; Wireless</Link></li>
            <li><Link to="/solutions#metro">Metro &amp; Railway</Link></li>
            <li><Link to="/solutions#power">Power &amp; Utilities</Link></li>
            <li><Link to="/solutions#ftth">FTTH &amp; Broadband</Link></li>
            <li><Link to="/solutions#broadcast">Broadcast &amp; CCTV</Link></li>
            <li><Link to="/solutions#enterprise">Enterprise &amp; Campus</Link></li>
          </ul>
        </div>

        <div>
          <h4>Resources</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/resources#support">Technical Support</Link></li>
            <li><Link to="/resources#custom">Custom Manufacturing</Link></li>
            <li><Link to="/resources#partners">Channel Partner Program</Link></li>
            <li><Link to="/resources#factory">Setup a Factory</Link></li>
            <li><Link to="/resources#training">Training</Link></li>
            <li><Link to="/contact">Submit RFQ / Enquiry</Link></li>
            <li><Link to="/resources#media">Media</Link></li>
            <li><Link to="/resources#events">Events &amp; Exhibitions</Link></li>
            <li><Link to="/resources#videos">Video Gallery</Link></li>
            <li><Link to="/about#compliance">Certifications</Link></li>
            <li><Link to="/about#careers">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>
              <strong style={{ color: '#fff', fontWeight: 600 }}>Headquarters</strong>
              <br />
              PDR Videotronics India Pvt. Ltd.
              <br />
              99 Old Prabhadevi Road
              <br />
              Mumbai 400025, Maharashtra, India
            </li>
            <li>
              <strong style={{ color: '#fff', fontWeight: 600 }}>Manufacturing</strong>
              <br />
              Filmcity Complex, Gen. A.K. Vaidya Marg
              <br />
              Goregaon East, Mumbai 400065, India
            </li>
            <li>
              <a href="tel:+912224306494">+91-22-24306494</a>
              <br />
              <a href="tel:+912224309536">+91-22-24309536</a>
            </li>
            <li>
              <a href="mailto:info@pdrworld.com">info@pdrworld.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="container footer-quick-actions"
        style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.06)' }}
      >
        <Link
          to="/contact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--accent)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          Submit RFQ →
        </Link>
        <a
          href="https://wa.me/918419916460"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,.06)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,.1)',
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-1.7-.9-2.9-1.5-4.1-3.5-.3-.5.3-.5.9-1.6.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3zM12 0a12 12 0 0 0-10.4 18l-1.6 6 6.1-1.6A12 12 0 1 0 12 0zm0 22a10 10 0 0 1-5.4-1.6l-.4-.2-3.7 1 1-3.6-.2-.4A10 10 0 1 1 12 22z" />
          </svg>{' '}
          WhatsApp
        </a>
        <a
          href="mailto:sales@pdrworld.com"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,.06)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,.1)',
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>{' '}
          sales@pdrworld.com
        </a>
      </div>

      <div className="container footer-bottom">
        <p>
          © {year} PDR Videotronics India Pvt. Ltd. — All Rights Reserved. GSTIN: 27AAACP2446G1ZL
        </p>
        <div className="links">
          <a href="mailto:info@pdrworld.com?subject=Legal%20%E2%80%94%20Terms%20of%20Sale%20Request">Terms of Sale</a>
          <a href="mailto:info@pdrworld.com?subject=Legal%20%E2%80%94%20Terms%20of%20Use%20Request">Terms of Use</a>
          <a href="mailto:info@pdrworld.com?subject=Legal%20%E2%80%94%20Privacy%20Policy%20Request">Privacy Policy</a>
          <a href="mailto:info@pdrworld.com?subject=Legal%20%E2%80%94%20Disclaimer%20Request">Disclaimer</a>
          <a href="mailto:info@pdrworld.com?subject=Legal%20%E2%80%94%20Subscriptions%20Request">Subscriptions</a>
        </div>
      </div>
    </footer>
  );
}
