import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SITE_URL = 'https://pdrworld.com';

const productsData = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'src/data/products.json'), 'utf8')
);

const CATEGORY_PAGES = [
  {
    path: 'products/active-components',
    title: 'Active Optical Components & Transceivers | PDR World',
    description: 'Explore high-speed optical transceivers from 1G to 400G, AOCs, DACs, and CWDM/DWDM modules engineered for enterprise networks and data centres.',
  },
  {
    path: 'products/passive-components',
    title: 'Passive Fiber Optic Components & Patch Cords | PDR World',
    description: 'Premium fiber patch cords, pigtails, attenuators, PLC splitters, and adapters manufactured for ultra-low insertion loss and high return loss.',
  },
  {
    path: 'products/cable-management',
    title: 'Fiber Cable Management & Distribution Systems | PDR World',
    description: 'High-density rack mount FMS, ODFs, fiber distribution boxes, and splice closures designed for streamlined telecom routing and protection.',
  },
  {
    path: 'products/test-measuring',
    title: 'Fiber Optic Test & Measurement Equipment | PDR World',
    description: 'Precision optical power meters, visual fault locators, OTDRs, and fiber inspection microscopes for field testing and lab certification.',
  },
  {
    path: 'products/specialty-drones',
    title: 'Specialty Drone Fiber Tether Systems | PDR World',
    description: 'Ultra-lightweight fiber optic tether spools and high-bandwidth optical terminals for uninterrupted, jam-proof UAV communication links.',
  },
  {
    path: 'products/maintenance-tools',
    title: 'Fiber Optic Cleaning & Maintenance Tools | PDR World',
    description: 'One-click cleaner pens, cassette cleaners, and precision fusion splicing accessories for flawless fiber end-face maintenance.',
  },
];

const STATIC_PAGES = [
  {
    path: 'about',
    title: 'About Us | PDR World — 35+ Years of Optical Fiber Innovation',
    description: 'Learn about PDR Videotronics, an ISO-certified pioneer in optical fiber communication components, infrastructure, and custom telecom manufacturing since 1988.',
  },
  {
    path: 'products',
    title: 'Products Catalogue — Optical Fiber Infrastructure & Devices | PDR World',
    description: 'Browse the complete PDR product line: transceivers, patch cords, cable management, test tools, fusion splicers, and drone tether systems.',
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
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectMeta(templateHtml, { title, description, canonicalUrl, ogImage, ogType = 'website', jsonLd = null }) {
  let html = templateHtml;
  
  // Replace or inject title
  const titleTag = `<title>${escapeHtml(title)}</title>`;
  if (html.includes('<title>')) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, titleTag);
  } else {
    html = html.replace('</head>', `  ${titleTag}\n  </head>`);
  }

  // Remove any pre-existing description, canonical or og tags from template
  html = html.replace(/<meta\s+name="description"[\s\S]*?>/gi, '');
  html = html.replace(/<link\s+rel="canonical"[\s\S]*?>/gi, '');
  html = html.replace(/<meta\s+property="og:[^"]+"[\s\S]*?>/gi, '');
  html = html.replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?>/gi, '');

  const safeDesc = escapeHtml(description);
  const safeTitle = escapeHtml(title);
  const safeImg = escapeHtml(ogImage || `${SITE_URL}/og-card.png`);
  const safeUrl = escapeHtml(canonicalUrl);

  const tags = [
    `<meta name="description" content="${safeDesc}" />`,
    `<link rel="canonical" href="${safeUrl}" />`,
    `<meta property="og:site_name" content="PDR World" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDesc}" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta property="og:image" content="${safeImg}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDesc}" />`,
    `<meta name="twitter:image" content="${safeImg}" />`,
  ];

  if (jsonLd) {
    tags.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`);
  }

  const injectedTags = tags.map((t) => `    ${t}`).join('\n');
  return html.replace('</head>', `${injectedTags}\n  </head>`);
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

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8');
  let generatedCount = 0;

  // 1. Update root index.html with default home SEO & Open Graph
  const homeHtml = injectMeta(baseHtml, {
    title: 'PDR World — Optical Fiber Components, Cables & Test Equipment',
    description: 'PDR Videotronics is a premier Indian manufacturer of high-performance fiber optic patch cords, 1G-400G optical transceivers, splice enclosures, and testing instruments.',
    canonicalUrl: `${SITE_URL}/`,
    ogImage: `${SITE_URL}/og-card.png`,
    ogType: 'website',
  });
  fs.writeFileSync(baseHtmlPath, homeHtml);
  generatedCount++;

  // 2. Generate Product Detail Pages
  for (const product of productsData) {
    if (!product.slug) continue;
    const pageDir = path.join(DIST_DIR, 'products', product.slug);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    const prodTitle = product.title || `${product.name} — ${product.category} | PDR World`;
    const prodDesc = product.description || product.tagline || 'Explore high-quality optical fiber solutions engineered by PDR World.';
    const prodImg = product.imageUrl || `${SITE_URL}/og-card.png`;
    const prodUrl = `${SITE_URL}/products/${product.slug}`;

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
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'INR',
        url: prodUrl,
      },
    };

    const prodHtml = injectMeta(baseHtml, {
      title: prodTitle,
      description: prodDesc,
      canonicalUrl: prodUrl,
      ogImage: prodImg,
      ogType: 'product',
      jsonLd,
    });

    fs.writeFileSync(path.join(pageDir, 'index.html'), prodHtml);
    generatedCount++;
  }

  // 3. Generate Category Pages
  for (const cat of CATEGORY_PAGES) {
    const pageDir = path.join(DIST_DIR, cat.path);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    const catHtml = injectMeta(baseHtml, {
      title: cat.title,
      description: cat.description,
      canonicalUrl: `${SITE_URL}/${cat.path}`,
      ogImage: `${SITE_URL}/og-card.png`,
      ogType: 'website',
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

    const pageHtml = injectMeta(baseHtml, {
      title: page.title,
      description: page.description,
      canonicalUrl: `${SITE_URL}/${page.path}`,
      ogImage: `${SITE_URL}/og-card.png`,
      ogType: 'website',
    });

    fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
    generatedCount++;
  }

  // 5. Generate 404.html
  const notFoundHtml = injectMeta(baseHtml, {
    title: 'Page Not Found | PDR World',
    description: "The page you're looking for doesn't exist or has moved.",
    canonicalUrl: `${SITE_URL}/404`,
    ogImage: `${SITE_URL}/og-card.png`,
  });
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml);
  generatedCount++;

  console.log(`Successfully generated ${generatedCount} static HTML pages with full Open Graph and SEO tags in dist/!`);
}

// Run directly if invoked
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateStaticPages();
}
