#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { load } from 'cheerio';

const SOURCE_DIR = '/Users/anurag/Coding/Garage/pdrworld';
const OUT = '/Users/anurag/Coding/Garage/pdrworld-react/src/data/products.json';

const SKIP = new Set([
  'index.html',
  'about.html',
  'products.html',
  'solutions.html',
  'resources.html',
  'contact.html',
  '404.html',
  'admin.html',
  'cable-configurator.html',
  'fiber-selector.html',
  'original_index.html',
  '5in1-opm.html',
]);

function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extract(html, slug) {
  const $ = load(html);

  const title = $('title').text().trim();
  const description = $('meta[name="description"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';

  // Breadcrumb: the third span (after Home / Products / <category>) — pull category text
  const breadcrumb = $('main .breadcrumb');
  let category = '';
  if (breadcrumb.length) {
    const spans = breadcrumb.find('span');
    if (spans.length >= 1) {
      category = decodeEntities(spans.eq(0).text());
    }
  }

  // Hero icon SVG: first <svg> inside the aspect-ratio image box (the one with "color: #4A9FD8" container)
  let heroIcon = '';
  const heroBox = $('main section').first().find('div[style*="aspect-ratio"]').first();
  if (heroBox.length) {
    const svg = heroBox.find('svg').first();
    if (svg.length) heroIcon = $.html(svg);
  }

  // Product name (h1) + tagline (first p after h1 in the same row)
  const h1 = $('main h1').first().text().trim();
  let tagline = '';
  const heroPara = $('main h1').first().nextAll('p').first();
  if (heroPara.length) tagline = decodeEntities(heroPara.text());

  // Features (the first ul in the second section under the "Key Features" h3)
  const features = [];
  const applications = [];
  let mode = null;
  $('main section').eq(1).find('h3, ul').each((_, el) => {
    const tag = el.tagName;
    if (tag === 'h3') {
      const t = $(el).text().toLowerCase();
      if (t.includes('feature')) mode = 'features';
      else if (t.includes('application')) mode = 'applications';
      else mode = null;
    } else if (tag === 'ul' && mode) {
      $(el).find('li').each((_, li) => {
        const text = decodeEntities($(li).text());
        if (text) (mode === 'features' ? features : applications).push(text);
      });
    }
  });

  // Specs table: rows of th/td
  const specs = [];
  $('main table tr').each((_, tr) => {
    const th = $(tr).find('th').text().trim();
    const td = $(tr).find('td').text().trim();
    if (th && td) specs.push({ label: decodeEntities(th), value: decodeEntities(td) });
  });

  // Related products: anchors in the third section
  const related = [];
  $('main section').eq(2).find('a[href$=".html"]').each((_, a) => {
    const href = $(a).attr('href');
    if (!href || href === 'products.html') return;
    const relSlug = href.replace(/\.html$/, '');
    const relName = decodeEntities($(a).find('h4').first().text());
    if (relSlug && relName) related.push({ slug: relSlug, name: relName });
  });

  return {
    slug,
    name: h1 || slug,
    category,
    title,
    description,
    canonical,
    tagline,
    heroIcon,
    features,
    applications,
    specs,
    related,
  };
}

const files = readdirSync(SOURCE_DIR)
  .filter((f) => f.endsWith('.html') && !SKIP.has(f))
  .sort();

const products = [];
const errors = [];

for (const file of files) {
  try {
    const html = readFileSync(join(SOURCE_DIR, file), 'utf8');
    const slug = basename(file, '.html');
    const p = extract(html, slug);
    products.push(p);
  } catch (e) {
    errors.push(`${file}: ${e.message}`);
  }
}

writeFileSync(OUT, JSON.stringify(products, null, 2));

console.log(`Extracted ${products.length} products → ${OUT}`);
if (errors.length) {
  console.error('Errors:');
  errors.forEach((e) => console.error('  ' + e));
}

// Sanity preview
console.log('\nSample (first product):');
const s = products[0];
console.log(`  slug: ${s.slug}`);
console.log(`  name: ${s.name}`);
console.log(`  category: ${s.category}`);
console.log(`  tagline: ${s.tagline}`);
console.log(`  features: ${s.features.length}`);
console.log(`  applications: ${s.applications.length}`);
console.log(`  specs: ${s.specs.length}`);
console.log(`  related: ${s.related.length}`);
console.log(`  hero icon: ${s.heroIcon ? `${s.heroIcon.length} chars` : 'MISSING'}`);
