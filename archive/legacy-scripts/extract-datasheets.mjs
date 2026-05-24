/**
 * Datasheet Extraction & Migration Script
 * 
 * This script:
 * 1. Fetches all WordPress posts from pdrworld.com via the REST API
 * 2. For each post, fetches the full HTML page
 * 3. Extracts specification PDF links from the "Specifications" section
 * 4. Matches old-site posts to new-project product slugs
 * 5. Downloads PDFs to public/datasheets/
 * 6. Generates a migration report (does NOT modify products.json)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ──────────────────────────────────────────
// Config
// ──────────────────────────────────────────
const WP_API = 'https://pdrworld.com/wp-json/wp/v2/posts';
const DATASHEETS_DIR = path.join(ROOT, 'public', 'datasheets');
const PRODUCTS_JSON = path.join(ROOT, 'src', 'data', 'products.json');
const REPORT_FILE = path.join(ROOT, 'datasheet_migration_report.json');
const DELAY_MS = 600; // delay between fetches to avoid overwhelming the server

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'PDR-Migration-Bot/1.0' } }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return resolve({ status: res.statusCode, body: '' });
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: 200, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'PDR-Migration-Bot/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return resolve({ ok: false, status: res.statusCode });
      }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => ws.close(() => resolve({ ok: true })));
      ws.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Download timeout')); });
  });
}

/**
 * Extract PDF URLs from HTML that appear under a "Specifications" section.
 * Pattern: <a href="...pdf"> with nearby "Click Here" text, OR any .pdf link
 * within an Elementor icon-list section that follows a "Specifications" heading.
 */
function extractSpecPdfUrls(html) {
  const pdfs = [];

  // Strategy 1: Find all .pdf links anywhere in the page
  const pdfRegex = /href=["']([^"']*\.pdf[^"']*)["']/gi;
  let match;
  while ((match = pdfRegex.exec(html)) !== null) {
    const url = match[1];
    // Skip if it's a CSS/JS file or clearly not a datasheet
    if (!url.includes('elementor') && !url.includes('plugin') && !url.includes('theme')) {
      pdfs.push(url);
    }
  }

  return [...new Set(pdfs)]; // deduplicate
}

function validatePdf(filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size < 100) return false; // too small to be a real PDF
    const buf = Buffer.alloc(5);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, 5, 0);
    fs.closeSync(fd);
    return buf.toString('ascii') === '%PDF-';
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────
// Step 1: Load local products
// ──────────────────────────────────────────
const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
console.log(`Loaded ${products.length} products from products.json`);

// ──────────────────────────────────────────
// Step 2: Fetch all WP posts
// ──────────────────────────────────────────
async function fetchAllPosts() {
  const allPosts = [];
  let page = 1;
  while (true) {
    const url = `${WP_API}?per_page=100&page=${page}&_fields=id,slug,title,link,categories`;
    console.log(`Fetching WP API page ${page}...`);
    const res = await fetchUrl(url);
    if (res.status !== 200) break;
    const posts = JSON.parse(res.body);
    if (posts.length === 0) break;
    allPosts.push(...posts);
    page++;
    await sleep(DELAY_MS);
  }
  return allPosts;
}

// ──────────────────────────────────────────
// Step 3: Build slug mapping
// ──────────────────────────────────────────

/**
 * Build a mapping from old WP post titles/slugs to new product slugs.
 * We try multiple matching strategies:
 * 1. Exact slug match
 * 2. Product name contained in post title (or vice versa)
 * 3. Known manual mappings for tricky names
 */
const MANUAL_SLUG_MAP = {
  // WP slug -> new product slug
  'direct-attached-cable': 'dac',
  'fiber-optic-transceivers-spf': 'sfp-transceivers',
  'hd-sdi-optical-transciever': 'hd-sdi',
  'optical-line-protection-system': 'olps',
  'active-optical-cable': 'aoc',
  'fiber-optic-cleaner-pen': 'cleaner-pen',
  'fiber-optic-cleaner-pen-mpo': 'mpo-cleaner',
  'visual-fault-locator': 'vfl',
  'fiber-optic-patchcords': 'fo-patchcords',
  'fiber-optic-patch-cords': 'fo-patchcords',
  'fiber-optic-drone': 'drone',
  'optical-fiber-drone': 'drone',
  'cassette-cleaner-2': 'cassette-cleaner',
  'plc-splitter-2': 'plc-splitter',
  'home-termination-box': 'htb',
  'next-gen-optical-fusion-splicer': 'next-gen-splicer',
  'regular-optical-power-meter': 'regular-opm',
  'mini-optical-power-meter': 'mini-opm',
  'pocket-otdr-2': 'pocket-otdr',
  'mini-otdr-2': 'mini-otdr',
  'pon-power-meter-2': 'pon-power-meter',
  'rack-mount-fiber-management-system': 'rack-mount-fms',
  'optical-distribution-frame': 'odf',
  'fiber-distribution-box': 'fdb',
  'wall-mount-enclosure': 'wall-mount',
  'optical-fiber-wall-mount-enclosure': 'wall-mount',
  'heat-shrink-closure-2': 'heat-shrink-closure',
  'horizontal-closure-2': 'horizontal-closure',
  'high-power-patchcord-2': 'high-power-patchcord',
  'variable-fiber-attenuator': 'attenuator',
  'bare-fiber-adapter-2': 'bare-fiber-adapter',
  'lc-uniboot-patchcord': 'lc-uniboot',
  'mode-conditioning-patchcord': 'mode-conditioning',
  'mpo-patchcord-assembly': 'mpo-assembly',
  'loopback-patchcord': 'loopback',
  'mating-sleeve-adapter': 'mating-sleeve',
  'field-installable-connector': 'field-connector',
  'fusion-splicer-2': 'fusion-splicer',
  'rapid-push-on-connector': 'rapid-push',
  'smart-sfp-transceiver': 'smart-sfp',
  'cat-6-patch-panel': 'cat6-panel',
  'cat-6-patch-cord': 'cat6-patch-cord',
  'cwdm-mux-demux-module': 'cwdm',
  'dwdm-mux-demux-module': 'dwdm',
  'hybrid-adapter-2': 'hybrid-adapter',
  'smpte-assembly-2': 'smpte-assembly',
  'splice-sleeves-2': 'splice-sleeves',
  'splice-on-connector': 'soc',
  'fiber-spool-fiber-drum': 'fiber-spool',
  'fanout-patch-cords-2': 'fanout-patch-cords',
  'cpri-patchcord-2': 'cpri-patchcord',
  'bendiboot-patchcord-2': 'bendiboot-patchcord',
  'armoured-patchcord-2': 'armoured-patchcord',
  'pof-patchcord-2': 'pof-patchcord',
  'easycheck-v2-2': 'easycheck-v2',
  'easyget-wifi-2': 'easyget-wifi',
};

function matchWpPostToProduct(wpSlug, wpTitle) {
  // 1. Check manual map first
  if (MANUAL_SLUG_MAP[wpSlug]) return MANUAL_SLUG_MAP[wpSlug];

  // 2. Direct slug match
  const directMatch = products.find(p => p.slug === wpSlug);
  if (directMatch) return directMatch.slug;

  // 3. Normalize and fuzzy match
  const normalizedWpSlug = wpSlug.replace(/-\d+$/, ''); // strip trailing numbers like "-2"
  const slugMatch = products.find(p => p.slug === normalizedWpSlug);
  if (slugMatch) return slugMatch.slug;

  // 4. Title-based matching
  const wpTitleLower = (wpTitle || '').toLowerCase();
  for (const p of products) {
    const pNameLower = p.name.toLowerCase();
    if (wpTitleLower === pNameLower) return p.slug;
    if (wpTitleLower.includes(pNameLower) || pNameLower.includes(wpTitleLower)) return p.slug;
  }

  return null;
}

// ──────────────────────────────────────────
// Main
// ──────────────────────────────────────────
async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(DATASHEETS_DIR)) {
    fs.mkdirSync(DATASHEETS_DIR, { recursive: true });
    console.log(`Created directory: ${DATASHEETS_DIR}`);
  }

  // Fetch all WordPress posts
  console.log('\n=== Step 1: Fetching WordPress posts ===');
  const wpPosts = await fetchAllPosts();
  console.log(`Found ${wpPosts.length} WordPress posts`);

  // Results tracking
  const report = {
    timestamp: new Date().toISOString(),
    totalProducts: products.length,
    totalWpPosts: wpPosts.length,
    matched: [],         // ✅ Successfully downloaded
    noPdfFound: [],      // ❌ Page found but no PDF
    multiplePdfs: [],    // ⚠️ Multiple PDFs found
    pageNotFound: [],    // 🔴 Could not find WP page
    downloadFailed: [],  // 💥 PDF download or validation failed
    unmatchedWpPosts: [],// 🔶 WP posts that didn't map to any product
    unmappedProducts: [] // 🔵 Products with no WP post found
  };

  // Track which products we've matched
  const matchedProductSlugs = new Set();

  // Process each WP post
  console.log('\n=== Step 2: Processing WordPress posts ===');
  for (let i = 0; i < wpPosts.length; i++) {
    const post = wpPosts[i];
    const wpSlug = post.slug;
    const wpTitle = post.title?.rendered || '';
    const wpLink = post.link;

    console.log(`\n[${i + 1}/${wpPosts.length}] WP: "${wpTitle}" (${wpSlug})`);

    // Try to match to a product
    const productSlug = matchWpPostToProduct(wpSlug, wpTitle);
    if (!productSlug) {
      console.log(`  → No product match found`);
      report.unmatchedWpPosts.push({ wpSlug, wpTitle, wpLink });
      continue;
    }

    if (matchedProductSlugs.has(productSlug)) {
      console.log(`  → Product "${productSlug}" already matched, skipping duplicate`);
      continue;
    }

    console.log(`  → Matched to product: ${productSlug}`);

    // Fetch the actual page HTML
    await sleep(DELAY_MS);
    let html = '';
    try {
      const pageRes = await fetchUrl(wpLink);
      if (pageRes.status !== 200) {
        console.log(`  → Page returned status ${pageRes.status}`);
        report.pageNotFound.push({ productSlug, wpSlug, wpLink, status: pageRes.status });
        continue;
      }
      html = pageRes.body;
    } catch (err) {
      console.log(`  → Failed to fetch page: ${err.message}`);
      report.pageNotFound.push({ productSlug, wpSlug, wpLink, error: err.message });
      continue;
    }

    // Extract PDF URLs
    const pdfUrls = extractSpecPdfUrls(html);
    console.log(`  → Found ${pdfUrls.length} PDF link(s): ${pdfUrls.join(', ') || 'none'}`);

    if (pdfUrls.length === 0) {
      report.noPdfFound.push({ productSlug, wpSlug, wpLink });
      continue;
    }

    if (pdfUrls.length > 1) {
      // Flag for manual review - do NOT guess
      report.multiplePdfs.push({ productSlug, wpSlug, wpLink, pdfUrls });
      console.log(`  ⚠️ Multiple PDFs found - flagged for manual review`);
      continue;
    }

    // Exactly 1 PDF found - confident match
    const pdfUrl = pdfUrls[0];
    const destPath = path.join(DATASHEETS_DIR, `${productSlug}.pdf`);

    console.log(`  → Downloading: ${pdfUrl}`);
    try {
      await sleep(DELAY_MS);
      const dlResult = await downloadFile(pdfUrl, destPath);
      if (!dlResult.ok) {
        console.log(`  → Download failed with status ${dlResult.status}`);
        report.downloadFailed.push({ productSlug, wpSlug, pdfUrl, reason: `HTTP ${dlResult.status}` });
        continue;
      }

      // Validate the downloaded PDF
      if (!validatePdf(destPath)) {
        console.log(`  → Downloaded file is not a valid PDF, removing...`);
        fs.unlinkSync(destPath);
        report.downloadFailed.push({ productSlug, wpSlug, pdfUrl, reason: 'Invalid PDF signature' });
        continue;
      }

      const fileSize = fs.statSync(destPath).size;
      console.log(`  ✅ Successfully downloaded and validated (${(fileSize / 1024).toFixed(1)} KB)`);
      report.matched.push({
        productSlug,
        wpSlug,
        wpLink,
        pdfUrl,
        localPath: `/datasheets/${productSlug}.pdf`,
        fileSize
      });
      matchedProductSlugs.add(productSlug);

    } catch (err) {
      console.log(`  → Download error: ${err.message}`);
      report.downloadFailed.push({ productSlug, wpSlug, pdfUrl, reason: err.message });
      // Clean up partial file
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    }
  }

  // Find products that were never matched
  for (const p of products) {
    if (!matchedProductSlugs.has(p.slug)) {
      const alreadyFlagged = [
        ...report.noPdfFound,
        ...report.multiplePdfs,
        ...report.pageNotFound,
        ...report.downloadFailed
      ].some(r => r.productSlug === p.slug);

      if (!alreadyFlagged) {
        report.unmappedProducts.push({ productSlug: p.slug, productName: p.name });
      }
    }
  }

  // Write report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`\n\n========================================`);
  console.log(`Migration Report Summary`);
  console.log(`========================================`);
  console.log(`✅ Successfully migrated:   ${report.matched.length}`);
  console.log(`⚠️  Multiple PDFs (review): ${report.multiplePdfs.length}`);
  console.log(`❌ No PDF found:            ${report.noPdfFound.length}`);
  console.log(`🔴 Page not found:          ${report.pageNotFound.length}`);
  console.log(`💥 Download failed:         ${report.downloadFailed.length}`);
  console.log(`🔶 Unmatched WP posts:      ${report.unmatchedWpPosts.length}`);
  console.log(`🔵 Unmapped products:       ${report.unmappedProducts.length}`);
  console.log(`========================================`);
  console.log(`Full report written to: ${REPORT_FILE}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
