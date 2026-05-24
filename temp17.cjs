const fs = require('fs');
const productsPath = 'src/data/products.json';
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const mappings = {
  'high-power-patchcord': '/datasheets/high-power-patchcord.pdf',
  'fo-patchcords': '/datasheets/fo-patchcords.pdf',
  'field-connector': '/datasheets/field-connector.pdf',
  'hybrid-adapter': '/datasheets/hybrid-adapter.pdf',
};

let updated = 0;
for (const p of products) {
  if (mappings[p.slug]) {
    const old = p.datasheetUrl;
    p.datasheetUrl = mappings[p.slug];
    console.log(`Updated: ${p.slug}`);
    console.log(`  Old datasheetUrl: ${old || '(none)'}`);
    console.log(`  New datasheetUrl: ${p.datasheetUrl}`);
    updated++;
  }
}

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2) + '\n');
console.log(`\nTotal updated: ${updated}`);
console.log(`Total products: ${products.length}`);
console.log(`Products with datasheetUrl: ${products.filter(p => p.datasheetUrl).length}`);
console.log(`Products using fallback: ${products.filter(p => !p.datasheetUrl).length}`);
