import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
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
import { resolveCanonicalProductImage } from '../lib/imageResolution';
import { uploadProductDatasheet } from '../lib/datasheetUpload';
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
  descriptionText: string;
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
  descriptionText: '',
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
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('admin_dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('admin_dark_mode', darkMode.toString());
  }, [darkMode]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'rfqs' | 'activity' | 'settings'>('dashboard');

  const [products, setProducts] = useState<AdminProduct[]>(() => {
    return getAdminProducts();
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
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
    async function fetchInquiries() {
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
      } catch (err) {
        console.error('Failed to fetch inquiries from Supabase', err);
      }
    }

    async function fetchRfqs() {
      try {
        const rfqRes = await fetch('/api/rfq/list');
        if (rfqRes.ok) {
          const { data } = await rfqRes.json();
          if (data && Array.isArray(data)) {
            // Overwrite with API data so deleted rows in Google Sheets are actually removed
            setRfqs(data);
          }
        }
      } catch (apiErr) {
        console.error('Failed to fetch RFQs from API', apiErr);
      }
    }

    fetchInquiries();
    fetchRfqs();
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
      }    
    };

    const handleProductUpdate = () => {
      const updatedProducts = getAdminProducts();
      if (updatedProducts && updatedProducts.length > 0) {
        setProducts(updatedProducts);
      }
    };

    window.addEventListener('local-storage-update', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('focus', handleStorageUpdate);
    window.addEventListener('pdrworld-product-update', handleProductUpdate);
    
    return () => {
      window.removeEventListener('local-storage-update', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('focus', handleStorageUpdate);
      window.removeEventListener('pdrworld-product-update', handleProductUpdate);
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
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
  }, [location]);
  
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);
  const [notices, setNotices] = useState<{
    global?: { message: string; type: 'success' | 'error' | 'info' };
    title?: { message: string; type: 'success' | 'error' | 'info' };
    image?: { message: string; type: 'success' | 'error' | 'info' };
    gallery?: { message: string; type: 'success' | 'error' | 'info' };
    pdf?: { message: string; type: 'success' | 'error' | 'info' };
  }>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const googleSheetUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL || (import.meta.env.VITE_GOOGLE_SHEETS_ID ? `https://docs.google.com/spreadsheets/d/${import.meta.env.VITE_GOOGLE_SHEETS_ID}/edit` : '');

  useEffect(() => {
    const storedSession = getStoredSession();
    if (storedSession) {
      setSession(storedSession);
      pushActivity('Session restored', 'User logged back in.', 'info', 'login', storedSession.email);
    }
  }, []);

  // Removed local storage sync for products to prevent overwriting IDB data with stale state.

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.rfqs, JSON.stringify(rfqs));
  }, [rfqs]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activity));
  }, [activity]);

  const getMainCategory = (cat: string) => (cat || '').split(' > ')[0].trim();
  const categories = Array.from(new Set(products.map((p) => getMainCategory(p.category)).filter(Boolean))).sort();
  const activeCount = products.filter((p) => p.status === 'Active').length;
  const draftCount = products.filter((p) => p.status === 'Draft').length;
  const rfqNewCount = rfqs.filter((r) => r.status === 'new').length;
  if (inquiries.length < 0) { console.log(setInquiries); }
  if (rfqNewCount < 0) { console.log(rfqNewCount); }

  const filteredProducts = products.filter((product) => {
    const haystack = [product.slug, product.name, product.category, product.description, product.tagline, product.title].join(' ').toLowerCase();
    const matchesQuery = query.trim() ? haystack.includes(query.trim().toLowerCase()) : true;
    const matchesCategory = category === 'All' ? true : getMainCategory(product.category) === category;
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
    setNotices({});
    setImagePreview('');
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
      setNotices(prev => ({ ...prev, title: { message: 'Name, category, and slug are required.', type: 'error' } }));
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
      description: form.descriptionText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .join('. '),
      canonical: form.canonical.trim(),
      tagline: form.tagline.trim(),
      status: form.status,
      imageUrl: form.imageUrl.trim(),
      features,
      applications,
      specs,
      tags: existingProduct?.tags || [],
      related: existingProduct?.related || [],
      heroIcon: existingProduct?.heroIcon || `<svg width="120" height="120" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="14" y="14" width="20" height="20" rx="3"></rect><circle cx="24" cy="24" r="4"></circle></svg>`,
      datasheetUrl: form.datasheetUrl.trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    };

    const duplicateSlug = products.some((p) => p.slug === payload.slug && p.slug !== editingSlug);
    if (duplicateSlug) {
      setNotices(prev => ({ ...prev, title: { message: 'Title of Product already exists. Please choose a different name.', type: 'error' } }));
      return;
    }

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
      descriptionText: product.description
        ? product.description.split('. ').join('\n')
        : '',
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

  const handleDelete = async (slug: string) => {
    if (!session || !checkPermission(session, 'delete_products')) {
      setNotices(prev => ({ ...prev, global: { message: 'Permission denied.', type: 'error' } }));
      return;
    }
    const target = products.find((p) => p.slug === slug);
    if (!target) return;
    try {
      await deleteProduct(slug);
      setProducts((current) => current.filter((p) => p.slug !== slug));
      if (editingSlug === slug) resetForm();
      pushActivity('Product deleted', `${target.name}`, 'warning', 'delete');
    } catch (err) {
      console.error(err);
      setNotices(prev => ({
        ...prev,
        global: { message: err instanceof Error ? err.message : 'Failed to delete product.', type: 'error' },
      }));
    }
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

  const openGoogleSheet = () => {
    if (!googleSheetUrl) {
      setNotices(prev => ({ ...prev, global: { message: 'Set VITE_GOOGLE_SHEETS_URL to open the live RFQ sheet.', type: 'info' } }));
      return;
    }

    window.open(googleSheetUrl, '_blank', 'noopener,noreferrer');
    pushActivity('Google Sheet opened', 'Opened the live RFQ sheet in a new tab.', 'info', 'status_change');
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

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setNotices(prev => ({ ...prev, pdf: { message: 'Please select a valid PDF file.', type: 'error' } }));
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setNotices(prev => ({ ...prev, pdf: { message: 'PDF size must be less than 25MB.', type: 'error' } }));
      return;
    }

    const uploadSlug = toSlug(form.slug || form.name || file.name.replace(/\.pdf$/i, 'datasheet'));
    if (!uploadSlug) {
      setNotices(prev => ({ ...prev, pdf: { message: 'Add a product name before uploading the datasheet.', type: 'error' } }));
      return;
    }

    setNotices(prev => ({ ...prev, pdf: { message: 'Uploading datasheet...', type: 'info' } }));
    try {
      const url = await uploadProductDatasheet(file, uploadSlug);
      setForm(prev => ({ ...prev, datasheetUrl: url }));
      setNotices(prev => ({ ...prev, pdf: { message: 'Datasheet PDF uploaded successfully!', type: 'success' } }));
    } catch (err) {
      setNotices(prev => ({
        ...prev,
        pdf: { message: err instanceof Error ? err.message : 'Failed to upload PDF file.', type: 'error' },
      }));
    } finally {
      event.target.value = '';
    }
  };

  if (!session) {
    return (
      <>
        <Seo title="Admin Login | PDR World" description="PDR World admin login." canonical="https://pdr-sable.vercel.app/dashboard-admin" />
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
      <Seo title="Admin Dashboard | PDR World" description="PDR World admin dashboard." canonical="https://pdr-sable.vercel.app/dashboard-admin" />

      <div className={`admin-enhanced-shell ${darkMode ? 'dark' : ''}`}>
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="admin-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1>Admin Dashboard</h1>
            <span className="admin-role-badge">{session.role.toUpperCase()}</span>
          </div>
          <div className="admin-header-right">
            <div className="admin-desktop-actions">
              <button className="admin-theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
                {darkMode ? '☀️' : '🌙'}
              </button>
              <span className="admin-user-info">{session.email}</span>
              <button className="admin-btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
            <div className="admin-mobile-actions">
              <button 
                className="admin-settings-dots" 
                onClick={() => setIsMobileSettingsOpen(!isMobileSettingsOpen)}
                title="Open settings menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="2"></circle>
                  <circle cx="12" cy="5" r="2"></circle>
                  <circle cx="12" cy="19" r="2"></circle>
                </svg>
              </button>
              {isMobileSettingsOpen && (
                <div className="admin-mobile-dropdown">
                  <div className="admin-dropdown-item admin-user-info-mobile">
                    {session.email}
                  </div>
                  <button 
                    className="admin-dropdown-item toggle-theme-item" 
                    onClick={() => {
                      setDarkMode(!darkMode);
                      setIsMobileSettingsOpen(false);
                    }}
                  >
                    Dark Mode
                    <span>{darkMode ? '☀️' : '🌙'}</span>
                  </button>
                  <button 
                    className="admin-dropdown-item" 
                    onClick={() => {
                      handleLogout();
                      setIsMobileSettingsOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="admin-container">
          <div className={`admin-mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
            <nav className="admin-nav">
              {checkPermission(session, 'view_dashboard') && (
                <button
                  className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  Dashboard
                </button>
              )}
              {checkPermission(session, 'manage_products') && (
                <button
                  className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  Products
                </button>
              )}
              {checkPermission(session, 'manage_rfqs') && (
                <button
                  className={`admin-nav-item ${activeTab === 'rfqs' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('rfqs'); setIsMobileMenuOpen(false); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  RFQs
                </button>
              )}

              {checkPermission(session, 'view_analytics') && (
                <button
                  className={`admin-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('activity'); setIsMobileMenuOpen(false); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
                  Activity
                </button>
              )}
              {checkPermission(session, 'manage_settings') && (
                <button
                  className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  Settings
                </button>
              )}
            </nav>
          </aside>

          <main className="admin-main">
            {activeTab === 'dashboard' && (
              <section>
                <h2 className="admin-page-title">Dashboard Overview</h2>
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

                <div className="admin-summary-row">
                  <div className="admin-summary-card">
                    <div className="admin-summary-icon admin-summary-icon--blue">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    </div>
                    <div>
                      <p className="admin-summary-label">Total Products</p>
                      <p className="admin-summary-value">{products.length} items in catalogue</p>
                    </div>
                  </div>
                  <div className="admin-summary-card">
                    <div className="admin-summary-icon admin-summary-icon--green">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                    </div>
                    <div>
                      <p className="admin-summary-label">Active Listings</p>
                      <p className="admin-summary-value">{activeCount} products published</p>
                    </div>
                  </div>
                  <div className="admin-summary-card">
                    <div className="admin-summary-icon admin-summary-icon--amber">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                    </div>
                    <div>
                      <p className="admin-summary-label">Draft Products</p>
                      <p className="admin-summary-value">{draftCount} pending review</p>
                    </div>
                  </div>
                  <div className="admin-summary-card">
                    <div className="admin-summary-icon admin-summary-icon--purple">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/></svg>
                    </div>
                    <div>
                      <p className="admin-summary-label">Open RFQs</p>
                      <p className="admin-summary-value">{rfqs.length} quote requests</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'products' && checkPermission(session, 'manage_products') && (
              <section>
                <div className="admin-section-header">
                  <h2>Product Management</h2>
                  <button 
                    className="admin-btn-primary" 
                    onClick={() => navigate('/admin/products/new')}
                  >
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

                <div style={{ width: '100%' }}>
                  <div className="admin-products-grouped">
                    {categories.length === 0 ? (
                      <p className="admin-empty">No products yet.</p>
                    ) : (
                      categories.map((cat) => {
                        const productsInCategory = filteredProducts.filter((p) => getMainCategory(p.category) === cat);
                        if (productsInCategory.length === 0) return null;
                        return (
                          <div key={cat} className="admin-category-group">
                            <h3 className="admin-category-heading">{cat}</h3>
                            <div className="admin-products-grid">
                              {productsInCategory.map((product) => (
                                <div key={product.slug} className="admin-product-card">
                                  {(() => {
                                    const displayImg = resolveCanonicalProductImage(product.slug, product.imageUrl, product.category);
                                    return displayImg ? (
                                      <div className="admin-product-image">
                                        <img src={displayImg} alt={product.name} />
                                      </div>
                                    ) : null;
                                  })()}
                                  <div className="admin-product-details">
                                    <h4>{product.name}</h4>
                                    <p className="admin-product-slug">{product.slug}</p>
                                    {product.tagline && <p className="admin-product-tagline">{product.tagline}</p>}
                                    <span className={`admin-status-badge ${product.status.toLowerCase()}`}>
                                      {product.status}
                                    </span>
                                  </div>
                                  <div className="admin-product-actions">
                                    <button className="admin-btn-sm" onClick={() => navigate(`/admin/products/edit/${product.slug}`)}>
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
                        onClick={openGoogleSheet} 
                        className="admin-btn-primary"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          padding: '8px 16px', 
                          fontSize: '14px',
                          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                          border: 'none',
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer',
                          borderRadius: '8px',
                          height: '42px'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 3h7v7" />
                          <path d="M10 14 21 3" />
                          <path d="M21 14v7h-7" />
                          <path d="M3 10V3h7" />
                        </svg>
                        Open Live Google Sheet
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
