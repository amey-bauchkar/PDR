const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be configured in .env');
  process.exit(1);
}

const client = createClient(url, anonKey);

// Path to data files in pdrworld-react
const REACT_DIR = path.join(__dirname, '../pdrworld-react');
const PRODUCTS_JSON_PATH = path.join(REACT_DIR, 'src/data/products.json');
const CATALOGUE_JSON_PATH = path.join(REACT_DIR, 'src/data/catalogue.json');

async function seed() {
  try {
    console.log('Reading seed data from source files...');
    const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8'));
    const catalogueData = JSON.parse(fs.readFileSync(CATALOGUE_JSON_PATH, 'utf8'));

    console.log(`Loaded ${productsData.length} products and ${catalogueData.sections.length} catalogue sections.`);

    // 1. Clear existing database rows in correct dependency order
    console.log('Clearing old database entries...');
    await client.from('catalog_product_relations').delete().neq('id', 0);
    await client.from('catalog_product_specs').delete().neq('id', 0);
    await client.from('catalog_product_applications').delete().neq('id', 0);
    await client.from('catalog_product_features').delete().neq('id', 0);
    await client.from('catalog_products').delete().neq('id', 0);
    await client.from('catalog_groups').delete().neq('id', 0);
    await client.from('catalog_sections').delete().neq('id', 0);
    await client.from('product_categories').delete().neq('id', 0);

    console.log('Old entries cleared successfully.');

    // 2. Insert Categories
    console.log('Seeding product_categories...');
    const categoryRows = catalogueData.tabs.map((tab, idx) => ({
      slug: tab.target,
      name: tab.label,
      description: `Category for ${tab.label}`,
      sort_order: idx
    }));

    const { data: dbCategories, error: catError } = await client
      .from('product_categories')
      .insert(categoryRows)
      .select();

    if (catError) throw catError;
    console.log(`Seeded ${dbCategories.length} product_categories.`);

    // Create a mapping of category slug -> DB category ID
    const catMap = new Map(dbCategories.map(c => [c.slug, c.id]));

    // 3. Insert Sections
    console.log('Seeding catalog_sections...');
    const sectionRows = catalogueData.sections.map((sec, idx) => ({
      slug: sec.id,
      category_slug: sec.id,
      eyebrow: sec.eyebrow,
      title: sec.heading,
      intro: sec.intro,
      sort_order: idx
    }));

    const { data: dbSections, error: secError } = await client
      .from('catalog_sections')
      .insert(sectionRows)
      .select();

    if (secError) throw secError;
    console.log(`Seeded ${dbSections.length} catalog_sections.`);

    // Create mapping of section slug -> DB section ID
    const secMap = new Map(dbSections.map(s => [s.slug, s.id]));

    // 4. Insert Groups
    console.log('Seeding catalog_groups...');
    const groupRows = [];
    catalogueData.sections.forEach(sec => {
      const sectionId = secMap.get(sec.id);
      if (!sectionId) return;

      sec.groups.forEach((grp, idx) => {
        const slug = grp.subhead.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        groupRows.push({
          section_id: sectionId,
          slug: slug,
          title: grp.subhead,
          sort_order: idx
        });
      });
    });

    const { data: dbGroups, error: grpError } = await client
      .from('catalog_groups')
      .insert(groupRows)
      .select();

    if (grpError) throw grpError;
    console.log(`Seeded ${dbGroups.length} catalog_groups.`);

    // Create mapping of group title -> DB group ID
    const grpMap = new Map(dbGroups.map(g => [g.title, g.id]));

    // 5. Insert Products
    console.log('Seeding catalog_products and related features/specs...');
    
    // We map category strings in products.json to the correct database categories
    // Map of "Active Components" -> "active", "Passive Components" -> "passive", etc.
    const catNameToSlug = {
      'Active Components': 'active',
      'Passive Components': 'passive',
      'Cable Management': 'cable',
      'Cable Management Devices': 'cable',
      'Test & Measuring': 'test',
      'Test & Measuring Equipment': 'test',
      'Specialty & Drones': 'specialty',
      'Optical Fiber Drone': 'specialty',
      'Maintenance Tools': 'tools'
    };

    for (let i = 0; i < productsData.length; i++) {
      const prod = productsData[i];
      const categorySlug = catNameToSlug[prod.category] || 'active';
      const categoryId = catMap.get(categorySlug) || null;
      const sectionId = secMap.get(categorySlug) || null;

      // Find the group in the catalogue sections
      let groupId = null;
      const secData = catalogueData.sections.find(s => s.id === categorySlug);
      if (secData) {
        const matchingGrp = secData.groups.find(g => 
          g.cards.some(c => c.slug === prod.slug)
        );
        if (matchingGrp) {
          groupId = grpMap.get(matchingGrp.subhead) || null;
        }
      }

      // Prepare metadata
      const specsMap = {};
      if (prod.specs) {
        prod.specs.forEach(s => {
          specsMap[s.label] = s.value;
        });
      }

      const environment = specsMap['Environment'] || specsMap['Installation'] || 'Indoor/Outdoor';
      const mountType = specsMap['Mount Type'] || specsMap['Mounting'] || 'Rack Mount';
      const capacityRaw = specsMap['Capacity'] || specsMap['Ports'] || '';
      const capacityVal = parseInt(capacityRaw) || 0;

      const productRow = {
        slug: prod.slug,
        category_id: categoryId,
        section_id: sectionId,
        group_id: groupId,
        name: prod.name,
        title: prod.title || `${prod.name} | PDR World`,
        tagline: prod.tagline || prod.description || '',
        description: prod.description || '',
        canonical_url: prod.canonical || `https://pdrworld.com/products/${prod.slug}`,
        hero_icon_svg: prod.heroIcon || '',
        image_url: prod.imageUrl || '',
        sort_order: i,
        status: 'published',
        metadata: {
          environment: environment,
          mount_type: mountType,
          capacity: capacityVal,
          specs: specsMap
        }
      };

      const { data: dbProd, error: prodError } = await client
        .from('catalog_products')
        .insert(productRow)
        .select()
        .single();

      if (prodError) {
        console.error(`Failed to insert product ${prod.slug}:`, prodError.message);
        continue;
      }

      const dbProdId = dbProd.id;

      // Insert Features
      if (prod.features && prod.features.length > 0) {
        const featureRows = prod.features.map((f, idx) => ({
          product_id: dbProdId,
          position: idx,
          feature: f
        }));
        await client.from('catalog_product_features').insert(featureRows);
      }

      // Insert Applications
      if (prod.applications && prod.applications.length > 0) {
        const appRows = prod.applications.map((a, idx) => ({
          product_id: dbProdId,
          position: idx,
          application: a
        }));
        await client.from('catalog_product_applications').insert(appRows);
      }

      // Insert Specs
      if (prod.specs && prod.specs.length > 0) {
        const specRows = prod.specs.map((s, idx) => ({
          product_id: dbProdId,
          position: idx,
          label: s.label,
          value: s.value
        }));
        await client.from('catalog_product_specs').insert(specRows);
      }
    }

    console.log('All products and detail relations seeded successfully!');
    console.log('Database seeding finished.');
  } catch (error) {
    console.error('Seeding crashed with error:', error);
  }
}

seed();
