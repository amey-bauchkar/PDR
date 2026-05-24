import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useRfqCart } from '../components/RfqCartProvider';
import Seo from '../components/Seo';
import { ProductSchema, BreadcrumbSchema } from '../components/Schema';
import productsData from '../data/products.json';
import catalogueData from '../data/catalogue.json';
import { mergeWithProducts } from '../lib/productSync';

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
};

const catalogueImageBySlug = new Map<string, string>();
const categoryFallbackImage: Record<string, string> = {
  'Active Components': 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=900&q=80',
  'Passive Components': 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80',
  'Cable Management Devices': 'https://images.unsplash.com/photo-1581092335878-4f8e1f9d9f8a?auto=format&fit=crop&w=900&q=80',
  'Test & Measuring Equipment': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
  'Maintenance Tools': 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=900&q=80',
  'Specialty Products': 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80',
};

for (const section of (catalogueData as { sections?: { groups?: { cards?: { slug: string; img?: string }[] }[] }[] }).sections ?? []) {
  for (const group of section.groups ?? []) {
    for (const card of group.cards ?? []) {
      if (card.img && card.img.trim()) catalogueImageBySlug.set(card.slug, card.img);
    }
  }
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useRfqCart();
  const [added, setAdded] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => mergeWithProducts(productsData));

  useEffect(() => {
    const handleStorage = () => {
      setProducts(mergeWithProducts(productsData));
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('pdrworld-product-update', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pdrworld-product-update', handleStorage);
    };
  }, []);

  const product = products.find((p) => p.slug === slug);
  const detailImage = product?.imageUrl || (slug ? catalogueImageBySlug.get(slug) : undefined) || categoryFallbackImage[product?.category ?? ''] || categoryFallbackImage['Passive Components'];

  if (!product) return <Navigate to="/404" replace />;

  return (
    <>
      <Seo
        title={product.title}
        description={product.description}
        canonical={`https://pdrworld.com/products/${product.slug}`}
        ogTitle={`${product.name} — ${product.category} | PDR World`}
        ogDescription={product.description}
        ogUrl={`https://pdrworld.com/products/${product.slug}`}
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
        { name: 'Home', url: 'https://pdrworld.com/' },
        { name: 'Products', url: 'https://pdrworld.com/products' },
        { name: product.category, url: 'https://pdrworld.com/products' },
        { name: product.name, url: `https://pdrworld.com/products/${product.slug}` },
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 80, alignItems: 'center' }}>
            <div className="pd-image-frame">
              <img
                src={detailImage}
                alt={`${product.name} — ${product.category} by PDR World`}
                className="pd-image"
                loading="eager"
                onError={(event) => {
                  event.currentTarget.src = categoryFallbackImage['Passive Components'];
                }}
              />
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

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '16px 32px', fontSize: 16 }}
                  onClick={() => {
                    addItem({
                      title: product.name,
                      specs: product.specs?.[0] ? `${product.specs[0].label}: ${product.specs[0].value}` : 'Standard Specs',
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
                  <a
                    href={product.datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`${product.slug}-datasheet.pdf`}
                    className="btn btn-outline"
                    style={{ padding: '16px 32px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Datasheet (PDF)
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      import('../lib/datasheetPdf').then(({ downloadProductDatasheet }) => {
                        downloadProductDatasheet({
                          slug: product.slug,
                          name: product.name,
                          category: product.category,
                          title: product.title || `${product.name} | PDR World`,
                          description: product.description || '',
                          canonical: `https://pdrworld.com/products/${product.slug}`,
                          tagline: product.tagline || '',
                          features: product.features || [],
                          applications: product.applications || [],
                          specs: product.specs || [],
                          related: product.related || [],
                        });
                      });
                    }}
                    className="btn btn-outline"
                    style={{ padding: '16px 32px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}
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
