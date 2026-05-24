const fs = require('fs');

const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const report = JSON.parse(fs.readFileSync('datasheet_migration_report.json', 'utf8'));

const unmapped = products.filter(p => !p.datasheetUrl);

console.log(`Unmapped products: ${unmapped.length}`);
console.log(`\n============================`);

for (const p of unmapped) {
    const noPdf = report.noPdfFound?.find(x => x.productSlug === p.slug);
    const multiPdf = report.multiplePdfs?.find(x => x.productSlug === p.slug);
    const notFound = report.pageNotFound?.find(x => x.productSlug === p.slug);
    const downFail = report.downloadFailed?.find(x => x.productSlug === p.slug);
    const unmappedRep = report.unmappedProducts?.find(x => x === p.slug);
    
    let reason = "UNKNOWN";
    if (noPdf) reason = `No PDF link found on old WP page (wpSlug: ${noPdf.wpSlug})`;
    else if (multiPdf) reason = `Multiple PDFs found on WP page (wpSlug: ${multiPdf.wpSlug}) - Skipped for safety`;
    else if (notFound) reason = `WP Page not found or could not match WP slug (wpSlug tried: ${notFound.wpSlug})`;
    else if (downFail) reason = `Download failed for PDF (wpSlug: ${downFail.wpSlug})`;
    else if (unmappedRep) reason = `Listed in unmappedProducts (No obvious WP match)`;
    
    console.log(`- ${p.name} (slug: ${p.slug})`);
    console.log(`  Reason: ${reason}`);
}
