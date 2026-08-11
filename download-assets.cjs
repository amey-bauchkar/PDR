const fs = require('fs');
const path = require('path');
const https = require('https');

const productsPath = path.join(__dirname, 'src', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const imgDir = path.join(__dirname, 'public', 'images', 'products');
const dsDir = path.join(__dirname, 'public', 'datasheets');

if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
if (!fs.existsSync(dsDir)) fs.mkdirSync(dsDir, { recursive: true });

function getExtFromUrl(url) {
  const match = url.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?|$)/i);
  return match ? match[1].toLowerCase() : 'png';
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(destPath);
        resolve(stats.size);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function main() {
  console.log(`Found ${products.length} products\n`);

  // Download images
  const supabaseImages = products.filter(p => (p.imageUrl || '').includes('supabase.co/storage'));
  console.log(`=== IMAGES: ${supabaseImages.length} products with Supabase Storage URLs ===\n`);

  let imgSuccess = 0, imgFail = 0;
  for (const p of supabaseImages) {
    const ext = getExtFromUrl(p.imageUrl);
    const dest = path.join(imgDir, `${p.slug}.${ext}`);
    try {
      const size = await downloadFile(p.imageUrl, dest);
      console.log(`  OK ${p.slug}.${ext} (${(size / 1024).toFixed(1)} KB)`);
      imgSuccess++;
    } catch (err) {
      console.log(`  FAIL ${p.slug}: ${err.message}`);
      imgFail++;
    }
  }

  // Download datasheets
  const supabaseDatasheets = products.filter(p => (p.datasheetUrl || '').includes('supabase.co/storage'));
  console.log(`\n=== DATASHEETS: ${supabaseDatasheets.length} products with Supabase Storage URLs ===\n`);

  let dsSuccess = 0, dsFail = 0;
  for (const p of supabaseDatasheets) {
    const dest = path.join(dsDir, `${p.slug}.pdf`);
    try {
      const size = await downloadFile(p.datasheetUrl, dest);
      console.log(`  OK ${p.slug}.pdf (${(size / 1024).toFixed(1)} KB)`);
      dsSuccess++;
    } catch (err) {
      console.log(`  FAIL ${p.slug}: ${err.message}`);
      dsFail++;
    }
  }

  // Generate mapping for assetUrl.ts
  const imageMapping = {};
  for (const p of supabaseImages) {
    const ext = getExtFromUrl(p.imageUrl);
    imageMapping[p.slug] = `/images/products/${p.slug}.${ext}`;
  }
  const dsMapping = {};
  for (const p of supabaseDatasheets) {
    dsMapping[p.slug] = `/datasheets/${p.slug}.pdf`;
  }

  fs.writeFileSync(
    path.join(__dirname, 'asset-mapping.json'),
    JSON.stringify({ images: imageMapping, datasheets: dsMapping }, null, 2)
  );

  console.log(`\n=== SUMMARY ===`);
  console.log(`Images:     ${imgSuccess} downloaded, ${imgFail} failed`);
  console.log(`Datasheets: ${dsSuccess} downloaded, ${dsFail} failed`);
  console.log(`Mapping saved to asset-mapping.json`);
}

main().catch(console.error);
