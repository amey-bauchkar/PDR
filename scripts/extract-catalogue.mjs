#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { load } from 'cheerio';

const SOURCE = '/Users/anurag/Coding/Garage/pdrworld/products.html';
const OUT = '/Users/anurag/Coding/Garage/pdrworld-react/src/data/catalogue.json';

function decode(s) {
  if (!s) return '';
  return s
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const html = readFileSync(SOURCE, 'utf8');
const $ = load(html);

// Hero
const hero = (() => {
  const eyebrow = decode($('.pr-hero .eyebrow').first().text());
  const title = decode($('.pr-hero h1').first().text());
  const subtitle = decode($('.pr-hero h1').first().next('p').text());
  const stats = $('.pr-hero-stats span').map((_, el) => decode($(el).text())).get();
  const pills = $('.pr-cat-nav-panel .pr-cat-pill').map((_, el) => {
    const $el = $(el);
    return {
      href: $el.attr('href') || '',
      name: decode($el.find('.pr-cat-pill-name').text()),
      meta: decode($el.find('.pr-cat-pill-right').text()),
    };
  }).get();
  return { eyebrow, title, subtitle, stats, pills };
})();

// Sticky nav tabs
const tabs = $('.pr-sticky-nav .pr-tab').map((_, el) => {
  const $el = $(el);
  return {
    target: $el.attr('data-target') || '',
    label: decode($el.text()),
  };
}).get();

// Category sections
const sectionIds = ['active', 'passive', 'cable', 'test', 'specialty', 'tools'];
const sections = sectionIds.map((id) => {
  const $sec = $(`section#${id}`);
  if (!$sec.length) return null;
  const eyebrow = decode($sec.find('.eyebrow').first().text());
  const heading = decode($sec.find('h2').first().text());
  const intro = decode($sec.find('.sec-head p').first().text());

  // Walk children to group sub-headings with grids
  const groups = [];
  let current = { subhead: '', cards: [] };
  $sec.find('> .container > *').each((_, el) => {
    const $el = $(el);
    if ($el.hasClass('pr-sub-head') || $el.is('h3.pr-sub-head')) {
      if (current.cards.length || current.subhead) groups.push(current);
      current = { subhead: decode($el.text()), cards: [] };
    } else if ($el.hasClass('pr-grid')) {
      $el.find('.pr-pcard').each((_, card) => {
        const $card = $(card);
        const slug = $card.attr('data-product') || '';
        const tag = decode($card.find('.pr-prod-tag').text());
        const img = $card.find('img').attr('src') || '';
        const inlineSvg = $card.find('.pr-pcard-art > svg').first();
        const heroSvg = inlineSvg.length ? $.html(inlineSvg) : '';
        const name = decode($card.find('.pr-pcard-body h3').text());
        const blurb = decode($card.find('.pr-pcard-body p').first().text());
        const pills = $card.find('.pr-spec-pill').map((_, p) => decode($(p).text())).get();
        const detailsHref = $card.find('.pr-prod-cta a').attr('href') || '';
        const detailsSlug = detailsHref.replace(/\.html$/, '');
        const addBtn = $card.find('.add-to-quote-btn');
        const addItem = {
          title: addBtn.attr('data-title') || name,
          specs: addBtn.attr('data-specs') || 'Standard Factory Specs',
          image: addBtn.attr('data-img') || img || '',
        };
        current.cards.push({
          slug,
          tag,
          img: img ? '/' + img : '',
          heroSvg,
          name,
          blurb,
          pills,
          detailsSlug,
          addItem,
        });
      });
    }
  });
  if (current.cards.length || current.subhead) groups.push(current);

  return { id, eyebrow, heading, intro, groups };
}).filter(Boolean);

const catalogue = { hero, tabs, sections };
writeFileSync(OUT, JSON.stringify(catalogue, null, 2));

const totalCards = sections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.cards.length, 0), 0);
console.log(`Catalogue extracted → ${OUT}`);
console.log(`  hero pills: ${hero.pills.length}`);
console.log(`  sticky tabs: ${tabs.length}`);
console.log(`  sections: ${sections.length}`);
console.log(`  total cards: ${totalCards}`);
sections.forEach((s) => {
  const cards = s.groups.reduce((n, g) => n + g.cards.length, 0);
  console.log(`    #${s.id} "${s.heading}" → ${s.groups.length} groups, ${cards} cards`);
});
