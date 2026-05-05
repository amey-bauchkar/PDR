import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import '../styles/resources.css';

export default function Resources() {
  return (
    <>
      <Seo
        title="Resources & Support | Technical Training & Partner Programs — PDR World"
        description="Access PDR World resources: Technical support, custom manufacturing, channel partner programs, and industry training. Support India's fiber infrastructure from Mumbai."
        canonical="https://pdrworld.com/resources"
      />
      {/* HERO */}
      <section className="rs-hero reveal" style={{ width: '100%' }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Support &amp; Insights</div>
          <h1 style={{ color: '#07008F' }}>Resources &amp; Media</h1>
          <p>Access technical documentation, partner programs, training videos, and the latest news from PDR Videotronics.</p>

          <div className="rs-grid">
            {/* Technical Support */}
            <div className="rs-card" id="support">
              <div className="rs-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg></div>
              <h3>Technical Support</h3>
              <p>Direct access to our engineering team for installation guidance, troubleshooting, and product specifications. We provide comprehensive support for all active and passive components.</p>
              <Link className="rs-link" to="/contact?inquiry=Technical Support">Contact Engineering Team →</Link>
            </div>

            {/* Partner Program */}
            <div className="rs-card" id="partners">
              <div className="rs-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
              <h3>Channel Partner Program</h3>
              <p>Join our nationwide network of distributors and resellers. Benefit from competitive wholesale pricing, dedicated account management, and priority technical support.</p>
              <Link className="rs-link" to="/contact?inquiry=Distributorship">Apply to be a Partner →</Link>
            </div>

            {/* Custom Manufacturing */}
            <div className="rs-card" id="custom">
              <div className="rs-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg></div>
              <h3>Custom Manufacturing (OEM)</h3>
              <p>We manufacture to spec. If you need non-standard lengths, specific connector types, custom ODF designs, or private-label assemblies, our facility can deliver.</p>
              <Link className="rs-link" to="/contact?inquiry=Custom Manufacturing">Request Custom Quote →</Link>
            </div>

            {/* Training */}
            <div className="rs-card" id="training">
              <div className="rs-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></div>
              <h3>Product Training</h3>
              <p>Comprehensive training sessions on fiber optic splicing, testing equipment operation, and network deployment best practices conducted by our experts.</p>
              <Link className="rs-link" to="/contact?inquiry=Training">Inquire About Training →</Link>
            </div>
            <div className="rs-card" id="factory">
              <div className="rs-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg></div>
              <h3>Setup a Fiber Factory</h3>
              <p>PDR offers complete turnkey consultation for establishing fiber optic assembly and testing facilities — including equipment procurement, calibration, staff training, and quality systems setup.</p>
              <Link className="rs-link" to="/contact?inquiry=Factory+Setup">Enquire About Factory Setup →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* MEDIA & VIDEOS */}
      <section className="section sec-muted reveal" id="videos">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Video Gallery</div>
            <h2>Tutorials &amp; Demonstrations</h2>
            <p>Watch our technical guides, product demonstrations, and corporate overviews on our official YouTube channel.</p>
          </div>

          <div className="rs-media-grid">
            <a href="https://www.youtube.com/channel/UCTOAYCstGJNZulaOF0TXGlg" target="_blank" rel="noopener noreferrer" className="rs-video-card">
              <div className="rs-video-thumb">
                <span className="pr-prod-tag" style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 2, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>Fusion Splicer</span>
                <div className="rs-play-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg></div>
              </div>
              <div className="rs-video-info">
                <h4>Fusion Splicer PDR618H Setup Guide</h4>
                <p>Learn how to calibrate and operate our 8s fusion splicer.</p>
              </div>
            </a>

            <a href="https://www.youtube.com/channel/UCTOAYCstGJNZulaOF0TXGlg" target="_blank" rel="noopener noreferrer" className="rs-video-card">
              <div className="rs-video-thumb">
                <span className="pr-prod-tag" style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 2, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>OTDR</span>
                <div className="rs-play-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg></div>
              </div>
              <div className="rs-video-info">
                <h4>Mini OTDR PDR4402S Demo</h4>
                <p>Analyzing fiber faults and events using our Pro-OTDR.</p>
              </div>
            </a>

            <a href="https://www.youtube.com/channel/UCTOAYCstGJNZulaOF0TXGlg" target="_blank" rel="noopener noreferrer" className="rs-video-card">
              <div className="rs-video-thumb">
                <span className="pr-prod-tag" style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 2, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>Factory Tour</span>
                <div className="rs-play-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg></div>
              </div>
              <div className="rs-video-info">
                <h4>Factory Tour: Mumbai Facility</h4>
                <p>Inside our clean rooms and interferometry testing labs.</p>
              </div>
            </a>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <a className="btn btn-outline" href="https://www.youtube.com/channel/UCTOAYCstGJNZulaOF0TXGlg" target="_blank" rel="noopener noreferrer">Subscribe to PDR on YouTube</a>
          </div>
        </div>
      </section>

      {/* MEDIA & PRESS */}
      <section className="section reveal" id="media" style={{ borderTop: '1px solid var(--line-dark)' }}>
        <div className="container">
          <div className="sec-head center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>In The News</div>
            <h2>Media &amp; Press</h2>
            <p>Stay updated with the latest breakthroughs, corporate announcements, and industry features from PDR World.</p>
          </div>

          <div className="rs-media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            <div className="rs-media-card" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 180, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8z" /></svg>
              </div>
              <div style={{ padding: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Press Release</span>
                <h4 style={{ margin: '8px 0' }}>PDR Unveils India's First Fiber Optic Drone</h4>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>Revolutionizing high-altitude fiber deployment with autonomous UAV technology engineered in Mumbai.</p>
                <Link to="/contact?inquiry=Media" style={{ display: 'inline-block', marginTop: 14, fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>Read More →</Link>
              </div>
            </div>
            <div className="rs-media-card" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 180, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8z" /></svg>
              </div>
              <div style={{ padding: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Industry Feature</span>
                <h4 style={{ margin: '8px 0' }}>Empowering Atmanirbhar Bharat in Telecom</h4>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>PDR's 40-year journey featured in Leading Tech Magazine as a cornerstone of Indian manufacturing.</p>
                <Link to="/contact?inquiry=Media" style={{ display: 'inline-block', marginTop: 14, fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>Read More →</Link>
              </div>
            </div>
            <div className="rs-media-card" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 180, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8z" /></svg>
              </div>
              <div style={{ padding: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Corporate</span>
                <h4 style={{ margin: '8px 0' }}>PDR Expands to 20+ Global Export Markets</h4>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>New strategic distribution partnerships established across the EU and Southeast Asia regions.</p>
                <Link to="/contact?inquiry=Media" style={{ display: 'inline-block', marginTop: 14, fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>Read More →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="section reveal" id="events">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Upcoming</div>
            <h2>Events &amp; Exhibitions</h2>
            <p>Meet the PDR team at industry trade shows and exhibitions across India.</p>
          </div>

          <div className="rs-events-list">
            <div className="rs-event">
              <div className="rs-event-date">
                <div className="rs-event-month">Sep</div>
                <div className="rs-event-day">18</div>
              </div>
              <div className="rs-event-details">
                <h4>Convergence India Expo 2026</h4>
                <p>Bharat Mandapam, New Delhi — Showcasing our latest 5G and FTTH passive infrastructure solutions.</p>
              </div>
              <div className="rs-event-action">
                <Link className="btn btn-outline" to="/contact">Book a Meeting</Link>
              </div>
            </div>

            <div className="rs-event">
              <div className="rs-event-date">
                <div className="rs-event-month">Nov</div>
                <div className="rs-event-day">14</div>
              </div>
              <div className="rs-event-details">
                <h4>InfoComm India 2026</h4>
                <p>Jio World Convention Centre, Mumbai — Live demonstrations of our SMPTE and Broadcast AV solutions.</p>
              </div>
              <div className="rs-event-action">
                <Link className="btn btn-outline" to="/contact">Book a Meeting</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
