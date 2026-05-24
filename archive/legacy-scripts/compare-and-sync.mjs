#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { load } from 'cheerio';

const PAGES = {
  'passive-components': 'Passive Components',
  'active-components': 'Active Components',
  'cable-management-devices': 'Cable Management Devices',
  'test-measuring-equipment': 'Test & Measuring Equipment',
  'specialty-products': 'Specialty Products',
  'maintenance-tool': 'Maintenance Tools',
};

// Map live category labels to our catalogue.json section ids
const SECTION_BY_LABEL = {
  'Passive Components': 'passive',
  'Active Components': 'active',
  'Cable Management Devices': 'cable',
  'Test & Measuring Equipment': 'test',
  'Specialty Products': 'specialty',
  'Maintenance Tools': 'tools',
};

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\//g, '-')
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalize(t) {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const live = {};
for (const [slug, label] of Object.entries(PAGES)) {
  const html = readFileSync(`/tmp/cat-${slug}.html`, 'utf8');
  const $ = load(html);
  const items = [];
  $('article, .elementor-post').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.elementor-post__title a, .elementor-post__title').first().text().trim();
    const link = $el.find('.elementor-post__title a').attr('href') || '';
    const img =
      $el.find('img').attr('src') ||
      $el.find('img').attr('data-src') ||
      $el.find('.elementor-post__thumbnail img').attr('src') ||
      '';
    if (title) items.push({ title, link, img });
  });
  const seen = new Set();
  live[label] = items.filter((i) => {
    if (seen.has(i.title)) return false;
    seen.add(i.title);
    return true;
  });
}

// Load current catalogue
const cataloguePath = '/Users/anurag/Coding/Garage/pdrworld-react/src/data/catalogue.json';
const catalogue = JSON.parse(readFileSync(cataloguePath, 'utf8'));

// Build a map of existing card names per section
const existing = {};
for (const sec of catalogue.sections) {
  existing[sec.id] = new Set();
  for (const g of sec.groups) for (const c of g.cards) existing[sec.id].add(normalize(c.name));
}

// Diff
const additions = {};
let totalAdditions = 0;
for (const [label, items] of Object.entries(live)) {
  const sectionId = SECTION_BY_LABEL[label];
  additions[sectionId] = [];
  for (const it of items) {
    if (!existing[sectionId].has(normalize(it.title))) {
      additions[sectionId].push(it);
      totalAdditions++;
    }
  }
}

console.log(`Total missing additions: ${totalAdditions}`);
for (const [sec, adds] of Object.entries(additions)) {
  if (!adds.length) continue;
  console.log(`\n#${sec}: ${adds.length} missing`);
  for (const a of adds) console.log(`  + ${a.title}\n      slug: ${slugifyTitle(a.title)}\n      img: ${a.img.split('/').pop()}`);
}

// Also find existing products on live whose images we should adopt
const liveImgBySlug = {};
const liveImgByName = {};
for (const items of Object.values(live)) {
  for (const it of items) {
    if (!it.img) continue;
    liveImgByName[normalize(it.title)] = it.img;
    if (it.link) {
      const m = it.link.match(/pdrworld\.com\/([^/]+)/);
      if (m) liveImgBySlug[m[1]] = it.img;
    }
  }
}

// Download images
const IMG_DIR = '/Users/anurag/Coding/Garage/pdrworld-react/public/images/live';
mkdirSync(IMG_DIR, { recursive: true });

async function downloadAll() {
  const tasks = [];
  for (const items of Object.values(live)) {
    for (const it of items) {
      if (!it.img) continue;
      const slug = slugifyTitle(it.title);
      const ext = (it.img.match(/\.(png|jpe?g|webp|gif)/i) || [, 'png'])[1].toLowerCase().replace('jpeg', 'jpg');
      const out = join(IMG_DIR, `${slug}.${ext}`);
      if (existsSync(out)) {
        it.localPath = `/images/live/${slug}.${ext}`;
        continue;
      }
      tasks.push(
        fetch(it.img)
          .then((r) => r.arrayBuffer())
          .then((buf) => {
            mkdirSync(dirname(out), { recursive: true });
            writeFileSync(out, Buffer.from(buf));
            it.localPath = `/images/live/${slug}.${ext}`;
            console.log(`  ✓ ${slug}.${ext}`);
          })
          .catch((e) => console.error(`  ✗ ${slug}: ${e.message}`)),
      );
    }
  }
  await Promise.all(tasks);
}

console.log('\nDownloading images...');
await downloadAll();

// Update catalogue: append missing cards + repoint existing cards' images
function makeCard(item) {
  const slug = slugifyTitle(item.title);
  return {
    slug,
    tag: '',
    img: item.localPath || '',
    heroSvg: '',
    name: item.title,
    blurb: '',
    pills: [],
    detailsSlug: slug,
    addItem: {
      title: item.title,
      specs: 'Standard Factory Specs',
      image: item.localPath || '',
    },
  };
}

let cardsRepointed = 0;
let cardsAppended = 0;
for (const sec of catalogue.sections) {
  // Repoint existing cards' images if we have a live one
  for (const g of sec.groups) {
    for (const c of g.cards) {
      const liveImg = liveImgByName[normalize(c.name)];
      if (liveImg) {
        const slug = slugifyTitle(c.name);
        const ext = (liveImg.match(/\.(png|jpe?g|webp|gif)/i) || [, 'png'])[1].toLowerCase().replace('jpeg', 'jpg');
        const localPath = `/images/live/${slug}.${ext}`;
        if (existsSync(join('/Users/anurag/Coding/Garage/pdrworld-react/public', localPath.slice(1)))) {
          if (c.img !== localPath) {
            c.img = localPath;
            if (c.addItem) c.addItem.image = localPath;
            cardsRepointed++;
          }
        }
      }
    }
  }

  // Append missing
  const missing = additions[sec.id] || [];
  if (missing.length) {
    // Pick the LAST group (or create a "More" group)
    let target = sec.groups[sec.groups.length - 1];
    if (!target) {
      target = { subhead: '', cards: [] };
      sec.groups.push(target);
    }
    for (const m of missing) {
      target.cards.push(makeCard(m));
      cardsAppended++;
    }
  }
}

writeFileSync(cataloguePath, JSON.stringify(catalogue, null, 2));
console.log(`\nWrote catalogue: +${cardsAppended} new cards, ${cardsRepointed} cards repointed to live images`);
