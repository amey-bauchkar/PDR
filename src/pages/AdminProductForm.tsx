import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import seedProducts from '../data/products.json';
import type { AdminSession } from '../lib/adminAuth';
import {
  getStoredSession,
  checkPermission,
  verifyCredentials,
  createSession,
  storeSession,
  clearStoredSession,
} from '../lib/adminAuth';
import { getAdminProducts, saveProduct } from '../lib/productSync';
import type { AdminProduct } from '../lib/productSync';
import '../styles/admin-enhanced.css';

type AdminStatus = 'Active' | 'Draft' | 'Archived';

type ProductFormState = {
  slug: string;
  name: string;
  category: string;
  title: string;
  description: string;
  descriptionText: string;
  tagline: string;
  status: AdminStatus;
  imageUrl: string;
  featuresText: string;
  applicationsText: string;
  specs: { label: string; value: string }[];
  datasheetUrl: string;
  galleryUrls: string[];
};

const DEFAULT_FORM: ProductFormState = {
  slug: '',
  name: '',
  category: '',
  title: '',
  description: '',
  descriptionText: '',
  tagline: '',
  status: 'Active',
  imageUrl: '',
  featuresText: '',
  applicationsText: '',
  specs: [],
  datasheetUrl: '',
  galleryUrls: [],
};

const COMMON_SPEC_LABELS = [
  "Cable Type",
  "Data Rate",
  "Reach",
  "Armour Material",
  "Fiber Type",
  "Jacket Type",
  "Connector Type",
  "Insertion Loss",
  "Return Loss",
  "Operating Temperature",
  "Capacity",
  "Ports",
  "Dimensions",
  "Weight",
  "Material",
  "Transmission Distance",
  "Wavelength",
  "Power Budget"
];

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const asAdminProducts = (items: typeof seedProducts): AdminProduct[] =>
  (items as Omit<AdminProduct, 'status' | 'updatedAt' | 'updatedBy'>[]).map((item) => ({
    ...item,
    status: 'Active' as AdminStatus,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  }));

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [session, setSession] = useState<AdminSession | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@pdrworld.com');
  const [loginPassword, setLoginPassword] = useState('Admin@123');
  const [loginError, setLoginError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('admin_dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('admin_dark_mode', darkMode.toString());
  }, [darkMode]);

  const [products, setProducts] = useState<AdminProduct[]>(() => {
    if (typeof window === 'undefined') return asAdminProducts(seedProducts as typeof seedProducts);
    const adminProducts = getAdminProducts();
    return adminProducts.length > 0 ? adminProducts : asAdminProducts(seedProducts as typeof seedProducts);
  });

  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);
  const [notices, setNotices] = useState<{
    global?: { message: string; type: 'success' | 'error' | 'info' };
    title?: { message: string; type: 'success' | 'error' | 'info' };
    image?: { message: string; type: 'success' | 'error' | 'info' };
    gallery?: { message: string; type: 'success' | 'error' | 'info' };
    pdf?: { message: string; type: 'success' | 'error' | 'info' };
  }>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const storedSession = getStoredSession();
    if (storedSession) {
      setSession(storedSession);
    }
  }, []);

  useEffect(() => {
    if (slug && products.length > 0) {
      const prod = products.find((p) => p.slug === slug);
      if (prod) {
        setForm({
          slug: prod.slug,
          name: prod.name,
          category: prod.category,
          title: prod.title ?? '',
          description: prod.description ?? '',
          descriptionText: prod.description
            ? prod.description.split('. ').join('\n')
            : '',
          tagline: prod.tagline ?? '',
          status: prod.status,
          imageUrl: prod.imageUrl ?? '',
          featuresText: (prod.features ?? []).join('\n'),
          applicationsText: (prod.applications ?? []).join('\n'),
          specs: prod.specs ?? [],
          datasheetUrl: prod.datasheetUrl ?? '',
          galleryUrls: prod.galleryUrls ?? [],
        });
        setImagePreview(prod.imageUrl ?? '');
      } else {
        setNotices(prev => ({ ...prev, global: { message: 'Product not found.', type: 'error' } }));
      }
    } else if (!slug) {
      setForm(DEFAULT_FORM);
      setImagePreview('');
    }
  }, [slug, products]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Email and password are required.');
      return;
    }

    const role = verifyCredentials(loginEmail, loginPassword);
    if (!role) {
      setLoginError('Invalid email or password. Demo users: admin@pdrworld.com / Admin@123');
      return;
    }

    const newSession = createSession(loginEmail, role);
    setSession(newSession);
    storeSession(newSession);
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleLogout = () => {
    clearStoredSession();
    setSession(null);
    navigate('/admin');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotices(prev => ({ ...prev, image: { message: 'Please select a valid image file.', type: 'error' } }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotices(prev => ({ ...prev, image: { message: 'Image size must be less than 5MB.', type: 'error' } }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setForm({ ...form, imageUrl: dataUrl });
      setNotices(prev => ({ ...prev, image: { message: 'Image uploaded successfully!', type: 'success' } }));
    };
    reader.onerror = () => {
      setNotices(prev => ({ ...prev, image: { message: 'Failed to read image file.', type: 'error' } }));
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (form.galleryUrls.length + files.length > 10) {
      setNotices(prev => ({ ...prev, gallery: { message: 'You can upload a maximum of 10 additional images.', type: 'error' } }));
      return;
    }

    const newUrls: string[] = [];
    let processed = 0;
    let hasError = false;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        hasError = true;
        setNotices(prev => ({ ...prev, gallery: { message: 'Please select only valid image files.', type: 'error' } }));
        processed++;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        hasError = true;
        setNotices(prev => ({ ...prev, gallery: { message: 'Each image size must be less than 5MB.', type: 'error' } }));
        processed++;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        newUrls.push(dataUrl);
        processed++;
        
        if (processed === files.length && !hasError) {
          setForm(prev => ({
            ...prev,
            galleryUrls: [...prev.galleryUrls, ...newUrls].slice(0, 10)
          }));
          setNotices(prev => ({ ...prev, gallery: { message: 'Gallery images uploaded successfully!', type: 'success' } }));
        }
      };
      reader.onerror = () => {
        processed++;
        hasError = true;
        setNotices(prev => ({ ...prev, gallery: { message: 'Failed to read one or more image files.', type: 'error' } }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setNotices(prev => ({ ...prev, pdf: { message: 'Please select a valid PDF file.', type: 'error' } }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setNotices(prev => ({ ...prev, pdf: { message: 'PDF size must be less than 10MB.', type: 'error' } }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setForm({ ...form, datasheetUrl: dataUrl });
      setNotices(prev => ({ ...prev, pdf: { message: 'Datasheet PDF uploaded successfully!', type: 'success' } }));
    };
    reader.onerror = () => {
      setNotices(prev => ({ ...prev, pdf: { message: 'Failed to read PDF file.', type: 'error' } }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) return;
    if (!checkPermission(session, 'manage_products')) {
      setNotices(prev => ({ ...prev, global: { message: 'You do not have permission to manage products.', type: 'error' } }));
      return;
    }

    const nextSlug = form.slug.trim() ? toSlug(form.slug) : toSlug(form.name);
    if (!nextSlug || !form.name.trim() || !form.category.trim()) {
      setNotices(prev => ({ ...prev, title: { message: 'Name and category are required.', type: 'error' } }));
      return;
    }

    const features = form.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const applications = form.applicationsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const specs = form.specs.filter((s) => s.label.trim() && s.value.trim());

    const existingProduct = products.find((p) => p.slug === (slug || ''));

    const payload: AdminProduct = {
      slug: nextSlug,
      name: form.name.trim(),
      category: form.category.trim(),
      title: form.title.trim(),
      description: form.descriptionText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .join('. '),
      canonical: existingProduct?.canonical || `https://pdr-sable.vercel.app/products/${nextSlug}`,
      tagline: form.tagline.trim(),
      status: form.status,
      imageUrl: form.imageUrl.trim(),
      features,
      applications,
      specs,
      related: existingProduct?.related || [],
      heroIcon: existingProduct?.heroIcon || `<svg width="120" height="120" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="14" y="14" width="20" height="20" rx="3"></rect><circle cx="24" cy="24" r="4"></circle></svg>`,
      datasheetUrl: form.datasheetUrl.trim(),
      galleryUrls: form.galleryUrls,
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    };

    // Refresh products from the latest data to avoid stale state
    const latestProducts = getAdminProducts();

    // Check for duplicate by product name (case-insensitive)
    const duplicateName = latestProducts.some(
      (p) => p.name.toLowerCase().trim() === payload.name.toLowerCase().trim() && p.slug !== (slug || '')
    );
    if (duplicateName) {
      setNotices(prev => ({ ...prev, title: { message: `Product "${payload.name}" already exists. Please choose a different name.`, type: 'error' } }));
      return;
    }

    // Check for duplicate by slug
    const duplicateSlug = latestProducts.some((p) => p.slug === payload.slug && p.slug !== (slug || ''));
    if (duplicateSlug) {
      setNotices(prev => ({ ...prev, title: { message: `A product with a similar name already exists (slug: "${payload.slug}"). Please choose a different name.`, type: 'error' } }));
      return;
    }

    setNotices(prev => ({ ...prev, global: { message: 'Saving product...', type: 'info' } }));

    try {
      await saveProduct(payload);
      setNotices(prev => ({ ...prev, global: { message: 'Product saved successfully! Redirecting...', type: 'success' } }));

      // Dispatch local sync event
      window.dispatchEvent(new Event('local-storage-update'));

      setTimeout(() => {
        navigate('/admin', { state: { activeTab: 'products' } });
      }, 1000);
    } catch (err) {
      console.error(err);
      setNotices(prev => ({ ...prev, global: { message: 'Failed to save product.', type: 'error' } }));
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();

  if (!session) {
    return (
      <>
        <Seo title="Admin Login | PDR World" description="PDR World admin login." canonical="https://pdr-sable.vercel.app/admin" />
        <div className={`admin-login-shell ${darkMode ? 'dark' : ''}`}>
          <div className="admin-login-container">
            <div className="admin-login-card">
              <div className="admin-login-header">
                <h1>PDR World Admin</h1>
                <p>Enterprise platform management</p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="admin-form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@pdrworld.com"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {loginError && <div className="admin-error-message">{loginError}</div>}

                <button type="submit" className="admin-btn-primary admin-btn-large">
                  Sign In
                </button>
              </form>

              <div className="admin-login-footer">
                <p>Demo Credentials:</p>
                <ul>
                  <li><strong>Super Admin:</strong> admin@pdrworld.com / Admin@123</li>
                  <li><strong>Admin:</strong> manager@pdrworld.com / Manager@123</li>
                </ul>
              </div>
            </div>

            <button
              className="admin-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title={`${slug ? 'Edit Product' : 'Add Product'} | PDR World`} description="Manage catalog products." canonical="https://pdr-sable.vercel.app/admin" />

      <div className={`admin-enhanced-shell ${darkMode ? 'dark' : ''}`}>
        <header className="admin-header">
          <div className="admin-header-left">
            <h1>Product Form</h1>
            <span className="admin-role-badge">{session.role.toUpperCase()}</span>
          </div>
          <div className="admin-header-right">
            <button className="admin-theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <span className="admin-user-info">{session.email}</span>
            <button className="admin-btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="admin-container">
          <aside className="admin-sidebar">
            <nav className="admin-nav">
              <button className="admin-nav-item" onClick={() => navigate('/admin', { state: { activeTab: 'dashboard' } })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Dashboard
              </button>
              <button className="admin-nav-item active" onClick={() => navigate('/admin', { state: { activeTab: 'products' } })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                Products
              </button>
              <button className="admin-nav-item" onClick={() => navigate('/admin', { state: { activeTab: 'rfqs' } })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                RFQs
              </button>
              <button className="admin-nav-item" onClick={() => navigate('/admin', { state: { activeTab: 'activity' } })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
                Activity
              </button>
              <button className="admin-nav-item" onClick={() => navigate('/admin', { state: { activeTab: 'settings' } })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                Settings
              </button>
            </nav>
          </aside>

          <main className="admin-main">
            <section style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>{slug ? 'Edit Product' : 'Add New Product'}</h2>
                <button 
                  className="admin-btn-secondary" 
                  onClick={() => navigate('/admin', { state: { activeTab: 'products' } })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px' }}
                >
                  ← Back to Catalogue
                </button>
              </div>



              <div className="admin-card" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '32px', boxShadow: 'var(--admin-shadow)' }}>
                <form 
                  onSubmit={handleSubmit} 
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                  <div className="admin-form-group">
                    <label>Product Name</label>
                    <input 
                      required 
                      value={form.name} 
                      onChange={(e) => {
                        setForm({...form, name: e.target.value});
                        setNotices(prev => ({...prev, title: undefined}));
                      }} 
                      placeholder="e.g. Active Optical Cable (AOC)"
                      className="admin-search"
                      style={{ width: '100%' }}
                    />
                    {notices.title && (
                      <div className={`admin-message ${notices.title.type}`} style={{ width: '100%', marginTop: '10px', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
                        {notices.title.message}
                      </div>
                    )}
                  </div>

                  <div className="admin-form-group">
                    <label>Category</label>
                    <select
                      required
                      value={categories.includes(form.category) ? form.category : (form.category ? "new" : "")}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "new") {
                          setForm({ ...form, category: "" });
                        } else {
                          setForm({ ...form, category: val });
                        }
                      }}
                      className="admin-select"
                      style={{ width: '100%', height: 'auto', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-surface)' }}
                    >
                      <option value="">Select Category...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="new">+ Add New Category...</option>
                    </select>
                    
                    {(!categories.includes(form.category) || !form.category) && (
                      <input
                        type="text"
                        required
                        placeholder="Enter New Category Name"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        style={{ marginTop: '10px', width: '100%' }}
                        className="admin-search"
                      />
                    )}
                  </div>


                  <div className="admin-form-group">
                    <label>Tagline</label>
                    <input 
                      value={form.tagline} 
                      onChange={(e) => setForm({...form, tagline: e.target.value})} 
                      placeholder="e.g. Ultra high-bandwidth serial transmission up to 100m"
                      className="admin-search"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Description Points</span>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-surface-2)', cursor: 'pointer', color: 'var(--admin-primary)', fontWeight: 600 }}
                        onClick={() => setForm({ ...form, descriptionText: form.descriptionText ? form.descriptionText + '\n' : ' ' })}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Point
                      </button>
                    </label>

                    {form.descriptionText === '' ? (
                      <div style={{ padding: '24px', background: 'rgba(7,0,143,0.02)', border: '1px dashed #07008F', borderRadius: '8px', textAlign: 'center', color: '#64748B', marginTop: '8px', fontSize: '13px' }}>
                        No description points added. Click "Add Point" to start.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {form.descriptionText.split('\n').map((point, index) => (
                          <div key={index} className="dyn-list-row">
                            <input
                              type="text"
                              autoFocus
                              value={point === ' ' ? '' : point}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  setForm({ ...form, descriptionText: form.descriptionText ? form.descriptionText + '\n' : ' ' });
                                }
                              }}
                              placeholder={`Point ${index + 1}`}
                              onChange={(e) => {
                                const lines = form.descriptionText.split('\n');
                                lines[index] = e.target.value;
                                setForm({ ...form, descriptionText: lines.join('\n') });
                              }}
                              className="dyn-list-input"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const lines = form.descriptionText.split('\n').filter((_, i) => i !== index);
                                setForm({ ...form, descriptionText: lines.join('\n') });
                              }}
                              className="dyn-list-del"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-form-group">
                    <label>SEO Title Tag</label>
                    <input 
                      value={form.title} 
                      onChange={(e) => setForm({...form, title: e.target.value})} 
                      placeholder="e.g. Active Optical Cable (AOC) | PDR World"
                      className="admin-search"
                      style={{ width: '100%' }}
                    />
                  </div>


                  <div className="admin-form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Key Features</span>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-surface-2)', cursor: 'pointer', color: 'var(--admin-primary)', fontWeight: 600 }}
                        onClick={() => setForm({ ...form, featuresText: form.featuresText ? form.featuresText + '\n' : ' ' })}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Feature
                      </button>
                    </label>

                    {form.featuresText === '' ? (
                      <div style={{ padding: '24px', background: 'rgba(7,0,143,0.02)', border: '1px dashed #07008F', borderRadius: '8px', textAlign: 'center', color: '#64748B', marginTop: '8px', fontSize: '13px' }}>
                        No features added. Click "Add Feature" to start.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {form.featuresText.split('\n').map((feature, index) => (
                          <div key={index} className="dyn-list-row">
                            <input
                              type="text"
                              autoFocus
                              value={feature === ' ' ? '' : feature}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  setForm({ ...form, featuresText: form.featuresText ? form.featuresText + '\n' : ' ' });
                                }
                              }}
                              placeholder={`Feature ${index + 1}`}
                              onChange={(e) => {
                                const lines = form.featuresText.split('\n');
                                lines[index] = e.target.value;
                                setForm({ ...form, featuresText: lines.join('\n') });
                              }}
                              className="dyn-list-input"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const lines = form.featuresText.split('\n').filter((_, i) => i !== index);
                                setForm({ ...form, featuresText: lines.join('\n') });
                              }}
                              className="dyn-list-del"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Applications</span>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-surface-2)', cursor: 'pointer', color: 'var(--admin-primary)', fontWeight: 600 }}
                        onClick={() => setForm({ ...form, applicationsText: form.applicationsText ? form.applicationsText + '\n' : ' ' })}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Application
                      </button>
                    </label>

                    {form.applicationsText === '' ? (
                      <div style={{ padding: '24px', background: 'rgba(7,0,143,0.02)', border: '1px dashed #07008F', borderRadius: '8px', textAlign: 'center', color: '#64748B', marginTop: '8px', fontSize: '13px' }}>
                        No applications added. Click "Add Application" to start.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {form.applicationsText.split('\n').map((app, index) => (
                          <div key={index} className="dyn-list-row">
                            <input
                              type="text"
                              autoFocus
                              value={app === ' ' ? '' : app}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  setForm({ ...form, applicationsText: form.applicationsText ? form.applicationsText + '\n' : ' ' });
                                }
                              }}
                              placeholder={`Application ${index + 1}`}
                              onChange={(e) => {
                                const lines = form.applicationsText.split('\n');
                                lines[index] = e.target.value;
                                setForm({ ...form, applicationsText: lines.join('\n') });
                              }}
                              className="dyn-list-input"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const lines = form.applicationsText.split('\n').filter((_, i) => i !== index);
                                setForm({ ...form, applicationsText: lines.join('\n') });
                              }}
                              className="dyn-list-del"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Technical Specifications</span>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-surface-2)', cursor: 'pointer', color: 'var(--admin-primary)', fontWeight: 600 }}
                        onClick={() => setForm({ ...form, specs: [...form.specs, { label: 'Cable Type', value: '' }] })}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add Specification
                      </button>
                    </label>

                    {form.specs.length === 0 ? (
                      <div style={{ padding: '24px', background: 'rgba(7,0,143,0.02)', border: '1px dashed #07008F', borderRadius: '8px', textAlign: 'center', color: '#64748B', marginTop: '8px', fontSize: '13px' }}>
                        No specifications added. Click "Add Specification" to build technical overview.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        {form.specs.map((spec, index) => {
                          const isCustom = !COMMON_SPEC_LABELS.includes(spec.label);
                          return (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', alignItems: 'start', width: '100%' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                                <select
                                  value={isCustom ? "custom" : spec.label}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const newSpecs = [...form.specs];
                                    if (val === "custom") {
                                      newSpecs[index] = { ...newSpecs[index], label: "" };
                                    } else {
                                      newSpecs[index] = { ...newSpecs[index], label: val };
                                    }
                                    setForm({ ...form, specs: newSpecs });
                                  }}
                                  className="dyn-list-input"
                                >
                                  {!COMMON_SPEC_LABELS.includes(spec.label) && spec.label !== "" && (
                                    <option value={spec.label}>{spec.label}</option>
                                  )}
                                  {COMMON_SPEC_LABELS.map((lbl) => (
                                    <option key={lbl} value={lbl}>{lbl}</option>
                                  ))}
                                  <option value="custom">+ Custom Label...</option>
                                </select>
                                
                                {isCustom && (
                                  <input
                                    type="text"
                                    required
                                    placeholder="Custom label name"
                                    value={spec.label}
                                    onChange={(e) => {
                                      const newSpecs = [...form.specs];
                                      newSpecs[index] = { ...newSpecs[index], label: e.target.value };
                                      setForm({ ...form, specs: newSpecs });
                                    }}
                                    className="dyn-list-input"
                                  />
                                )}
                              </div>

                              <input
                                type="text"
                                required
                                autoFocus
                                placeholder="Specification value (e.g. Multimode Fiber, 10G)"
                                value={spec.value}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    setForm({ ...form, specs: [...form.specs, { label: 'Cable Type', value: '' }] });
                                  }
                                }}
                                onChange={(e) => {
                                  const newSpecs = [...form.specs];
                                  newSpecs[index] = { ...newSpecs[index], value: e.target.value };
                                  setForm({ ...form, specs: newSpecs });
                                }}
                                className="dyn-list-input"
                              />

                              <button
                                type="button"
                                className="btn btn-outline"
                                style={{ 
                                  padding: '0',
                                  margin: '0',
                                  boxSizing: 'border-box',
                                  width: '38px',
                                  border: '1px solid #ef4444', 
                                  color: '#ef4444', 
                                  height: '38px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  flexShrink: 0
                                }}
                                onClick={() => {
                                  const newSpecs = form.specs.filter((_, i) => i !== index);
                                  setForm({ ...form, specs: newSpecs });
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="admin-form-group">
                    <label>Image Upload</label>
                    <div className="admin-image-upload-section" style={{ border: '2px dashed var(--admin-border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'var(--admin-surface-2)' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="admin-file-input"
                        style={{ display: 'none' }}
                        id="image-file-input"
                      />
                      <label htmlFor="image-file-input" style={{ cursor: 'pointer', padding: '10px 20px', background: 'var(--admin-primary)', color: '#FFFFFF', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                        Choose Product Image
                      </label>
                      {imagePreview && (
                        <div className="admin-image-preview" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <img src={imagePreview} alt="Preview" style={{ maxWidth: '240px', maxHeight: '180px', borderRadius: '8px', objectFit: 'contain', border: '1px solid var(--admin-border)' }} />
                          <button 
                            type="button" 
                            onClick={() => {
                              setImagePreview('');
                              setForm({...form, imageUrl: ''});
                              setNotices(prev => ({...prev, image: undefined}));
                            }}
                            style={{ 
                              background: '#ef4444', 
                              color: '#FFFFFF', 
                              border: 'none', 
                              padding: '8px 16px', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '13px', 
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              lineHeight: '1',
                              boxSizing: 'border-box'
                            }}
                          >
                            ✕ Remove Image
                          </button>
                        </div>
                      )}
                      {notices.image && (
                        <div className={`admin-message ${notices.image.type}`} style={{ width: '100%', marginTop: '10px', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
                          {notices.image.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Gallery Images (Up to 10)</label>
                    <div className="admin-image-upload-section" style={{ border: '2px dashed var(--admin-border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'var(--admin-surface-2)' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="admin-file-input"
                        style={{ display: 'none' }}
                        id="gallery-file-input"
                      />
                      <label htmlFor="gallery-file-input" style={{ cursor: 'pointer', padding: '10px 20px', background: 'var(--admin-primary)', color: '#FFFFFF', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                        Choose Additional Images
                      </label>
                      {form.galleryUrls && form.galleryUrls.length > 0 && (
                        <div className="admin-image-preview" style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', overflow: 'visible', padding: '10px' }}>
                          {form.galleryUrls.map((url, i) => (
                            <div key={i} style={{ position: 'relative', overflow: 'visible' }}>
                              <img src={url} alt={`Gallery ${i}`} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--admin-border)' }} />
                              <button 
                                type="button" 
                                onClick={() => { setForm(prev => ({...prev, galleryUrls: prev.galleryUrls.filter((_, index) => index !== i)})); setNotices(prev => ({...prev, gallery: undefined})); }}
                                style={{ 
                                  position: 'absolute', 
                                  top: '-8px', 
                                  right: '-8px', 
                                  background: '#ef4444', 
                                  color: '#FFFFFF', 
                                  border: '2px solid #fff', 
                                  borderRadius: '50%', 
                                  width: '24px', 
                                  height: '24px', 
                                  minWidth: '24px',
                                  minHeight: '24px',
                                  maxWidth: '24px',
                                  maxHeight: '24px',
                                  cursor: 'pointer', 
                                  fontSize: '12px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  padding: 0,
                                  margin: 0,
                                  lineHeight: '1',
                                  boxSizing: 'border-box',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                  zIndex: 2
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {notices.gallery && (
                        <div className={`admin-message ${notices.gallery.type}`} style={{ width: '100%', marginTop: '10px', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
                          {notices.gallery.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Datasheet PDF</label>
                    <div className="admin-image-upload-section" style={{ border: '2px dashed var(--admin-border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'var(--admin-surface-2)' }}>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="admin-file-input"
                        style={{ display: 'none' }}
                        id="pdf-file-input"
                      />
                      <label htmlFor="pdf-file-input" style={{ cursor: 'pointer', padding: '10px 20px', background: 'var(--admin-primary)', color: '#FFFFFF', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                        Choose Datasheet PDF
                      </label>
                      {form.datasheetUrl && (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(7,0,143,0.05)', borderRadius: '8px', border: '1px solid rgba(7,0,143,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E21D3C" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span style={{ fontSize: '13px', color: 'var(--admin-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
                              {form.datasheetUrl.startsWith('data:') ? 'Uploaded PDF (Base64 file)' : form.datasheetUrl}
                            </span>
                          </div>
                          <button 
                            type="button" 
                            style={{ margin: 0, background: '#ef4444', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', lineHeight: '1', boxSizing: 'border-box' }}
                            onClick={() => { setForm({...form, datasheetUrl: ''}); setNotices(prev => ({...prev, pdf: undefined})); }}
                          >
                            ✕ Remove PDF
                          </button>
                        </div>
                      )}
                      {notices.pdf && (
                        <div className={`admin-message ${notices.pdf.type}`} style={{ width: '100%', marginTop: '10px', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
                          {notices.pdf.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Catalog Status</label>
                    <select 
                      value={form.status} 
                      onChange={(e) => setForm({...form, status: e.target.value as AdminStatus})}
                      className="admin-select"
                      style={{ width: '100%', height: 'auto', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-surface)' }}
                    >
                      <option value="Active">Active (Visible in Storefront)</option>
                      <option value="Draft">Draft (Internal Only)</option>
                      <option value="Archived">Archived (Hidden)</option>
                    </select>
                  </div>

                  {notices.global && (
                    <div className={`admin-message ${notices.global.type}`} style={{ marginTop: '4px', borderRadius: '8px', padding: '14px 18px', textAlign: 'center' }}>
                      {notices.global.message}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                    <button type="submit" className="admin-btn-primary" style={{ flex: 1, padding: '14px', fontSize: '16px', borderRadius: '8px', fontWeight: 700 }}>
                      {slug ? 'Save Product Changes' : 'Publish Product'}
                    </button>
                    <button 
                      type="button" 
                      className="admin-btn-secondary" 
                      onClick={() => navigate('/admin', { state: { activeTab: 'products' } })}
                      style={{ flex: 1, padding: '14px', fontSize: '16px', borderRadius: '8px', fontWeight: 700 }}
                    >
                      Cancel & Return
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
