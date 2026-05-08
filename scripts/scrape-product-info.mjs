#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { load } from 'cheerio';

const CATALOGUE = '/Users/anurag/Coding/Garage/pdrworld-react/src/data/catalogue.json';
const CACHE_DIR = '/tmp/pdr-product-cache';
mkdirSync(CACHE_DIR, { recursive: true });

// Live URL slug overrides — many products have URL slugs that differ from our internal slugs
const URL_SLUG_OVERRIDES = {
  'autoget-wifi-intelligent-fiber-endface-microscope': 'autoget-wifi',
  'twoway-fiber-polarity-and-return-loss-meter': 'return-loss-meter',
  'easyget-wifi-wireless-fiber-endface-microscope': 'easyget-wifi',
  'easycheck-v2-digital-fiber-endface-inspector': 'easycheck-v2-digital-fiber-endface-inspector',
  'cwdm-mux-demux-module': 'cwdm-mux-and-demux-module',
  'fiber-optic-transceivers-sfp': 'fiber-optic-transceivers-spf',
  'fiber-optic-splitter-closure-gjs-2016': 'optical-distribution-frames-2',
  'home-termination-box-htb': 'home-termination-box',
  'fiber-distribution-box-fdb': 'fiber-distribution-box',
  'fiber-optic-cleaner-pen-mpo': 'fiber-optic-cleaner-pen-mpo',
  'fiber-cleaver-clv-b1': 'fiber-cleaver-clv-b1',
  'fiber-optic-connector-field-installable': 'fiber-optic-connector-field-installable',
  'fiber-optic-patch-cords-and-pigtails': 'fiber-optic-patch-cords-and-pigtails',
  'rapid-push-cable-assembly': 'rapid-push-cable-assembly',
  'sc-apc-female-to-sc-upc-male-adapter-converter': 'sc-apc-female-to-sc-upc-male-adapter-converter',
  'mode-conditioning-patchcord': 'mode-conditioning-patch-cord',
  'fiber-optic-termination-box-model-tb-c08': 'fiber-optic-termination-box-model-tb-c08',
  'fiber-optic-termination-box-model-din-fb': 'fiber-optic-termination-box-model-din-fb',
  'wall-mount-enclosure-model-ftb-r24': 'wall-mount-enclosure-model-ftb-r24',
  'fiber-optic-termination-box-ftb-08b-2': 'fiber-optic-termination-box-ftb-08b-2',
  'fiber-distribution-box-fdb-32': 'fiber-distribution-box-fdb-32',
  'optical-line-protection-system': 'optical-line-protection-system',
  'high-power-patch-cord': 'high-power-patch-cord',
  'cold-shrink-sleeve': 'cold-shrink-sleeve',
};

async function fetchOnce(slug) {
  const cached = `${CACHE_DIR}/${slug}.html`;
  if (existsSync(cached)) return readFileSync(cached, 'utf8');
  const url = `https://pdrworld.com/${slug}/`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) return null;
    const html = await r.text();
    writeFileSync(cached, html);
    return html;
  } catch {
    return null;
  }
}

async function fetchProduct(slug) {
  const tried = new Set();
  const candidates = [URL_SLUG_OVERRIDES[slug] || slug, slug];
  // Heuristic shortenings: remove suffixes like " - intelligent...", "-wireless...", etc.
  const short = slug.replace(/-(intelligent|wireless|digital).*$/, '');
  if (short !== slug) candidates.push(short);
  for (const c of candidates) {
    if (tried.has(c)) continue;
    tried.add(c);
    const html = await fetchOnce(c);
    if (html) return html;
  }
  return null;
}

function extract(html) {
  const $ = load(html);
  // Pick the longest substantive text-editor widget (skip the lorem-ipsum stub)
  let target = null;
  let targetLen = 0;
  $('.elementor-widget-text-editor .elementor-widget-container').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text.length < 100) return;
    if (text.toLowerCase().includes('lorem ipsum')) return;
    if (text.toLowerCase().startsWith('interested in a product')) return;
    if (text.length > targetLen) {
      target = $(el);
      targetLen = text.length;
    }
  });
  if (!target) return null;

  const raw = target.html() || '';
  const cleaned = raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

  const fullText = load(cleaned).text();

  // Try to identify section headers (anything in <font color="#070446"> or <b><u> blocks).
  // Fallback: take first long paragraph as description.
  const HEADERS = /(General Description|General|Description|Overview|Features|Applications?|Standards Compliance|Specifications?)/gi;
  const parts = cleaned.split(HEADERS);
  const sections = {};
  if (parts.length >= 3) {
    for (let i = 1; i < parts.length; i += 2) {
      const k = parts[i].toLowerCase().replace(/\s+/g, '');
      const normalized =
        k === 'generaldescription' || k === 'general' || k === 'overview' ? 'description' : k;
      const text = load(parts[i + 1] || '').text().trim();
      if (!sections[normalized] || text.length > sections[normalized].length) sections[normalized] = text;
    }
  }

  // Description: prefer parsed section, else first paragraph from fullText
  let description = sections.description || '';
  if (!description) {
    const paras = fullText.split(/\n{2,}|\.\s+(?=[A-Z])/).map((p) => p.trim()).filter((p) => p.length > 50);
    description = paras[0] || fullText.slice(0, 280);
  }

  const splitToList = (str) =>
    (str || '')
      .split(/[\n•]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2 && s.length < 120)
      .slice(0, 6);

  const features = splitToList(sections.features || sections.standardscompliance);
  const applications = splitToList(sections.applications || sections.application);

  return { description, features, applications };
}

function deriveBlurb(text) {
  if (!text) return '';
  const s = text.replace(/\s+/g, ' ').trim();
  // First sentence or 180 chars max
  const firstStop = s.search(/[.!?](\s|$)/);
  const cut = firstStop > 30 && firstStop < 220 ? firstStop + 1 : 180;
  return s.slice(0, cut).trim();
}

function pickPills(features) {
  // Take 2-3 short feature labels suitable for chips
  const candidates = features
    .map((f) => f.replace(/\s*\([^)]+\)/g, '').trim())
    .map((f) => f.split(/[—,;:]/)[0].trim())
    .filter((f) => f && f.length <= 28);
  return candidates.slice(0, 3);
}

const catalogue = JSON.parse(readFileSync(CATALOGUE, 'utf8'));
const allCards = catalogue.sections.flatMap((s) => s.groups.flatMap((g) => g.cards));
console.log(`Total cards: ${allCards.length}`);

let updated = 0;
let skipped = 0;
let failed = 0;

for (const card of allCards) {
  const slug = card.detailsSlug || card.slug;
  if (!slug) { skipped++; continue; }
  // Skip if already populated AND has at least one pill
  if (card.blurb && card.blurb.length > 20 && card.pills?.length) { skipped++; continue; }

  const html = await fetchProduct(slug);
  if (!html) {
    console.log(`  ✗ ${slug}: fetch failed`);
    failed++;
    continue;
  }
  const data = extract(html);
  if (!data || !data.description) {
    // Try alt slug variants for known mismatches
    const alts = [];
    if (slug.includes('twoway')) alts.push('return-loss-meter');
    if (slug === 'fiber-optic-transceivers-sfp') alts.push('fiber-optic-transceivers-spf');
    if (slug === 'cwdm-mux-demux-module') alts.push('cwdm-mux-and-demux-module');
    if (slug === 'fiber-optic-splitter-closure-gjs-2016') alts.push('optical-distribution-frames-2');
    if (slug === 'home-termination-box-htb') alts.push('home-termination-box');
    if (slug === 'fiber-distribution-box-fdb') alts.push('fiber-distribution-box');
    let altHtml = null;
    for (const a of alts) {
      altHtml = await fetchProduct(a);
      if (altHtml) {
        const altData = extract(altHtml);
        if (altData && altData.description) {
          if (!card.blurb) card.blurb = deriveBlurb(altData.description);
          if (!card.pills?.length) card.pills = pickPills(altData.features);
          updated++;
          console.log(`  + ${slug} (via ${a})`);
          break;
        }
      }
    }
    if (!altHtml || !extract(altHtml)?.description) {
      console.log(`  ? ${slug}: no description widget`);
      failed++;
    }
    continue;
  }
  if (!card.blurb) card.blurb = deriveBlurb(data.description);
  if (!card.pills?.length) card.pills = pickPills(data.features);
  updated++;
  if (updated % 10 === 0) console.log(`  ... ${updated} updated`);
}

writeFileSync(CATALOGUE, JSON.stringify(catalogue, null, 2));
console.log(`\nDone: +${updated} updated, ${skipped} skipped, ${failed} failed`);
