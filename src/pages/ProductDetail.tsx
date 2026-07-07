import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useRfqCart } from '../components/RfqCartProvider';
import Seo from '../components/Seo';
import { ProductSchema, BreadcrumbSchema } from '../components/Schema';
import productsData from '../data/products.json';
import { fetchAndSyncProducts, fetchProductBySlug, mergeWithProducts } from '../lib/productSync';
import { resolveCanonicalProductImage, getFallbackImage } from '../lib/imageResolution';

type Product = {
  slug: string;
  name: string;
  category: string;
  title: string;
  description: string;
  canonical: string;
  tagline: string;
  heroIcon: string;
  features: string[];
  applications: string[];
  specs: { label: string; value: string }[];
  related: { slug: string; name: string }[];
  imageUrl?: string;
  datasheetUrl?: string;
  galleryUrls?: string[];
};


export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useRfqCart();
  const [added, setAdded] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => mergeWithProducts(productsData));
  const [syncComplete, setSyncComplete] = useState(false);
  const [droneLength, setDroneLength] = useState('1 km');
  const [customDroneLength, setCustomDroneLength] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [prevSlug, setPrevSlug] = useState(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setSelectedImage(null);
  }

  useEffect(() => {
    const handleStorage = () => {
      setProducts(mergeWithProducts(productsData));
    };

    let cancelled = false;
    
    fetchAndSyncProducts()
      .then(async () => {
        if (cancelled) return;
        setProducts(mergeWithProducts(productsData));
      })
      .finally(() => {
        if (!cancelled) setSyncComplete(true);
      });

    window.addEventListener('storage', handleStorage);
    window.addEventListener('pdrworld-product-update', handleStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pdrworld-product-update', handleStorage);
    };
  }, [slug]);

  const product = products.find((p) => p.slug === slug);
  const detailImage = resolveCanonicalProductImage(product?.slug, product?.imageUrl, product?.category);

  if (!product && !syncComplete) {
    return (
      <section className="section" style={{ paddingTop: 180, paddingBottom: 120, background: '#FFFFFF' }}>
        <div className="container" style={{ color: '#475569' }}>Loading product...</div>
      </section>
    );
  }

  if (!product) return <Navigate to="/404" replace />;

  return (
    <>
      <Seo
        title={product.title}
        description={product.description}
        canonical={`https://pdr-sable.vercel.app/products/${product.slug}`}
        ogTitle={`${product.name} — ${product.category} | PDR World`}
        ogDescription={product.description}
        ogUrl={`https://pdr-sable.vercel.app/products/${product.slug}`}
        ogImage={detailImage}
        ogType="product"
      />
      <ProductSchema
        name={product.name}
        description={product.description}
        slug={product.slug}
        category={product.category}
        specs={product.specs}
        image={detailImage}
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdr-sable.vercel.app/' },
        { name: 'Products', url: 'https://pdr-sable.vercel.app/products' },
        { name: product.category, url: 'https://pdr-sable.vercel.app/products' },
        { name: product.name, url: `https://pdr-sable.vercel.app/products/${product.slug}` },
      ]} />

      {/* HERO */}
      <section className="section" style={{ paddingTop: 160, paddingBottom: 80, background: '#FFFFFF' }}>
        <div className="container">
          <div
            className="breadcrumb"
            style={{ marginBottom: 48, fontSize: 14, color: '#94A3B8', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/">Home</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <Link to="/products">Products</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span>{product.category}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span style={{ color: '#07008F', fontWeight: 600 }}>{product.name}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 80, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="pd-image-frame">
                <img
                  src={selectedImage || detailImage}
                  alt={`${product.name} — ${product.category} by PDR World`}
                  className="pd-image"
                  loading="eager"
                  onError={(event) => {
                    const fallback = getFallbackImage(product?.category);
                    if (!event.currentTarget.src.endsWith(fallback)) {
                      event.currentTarget.src = fallback;
                    }
                  }}
                />
              </div>
              {product.galleryUrls && product.galleryUrls.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginTop: '16px', WebkitOverflowScrolling: 'touch' }}>
                  <img
                    src={detailImage}
                    alt="Main"
                    onClick={() => setSelectedImage(null)}
                    className={`pd-thumbnail ${!selectedImage ? 'active' : ''}`}
                  />
                  {product.galleryUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Gallery ${idx + 1}`}
                      onClick={() => setSelectedImage(url)}
                      className={`pd-thumbnail ${selectedImage === url ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1
                style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  lineHeight: 1.1,
                  marginBottom: 24,
                  letterSpacing: '-1px',
                  color: '#07008F',
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                {product.name}
              </h1>
              <p style={{ color: '#475569', fontSize: 20, lineHeight: 1.6, marginBottom: 24 }}>{product.tagline}</p>

              {product.slug === 'drone' && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#475569' }}>Select Fiber Length</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {['1 km', '2 km', '3 km', '5 km', '10 km', '15 km', '20 km', '25 km', '30 km', '40 km', '50 km'].map(len => (
                      <button
                        key={len}
                        onClick={() => { setDroneLength(len); setCustomDroneLength(''); }}
                        style={{
                          padding: '8px 12px',
                          border: `1px solid ${droneLength === len && !customDroneLength ? '#07008F' : '#E2E8F0'}`,
                          background: droneLength === len && !customDroneLength ? '#07008F' : '#FFF',
                          color: droneLength === len && !customDroneLength ? '#FFF' : '#475569',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 14
                        }}
                      >
                        {len}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#475569', fontSize: 14 }}>Or Custom:</span>
                    <input
                      type="text"
                      placeholder="e.g. 7.5 km"
                      value={customDroneLength}
                      onChange={(e) => { setCustomDroneLength(e.target.value); setDroneLength(''); }}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: 6,
                        fontSize: 14,
                        width: '120px'
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '16px 32px', fontSize: 16 }}
                  onClick={() => {
                    addItem({
                      title: product.name,
                      specs: product.slug === 'drone' ? `Fiber Length: ${customDroneLength || droneLength}` : (product.specs?.[0] ? `${product.specs[0].label}: ${product.specs[0].value}` : 'Standard Specs'),
                      image: detailImage || '/placeholder.webp',
                      qty: 1,
                    });
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1500);
                  }}
                >
                  {added ? '✓ Added' : 'Add to Quote'}
                </button>
                {product.datasheetUrl ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(product.datasheetUrl, '_blank', 'noopener,noreferrer');
                    }}
                    style={{
                      padding: '16px 32px',
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      textDecoration: 'none',
                      border: '1px solid #0f172a',
                      background: '#fff',
                      color: '#0f172a',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      fontFamily: "'Manrope', sans-serif",
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#07008F';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#0f172a';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Datasheet (PDF)
                  </button>
                ) : (
                  <span
                    style={{
                      padding: '16px 32px',
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      opacity: 0.5,
                      cursor: 'not-allowed',
                      border: '1px solid #d6dee8',
                      background: '#f8f9fa',
                      color: '#94A3B8',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Datasheet (PDF)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES + APPLICATIONS + SPECS */}
      <section className="section sec-muted" style={{ paddingTop: 80, paddingBottom: 120, background: '#FAFAFA' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 80 }}>
          <div>
            {product.features.length > 0 && (
              <>
                <h3 style={{ marginBottom: 32, fontSize: 28, fontFamily: "'Manrope', sans-serif", color: '#07008F' }}>Key Features</h3>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 56, fontSize: 16 }}>
                  {product.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, color: '#475569' }}>
                      <svg
                        style={{ flexShrink: 0, color: '#4A9FD8', marginTop: 2 }}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {product.applications.length > 0 && (
              <>
                <h3 style={{ marginBottom: 32, fontSize: 28, fontFamily: "'Manrope', sans-serif", color: '#07008F' }}>Applications</h3>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
                  {product.applications.map((a, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, color: '#475569' }}>
                      <svg
                        style={{ flexShrink: 0, color: '#94A3B8', marginTop: 2 }}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 16 12 12 8 12" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div>
            {product.specs.length > 0 && (
              <>
                <h3 style={{ marginBottom: 32, fontSize: 28, fontFamily: "'Manrope', sans-serif", color: '#07008F' }}>Technical Specifications</h3>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', fontSize: 15 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <tbody>
                      {product.specs.map((s, i) => (
                        <tr
                          key={i}
                          style={{
                            background: i % 2 === 0 ? 'rgba(7,0,143,0.02)' : 'transparent',
                            borderBottom: '1px solid #E2E8F0',
                          }}
                        >
                          <th
                            style={{
                              padding: 16,
                              color: '#475569',
                              fontWeight: 500,
                              width: '40%',
                              textAlign: 'left',
                            }}
                          >
                            {s.label}
                          </th>
                          <td style={{ padding: 16, color: '#475569' }}>{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {product.related.length > 0 && (
        <section className="section" style={{ paddingTop: 80, paddingBottom: 120, borderTop: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          <div className="container">
            <h3 style={{ marginBottom: 48, textAlign: 'center', fontFamily: "'Manrope', sans-serif", color: '#07008F' }}>
              Related Products from {product.category}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {product.related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/products/${r.slug}`}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 24,
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 16px 40px -12px rgba(7,0,143,0.08)',
                  }}
                >
                  <div style={{ color: '#4A9FD8', marginBottom: 16 }}>
                    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="8" y="16" width="32" height="16" rx="3" />
                      <rect x="4" y="20" width="6" height="8" rx="1" />
                      <rect x="38" y="20" width="6" height="8" rx="1" />
                      <line x1="14" y1="24" x2="34" y2="24" />
                    </svg>
                  </div>
                  <h4 style={{ color: '#07008F', marginBottom: 8 }}>{r.name}</h4>
                  <p style={{ color: '#475569', fontSize: 13 }}>View Details →</p>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 64 }}>
              <Link to="/products" className="btn btn-outline">
                View Full Catalogue →
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
