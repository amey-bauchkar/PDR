import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SITE_URL = 'https://pdrworld.com';

const productsData = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'src/data/products.json'), 'utf8')
);

const STATIC_ROUTES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'about', priority: '0.8', changefreq: 'monthly' },
  { path: 'products', priority: '0.9', changefreq: 'daily' },
  { path: 'solutions', priority: '0.8', changefreq: 'monthly' },
  { path: 'resources', priority: '0.8', changefreq: 'weekly' },
  { path: 'contact', priority: '0.8', changefreq: 'monthly' },
  { path: 'cable-configurator', priority: '0.8', changefreq: 'monthly' },
  { path: 'fiber-selector', priority: '0.8', changefreq: 'monthly' },
  { path: 'terms', priority: '0.5', changefreq: 'yearly' },
  { path: 'privacy', priority: '0.5', changefreq: 'yearly' },
];

const CATEGORY_ROUTES = [
  'products/active-components',
  'products/passive-components',
  'products/cable-management',
  'products/test-measuring',
  'products/specialty-drones',
  'products/maintenance-tools',
];

export function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  const entries = [];

  // Static routes
  for (const r of STATIC_ROUTES) {
    const loc = r.path ? `${SITE_URL}/${r.path}` : `${SITE_URL}/`;
    entries.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`);
  }

  // Category routes
  for (const cat of CATEGORY_ROUTES) {
    entries.push(`  <url>
    <loc>${SITE_URL}/${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // Active products (excluding any deleted items)
  for (const p of productsData) {
    if (!p.slug || p.status === 'Archived' || p.slug === 'easyget-wifi') continue;
    const lastmod = p.updatedAt ? p.updatedAt.split('T')[0] : today;
    entries.push(`  <url>
    <loc>${SITE_URL}/products/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  // Write to public and dist if dist exists
  fs.writeFileSync(path.join(ROOT_DIR, 'public/sitemap.xml'), sitemapXml);
  const distPath = path.join(ROOT_DIR, 'dist/sitemap.xml');
  if (fs.existsSync(path.join(ROOT_DIR, 'dist'))) {
    fs.writeFileSync(distPath, sitemapXml);
  }

  console.log(`✅ Generated sitemap.xml with ${entries.length} active URLs (easyget-wifi excluded).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSitemap();
}
