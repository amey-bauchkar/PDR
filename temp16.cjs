const fs = require('fs');
const p = JSON.parse(fs.readFileSync('src/data/products.json'));
const slugs = ['high-power-patchcord', 'fo-patchcords', 'field-connector', 'hybrid-adapter'];

const wpData = {
  'high-power-patchcord': { wpTitle: 'High power patch cord', pdfName: 'High-Power-Patch-Cord-Datasheet.pdf' },
  'fo-patchcords': { wpTitle: 'Fiber Optic Patch cords & Pigtails', pdfName: 'Patch-Cord-data-sheet.pdf' },
  'field-connector': { wpTitle: 'Fiber Optic Connector, Field Installable', pdfName: 'Fiber-Optic-Connector-Field-Installable.pdf' },
  'hybrid-adapter': { wpTitle: 'SC/APC FEMALE to SC/UPC MALE Adapter Converter', pdfName: 'SC-APC-FEMALEtoSC-UPC-MALE.pdf' },
};

for (const s of slugs) {
  const prod = p.find(x => x.slug === s);
  const wp = wpData[s];
  console.log('');
  console.log('='.repeat(60));
  console.log('Product slug: ' + s);
  console.log('New site name: ' + prod.name);
  console.log('New site category: ' + prod.category);
  console.log('New site tagline: ' + prod.tagline);
  console.log('Old WP page title: ' + wp.wpTitle);
  console.log('PDF filename: ' + wp.pdfName);
  console.log('PDF file size: ' + (fs.statSync('public/datasheets/' + s + '.pdf').size / 1024).toFixed(1) + ' KB');
  
  // Semantic alignment check
  const newNameLower = prod.name.toLowerCase();
  const wpTitleLower = wp.wpTitle.toLowerCase();
  const pdfLower = wp.pdfName.toLowerCase();
  
  let alignment = 'HIGH';
  let reason = '';
  
  // Check overlap between new name and WP title
  const newWords = newNameLower.split(/[\s,/&-]+/).filter(w => w.length > 2);
  const wpWords = wpTitleLower.split(/[\s,/&-]+/).filter(w => w.length > 2);
  const overlap = newWords.filter(w => wpWords.some(ww => ww.includes(w) || w.includes(ww)));
  
  if (overlap.length >= 2) {
    reason = 'Strong keyword overlap: ' + overlap.join(', ');
  } else if (overlap.length === 1) {
    alignment = 'MEDIUM';
    reason = 'Partial keyword overlap: ' + overlap.join(', ');
  } else {
    alignment = 'LOW';
    reason = 'No obvious keyword overlap';
  }
  
  console.log('Semantic alignment: ' + alignment);
  console.log('Reason: ' + reason);
  console.log('='.repeat(60));
}
