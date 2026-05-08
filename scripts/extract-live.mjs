#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

const PAGES = {
  'passive-components': 'Passive Components',
  'active-components': 'Active Components',
  'cable-management-devices': 'Cable Management Devices',
  'test-measuring-equipment': 'Test & Measuring Equipment',
  'specialty-products': 'Specialty Products',
  'maintenance-tool': 'Maintenance Tools',
};

const all = {};
for (const [slug, label] of Object.entries(PAGES)) {
  const html = readFileSync(`/tmp/cat-${slug}.html`, 'utf8');
  const $ = load(html);
  const items = [];
  $('article, .elementor-post').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.elementor-post__title a, .elementor-post__title').first().text().trim();
    const link = $el.find('.elementor-post__title a').attr('href') || $el.find('a').attr('href') || '';
    const img =
      $el.find('img').attr('src') ||
      $el.find('img').attr('data-src') ||
      $el.find('.elementor-post__thumbnail img').attr('src') ||
      '';
    if (title) items.push({ title, link, img });
  });
  // Dedupe by title
  const seen = new Set();
  const unique = items.filter((i) => {
    if (seen.has(i.title)) return false;
    seen.add(i.title);
    return true;
  });
  all[label] = unique;
}

for (const [label, items] of Object.entries(all)) {
  console.log(`\n=== ${label} (${items.length}) ===`);
  for (const it of items) console.log(`  - ${it.title}\n      img: ${it.img.slice(-80)}\n      link: ${it.link}`);
}
