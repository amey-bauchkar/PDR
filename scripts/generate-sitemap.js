/**
 * Generate sitemap.xml from actual product data.
 * Replaces the hand-maintained sitemap that drifted from reality.
 * 
 * Run: node scripts/generate-sitemap.js
 * Called automatically during build:full
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/products.json'), 'utf8')
);

const SITE = 'https://pdrworld.com';

// Core pages (static)
const corePages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/about', changefreq: 'monthly', priority: '0.8' },
  { loc: '/products', changefreq: 'weekly', priority: '0.9' },
  { loc: '/solutions', changefreq: 'monthly', priority: '0.8' },
  { loc: '/resources', changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
  { loc: '/cable-configurator', changefreq: 'monthly', priority: '0.7' },
  { loc: '/fiber-selector', changefreq: 'monthly', priority: '0.7' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
];

// Product category pages (static)
const categoryPages = [
  { loc: '/products/active-components', changefreq: 'weekly', priority: '0.8' },
  { loc: '/products/passive-components', changefreq: 'weekly', priority: '0.8' },
  { loc: '/products/cable-management', changefreq: 'weekly', priority: '0.8' },
  { loc: '/products/test-measuring', changefreq: 'weekly', priority: '0.8' },
  { loc: '/products/specialty-drones', changefreq: 'monthly', priority: '0.7' },
  { loc: '/products/maintenance-tools', changefreq: 'monthly', priority: '0.7' },
];

// Product detail pages — generated from actual data
const productPages = productsData
  .filter(p => p.status === 'Active' && p.slug)
  .map(p => ({
    loc: `/products/${p.slug}`,
    changefreq: 'monthly',
    priority: '0.6',
  }));

const allPages = [...corePages, ...categoryPages, ...productPages];

// Build XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Pages -->
${corePages.map(p => `  <url><loc>${SITE}${p.loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}

  <!-- Product Categories -->
${categoryPages.map(p => `  <url><loc>${SITE}${p.loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}

  <!-- Product Detail Pages (${productPages.length} products) -->
${productPages.map(p => `  <url><loc>${SITE}${p.loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`;

const outputPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(outputPath, xml, 'utf8');

console.log(`Generated sitemap.xml with ${allPages.length} URLs (${corePages.length} core + ${categoryPages.length} categories + ${productPages.length} products)`);
