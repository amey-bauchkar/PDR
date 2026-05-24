/**
 * Apply Datasheet Mapping
 * 
 * This script reads the migration report and updates products.json
 * ONLY for the 36 successfully validated products.
 * 
 * It adds a "datasheetUrl" field to each matched product.
 * All other fields and unmatched products remain completely untouched.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PRODUCTS_JSON = path.join(ROOT, 'src', 'data', 'products.json');
const REPORT_FILE = path.join(ROOT, 'datasheet_migration_report.json');

// Read migration report
const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
const matchedMap = new Map();
for (const m of report.matched) {
  matchedMap.set(m.productSlug, m.localPath);
}

console.log(`Migration report loaded: ${matchedMap.size} matched products`);

// Read products.json
const raw = fs.readFileSync(PRODUCTS_JSON, 'utf8');
const products = JSON.parse(raw);

let updatedCount = 0;
let skippedCount = 0;

for (const product of products) {
  if (matchedMap.has(product.slug)) {
    product.datasheetUrl = matchedMap.get(product.slug);
    updatedCount++;
    console.log(`  ✅ ${product.slug} → ${product.datasheetUrl}`);
  } else {
    skippedCount++;
  }
}

// Write back with same formatting (2-space indent)
fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 2) + '\n', 'utf8');

console.log(`\n========================================`);
console.log(`✅ Mapped products:     ${updatedCount}`);
console.log(`⬜ Fallback products:   ${skippedCount}`);
console.log(`📦 Total products:      ${products.length}`);
console.log(`========================================`);
console.log(`products.json updated successfully.`);
