#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogue = JSON.parse(readFileSync(path.join(rootDir, 'src/data/catalogue.json'), 'utf8'));
const products = JSON.parse(readFileSync(path.join(rootDir, 'src/data/products.json'), 'utf8'));

const sectionCategoryMap = {
  active: { slug: 'active-components', name: 'Active Components', description: 'Active optical modules and switching systems.' },
  passive: { slug: 'passive-components', name: 'Passive Components', description: 'Patchcords, adapters, splitters, and passive assemblies.' },
  cable: { slug: 'cable-management-devices', name: 'Cable Management Devices', description: 'Enclosures, patch panels, racks, and routing hardware.' },
  test: { slug: 'test-measuring-equipment', name: 'Test & Measuring Equipment', description: 'Field test equipment, inspection tools, and meters.' },
  specialty: { slug: 'specialty-products', name: 'Specialty Products', description: 'Specialty assemblies, drone systems, and custom builds.' },
  tools: { slug: 'maintenance-tools', name: 'Maintenance Tools', description: 'Installation, maintenance, and service tools.' },
};

const categoryDescriptionMap = {
  'Active Components': 'Active optical modules and switching systems.',
  'Passive Components': 'Patchcords, adapters, splitters, and passive assemblies.',
  'Cable Management Devices': 'Enclosures, patch panels, racks, and routing hardware.',
  'Test & Measuring Equipment': 'Field test equipment, inspection tools, and meters.',
  'Specialty Products': 'Specialty assemblies, drone systems, and custom builds.',
  'Maintenance Tools': 'Installation, maintenance, and service tools.',
};

function sql(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function json(value) {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeSvg(value) {
  return String(value || '').replace(/\r?\n/g, ' ').trim();
}

const sections = catalogue.sections;
const cards = [];
const mergedProducts = new Map();
const detailBySlug = new Map(products.map((product) => [product.slug, product]));

for (const section of sections) {
  for (let groupIndex = 0; groupIndex < section.groups.length; groupIndex += 1) {
    const group = section.groups[groupIndex];
    const groupSlug = `${section.id}-${slugify(group.subhead || `group-${groupIndex + 1}`)}`;

    for (let cardIndex = 0; cardIndex < group.cards.length; cardIndex += 1) {
      const card = group.cards[cardIndex];
      const detail = detailBySlug.get(card.detailsSlug) || detailBySlug.get(card.slug) || null;
      const productSlug = detail?.slug || card.detailsSlug || card.slug;
      const product = {
        slug: productSlug,
        name: detail?.name || card.name,
        title: detail?.title || `${card.name} | PDR World`,
        category: detail?.category || sectionCategoryMap[section.id]?.name || 'Specialty Products',
        description: detail?.description || card.blurb,
        canonical: detail?.canonical || `https://pdrworld.com/products/${productSlug}`,
        tagline: detail?.tagline || card.blurb,
        heroIcon: escapeSvg(detail?.heroIcon || card.heroSvg || ''),
        features: detail?.features || [],
        applications: detail?.applications || [],
        specs: detail?.specs || [],
        related: detail?.related || [],
        imageUrl: card.img || '',
        sectionId: section.id,
        sectionSlug: section.id,
        groupSlug,
        sortOrder: cardIndex,
        metadata: {
          source: detail ? 'catalogue+detail' : 'catalogue',
          cardSlug: card.slug,
          detailsSlug: card.detailsSlug || card.slug,
          tag: card.tag,
          pills: card.pills,
          addItem: card.addItem,
          sectionId: section.id,
          groupSlug,
        },
      };
      cards.push(product);
      mergedProducts.set(product.slug, product);
    }
  }
}

for (const detail of products) {
  if (mergedProducts.has(detail.slug)) continue;
  const mappedSection = Object.values(sectionCategoryMap).find((entry) => entry.name === detail.category) || null;
  const product = {
    slug: detail.slug,
    name: detail.name,
    title: detail.title,
    category: detail.category,
    description: detail.description,
    canonical: detail.canonical,
    tagline: detail.tagline,
    heroIcon: escapeSvg(detail.heroIcon || ''),
    features: detail.features || [],
    applications: detail.applications || [],
    specs: detail.specs || [],
    related: detail.related || [],
    imageUrl: '',
    sectionId: mappedSection ? Object.keys(sectionCategoryMap).find((key) => sectionCategoryMap[key].slug === mappedSection.slug) : 'specialty',
    sectionSlug: mappedSection ? Object.keys(sectionCategoryMap).find((key) => sectionCategoryMap[key].slug === mappedSection.slug) : 'specialty',
    groupSlug: null,
    sortOrder: 999,
    metadata: { source: 'detail-only' },
  };
  cards.push(product);
  mergedProducts.set(product.slug, product);
}

const seenCategories = new Map();
for (const detail of products) {
  if (!seenCategories.has(detail.category)) {
    seenCategories.set(detail.category, {
      slug: slugify(detail.category),
      name: detail.category,
      description: categoryDescriptionMap[detail.category] || detail.category,
    });
  }
}

const categoryRows = [...seenCategories.values()];
const sectionRows = sections.map((section, index) => ({
  slug: section.id,
  categorySlug: sectionCategoryMap[section.id]?.slug || null,
  eyebrow: section.eyebrow,
  title: section.heading,
  intro: section.intro,
  sortOrder: index,
}));

const groupRows = [];
for (const section of sections) {
  for (let groupIndex = 0; groupIndex < section.groups.length; groupIndex += 1) {
    const group = section.groups[groupIndex];
    groupRows.push({
      sectionSlug: section.id,
      slug: `${section.id}-${slugify(group.subhead || `group-${groupIndex + 1}`)}`,
      title: group.subhead || `Group ${groupIndex + 1}`,
      sortOrder: groupIndex,
    });
  }
}

function insertValueList(rows, columns, rowToValues) {
  return rows
    .map((row) => `insert into public.${columns.table} (${columns.fields.join(', ')}) values (${rowToValues(row)}) on conflict ${columns.conflict || '(slug)'} do update set ${columns.updates};`)
    .join('\n\n');
}

const parts = [];
parts.push('-- Auto-generated from src/data/catalogue.json and src/data/products.json');
parts.push('-- Run this after schema.sql on a fresh Supabase project.');
parts.push('begin;');

parts.push('');
parts.push('-- Categories');
for (const row of categoryRows) {
  parts.push(`insert into public.product_categories (slug, name, description, sort_order) values (${sql(row.slug)}, ${sql(row.name)}, ${sql(row.description)}, 0) on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;`);
}

parts.push('');
parts.push('-- Sections');
for (const row of sectionRows) {
  parts.push(`insert into public.catalog_sections (slug, category_slug, eyebrow, title, intro, sort_order) values (${sql(row.slug)}, ${row.categorySlug ? sql(row.categorySlug) : 'null'}, ${sql(row.eyebrow)}, ${sql(row.title)}, ${sql(row.intro)}, ${row.sortOrder}) on conflict (slug) do update set category_slug = excluded.category_slug, eyebrow = excluded.eyebrow, title = excluded.title, intro = excluded.intro, sort_order = excluded.sort_order;`);
}

parts.push('');
parts.push('-- Groups');
for (const row of groupRows) {
  parts.push(`insert into public.catalog_groups (section_id, slug, title, sort_order) values ((select id from public.catalog_sections where slug = ${sql(row.sectionSlug)}), ${sql(row.slug)}, ${sql(row.title)}, ${row.sortOrder}) on conflict (section_id, slug) do update set title = excluded.title, sort_order = excluded.sort_order;`);
}

parts.push('');
parts.push('-- Products');
for (const product of cards) {
  const categorySlug = slugify(product.category);
  const groupClause = product.groupSlug
    ? `(select id from public.catalog_groups where slug = ${sql(product.groupSlug)} and section_id = (select id from public.catalog_sections where slug = ${sql(product.sectionSlug)}))`
    : 'null';

  parts.push(`insert into public.catalog_products (slug, category_id, section_id, group_id, name, title, tagline, description, canonical_url, hero_icon_svg, image_url, sort_order, status, metadata) values (${sql(product.slug)}, (select id from public.product_categories where slug = ${sql(categorySlug)}), (select id from public.catalog_sections where slug = ${sql(product.sectionSlug)}), ${groupClause}, ${sql(product.name)}, ${sql(product.title)}, ${sql(product.tagline)}, ${sql(product.description)}, ${sql(product.canonical)}, ${sql(product.heroIcon)}, ${sql(product.imageUrl)}, ${product.sortOrder}, 'published', ${json(product.metadata)}) on conflict (slug) do update set category_id = excluded.category_id, section_id = excluded.section_id, group_id = excluded.group_id, name = excluded.name, title = excluded.title, tagline = excluded.tagline, description = excluded.description, canonical_url = excluded.canonical_url, hero_icon_svg = excluded.hero_icon_svg, image_url = excluded.image_url, sort_order = excluded.sort_order, status = excluded.status, metadata = excluded.metadata;`);
}

parts.push('');
parts.push('-- Product features');
for (const product of cards) {
  product.features.forEach((feature, index) => {
    parts.push(`insert into public.catalog_product_features (product_id, position, feature) values ((select id from public.catalog_products where slug = ${sql(product.slug)}), ${index}, ${sql(feature)}) on conflict (product_id, position) do update set feature = excluded.feature;`);
  });
}

parts.push('');
parts.push('-- Product applications');
for (const product of cards) {
  product.applications.forEach((application, index) => {
    parts.push(`insert into public.catalog_product_applications (product_id, position, application) values ((select id from public.catalog_products where slug = ${sql(product.slug)}), ${index}, ${sql(application)}) on conflict (product_id, position) do update set application = excluded.application;`);
  });
}

parts.push('');
parts.push('-- Product specs');
for (const product of cards) {
  product.specs.forEach((spec, index) => {
    parts.push(`insert into public.catalog_product_specs (product_id, position, label, value) values ((select id from public.catalog_products where slug = ${sql(product.slug)}), ${index}, ${sql(spec.label)}, ${sql(spec.value)}) on conflict (product_id, position) do update set label = excluded.label, value = excluded.value;`);
  });
}

parts.push('');
parts.push('-- Product relations');
for (const product of cards) {
  product.related.forEach((relatedProduct, index) => {
    if (!mergedProducts.has(relatedProduct.slug)) return;
    parts.push(`insert into public.catalog_product_relations (product_id, related_product_id, relation_type, position) values ((select id from public.catalog_products where slug = ${sql(product.slug)}), (select id from public.catalog_products where slug = ${sql(relatedProduct.slug)}), 'related', ${index}) on conflict (product_id, related_product_id, relation_type) do update set position = excluded.position;`);
  });
}

parts.push('commit;');

const outputPath = path.join(rootDir, 'supabase/seed.sql');
mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, parts.join('\n'));

console.log(`Generated seed SQL at ${outputPath}`);
console.log(`Categories: ${categoryRows.length}`);
console.log(`Sections: ${sectionRows.length}`);
console.log(`Groups: ${groupRows.length}`);
console.log(`Products: ${cards.length}`);
