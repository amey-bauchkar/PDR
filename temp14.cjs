const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : require('http');
    mod.get(url, { headers: { 'User-Agent': 'PDR-Migration-Bot/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    }).on('error', reject);
  });
}

const targets = [
  { slug: 'high-power-patchcord', wpSlug: 'high-power-patch-cord', wpUrl: 'https://pdrworld.com/high-power-patch-cord/' },
  { slug: 'fo-patchcords', wpSlug: 'fiber-optic-patch-cords-and-pigtails', wpUrl: 'https://pdrworld.com/fiber-optic-patch-cords-and-pigtails/' },
  { slug: 'field-connector', wpSlug: 'fiber-optic-connector-field-installable', wpUrl: 'https://pdrworld.com/fiber-optic-connector-field-installable/' },
  { slug: 'hybrid-adapter', wpSlug: 'sc-apc-female-to-sc-upc-male-adapter-converter', wpUrl: 'https://pdrworld.com/sc-apc-female-to-sc-upc-male-adapter-converter/' },
];

async function run() {
  for (const t of targets) {
    console.log(`\n========================================`);
    console.log(`Product: ${t.slug}`);
    console.log(`WP URL: ${t.wpUrl}`);
    console.log(`========================================`);
    
    try {
      const res = await fetchUrl(t.wpUrl);
      console.log(`HTTP Status: ${res.status}`);
      
      if (res.status !== 200) {
        console.log(`Page not accessible.`);
        continue;
      }
      
      // Extract PDF links
      const pdfRegex = /href=["']([^"']*\.pdf[^"']*)["']/gi;
      const pdfs = [];
      let match;
      while ((match = pdfRegex.exec(res.body)) !== null) {
        const url = match[1];
        if (!url.includes('elementor') && !url.includes('plugin') && !url.includes('theme')) {
          pdfs.push(url);
        }
      }
      const unique = [...new Set(pdfs)];
      console.log(`PDF links found: ${unique.length}`);
      unique.forEach((u, i) => console.log(`  [${i+1}] ${u}`));
      
      // Extract page title
      const titleMatch = res.body.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch) console.log(`Page title: ${titleMatch[1].trim()}`);
      
      // Extract h1
      const h1Match = res.body.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (h1Match) console.log(`H1: ${h1Match[1].trim()}`);
      
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
    
    // Small delay
    await new Promise(r => setTimeout(r, 800));
  }
}

run();
