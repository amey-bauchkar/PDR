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
import { supabase } from '../lib/supabase';
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
  datasheetUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
  features?: string[];
  applications?: string[];
  specs?: { label: string; value: string }[];
  related?: { slug: string; name: string }[];
  heroIcon?: string;
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
  featuresText: string;
  applicationsText: string;
  specs: { label: string; value: string }[];
  datasheetUrl: string;
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
  status: 'Active',
  imageUrl: '',
  featuresText: '',
  applicationsText: '',
  specs: [],
  datasheetUrl: '',
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
  const [inquiries, setInquiries] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem('pdrworld-pending-contact-inquiries');
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    async function fetchFromSupabase() {
      if (!supabase) return;
      try {
        const { data: dbInquiries, error: inqError } = await supabase
          .from('contact_inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!inqError && dbInquiries) {
          const mappedInquiries = dbInquiries.map((inq: any) => ({
            firstName: inq.first_name,
            lastName: inq.last_name,
            email: inq.email,
            inquiryType: inq.inquiry_type,
            message: inq.message,
            createdAt: inq.created_at
          }));
          
          setInquiries(prev => {
            const localKeys = new Set(prev.map(i => i.email + i.message));
            const uniqueDb = mappedInquiries.filter((i: any) => !localKeys.has(i.email + i.message));
            return [...uniqueDb, ...prev]; // DB items first
          });
        }

        const { data: dbRfqs, error: rfqError } = await supabase
          .from('quote_requests')
          .select('*, quote_request_items(*)')
          .order('created_at', { ascending: false });

        if (!rfqError && dbRfqs) {
          const mappedRfqs = dbRfqs.map((rfq: any) => ({
            id: rfq.id,
            name: rfq.full_name,
            email: rfq.email,
            company: rfq.company,
            status: rfq.status,
            createdAt: rfq.created_at,
            items: rfq.quote_request_items ? rfq.quote_request_items.map((item: any) => `${item.quantity}x ${item.product_title} (${item.product_specs})`) : [],
            notes: rfq.notes
          }));

          setRfqs(prev => {
            const localIds = new Set(prev.map(r => r.id));
            const uniqueDb = mappedRfqs.filter((r: any) => !localIds.has(r.id));
            return [...uniqueDb, ...prev];
          });
        }
      } catch (err) {
        console.error('Failed to fetch from Supabase', err);
      }
    }

    fetchFromSupabase();
  }, []);

  useEffect(() => {
    const handleStorageUpdate = () => {
      const rawRfq = window.localStorage.getItem(STORAGE_KEYS.rfqs);
      if (rawRfq) {
        try { setRfqs(JSON.parse(rawRfq)); } catch {}
      }
      const rawInq = window.localStorage.getItem('pdrworld-pending-contact-inquiries');
      if (rawInq) {
        try { setInquiries(JSON.parse(rawInq)); } catch {}
      }    };

    window.addEventListener('local-storage-update', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('focus', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('local-storage-update', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('focus', handleStorageUpdate);
    };
  }, []);

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
  const [isExporting, setIsExporting] = useState(false);

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
  if (inquiries.length < 0) { console.log(setInquiries); }
  if (rfqNewCount < 0) { console.log(rfqNewCount); }

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
        id: Date.now() + Math.random(),
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

    const features = form.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const applications = form.applicationsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const specs = form.specs.filter((s) => s.label.trim() && s.value.trim());

    const existingProduct = products.find((p) => p.slug === editingSlug);

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
      features,
      applications,
      specs,
      related: existingProduct?.related || [],
      heroIcon: existingProduct?.heroIcon || `<svg width="120" height="120" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="14" y="14" width="20" height="20" rx="3"></rect><circle cx="24" cy="24" r="4"></circle></svg>`,
      datasheetUrl: form.datasheetUrl.trim(),
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
      featuresText: (product.features ?? []).join('\n'),
      applicationsText: (product.applications ?? []).join('\n'),
      specs: product.specs ?? [],
      datasheetUrl: product.datasheetUrl ?? '',
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

  const downloadExcel = async () => {
    setIsExporting(true);
    if (!supabase) {
      generateCSV(rfqs);
      setIsExporting(false);
      return;
    }

    try {
      const { data: dbRfqs, error } = await supabase
        .from('quote_requests')
        .select('*, quote_request_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (dbRfqs) {
        const mappedRfqs = dbRfqs.map((rfq: any) => ({
          id: rfq.id,
          name: rfq.full_name,
          email: rfq.email,
          company: rfq.company,
          status: rfq.status,
          createdAt: rfq.created_at,
          items: rfq.quote_request_items ? rfq.quote_request_items.map((item: any) => `${item.quantity}x ${item.product_title} (${item.product_specs})`) : [],
          notes: rfq.notes
        }));

        setRfqs(mappedRfqs);
        generateCSV(mappedRfqs);
        pushActivity('RFQs exported', `Successfully exported ${mappedRfqs.length} RFQs to CSV/Excel`, 'success', 'status_change');
      }
    } catch (err) {
      console.error('Failed to fetch latest quotes during export:', err);
      generateCSV(rfqs);
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (data: typeof rfqs) => {
    const headers = ['Client Name', 'Company', 'Email', 'Requested Items', 'Date', 'Status', 'Notes'];
    const rows = data.map(rfq => [
      rfq.name,
      rfq.company || '—',
      rfq.email,
      rfq.items.join('; '),
      new Date(rfq.createdAt).toLocaleString(),
      rfq.status,
      rfq.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PDR-World-RFQs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setNotice('Please select a valid PDF file.');
      setNoticeType('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setNotice('PDF size must be less than 10MB.');
      setNoticeType('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setForm({ ...form, datasheetUrl: dataUrl });
      setNotice('Datasheet PDF uploaded successfully!');
      setNoticeType('success');
    };
    reader.onerror = () => {
      setNotice('Failed to read PDF file.');
      setNoticeType('error');
    };
    reader.readAsDataURL(file);
  };

  if (!session) {
    return (
      <>
        <Seo title="Admin Login | PDR World" description="PDR World admin login." canonical="https://pdrworld.com/dashboard-admin" />
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
      <Seo title="Admin Dashboard | PDR World" description="PDR World admin dashboard." canonical="https://pdrworld.com/dashboard-admin" />

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
                  📋 RFQs
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
                          style={{ width: '100%' }}
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
                            style={{ marginTop: '8px' }}
                            className="admin-search"
                          />
                        )}
                      </div>

                      <div className="admin-form-group">
                        <label>Tagline</label>
                        <input value={form.tagline} onChange={(e) => setForm({...form, tagline: e.target.value})} />
                      </div>
                      <div className="admin-form-group">
                        <label>Description (one point per line)</label>
                        <textarea 
                          value={form.description} 
                          onChange={(e) => setForm({...form, description: e.target.value})} 
                          rows={4} 
                          placeholder="Bullet point 1&#10;Bullet point 2&#10;Bullet point 3"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>SEO Title</label>
                        <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="e.g. Active Optical Cable (AOC) | PDR World" />
                      </div>
                      <div className="admin-form-group">
                        <label>Key Features (one per line)</label>
                        <textarea value={form.featuresText} onChange={(e) => setForm({...form, featuresText: e.target.value})} rows={4} placeholder="Feature 1&#10;Feature 2" />
                      </div>
                      <div className="admin-form-group">
                        <label>Applications (one per line)</label>
                        <textarea value={form.applicationsText} onChange={(e) => setForm({...form, applicationsText: e.target.value})} rows={4} placeholder="Application 1&#10;Application 2" />
                      </div>
                      <div className="admin-form-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Technical Specifications</span>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => setForm({ ...form, specs: [...form.specs, { label: 'Cable Type', value: '' }] })}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add Specification
                          </button>
                        </label>

                        {form.specs.length === 0 ? (
                          <div style={{ padding: '16px', background: 'rgba(7,0,143,0.02)', border: '1px dashed #07008F', borderRadius: '8px', textAlign: 'center', color: '#64748B', marginTop: '8px' }}>
                            No specifications added. Click "Add Specification" to build technical overview.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            {form.specs.map((spec, index) => {
                              const isCustom = !COMMON_SPEC_LABELS.includes(spec.label);
                              return (
                                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', alignItems: 'start' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A', fontSize: '14px' }}
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
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A', fontSize: '14px' }}
                                      />
                                    )}
                                  </div>

                                  <input
                                    type="text"
                                    required
                                    placeholder="Specification value (e.g. Multimode Fiber, 10G)"
                                    value={spec.value}
                                    onChange={(e) => {
                                      const newSpecs = [...form.specs];
                                      newSpecs[index] = { ...newSpecs[index], value: e.target.value };
                                      setForm({ ...form, specs: newSpecs });
                                    }}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A', fontSize: '14px' }}
                                  />

                                  <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ 
                                      padding: '8px 12px', 
                                      border: '1px solid #ef4444', 
                                      color: '#ef4444', 
                                      height: '38px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '6px',
                                      cursor: 'pointer'
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
                        <label>Image</label>
                        <div className="admin-image-upload-section">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="admin-file-input"
                          />
                          {imagePreview && (
                            <div className="admin-image-preview" style={{ marginTop: '12px' }}>
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
                        <label>Datasheet PDF</label>
                        <div className="admin-image-upload-section">
                          <input 
                            type="file" 
                            accept="application/pdf"
                            onChange={handlePdfUpload}
                            className="admin-file-input"
                          />
                          {form.datasheetUrl && (
                            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(7,0,143,0.05)', borderRadius: '8px', border: '1px solid rgba(7,0,143,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E21D3C" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                  {form.datasheetUrl.startsWith('data:') ? 'Uploaded PDF (Base64 file)' : form.datasheetUrl}
                                </span>
                              </div>
                              <button 
                                type="button" 
                                className="admin-btn-remove-image"
                                style={{ margin: 0 }}
                                onClick={() => setForm({...form, datasheetUrl: ''})}
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
                <h2>Quotes & Inquiries</h2>

                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      📋 Product Quotes (RFQs)
                      <span className="admin-badge-count">{rfqs.length}</span>
                    </h3>
                    <button 
                      onClick={downloadExcel} 
                      disabled={isExporting}
                      className="admin-btn-primary"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 16px', 
                        fontSize: '14px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        border: 'none',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: '6px',
                        opacity: isExporting ? 0.7 : 1
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {isExporting ? 'Syncing & Exporting...' : 'Download Excel Sheet'}
                    </button>
                  </div>
                  <div className="admin-activity-table">
                    {rfqs.length === 0 ? (
                      <p className="admin-empty">No RFQs yet.</p>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Client Name</th>
                            <th>Company</th>
                            <th>Email</th>
                            <th>Requested Items</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rfqs.map((rfq) => (
                            <tr key={rfq.id}>
                              <td>
                                <strong>{rfq.name}</strong>
                                {rfq.notes && (
                                  <div style={{ fontSize: '0.85em', color: '#888', marginTop: 4 }}>
                                    💡 {rfq.notes}
                                  </div>
                                )}
                              </td>
                              <td>{rfq.company || '—'}</td>
                              <td><a href={`mailto:${rfq.email}`} style={{ color: 'var(--primary-color)' }}>{rfq.email}</a></td>
                              <td>
                                <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.9em' }}>
                                  {rfq.items.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                {new Date(rfq.createdAt).toLocaleDateString()}
                              </td>
                              <td>
                                <select
                                  value={rfq.status}
                                  onChange={(e) => handleStatusChange(rfq.id, e.target.value as RFQRequest['status'])}
                                  className={`admin-status-select ${rfq.status}`}
                                >
                                  <option value="new">New</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
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
                    <button
                      className="admin-btn-secondary danger"
                      onClick={handleLogout}
                      style={{ marginTop: 16 }}
                    >
                      Logout Session
                    </button>
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
