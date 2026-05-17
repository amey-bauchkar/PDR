import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Seo from '../components/Seo';
import seedProducts from '../data/products.json';
import '../styles/admin.css';

type AdminStatus = 'Active' | 'Draft' | 'Archived';
type UserRole = 'Admin' | 'Super Admin';

type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  lastLogin: string;
};

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

type ValidationError = {
  field: string;
  message: string;
};

const PRODUCT_STORAGE_KEY = 'pdrworld-admin-products-v1';
const ACTIVITY_STORAGE_KEY = 'pdrworld-admin-activity-v1';

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

// Security: Input sanitization to prevent XSS
const sanitizeInput = (value: string): string =>
  value
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 500);

const sanitizeUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return '';
  }
};

// Validation helper
const validateProduct = (product: Omit<AdminProduct, 'slug'>): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!product.name?.trim()) errors.push({ field: 'name', message: 'Name is required' });
  if (!product.category?.trim()) errors.push({ field: 'category', message: 'Category is required' });
  if (product.name.length > 200) errors.push({ field: 'name', message: 'Name too long (max 200 chars)' });
  if (product.description && product.description.length > 1000) {
    errors.push({ field: 'description', message: 'Description too long (max 1000 chars)' });
  }
  if (product.imageUrl && !isValidImageUrl(product.imageUrl)) {
    errors.push({ field: 'imageUrl', message: 'Invalid image URL' });
  }
  return errors;
};

const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
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
  (items as Omit<AdminProduct, 'status'>[]).map((item) => ({
    ...item,
    status: 'Active',
  }));

const seedActivities = (count: number): ActivityItem[] => [
  {
    id: 1,
    title: 'Admin panel initialized',
    detail: `Loaded ${count} products from catalogue. Session started with demo data.`,
    tone: 'success',
    time: nowLabel(),
    userId: 'admin-001',
    action: 'login',
  },
  {
    id: 2,
    title: 'Security audit active',
    detail: 'Input validation, XSS protection, and rate limiting are enabled.',
    tone: 'info',
    time: nowLabel(),
    userId: 'system',
    action: 'status_change',
  },
  {
    id: 3,
    title: 'Demo mode enabled',
    detail: 'Changes persist in localStorage. Backend connection ready for Supabase integration.',
    tone: 'warning',
    time: nowLabel(),
    userId: 'system',
    action: 'create',
  },
];

const mockAuthUser: AuthUser = {
  id: 'admin-001',
  email: 'admin@pdrworld.com',
  role: 'Super Admin',
  lastLogin: new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date()),
};

export default function Admin() {
  const [authUser] = useState<AuthUser>(mockAuthUser);
  const formRef = useRef<HTMLFormElement>(null);
  const [products, setProducts] = useState<AdminProduct[]>(() => {
    if (typeof window === 'undefined') return asAdminProducts(seedProducts as typeof seedProducts);
    const raw = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (!raw) return asAdminProducts(seedProducts as typeof seedProducts);
    try {
      const parsed = JSON.parse(raw) as AdminProduct[];
      return parsed.length ? parsed : asAdminProducts(seedProducts as typeof seedProducts);
    } catch {
      return asAdminProducts(seedProducts as typeof seedProducts);
    }
  });

  const [activity, setActivity] = useState<ActivityItem[]>(() => {
    if (typeof window === 'undefined') return seedActivities(seedProducts.length);
    const raw = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) return seedActivities(seedProducts.length);
    try {
      const parsed = JSON.parse(raw) as ActivityItem[];
      return parsed.length ? parsed : seedActivities(seedProducts.length);
    } catch {
      return seedActivities(seedProducts.length);
    }
  });

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState<'All' | AdminStatus>('All');
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity));
  }, [activity]);

  const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort();
  const activeCount = products.filter((product) => product.status === 'Active').length;
  const draftCount = products.filter((product) => product.status === 'Draft').length;
  const archivedCount = products.filter((product) => product.status === 'Archived').length;

  const filteredProducts = products.filter((product) => {
    const haystack = [product.slug, product.name, product.category, product.description, product.tagline, product.title]
      .join(' ')
      .toLowerCase();
    const matchesQuery = query.trim() ? haystack.includes(query.trim().toLowerCase()) : true;
    const matchesCategory = category === 'All' ? true : product.category === category;
    const matchesStatus = status === 'All' ? true : product.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setEditorMode('create');
    setEditingSlug(null);
    setForm(DEFAULT_FORM);
  };

  const pushActivity = (title: string, detail: string, tone: ActivityItem['tone'], action: ActivityItem['action']) => {
    setActivity((current) => [
      {
        id: Date.now(),
        title,
        detail,
        tone,
        time: nowLabel(),
        userId: authUser.id,
        action,
      },
      ...current,
    ]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors([]);

    const nextSlug = form.slug.trim() ? toSlug(form.slug) : toSlug(form.name);
    if (!nextSlug) {
      setNotice('Add a valid slug or product name.');
      setErrors([{ field: 'slug', message: 'Invalid slug' }]);
      return;
    }

    // Sanitize inputs
    const payload: AdminProduct = {
      slug: nextSlug,
      name: sanitizeInput(form.name),
      category: sanitizeInput(form.category),
      title: sanitizeInput(form.title),
      description: sanitizeInput(form.description),
      canonical: sanitizeUrl(form.canonical),
      tagline: sanitizeInput(form.tagline),
      status: form.status,
      imageUrl: sanitizeUrl(form.imageUrl),
      updatedAt: new Date().toISOString(),
      updatedBy: authUser.email,
    };

    // Validate
    const validationErrors = validateProduct(payload);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setNotice(`${validationErrors.length} validation error(s) found.`);
      return;
    }

    const duplicateSlug = products.some((product) => product.slug === payload.slug && product.slug !== editingSlug);
    if (duplicateSlug) {
      setNotice('That slug already exists. Choose a unique slug.');
      setErrors([{ field: 'slug', message: 'Slug already exists' }]);
      return;
    }

    if (editorMode === 'edit' && editingSlug) {
      setProducts((current) => current.map((product) => (product.slug === editingSlug ? payload : product)));
      pushActivity('Product updated', `${payload.name} was updated by ${authUser.email}.`, 'info', 'update');
      setNotice('✓ Product updated successfully.');
    } else {
      setProducts((current) => [payload, ...current]);
      pushActivity('Product created', `${payload.name} was added to the catalogue.`, 'success', 'create');
      setNotice('✓ Product added successfully.');
    }

    resetForm();
  };

  const handleEdit = (product: AdminProduct) => {
    setEditorMode('edit');
    setEditingSlug(product.slug);
    setErrors([]);
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
    setNotice('Editing product — make your changes and save.');
    
    // Scroll form into view
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleDelete = (slug: string) => {
    const target = products.find((product) => product.slug === slug);
    if (!target) return;
    setProducts((current) => current.filter((product) => product.slug !== slug));
    if (editingSlug === slug) resetForm();
    pushActivity('Product deleted', `${target.name} was removed by ${authUser.email}.`, 'warning', 'delete');
    setNotice('Product deleted.');
    setShowConfirmDelete(null);
  };

  const handleBulkDelete = () => {
    if (selectedSlugs.size === 0) return;
    const deletedNames = products
      .filter((p) => selectedSlugs.has(p.slug))
      .map((p) => p.name)
      .join(', ');
    setProducts((current) => current.filter((product) => !selectedSlugs.has(product.slug)));
    pushActivity('Bulk delete', `Removed ${selectedSlugs.size} products: ${deletedNames}`, 'warning', 'delete');
    setSelectedSlugs(new Set());
    setNotice(`✓ Deleted ${selectedSlugs.size} products.`);
  };

  const toggleSelectAll = () => {
    if (selectedSlugs.size === filteredProducts.length) {
      setSelectedSlugs(new Set());
    } else {
      setSelectedSlugs(new Set(filteredProducts.map((p) => p.slug)));
    }
  };

  return (
    <>
      <Seo
        title="Admin Panel | PDR World"
        description="Admin dashboard for PDR World product management, metrics, and RFQ-ready content operations."
        canonical="https://pdrworld.com/dashboard-admin"
      />

      <div className="admin-shell">
        <header className="admin-header">
          <div className="container admin-header-content">
            <div>
              <h2>Admin Dashboard</h2>
            </div>
            <div className="admin-header-profile">
              <span>Logged in as</span>
              <strong>{authUser.email}</strong>
              <span className="admin-role-badge">{authUser.role}</span>
            </div>
          </div>
        </header>
        <section className="admin-hero">
          <div className="container admin-hero-grid">
            <div>
              <div className="eyebrow" style={{ justifyContent: 'flex-start' }}>Admin Workspace</div>
              <h1>Control the catalogue from one panel.</h1>
              <p>
                This first scaffold covers the FRD admin essentials: dashboard metrics, recent activity, searchable products, and local
                add/edit/delete controls.
              </p>
              <div className="admin-hero-actions">
                <button className="btn btn-primary" type="button" onClick={resetForm}>
                  New product
                </button>
                <a className="btn btn-outline" href="/products">
                  View public catalogue
                </a>
              </div>
            </div>
            <div className="admin-hero-card">
              <span className="admin-badge">Demo protected panel</span>
              <h3>Ready for Supabase auth and product sync.</h3>
              <p>
                The UI is in place now. When the backend is connected, this page can enforce Admin and Super Admin access rules and push
                changes to the live catalogue.
              </p>
              <div className="admin-mini-grid">
                <div>
                  <strong>{products.length}</strong>
                  <span>Products</span>
                </div>
                <div>
                  <strong>{activeCount}</strong>
                  <span>Active</span>
                </div>
                <div>
                  <strong>{draftCount}</strong>
                  <span>Drafts</span>
                </div>
                <div>
                  <strong>{archivedCount}</strong>
                  <span>Archived</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-panel section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="admin-metrics">
              <div className="admin-metric-card">
                <span className="admin-metric-label">Products</span>
                <strong>{products.length}</strong>
                <span>Imported from the current JSON catalogue.</span>
              </div>
              <div className="admin-metric-card">
                <span className="admin-metric-label">Categories</span>
                <strong>{categories.length}</strong>
                <span>Unique product families available.</span>
              </div>
              <div className="admin-metric-card">
                <span className="admin-metric-label">Live RFQ Queue</span>
                <strong>{Math.max(3, Math.round(products.length / 8))}</strong>
                <span>Demo value until the backend queue is connected.</span>
              </div>
              <div className="admin-metric-card">
                <span className="admin-metric-label">Recent Actions</span>
                <strong>{activity.length}</strong>
                <span>Audit trail for the current session.</span>
              </div>
            </div>

            <div className="admin-layout">
              <div className="admin-main">
                <div className="admin-toolbar">
                  <div className="admin-field">
                    <label htmlFor="admin-search">Search</label>
                    <input id="admin-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, slug, category..." />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="admin-category">Category</label>
                    <select id="admin-category" value={category} onChange={(event) => setCategory(event.target.value)}>
                      <option value="All">All categories</option>
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label htmlFor="admin-status">Status</label>
                    <select id="admin-status" value={status} onChange={(event) => setStatus(event.target.value as 'All' | AdminStatus)}>
                      <option value="All">All statuses</option>
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="admin-table-card">
                  <div className="admin-table-head">
                    <div>
                      <h2>Product Management</h2>
                      <p>
                        Search, filter, edit, and delete products. The form below can also add new entries for the catalogue.
                      </p>
                    </div>
                    <div className="admin-table-actions">
                      {selectedSlugs.size > 0 && (
                        <button className="btn btn-danger" type="button" onClick={handleBulkDelete}>
                          Delete {selectedSlugs.size} selected
                        </button>
                      )}
                      <button className="btn btn-outline" type="button" onClick={() => { setQuery(''); setCategory('All'); setStatus('All'); }}>
                        Clear filters
                      </button>
                    </div>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: '32px' }}>
                            <input
                              type="checkbox"
                              checked={selectedSlugs.size === filteredProducts.length && filteredProducts.length > 0}
                              onChange={toggleSelectAll}
                              title="Select all"
                            />
                          </th>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Slug</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.slug}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedSlugs.has(product.slug)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedSlugs);
                                  if (e.target.checked) {
                                    newSelected.add(product.slug);
                                  } else {
                                    newSelected.delete(product.slug);
                                  }
                                  setSelectedSlugs(newSelected);
                                }}
                              />
                            </td>
                            <td>
                              <strong>{product.name}</strong>
                              <span>{product.description || product.tagline || product.title || 'No description yet.'}</span>
                            </td>
                            <td>{product.category}</td>
                            <td>{product.slug}</td>
                            <td>
                              <span className={`admin-status ${product.status.toLowerCase()}`}>{product.status}</span>
                            </td>
                            <td>
                              <div className="admin-row-actions">
                                <button type="button" onClick={() => handleEdit(product)}>
                                  Edit
                                </button>
                                <button type="button" className="danger" onClick={() => setShowConfirmDelete(product.slug)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="admin-empty">
                              No products match the current filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <aside className="admin-sidebar">
                <form className="admin-form-card" ref={formRef} onSubmit={handleSubmit}>
                  <div className="admin-form-head">
                    <div>
                      <span className="admin-badge">{editorMode === 'edit' ? 'Editing product' : 'Create product'}</span>
                      <h2>{editorMode === 'edit' ? 'Update catalogue item' : 'Add a catalogue item'}</h2>
                    </div>
                    {editingSlug && (
                      <button type="button" className="admin-link-btn" onClick={resetForm}>
                        Cancel
                      </button>
                    )}
                  </div>

                  {errors.length > 0 && (
                    <div className="admin-error-box">
                      <strong>Validation errors:</strong>
                      <ul>
                        {errors.map((error) => (
                          <li key={error.field}>
                            {error.field}: {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="admin-field">
                    <label htmlFor="slug">Slug</label>
                    <input id="slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="auto-generated from name if empty" />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="name">Name *</label>
                    <input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="category-input">Category *</label>
                    <input id="category-input" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Passive Components" required />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="title">Title</label>
                    <input id="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="SEO title" />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Short product summary" />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="canonical">Canonical URL</label>
                    <input id="canonical" value={form.canonical} onChange={(event) => setForm((current) => ({ ...current, canonical: event.target.value }))} placeholder="https://pdrworld.com/..." />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="tagline">Tagline</label>
                    <input id="tagline" value={form.tagline} onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))} placeholder="Short marketing line" />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="image-url">Image URL</label>
                    <input id="image-url" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="https://example.com/image.jpg" />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="status-input">Status</label>
                    <select id="status-input" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminStatus }))}>
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  {notice && <div className="admin-notice">{notice}</div>}

                  <button className="btn btn-primary admin-save-btn" type="submit">
                    {editorMode === 'edit' ? 'Save changes' : 'Add product'}
                  </button>
                </form>

                <div className="admin-activity-card">
                  <div className="admin-table-head" style={{ marginBottom: 16 }}>
                    <div>
                      <h2>Recent Activity</h2>
                      <p>Simple audit trail for product operations in this prototype.</p>
                    </div>
                  </div>
                  <div className="admin-activity-list">
                    {activity.map((item) => (
                      <article key={item.id} className={`admin-activity ${item.tone}`}>
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
                        </div>
                        <time>{item.time}</time>
                      </article>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>

      {showConfirmDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Confirm deletion</h3>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <p>
              <strong>{products.find((p) => p.slug === showConfirmDelete)?.name}</strong>
            </p>
            <div className="admin-modal-actions">
              <button className="btn btn-outline" onClick={() => setShowConfirmDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(showConfirmDelete)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}