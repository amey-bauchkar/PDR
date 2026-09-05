import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSitemap } from './generate-sitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SITE_URL = 'https://pdrworld.com';

const productsData = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'src/data/products.json'), 'utf8')
);

const catalogueData = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'src/data/catalogue.json'), 'utf8')
);

// Map catalogue card images as fallback
const catalogueImageMap = {};
for (const section of catalogueData.sections || []) {
  for (const group of section.groups || []) {
    for (const card of group.cards || []) {
      if (card.slug && card.img) {
        catalogueImageMap[card.slug] = card.img;
      }
    }
  }
}

// Map dedicated fallback images for specific products
const LOCAL_IMAGE_MAP = {
  'cleaner-pen': '/images/live/fiber-optic-cleaner-pen.webp',
  'mpo-cleaner': '/images/live/fiber-optic-cleaner-pen-mpo.webp',
  'cassette-cleaner': '/images/live/cassette-cleaner.webp',
  'wall-mount': '/images/live/optical-fiber-wall-mount-enclosure.webp',
  'rack-mount-fms': '/images/live/rack-mount-fiber-management-system.webp',
  'fdb': '/images/live/fiber-distribution-box-fdb.webp',
  'htb': '/images/live/home-termination-box-htb.webp',
  'heat-shrink-closure': '/images/live/heat-shrink-splice-closure.webp',
  'horizontal-closure': '/images/products/horizontal-closure.png',
  'cat6-panel': '/images/live/cat-6-patch-panel.webp',
  'cat6-patch-cord': '/images/live/cat-6-patch-cord.webp',
  'cpri-patchcord': '/images/live/cpri-patchcord.webp',
  'cwdm': '/images/live/cwdm-mux-demux-module.webp',
  'dwdm': '/images/live/dwdm-mux-demux-module.webp',
  'fanout-patch-cords': '/images/live/fanout-patch-cords.webp',
  'field-connector': '/images/live/fiber-optic-connector-field-installable.webp',
  'fo-patchcords': '/images/live/fiber-optic-patch-cords-and-pigtails.webp',
  'mode-conditioning': '/images/live/mode-conditioning-patchcord.webp',
  'mpo-assembly': '/images/live/mpo-cable-assembly.webp',
  'plc-splitter': '/images/live/plc-splitter.webp',
  'rapid-push': '/images/live/rapid-push-cable-assembly.webp',
  'smpte-assembly': '/images/live/smpte-cable-assembly.webp',
  'attenuator': '/images/live/variable-fiber-attenuator.webp',
  'bare-fiber-adapter': '/images/live/bare-fiber-adapter.webp',
  'fiber-optic-adapter': '/images/live/sc-apc-female-to-sc-upc-male-adapter-converter.webp',
  'hybrid-adapter': '/images/live/sc-apc-female-to-sc-upc-male-adapter-converter.webp',
  'fiber-spool': '/images/products/fiber-spool.png',
  'pof-patchcord': '/images/products/pof-patchcord.png',
  'fusion-splicer': '/images/live/fusion-splicer-pdr618h.webp',
  'next-gen-splicer': '/images/products/next-gen-splicer.png',
  'regular-opm': '/images/live/mini-optical-power-meter.webp',
  'pocket-otdr': '/images/live/mini-otdr-pdr4402s.webp',
  'pon-power-meter': '/images/live/pon-power-meter.webp',
  'vfl': '/images/products/vfl.png',
  'drone': '/images/products/drone.png',
  'uav-fiber-optic-spool': '/images/products/uav-fiber-optic-spool.png',
  'fpv-optical-terminal': '/images/products/fpv-optical-terminal.png',
  'sfp-400g': '/images/sfp-400g.webp',
};

function resolveProductImage(product) {
  if (product.imageUrl && product.imageUrl.startsWith('http')) {
    return product.imageUrl;
  }
  const localPath = product.imageUrl || catalogueImageMap[product.slug] || LOCAL_IMAGE_MAP[product.slug];
  if (localPath) {
    if (localPath.startsWith('http')) return localPath;
    return `${SITE_URL}${localPath.startsWith('/') ? '' : '/'}${localPath}`;
  }
  return `${SITE_URL}/og-card.png`;
}

function getImageMimeType(url) {
  if (!url) return 'image/png';
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) return 'image/jpeg';
  if (cleanUrl.endsWith('.webp')) return 'image/webp';
  if (cleanUrl.endsWith('.gif')) return 'image/gif';
  if (cleanUrl.endsWith('.svg')) return 'image/svg+xml';
  return 'image/png';
}

const CATEGORY_PAGES = [
  {
    path: 'products/active-components',
    name: 'Active Components',
    title: 'Active Optical Components & Transceivers | PDR World',
    description: 'Explore high-speed optical transceivers from 1G to 400G, AOCs, DACs, and CWDM/DWDM modules engineered for enterprise networks and data centres.',
  },
  {
    path: 'products/passive-components',
    name: 'Passive Components',
    title: 'Passive Fiber Optic Components & Patch Cords | PDR World',
    description: 'Browse precision fiber patch cords, MPO trunk assemblies, PLC splitters, and attenuators built with premium low-loss optical glass.',
  },
  {
    path: 'products/cable-management',
    name: 'Cable Management',
    title: 'Fiber Management Systems, Enclosures & Patch Panels | PDR World',
    description: 'High-density rack-mount FMS, wall-mount enclosures, fiber distribution boxes (FDB), and Cat6 patch panels designed for organized cable routing.',
  },
  {
    path: 'products/test-measuring',
    name: 'Test & Measurement',
    title: 'Optical Test & Measurement Equipment | PDR World',
    description: 'Core-alignment fusion splicers, handheld OTDRs, optical power meters (OPM), and visual fault locators for field installation and certification.',
  },
  {
    path: 'products/specialty-drones',
    name: 'Specialty Defense & UAV Solutions',
    title: 'Defense & UAV Tethered Fiber Spools | PDR World',
    description: 'Ultra-lightweight micro-armored fiber optic spools and optical ground/sky terminals for jam-proof FPV drone and defense tethering.',
  },
  {
    path: 'products/maintenance-tools',
    name: 'Maintenance Tools',
    title: 'Fiber Cleaning & Inspection Tools | PDR World',
    description: 'One-click cleaner pens, cassette cleaners, and fiber endface inspection scopes to ensure zero optical contamination.',
  },
];

const STATIC_PAGES = [
  {
    path: 'about',
    title: 'About PDR World — Leading Fiber Optic Manufacturer in India',
    description: 'Established in 1986, PDR Videotronics is an ISO 9001/14001 certified pioneer in fiber optic communication systems and networking infrastructure.',
  },
  {
    path: 'products',
    title: 'All Optical Fiber Products & Systems | PDR World',
    description: 'Comprehensive catalogue of optical transceivers, fiber patch cords, splice closures, MPO cables, and fusion splicers manufactured by PDR.',
  },
  {
    path: 'solutions',
    title: 'Enterprise & Telecom Optical Solutions | PDR World',
    description: 'Custom fiber connectivity solutions for Data Centres, Telecom Operators, Defense, Smart Cities, and Broadcasting Networks.',
  },
  {
    path: 'resources',
    title: 'Technical Resources, Datasheets & Catalogues | PDR World',
    description: 'Download official product datasheets, optical fiber whitepapers, and comprehensive product catalogues from PDR World.',
  },
  {
    path: 'contact',
    title: 'Contact PDR World — Request a Quote & Technical Support',
    description: 'Get in touch with PDR engineers for custom quotes, technical specifications, bulk distributor pricing, and product consultations.',
  },
  {
    path: 'cable-configurator',
    title: 'Interactive 3D Fiber Cable Configurator | PDR World',
    description: 'Custom configure your fiber optic cable assemblies in 3D: select fiber core count, jacket type, connector types, and length in real-time.',
  },
  {
    path: 'fiber-selector',
    title: 'Fiber Cable Selection Tool | PDR World',
    description: 'Easily find the exact optical fiber cable, patchcord, or transceiver configuration for your specific installation environment.',
  },
  {
    path: 'terms',
    title: 'Terms of Service | PDR World',
    description: 'Terms and conditions governing the use of PDR World website, products, and manufacturing services.',
  },
  {
    path: 'privacy',
    title: 'Privacy Policy | PDR World',
    description: 'Privacy policy and data protection commitments of PDR Videotronics India Pvt. Ltd.',
  },
];

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function resolveDatasheetUrl(url, slug) {
  if (slug) {
    const localFile = path.join(DIST_DIR, 'datasheets', `${slug}.pdf`);
    const publicFile = path.join(ROOT_DIR, 'public/datasheets', `${slug}.pdf`);
    if (fs.existsSync(localFile) || fs.existsSync(publicFile)) {
      return `/datasheets/${slug}.pdf`;
    }
  }
  return url || '';
}

function renderProductBody(product, prodImg) {
  const specs = Array.isArray(product.specs) ? product.specs : [];
  const features = Array.isArray(product.features) ? product.features : [];
  const apps = Array.isArray(product.applications) ? product.applications : [];
  const dsUrl = resolveDatasheetUrl(product.datasheetUrl, product.slug);

  const specsSection = specs.length > 0 
    ? `<section style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:32px;"><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:20px;">Technical Specifications</h2><table style="width:100%;border-collapse:collapse;text-align:left;font-size:15px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;"><tbody>${specs.map((s, idx) => `<tr style="background:${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};border-bottom:1px solid #e2e8f0;"><th style="padding:12px 16px;font-weight:600;color:#334155;width:35%;border-right:1px solid #e2e8f0;">${escapeHtml(s.label)}</th><td style="padding:12px 16px;color:#475569;">${escapeHtml(s.value)}</td></tr>`).join('')}</tbody></table></section>`
    : `<section style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:32px;"><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:20px;">Technical Specifications</h2><p style="color:#64748b;font-size:15px;">Complete technical specifications and performance graphs are provided in the official downloadable datasheet. Please contact PDR engineering for custom technical parameters.</p></section>`;

  const featuresSection = features.length > 0
    ? `<section style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:32px;"><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:16px;">Key Features</h2><ul style="padding-left:24px;color:#334155;line-height:1.8;font-size:15px;">${features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul></section>`
    : `<section style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:32px;"><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:16px;">Key Features</h2><ul style="padding-left:24px;color:#334155;line-height:1.8;font-size:15px;"><li>Engineered to international telecommunication standards (Telcordia / IEC / TIA)</li><li>Manufactured under ISO 9001:2015 and ISO 14001:2015 certified quality processes</li><li>100% factory tested for optical insertion loss and return loss compliance</li></ul></section>`;

  const appsSection = apps.length > 0
    ? `<section style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:32px;"><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:16px;">Applications &amp; Use Cases</h2><ul style="padding-left:24px;color:#334155;line-height:1.8;font-size:15px;">${apps.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul></section>`
    : `<section style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:32px;"><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:16px;">Applications &amp; Use Cases</h2><ul style="padding-left:24px;color:#334155;line-height:1.8;font-size:15px;"><li>Telecommunications network infrastructure &amp; FTTH/FTTX deployments</li><li>Enterprise data centres, high-density optical routing, and campus LANs</li><li>Broadband CATV networks and carrier-grade fiber backhaul</li></ul></section>`;

  return `<div id="root"><header style="background:#0f172a;color:#ffffff;padding:16px 24px;border-bottom:1px solid #1e293b;"><div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;"><a href="/" style="color:#ffffff;text-decoration:none;font-weight:700;font-size:20px;letter-spacing:1px;">PDR WORLD</a><nav style="display:flex;gap:20px;font-size:14px;"><a href="/products" style="color:#94a3b8;text-decoration:none;">Products</a><a href="/solutions" style="color:#94a3b8;text-decoration:none;">Solutions</a><a href="/about" style="color:#94a3b8;text-decoration:none;">About</a><a href="/contact" style="color:#38bdf8;text-decoration:none;font-weight:600;">Contact</a></nav></div></header><main style="font-family:system-ui,-apple-system,sans-serif;max-width:1200px;margin:0 auto;padding:32px 16px;color:#1e293b;"><nav aria-label="Breadcrumb" style="font-size:14px;color:#64748b;margin-bottom:24px;"><a href="/" style="color:#0284c7;text-decoration:none;">Home</a> &gt; <a href="/products" style="color:#0284c7;text-decoration:none;">Products</a> &gt; <span>${escapeHtml(product.category)}</span> &gt; <span style="font-weight:600;color:#0f172a;">${escapeHtml(product.name)}</span></nav><article style="display:flex;flex-wrap:wrap;gap:40px;margin-bottom:48px;"><div style="flex:1;min-width:300px;max-width:500px;"><img src="${escapeHtml(prodImg)}" alt="${escapeHtml(product.name)}" style="width:100%;height:auto;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);background:#f8fafc;border:1px solid #e2e8f0;" /></div><div style="flex:1;min-width:320px;"><span style="display:inline-block;padding:4px 12px;background:#e0f2fe;color:#0369a1;border-radius:9999px;font-size:13px;font-weight:600;margin-bottom:12px;">${escapeHtml(product.category)}</span><h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 12px 0;line-height:1.2;">${escapeHtml(product.name)}</h1>${product.tagline ? `<p style="font-size:18px;color:#0284c7;font-weight:500;margin:0 0 16px 0;">${escapeHtml(product.tagline)}</p>` : ''}<div style="font-size:16px;line-height:1.6;color:#334155;margin-bottom:24px;">${escapeHtml(product.description || '')}</div><div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px;">${dsUrl ? `<a href="${escapeHtml(dsUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;padding:12px 20px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Download Official Datasheet (PDF)</a>` : ''}<a href="/contact?product=${encodeURIComponent(product.name)}" style="display:inline-flex;align-items:center;padding:12px 20px;background:#0284c7;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Request a Quote</a></div></div></article>${specsSection}${featuresSection}${appsSection}</main><footer style="background:#0f172a;color:#94a3b8;padding:32px 16px;margin-top:64px;border-top:1px solid #1e293b;text-align:center;font-size:14px;"><p>&copy; ${new Date().getFullYear()} PDR Videotronics (India) Pvt. Ltd. All rights reserved.</p></footer></div>`;
}

function renderCategoryBody(category, prods) {
  const catProds = prods.filter(p => p.category && p.category.toLowerCase().includes(category.name.toLowerCase()));
  return `<div id="root"><header style="background:#0f172a;color:#ffffff;padding:16px 24px;"><div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;"><a href="/" style="color:#ffffff;text-decoration:none;font-weight:700;font-size:20px;">PDR WORLD</a><nav style="display:flex;gap:20px;font-size:14px;"><a href="/products" style="color:#94a3b8;text-decoration:none;">Products</a><a href="/contact" style="color:#38bdf8;text-decoration:none;">Contact</a></nav></div></header><main style="font-family:system-ui,-apple-system,sans-serif;max-width:1200px;margin:0 auto;padding:32px 16px;color:#1e293b;"><nav style="font-size:14px;color:#64748b;margin-bottom:20px;"><a href="/" style="color:#0284c7;text-decoration:none;">Home</a> &gt; <a href="/products" style="color:#0284c7;text-decoration:none;">Products</a> &gt; <span style="font-weight:600;color:#0f172a;">${escapeHtml(category.name)}</span></nav><h1 style="font-size:32px;font-weight:800;color:#0f172a;margin-bottom:12px;">${escapeHtml(category.name)}</h1><p style="font-size:16px;color:#475569;max-width:800px;line-height:1.6;margin-bottom:32px;">${escapeHtml(category.description)}</p><div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;">${catProds.map(p => `<article style="border:1px solid #e2e8f0;border-radius:12px;padding:20px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.05);"><h2 style="font-size:18px;font-weight:700;margin:0 0 8px 0;"><a href="/products/${p.slug}" style="color:#0f172a;text-decoration:none;">${escapeHtml(p.name)}</a></h2><p style="font-size:14px;color:#64748b;line-height:1.5;margin:0 0 16px 0;">${escapeHtml(p.tagline || p.description || '')}</p><a href="/products/${p.slug}" style="display:inline-block;font-size:14px;font-weight:600;color:#0284c7;text-decoration:none;">View Specifications &rarr;</a></article>`).join('')}</div></main></div>`;
}

function renderStaticBody(page) {
  return `<div id="root"><header style="background:#0f172a;color:#ffffff;padding:16px 24px;"><div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;"><a href="/" style="color:#ffffff;text-decoration:none;font-weight:700;font-size:20px;">PDR WORLD</a><nav style="display:flex;gap:20px;font-size:14px;"><a href="/products" style="color:#94a3b8;text-decoration:none;">Products</a><a href="/solutions" style="color:#94a3b8;text-decoration:none;">Solutions</a><a href="/about" style="color:#94a3b8;text-decoration:none;">About</a><a href="/contact" style="color:#38bdf8;text-decoration:none;">Contact</a></nav></div></header><main style="font-family:system-ui,-apple-system,sans-serif;max-width:1200px;margin:0 auto;padding:40px 16px;color:#1e293b;"><h1 style="font-size:36px;font-weight:800;color:#0f172a;margin-bottom:16px;">${escapeHtml(page.title.split('|')[0].split('—')[0].trim())}</h1><p style="font-size:18px;color:#475569;line-height:1.6;max-width:800px;margin-bottom:32px;">${escapeHtml(page.description)}</p><a href="/products" style="display:inline-block;padding:12px 24px;background:#0284c7;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:600;">Explore PDR Products</a></main></div>`;
}

function renderHomeBody(categories, prods) {
  return `<div id="root"><header style="background:#0f172a;color:#ffffff;padding:16px 24px;border-bottom:1px solid #1e293b;"><div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;"><a href="/" style="color:#ffffff;text-decoration:none;font-weight:700;font-size:20px;letter-spacing:1px;">PDR WORLD</a><nav style="display:flex;gap:20px;font-size:14px;"><a href="/products" style="color:#94a3b8;text-decoration:none;">Products</a><a href="/solutions" style="color:#94a3b8;text-decoration:none;">Solutions</a><a href="/cable-configurator" style="color:#94a3b8;text-decoration:none;">3D Configurator</a><a href="/about" style="color:#94a3b8;text-decoration:none;">About</a><a href="/contact" style="color:#38bdf8;text-decoration:none;font-weight:600;">Contact</a></nav></div></header><main style="font-family:system-ui,-apple-system,sans-serif;max-width:1200px;margin:0 auto;padding:48px 16px;color:#1e293b;"><section style="text-align:center;margin-bottom:64px;"><span style="display:inline-block;padding:6px 16px;background:#e0f2fe;color:#0369a1;border-radius:9999px;font-size:14px;font-weight:600;margin-bottom:16px;">India's Premier Optical Fiber Manufacturer Since 1986</span><h1 style="font-size:42px;font-weight:800;color:#0f172a;margin:0 0 20px 0;line-height:1.2;">High-Performance Fiber Optic Connectivity &amp; Test Instruments</h1><p style="font-size:18px;color:#475569;max-width:800px;margin:0 auto 32px auto;line-height:1.6;">PDR Videotronics delivers world-class 1G to 400G optical transceivers, low-loss fiber patch cords, MPO trunk assemblies, ruggedized splice enclosures, and precision fusion splicers engineered for modern enterprise data centers, telecom operators, defense, and FTTx networks.</p><div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;"><a href="/products" style="display:inline-block;padding:14px 28px;background:#0284c7;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">Browse Product Catalogue</a><a href="/cable-configurator" style="display:inline-block;padding:14px 28px;background:#0f172a;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">Launch 3D Configurator</a></div></section><section style="margin-bottom:64px;"><h2 style="font-size:28px;font-weight:800;color:#0f172a;margin-bottom:24px;text-align:center;">Product Categories</h2><div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:24px;">${categories.map(c => `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:24px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.05);"><h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 10px 0;">${escapeHtml(c.name)}</h3><p style="font-size:14px;color:#64748b;line-height:1.6;margin:0 0 16px 0;">${escapeHtml(c.description)}</p><a href="/${c.path}" style="color:#0284c7;text-decoration:none;font-weight:600;font-size:14px;">Explore ${escapeHtml(c.name)} &rarr;</a></div>`).join('')}</div></section><section style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:40px 32px;margin-bottom:48px;"><div style="display:flex;flex-wrap:wrap;gap:32px;align-items:center;"><div style="flex:1;min-width:300px;"><h2 style="font-size:26px;font-weight:800;color:#0f172a;margin-bottom:12px;">ISO 9001 &amp; ISO 14001 Certified Quality</h2><p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:20px;">Every PDR optical patchcord and transceiver undergoes rigorous interferometric geometry inspection, insertion loss testing, and return loss certification before dispatch from our Mumbai manufacturing facility.</p><a href="/about" style="color:#0284c7;text-decoration:none;font-weight:600;">Learn More About PDR Manufacturing &rarr;</a></div><div style="flex:1;min-width:300px;text-align:center;"><div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap;"><div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:16px 24px;font-weight:700;color:#0f172a;">ISO 9001:2015</div><div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:16px 24px;font-weight:700;color:#0f172a;">ISO 14001:2015</div><div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:16px 24px;font-weight:700;color:#0f172a;">CACT Approved</div><div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:16px 24px;font-weight:700;color:#0f172a;">RoHS Compliant</div></div></div></div></section></main><footer style="background:#0f172a;color:#94a3b8;padding:32px 16px;text-align:center;font-size:14px;border-top:1px solid #1e293b;"><p>&copy; ${new Date().getFullYear()} PDR Videotronics (India) Pvt. Ltd. 99, Old Prabhadevi Road, Mumbai 400 025, India.</p></footer></div>`;
}

function render404Body() {
  return `<div id="root"><main style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:100px auto;padding:32px;text-align:center;color:#1e293b;"><h1 style="font-size:72px;font-weight:800;color:#0284c7;margin:0 0 16px 0;">404</h1><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin:0 0 16px 0;">Page Not Found</h2><p style="font-size:16px;color:#64748b;line-height:1.6;margin:0 0 32px 0;">The page you requested could not be found or has been moved.</p><a href="/" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Return to Homepage</a></main></div>`;
}

function injectMeta(templateHtml, { title, description, canonicalUrl, ogImage, ogType = 'website', jsonLd = null, bodyHtml = null }) {
  let html = templateHtml;
  
  // Replace title
  const titleTag = `<title>${escapeHtml(title)}</title>`;
  if (html.includes('<title>')) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, titleTag);
  } else {
    html = html.replace('</head>', `  ${titleTag}\n  </head>`);
  }

  // Strip existing description, canonical, alternate/hreflang, og, twitter tags
  html = html.replace(/<meta\s+name="description"[\s\S]*?>/gi, '');
  html = html.replace(/<link\s+rel="canonical"[\s\S]*?>/gi, '');
  html = html.replace(/<link\s+[^>]*hreflang=[^>]*>/gi, '');
  html = html.replace(/<meta\s+property="og:[^"]+"[\s\S]*?>/gi, '');
  html = html.replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?>/gi, '');

  const safeDesc = escapeHtml(description);
  const safeTitle = escapeHtml(title);
  const safeImg = escapeHtml(ogImage || `${SITE_URL}/og-card.png`);
  const safeUrl = escapeHtml(canonicalUrl);
  const mimeType = getImageMimeType(safeImg);

  const tags = [
    `<meta name="description" content="${safeDesc}" />`,
    `<link rel="canonical" href="${safeUrl}" />`,
    `<link rel="alternate" hreflang="en-in" href="${safeUrl}" />`,
    `<link rel="alternate" hreflang="en" href="${safeUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${safeUrl}" />`,
    `<meta property="og:site_name" content="PDR World" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDesc}" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta property="og:image" content="${safeImg}" />`,
    `<meta property="og:image:secure_url" content="${safeImg}" />`,
    `<meta property="og:image:type" content="${mimeType}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${safeTitle}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDesc}" />`,
    `<meta name="twitter:image" content="${safeImg}" />`,
  ];

  if (jsonLd) {
    tags.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`);
  }

  const injectedTags = tags.map((t) => `    ${t}`).join('\n');
  html = html.replace('</head>', `${injectedTags}\n  </head>`);

  // Inject crawlable readable body inside <div id="root">
  if (bodyHtml) {
    html = html.replace(/<div id="root">[\s\S]*?(?=\s*<script|\s*<\/body>)/, bodyHtml);
  }

  return html;
}

export function generateStaticPages() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Error: dist directory not found. Please run "vite build" first.');
    return;
  }

  const baseHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('Error: dist/index.html not found.');
    return;
  }

  const rawBaseHtml = fs.readFileSync(baseHtmlPath, 'utf8');
  // Clean base template ensuring <div id="root"> is reset to an empty <div id="root"></div>
  const cleanBaseHtml = rawBaseHtml.replace(/<div id="root">[\s\S]*?(?=\s*<script|\s*<\/body>)/, '<div id="root"></div>');
  let generatedCount = 0;

  // 1. Update root index.html with default home SEO & Open Graph and pre-rendered body
  const homeBodyHtml = renderHomeBody(CATEGORY_PAGES, productsData);
  const homeHtml = injectMeta(cleanBaseHtml, {
    title: 'PDR World — Optical Fiber Components, Cables & Test Equipment',
    description: 'PDR Videotronics is a premier Indian manufacturer of high-performance fiber optic patch cords, 1G-400G optical transceivers, splice enclosures, and testing instruments.',
    canonicalUrl: `${SITE_URL}/`,
    ogImage: `${SITE_URL}/og-card.png`,
    ogType: 'website',
    bodyHtml: homeBodyHtml,
  });
  fs.writeFileSync(baseHtmlPath, homeHtml);
  generatedCount++;

  // 2. Generate Product Detail Pages
  for (const product of productsData) {
    if (!product.slug || product.slug === 'easyget-wifi') continue;
    const pageDir = path.join(DIST_DIR, 'products', product.slug);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    const prodTitle = product.title || `${product.name} | PDR World`;
    const prodDesc = product.description || product.tagline || 'Explore high-quality optical fiber solutions engineered by PDR World.';
    const prodImg = resolveProductImage(product);
    const prodUrl = `${SITE_URL}/products/${product.slug}`;

    const additionalProperty = Array.isArray(product.specs)
      ? product.specs.map((s) => ({
          '@type': 'PropertyValue',
          name: s.label,
          value: s.value,
        }))
      : [];

    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: prodImg,
      description: prodDesc,
      category: product.category,
      brand: {
        '@type': 'Brand',
        name: 'PDR World',
      },
      manufacturer: {
        '@type': 'Organization',
        name: 'PDR Videotronics India Pvt. Ltd.',
        url: SITE_URL,
      },
      url: prodUrl,
      ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
    };

    const prodBodyHtml = renderProductBody(product, prodImg);

    const prodHtml = injectMeta(cleanBaseHtml, {
      title: prodTitle,
      description: prodDesc,
      canonicalUrl: prodUrl,
      ogImage: prodImg,
      ogType: 'product',
      jsonLd,
      bodyHtml: prodBodyHtml,
    });

    fs.writeFileSync(path.join(pageDir, 'index.html'), prodHtml);
    generatedCount++;
  }

  // Generate static redirect stubs for historical slugs to new canonical product slugs
  const REDIRECT_STUBS = [
    { oldSlug: 'pocket-otdr', newSlug: 'nano-otdr', title: 'Nano OTDR' },
    { oldSlug: 'drone', newSlug: 'ground-unit', title: 'Ground unit' },
    { oldSlug: 'fpv-optical-terminal', newSlug: 'sky-unit', title: 'Sky Unit' },
    { oldSlug: 'rapid-push', newSlug: 'fttx-smart-bullet-drop-cable', title: 'FTTX Smart Bullet Drop Cable' },
  ];

  for (const stub of REDIRECT_STUBS) {
    const stubDir = path.join(DIST_DIR, 'products', stub.oldSlug);
    if (!fs.existsSync(stubDir)) fs.mkdirSync(stubDir, { recursive: true });
    const stubHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(stub.title)} | PDR World</title>
  <link rel="canonical" href="${SITE_URL}/products/${stub.newSlug}" />
  <meta http-equiv="refresh" content="0;url=/products/${stub.newSlug}">
  <script>window.location.replace('/products/${stub.newSlug}');</script>
</head>
<body>
  <p>Redirecting to <a href="/products/${stub.newSlug}">${escapeHtml(stub.title)}</a>...</p>
</body>
</html>`;
    fs.writeFileSync(path.join(stubDir, 'index.html'), stubHtml);
    generatedCount++;
  }

  // 3. Generate Category Pages
  for (const cat of CATEGORY_PAGES) {
    const pageDir = path.join(DIST_DIR, cat.path);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    const catBodyHtml = renderCategoryBody(cat, productsData);

    const catHtml = injectMeta(cleanBaseHtml, {
      title: cat.title,
      description: cat.description,
      canonicalUrl: `${SITE_URL}/${cat.path}`,
      ogImage: `${SITE_URL}/og-card.png`,
      ogType: 'website',
      bodyHtml: catBodyHtml,
    });

    fs.writeFileSync(path.join(pageDir, 'index.html'), catHtml);
    generatedCount++;
  }

  // 4. Generate Static Routes
  for (const page of STATIC_PAGES) {
    const pageDir = path.join(DIST_DIR, page.path);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    const staticBodyHtml = renderStaticBody(page);

    const pageHtml = injectMeta(cleanBaseHtml, {
      title: page.title,
      description: page.description,
      canonicalUrl: `${SITE_URL}/${page.path}`,
      ogImage: `${SITE_URL}/og-card.png`,
      ogType: 'website',
      bodyHtml: staticBodyHtml,
    });

    fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
    generatedCount++;
  }

  // 5. Generate 404.html
  const notFoundHtml = injectMeta(cleanBaseHtml, {
    title: 'Page Not Found | PDR World',
    description: "The page you're looking for doesn't exist or has moved.",
    canonicalUrl: `${SITE_URL}/404`,
    ogImage: `${SITE_URL}/og-card.png`,
    bodyHtml: render404Body(),
  });
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml);
  generatedCount++;

  // 6. Generate Dynamic Sitemap
  generateSitemap();

  console.log(`Successfully generated ${generatedCount} static HTML pages with full readable content and Open Graph tags in dist/!`);
}

// Run directly if invoked
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateStaticPages();
}
