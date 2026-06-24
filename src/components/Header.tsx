import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

import logo from '../assets/logo.png';
import DownloadCatalogueModal from './DownloadCatalogueModal';
import ProductSearch from './ProductSearch';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const location = useLocation();
  const closeTimer = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openWithDelayCancel = (menu: string) => {
    clearCloseTimer();
    setOpenMega(menu);
  };

  const closeWithDelay = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpenMega(null);
    }, 180);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setMenuOpen(false);
    setOpenMega(null);
  }, [location.pathname, location.hash]);

  // Mobile body class
  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  useEffect(
    () => () => {
      clearCloseTimer();
    },
    [],
  );

  return (
    <>
      <header className={`site-header${scrolled ? ' scrolled' : ''}`} id="top">
        <div className="container nav">
          <Link className="brand site-header-brand" to="/" aria-label="PDR Videotronics India home">
            <img src={logo} alt="" className="logo site-header-logo" />
          </Link>

          <nav className="nav-center" aria-label="Primary">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Home
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              About Us
            </NavLink>
            <div
              className={`has-mega${openMega === 'products' ? ' open' : ''}`}
              onMouseEnter={() => openWithDelayCancel('products')}
              onMouseLeave={closeWithDelay}
            >
              <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : undefined)} aria-haspopup="true">
                Products
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </NavLink>
              <div className="mega" role="menu">
                <div className="mega-grid">
                  <Link to="/products/passive-components#passive" onClick={() => setOpenMega(null)}>
                    <strong>Passive Components</strong>
                    <span>Patchcords · Armoured · CPRI · FanOut · Rapid Push · Splitters · WDM · Adapters</span>
                  </Link>
                  <Link to="/products/active-components#active" onClick={() => setOpenMega(null)}>
                    <strong>Active Components</strong>
                    <span>SFP Transceivers · OLP · DAC/AOC · Bypass Switch</span>
                  </Link>
                  <Link to="/products/cable-management#cable" onClick={() => setOpenMega(null)}>
                    <strong>Cable Management</strong>
                    <span>ODF · FDB · Closures · Termination Boxes</span>
                  </Link>
                  <Link to="/products/test-measuring#test" onClick={() => setOpenMega(null)}>
                    <strong>Test and Measurement</strong>
                    <span>OPM · OTDR · Fusion Splicer</span>
                  </Link>
                  <Link to="/products/specialty-drones#specialty" onClick={() => setOpenMega(null)}>
                    <strong>Drone Optical Fiber Kit</strong>
                    <span>Optical Fiber Spool · Ground Unit · Sky Unit</span>
                  </Link>
                </div>
              </div>
            </div>
            <div
              className={`has-mega${openMega === 'tools' ? ' open' : ''}`}
              onMouseEnter={() => openWithDelayCancel('tools')}
              onMouseLeave={closeWithDelay}
            >
              <NavLink to="/cable-configurator" className={({ isActive }) => (isActive ? 'active' : undefined)} aria-haspopup="true">
                Configurator Tools
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </NavLink>
              <div className="mega" role="menu" style={{ width: 320, right: 'auto', left: 0, transform: 'translateX(-20%)', minHeight: 'unset', height: 'max-content' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Link
                    to="/cable-configurator"
                    onClick={() => setOpenMega(null)}
                    style={{ padding: 16, border: '1px solid var(--line)', borderRadius: 12, transition: 'all 0.2s' }}
                  >
                    <strong style={{ display: 'block', fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>
                      Custom Cable Builder
                    </strong>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Multi-step fiber patchcord wizard</span>
                  </Link>
                  <Link
                    to="/fiber-selector"
                    onClick={() => setOpenMega(null)}
                    style={{ padding: 16, border: '1px solid var(--line)', borderRadius: 12, transition: 'all 0.2s' }}
                  >
                    <strong style={{ display: 'block', fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>
                      Fiber Management Selector
                    </strong>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Filter panels, racks &amp; closures</span>
                  </Link>

                </div>
              </div>
            </div>

            <NavLink to="/solutions" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Solutions
            </NavLink>
            <NavLink to="/resources" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Resources
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Contact
            </NavLink>
          </nav>

          <div className="nav-right">
            <ProductSearch />
            <a
              className="icon-btn"
              href="https://wa.me/918419916460"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp: +91 84199 16460 (Sales & Support)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-1.7-.9-2.9-1.5-4.1-3.5-.3-.5.3-.5.9-1.6.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3zM12 0a12 12 0 0 0-10.4 18l-1.6 6 6.1-1.6A12 12 0 1 0 12 0zm0 22a10 10 0 0 1-5.4-1.6l-.4-.2-3.7 1 1-3.6-.2-.4A10 10 0 1 1 12 22z" />
              </svg>
            </a>
            <button className="btn btn-outline" onClick={() => setIsCatalogueModalOpen(true)} style={{ marginRight: '8px' }}>
              Download Catalogue
            </button>
            <Link className="btn btn-primary" to="/contact">
              Request Quote
            </Link>
            <button
              className="menu-toggle"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="2"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                  <circle cx="12" cy="19" r="2"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-overlay" aria-hidden={!menuOpen}>
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        <details>
          <summary>
            Products{' '}
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5l3 3 3-3" />
            </svg>
          </summary>
          <div className="submenu">
            <Link to="/products/passive-components">Passive Components</Link>
            <Link to="/products/active-components">Active Components</Link>
            <Link to="/products/cable-management">Cable Management Devices</Link>
            <Link to="/products/test-measuring">Test and Measurement</Link>
            <Link to="/products/specialty-drones">Drone Optical Fiber Kit</Link>
          </div>
        </details>
        <details>
          <summary>
            Configurator Tools{' '}
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5l3 3 3-3" />
            </svg>
          </summary>
          <div className="submenu">
            <Link to="/cable-configurator">Custom Cable Builder</Link>
            <Link to="/fiber-selector">Fiber Management Selector</Link>

          </div>
        </details>
        <Link to="/solutions">Solutions</Link>
        <Link to="/resources">Resources</Link>
        <Link to="/contact">Contact</Link>
        <div className="mobile-cta">
          <Link className="btn btn-primary" to="/contact">
            Request Engineering Consultation
          </Link>
          <a
            className="btn btn-outline"
            style={{ borderColor: 'rgba(255,255,255,.2)', background: 'transparent', color: '#fff' }}
            href="https://wa.me/918419916460"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <Link className="float-cta" to="/contact">
        Get a Quote →
      </Link>

      <DownloadCatalogueModal isOpen={isCatalogueModalOpen} onClose={() => setIsCatalogueModalOpen(false)} />
    </>
  );
}
