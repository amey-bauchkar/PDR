import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import Seo from '../components/Seo';
import seedProducts from '../data/products.json';
import type { AdminSession } from '../lib/adminAuth';
import {
  createSession,
  getStoredSession,
  storeSession,
  clearStoredSession,
  checkPermission,
  verifyCredentials,
} from '../lib/adminAuth';
import { getAdminProducts, saveProduct, deleteProduct } from '../lib/productSync';
import '../styles/admin-enhanced.css';

type AdminStatus = 'Active' | 'Draft' | 'Archived';

type AdminProduct = {
  slug: string;
  name: string;
  category: string;
  title?: string;
  description?: string;
  canonical?: string;
  tagline?: string;
  status: AdminStatus;
  imageUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
};

type ActivityItem = {
  id: number;
  title: string;
  detail: string;
  tone: 'success' | 'info' | 'warning' | 'error';
  time: string;
  userId?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'status_change';
};

type RFQRequest = {
  id: string;
  email: string;
  name: string;
  company: string;
  items: string[];
  status: 'new' | 'in_progress' | 'completed';
  createdAt: string;
  notes?: string;
};

type ProductFormState = {
  slug: string;
  name: string;
  category: string;
  title: string;
  description: string;
  canonical: string;
  tagline: string;
  status: AdminStatus;
  imageUrl: string;
};

const STORAGE_KEYS = {
  products: 'pdrworld-admin-products-v2',
  activity: 'pdrworld-admin-activity-v2',
  rfqs: 'pdrworld-admin-rfqs-v1',
};

const DEFAULT_FORM: ProductFormState = {
  slug: '',
  name: '',
  category: '',
  title: '',
  description: '',
  canonical: '',
  tagline: '',
  status: 'Draft',
  imageUrl: '',
};

const nowLabel = () =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());

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

export default function AdminNew() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@pdrworld.com');
  const [loginPassword, setLoginPassword] = useState('Admin@123');
  const [loginError, setLoginError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'rfqs' | 'activity' | 'settings'>('dashboard');

  const [products, setProducts] = useState<AdminProduct[]>(() => {
    if (typeof window === 'undefined') return asAdminProducts(seedProducts as typeof seedProducts);
    const adminProducts = getAdminProducts();
    return adminProducts.length > 0 ? adminProducts : asAdminProducts(seedProducts as typeof seedProducts);
  });

  const [rfqs, setRfqs] = useState<RFQRequest[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(STORAGE_KEYS.rfqs);
    return raw ? JSON.parse(raw) : [];
  });

  const [activity, setActivity] = useState<ActivityItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(STORAGE_KEYS.activity);
    return raw ? JSON.parse(raw) : [];
  });

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState<'All' | AdminStatus>('All');
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState<'success' | 'error' | 'info'>('success');
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const storedSession = getStoredSession();
    if (storedSession) {
      setSession(storedSession);
      pushActivity('Session restored', 'User logged back in.', 'info', 'login', storedSession.email);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.rfqs, JSON.stringify(rfqs));
  }, [rfqs]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activity));
  }, [activity]);

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
  const activeCount = products.filter((p) => p.status === 'Active').length;
  const draftCount = products.filter((p) => p.status === 'Draft').length;
  const rfqNewCount = rfqs.filter((r) => r.status === 'new').length;

  const filteredProducts = products.filter((product) => {
    const haystack = [product.slug, product.name, product.category, product.description, product.tagline, product.title].join(' ').toLowerCase();
    const matchesQuery = query.trim() ? haystack.includes(query.trim().toLowerCase()) : true;
    const matchesCategory = category === 'All' ? true : product.category === category;
    const matchesStatus = status === 'All' ? true : product.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  const pushActivity = (
    title: string,
    detail: string,
    tone: ActivityItem['tone'],
    action: ActivityItem['action'],
    userId?: string
  ) => {
    setActivity((current) => [
      {
        id: Date.now(),
        title,
        detail,
        tone,
        time: nowLabel(),
        userId: userId || session?.email,
        action,
      },
      ...current.slice(0, 49), // Keep last 50 items
    ]);
  };

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
      pushActivity('Failed login attempt', `Email: ${loginEmail}`, 'error', 'login', loginEmail);
      return;
    }

    const newSession = createSession(loginEmail, role);
    setSession(newSession);
    storeSession(newSession);
    setLoginEmail('');
    setLoginPassword('');
    pushActivity('User logged in', `Role: ${role}`, 'success', 'login', loginEmail);
  };

  const handleLogout = () => {
    clearStoredSession();
    pushActivity('User logged out', '', 'info', 'login', session?.email);
    setSession(null);
    setActiveTab('dashboard');
  };

  const resetForm = () => {
    setEditorMode('create');
    setEditingSlug(null);
    setForm(DEFAULT_FORM);
    setNotice('');
    setImagePreview('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) return;
    if (!checkPermission(session, 'manage_products')) {
      setNotice('You do not have permission to manage products.');
      setNoticeType('error');
      return;
    }

    const nextSlug = form.slug.trim() ? toSlug(form.slug) : toSlug(form.name);
    if (!nextSlug || !form.name.trim() || !form.category.trim()) {
      setNotice('Name, category, and slug are required.');
      setNoticeType('error');
      return;
    }

    const payload: AdminProduct = {
      slug: nextSlug,
      name: form.name.trim(),
      category: form.category.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      canonical: form.canonical.trim(),
      tagline: form.tagline.trim(),
      status: form.status,
      imageUrl: form.imageUrl.trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    };

    const duplicateSlug = products.some((p) => p.slug === payload.slug && p.slug !== editingSlug);
    if (duplicateSlug) {
      setNotice('Slug already exists.');
      setNoticeType('error');
      return;
    }

    if (editorMode === 'edit' && editingSlug) {
      setProducts((current) => current.map((p) => (p.slug === editingSlug ? payload : p)));
      saveProduct(payload);
      pushActivity('Product updated', `${payload.name}`, 'info', 'update');
      setNotice('Product updated successfully.');
    } else {
      setProducts((current) => [payload, ...current]);
      saveProduct(payload);
      pushActivity('Product created', `${payload.name}`, 'success', 'create');
      setNotice('Product added successfully.');
    }
    setNoticeType('success');
    resetForm();
  };

  const handleEdit = (product: AdminProduct) => {
    setEditorMode('edit');
    setEditingSlug(product.slug);
    setForm({
      slug: product.slug,
      name: product.name,
      category: product.category,
      title: product.title ?? '',
      description: product.description ?? '',
      canonical: product.canonical ?? '',
      tagline: product.tagline ?? '',
      status: product.status,
      imageUrl: product.imageUrl ?? '',
    });
    setImagePreview(product.imageUrl ?? '');
  };

  const handleDelete = (slug: string) => {
    if (!session || !checkPermission(session, 'delete_products')) {
      setNotice('Permission denied.');
      setNoticeType('error');
      return;
    }
    const target = products.find((p) => p.slug === slug);
    if (!target) return;
    setProducts((current) => current.filter((p) => p.slug !== slug));
    deleteProduct(slug);
    if (editingSlug === slug) resetForm();
    pushActivity('Product deleted', `${target.name}`, 'warning', 'delete');
  };

  const handleStatusChange = (rfqId: string, newStatus: RFQRequest['status']) => {
    if (!session || !checkPermission(session, 'manage_rfqs')) return;
    setRfqs((current) =>
      current.map((r) =>
        r.id === rfqId
          ? { ...r, status: newStatus }
          : r
      )
    );
    pushActivity('RFQ status updated', `ID: ${rfqId} → ${newStatus}`, 'info', 'status_change');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotice('Please select a valid image file.');
      setNoticeType('error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice('Image size must be less than 5MB.');
      setNoticeType('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setForm({ ...form, imageUrl: dataUrl });
      setNotice('Image uploaded successfully!');
      setNoticeType('success');
    };
    reader.onerror = () => {
      setNotice('Failed to read image file.');
      setNoticeType('error');
    };
    reader.readAsDataURL(file);
  };

  if (!session) {
    return (
      <>
        <Seo title="Admin Login | PDR World" description="PDR World admin login." canonical="https://pdrworld.com/admin" />
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
      <Seo title="Admin Dashboard | PDR World" description="PDR World admin dashboard." canonical="https://pdrworld.com/admin" />

      <div className={`admin-enhanced-shell ${darkMode ? 'dark' : ''}`}>
        <header className="admin-header">
          <div className="admin-header-left">
            <h1>Admin Dashboard</h1>
            <span className="admin-role-badge">{session.role.toUpperCase()}</span>
          </div>
          <div className="admin-header-right">
            <button className="admin-theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <span className="admin-user-info">{session.email}</span>
            <button className="admin-btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="admin-container">
          <aside className="admin-sidebar">
            <nav className="admin-nav">
              {checkPermission(session, 'view_dashboard') && (
                <button
                  className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  📊 Dashboard
                </button>
              )}
              {checkPermission(session, 'manage_products') && (
                <button
                  className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}
                >
                  📦 Products
                </button>
              )}
              {checkPermission(session, 'manage_rfqs') && (
                <button
                  className={`admin-nav-item ${activeTab === 'rfqs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rfqs')}
                >
                  📋 RFQs <span className="admin-badge-count">{rfqNewCount}</span>
                </button>
              )}
              {checkPermission(session, 'view_analytics') && (
                <button
                  className={`admin-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  📈 Activity
                </button>
              )}
              {checkPermission(session, 'manage_settings') && (
                <button
                  className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  ⚙️ Settings
                </button>
              )}
            </nav>
          </aside>

          <main className="admin-content">
            {activeTab === 'dashboard' && (
              <section>
                <h2>Dashboard Overview</h2>
                <div className="admin-metrics-grid">
                  <div className="admin-metric">
                    <strong>{products.length}</strong>
                    <span>Products</span>
                  </div>
                  <div className="admin-metric">
                    <strong>{activeCount}</strong>
                    <span>Active</span>
                  </div>
                  <div className="admin-metric">
                    <strong>{draftCount}</strong>
                    <span>Drafts</span>
                  </div>
                  <div className="admin-metric">
                    <strong>{rfqs.length}</strong>
                    <span>RFQs</span>
                  </div>
                </div>

                <div className="admin-section">
                  <h3>Recent Activity</h3>
                  <div className="admin-activity-feed">
                    {activity.slice(0, 8).map((item) => (
                      <div key={item.id} className={`admin-activity-item ${item.tone}`}>
                        <div className="admin-activity-content">
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
                        </div>
                        <time>{item.time}</time>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'products' && checkPermission(session, 'manage_products') && (
              <section>
                <div className="admin-section-header">
                  <h2>Product Management</h2>
                  <button className="admin-btn-primary" onClick={() => { setEditorMode('create'); setEditingSlug(null); setForm(DEFAULT_FORM); }}>
                    + New Product
                  </button>
                </div>

                <div className="admin-toolbar">
                  <input
                    type="search"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="admin-search"
                  />
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-select">
                    <option value="All">All categories</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={status} onChange={(e) => setStatus(e.target.value as 'All' | AdminStatus)} className="admin-select">
                    <option value="All">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="admin-grid">
                  <div className="admin-products-grouped">
                    {categories.length === 0 ? (
                      <p className="admin-empty">No products yet.</p>
                    ) : (
                      categories.map((cat) => {
                        const productsInCategory = filteredProducts.filter((p) => p.category === cat);
                        if (productsInCategory.length === 0) return null;
                        return (
                          <div key={cat} className="admin-category-group">
                            <h3 className="admin-category-heading">{cat}</h3>
                            <div className="admin-products-grid">
                              {productsInCategory.map((product) => (
                                <div key={product.slug} className="admin-product-card">
                                  {product.imageUrl && (
                                    <div className="admin-product-image">
                                      <img src={product.imageUrl} alt={product.name} />
                                    </div>
                                  )}
                                  <div className="admin-product-details">
                                    <h4>{product.name}</h4>
                                    <p className="admin-product-slug">{product.slug}</p>
                                    {product.tagline && <p className="admin-product-tagline">{product.tagline}</p>}
                                    <span className={`admin-status-badge ${product.status.toLowerCase()}`}>
                                      {product.status}
                                    </span>
                                  </div>
                                  <div className="admin-product-actions">
                                    <button className="admin-btn-sm" onClick={() => handleEdit(product)}>
                                      ✎ Edit
                                    </button>
                                    {checkPermission(session, 'delete_products') && (
                                      <button className="admin-btn-sm danger" onClick={() => handleDelete(product.slug)}>
                                        🗑 Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="admin-form-section">
                    <form onSubmit={handleSubmit}>
                      <h3>{editorMode === 'edit' ? 'Edit Product' : 'Add Product'}</h3>
                      <div className="admin-form-group">
                        <label>Name</label>
                        <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                      </div>
                      <div className="admin-form-group">
                        <label>Category</label>
                        <input required value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} />
                      </div>
                      <div className="admin-form-group">
                        <label>Slug</label>
                        <input value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} placeholder="auto-generated" />
                      </div>
                      <div className="admin-form-group">
                        <label>Tagline</label>
                        <input value={form.tagline} onChange={(e) => setForm({...form, tagline: e.target.value})} />
                      </div>
                      <div className="admin-form-group">
                        <label>Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} />
                      </div>
                      <div className="admin-form-group">
                        <label>Image</label>
                        <div className="admin-image-upload-section">
                          <div className="admin-image-upload-options">
                            <div className="admin-upload-option">
                              <label htmlFor="image-url" className="admin-upload-label">From URL</label>
                              <input 
                                id="image-url"
                                value={form.imageUrl && !form.imageUrl.startsWith('data:') ? form.imageUrl : ''} 
                                onChange={(e) => {
                                  setForm({...form, imageUrl: e.target.value});
                                  if (!e.target.value.startsWith('data:')) setImagePreview(e.target.value);
                                }} 
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div className="admin-upload-option">
                              <label htmlFor="image-upload" className="admin-upload-label">Or Upload from PC</label>
                              <input 
                                id="image-upload"
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="admin-file-input"
                              />
                            </div>
                          </div>
                          {imagePreview && (
                            <div className="admin-image-preview">
                              <img src={imagePreview} alt="Preview" />
                              <button 
                                type="button" 
                                className="admin-btn-remove-image"
                                onClick={() => {
                                  setImagePreview('');
                                  setForm({...form, imageUrl: ''});
                                }}
                              >
                                ✕ Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <label>Status</label>
                        <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value as AdminStatus})}>
                          <option value="Active">Active</option>
                          <option value="Draft">Draft</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                      {notice && <div className={`admin-message ${noticeType}`}>{notice}</div>}
                      <button type="submit" className="admin-btn-primary admin-btn-full">
                        {editorMode === 'edit' ? 'Save Changes' : 'Add Product'}
                      </button>
                      {editorMode === 'edit' && <button type="button" className="admin-btn-secondary admin-btn-full" onClick={resetForm}>Cancel</button>}
                    </form>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'rfqs' && checkPermission(session, 'manage_rfqs') && (
              <section>
                <h2>RFQ Management</h2>
                <div className="admin-rfq-list">
                  {rfqs.length === 0 ? (
                    <p className="admin-empty">No RFQs yet.</p>
                  ) : (
                    rfqs.map((rfq) => (
                      <div key={rfq.id} className="admin-rfq-card">
                        <div className="admin-rfq-header">
                          <h4>{rfq.name}</h4>
                          <select
                            value={rfq.status}
                            onChange={(e) => handleStatusChange(rfq.id, e.target.value as RFQRequest['status'])}
                            className={`admin-status-select ${rfq.status}`}
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        <p><strong>Email:</strong> {rfq.email}</p>
                        <p><strong>Company:</strong> {rfq.company}</p>
                        <p><strong>Items:</strong> {rfq.items.join(', ')}</p>
                        <p><strong>Date:</strong> {rfq.createdAt}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeTab === 'activity' && checkPermission(session, 'view_analytics') && (
              <section>
                <h2>Activity Log</h2>
                <div className="admin-activity-table">
                  {activity.length === 0 ? (
                    <p className="admin-empty">No activity yet.</p>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Action</th>
                          <th>Detail</th>
                          <th>User</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activity.map((item) => (
                          <tr key={item.id}>
                            <td><span className={`admin-action-badge ${item.tone}`}>{item.title}</span></td>
                            <td>{item.detail}</td>
                            <td>{item.userId || 'system'}</td>
                            <td>{item.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'settings' && checkPermission(session, 'manage_settings') && (
              <section>
                <h2>Settings</h2>
                <div className="admin-settings">
                  <div className="admin-setting-group">
                    <h3>Session</h3>
                    <p>Current User: {session.email}</p>
                    <p>Role: {session.role.toUpperCase()}</p>
                    <p>Session ID: {session.id.substring(0, 20)}...</p>
                  </div>
                  <div className="admin-setting-group">
                    <h3>Preferences</h3>
                    <label>
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                      />
                      Dark Mode
                    </label>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
