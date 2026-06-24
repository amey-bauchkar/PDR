import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { BreadcrumbSchema } from '../components/Schema';
import eventsData from '../data/events.json';
import DownloadCatalogueModal from '../components/DownloadCatalogueModal';
import '../styles/resources.css';

export default function Resources() {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState(false);

  return (
    <>
      <Seo
        title="Fiber Optic Technical Resources & Support | Training & Partner Programs — PDR World"
        description="Technical documentation, training videos, partner programs, and industry news from PDR Videotronics. Supporting India's fiber optic infrastructure ecosystem."
        canonical="https://pdr-sable.vercel.app/resources"
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdr-sable.vercel.app/' },
        { name: 'Resources', url: 'https://pdr-sable.vercel.app/resources' },
      ]} />
      {/* HERO */}
      <section className="rs-hero reveal" style={{ width: '100%' }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Support &amp; Insights</div>
          <h1 style={{ color: '#07008F' }}>Fiber Optic Technical Resources, Training & Support</h1>
          <p>Access technical documentation, partner programs, training videos, and the latest news from PDR Videotronics.</p>

          <div className="rs-grid">
            {/* Download Catalogue */}
            <div className="rs-card" id="catalogue">
              <div className="rs-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg></div>
              <h3>PDR Catalogue 2024</h3>
              <p>Download our complete product catalogue featuring detailed specifications of all our active and passive fiber optic components.</p>
              <button 
                className="rs-link" 
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                onClick={() => setIsCatalogueModalOpen(true)}
              >
                Download PDF →
              </button>
            </div>

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
            <div className="rs-video-card">
              <div className="rs-video-container">
                <iframe src="https://www.youtube-nocookie.com/embed/7zuhQEL9JLo" title="Splice Closure" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
              </div>
              <div className="rs-video-info">
                <h4>Splice Closure</h4>
                <p>Complete calibration and operation guide for our fusion splicer.</p>
              </div>
            </div>

            <div className="rs-video-card">
              <div className="rs-video-container">
                <iframe src="https://www.youtube-nocookie.com/embed/UI9oTguhGUE" title="Nano OTDR (Built in VFL+OPM)" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
              </div>
              <div className="rs-video-info">
                <h4>Nano OTDR (Built in VFL+OPM)</h4>
                <p>Analyzing fiber faults and events using our Nano-OTDR equipment.</p>
              </div>
            </div>

            <div className="rs-video-card">
              <div className="rs-video-container">
                <iframe src="https://www.youtube-nocookie.com/embed/Fz5ztuc8l38" title="Fast Connector" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
              </div>
              <div className="rs-video-info">
                <h4>Fast Connector</h4>
                <p>Step-by-step demonstration on how to install PDR fast connectors.</p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <a className="btn btn-outline" href="https://www.youtube.com/channel/UCTOAYCstGJNZulaOF0TXGlg" target="_blank" rel="noopener noreferrer">Subscribe to PDR on YouTube</a>
          </div>
        </div>
      </section>

            {/* MEDIA */}
      <section className="section reveal" id="media" style={{ borderTop: '1px solid var(--line-dark)' }}>
        <div className="container">
          <div className="sec-head center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>In The News</div>
            <h2>Advertisements &amp; Press Coverages</h2>
            <p>Explore our featured advertisements and press coverages across top industry magazines.</p>
          </div>

          <div className="rs-ad-gallery">
            {[
              'PDR-FTTF-Feb-Ad-for-V-D-scaled',
              'PDR-May-Ad-for-CT-scaled',
              'PDR-Optic-Revolution-Feb-Ad-for-CT-scaled',
              'PDR-Patch-Cord-Jan-Ad-for-CT-scaled',
              'pdr',
              'final1',
              'Fnl-ET-Ad-scaled',
              'Green-Leaf-Sept-09-Ad',
              'PDR-3G-Ad',
              'PDR-AD-CT-BG-April-07',
              'PDR-FDF-ODF-Ad',
              'PDR-FttH-June-Ad-CT-scaled',
              'PDR-June-Ad-for-Satelite-Cable-scaled'
            ].map((img, i) => (
              <div key={i} className="rs-ad-card" onClick={() => setLightboxImg(`/images/media/${img}.webp`)} style={{ cursor: 'zoom-in' }}>
                <img src={`/images/media/${img}-thumb.webp`} alt={`PDR Advertisement ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY & EXHIBITIONS */}
      <section className="section reveal" id="gallery" style={{ borderTop: '1px solid var(--line-dark)' }}>
        <div className="container">
          <div className="sec-head center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Exhibitions & Events</div>
            <h2>Gallery</h2>
            <p>Highlights from our recent industry events and exhibitions.</p>
          </div>

          <div className="events-container" style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {eventsData.map((event, eventIdx) => (
              <div key={eventIdx} className="event-section-minimal">
                <h3 className="event-title-minimal">{event.title}</h3>
                <div className="event-gallery-minimal">
                  {event.images.map((img, imgIdx) => {
                    const thumbPath = img.replace(/\.(png|jpg|jpeg)$/i, '-thumb.webp');
                    const fullPath = img.replace(/\.(png|jpg|jpeg)$/i, '.webp');
                    return (
                      <div key={imgIdx} className="event-card-minimal" onClick={() => setLightboxImg(fullPath)}>
                        <img src={thumbPath} alt={`${event.title} Image ${imgIdx + 1}`} loading="lazy" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT GALLERY */}
      <section className="section reveal" id="product-gallery" style={{ borderTop: '1px solid var(--line-dark)', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="sec-head center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Product Gallery</div>
            <h2>Factory &amp; Product Slabs</h2>
            <p>A closer look at our manufacturing facilities and high-quality product slabs.</p>
          </div>

          <div className="event-gallery-minimal" style={{ marginTop: '2rem' }}>
            {[
              'gallery-1', 'gallery-2', 'gallery-3', 'gallery-4',
              'gallery-5', 'gallery-6', 'gallery-7', 'gallery-8'
            ].map((img, i) => (
              <div key={i} className="event-card-minimal" onClick={() => setLightboxImg(`/images/gallery/${img}.webp`)}>
                <img src={`/images/gallery/${img}-thumb.webp`} alt={`Product Gallery ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

{/* LIGHTBOX */}
      {lightboxImg && (
        <div 
          className="rs-lightbox-overlay" 
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={lightboxImg} 
            alt="Fullscreen view" 
            style={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              objectFit: 'contain',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }} 
          />
        </div>
      )}
      <DownloadCatalogueModal isOpen={isCatalogueModalOpen} onClose={() => setIsCatalogueModalOpen(false)} />
    </>
  );
}
