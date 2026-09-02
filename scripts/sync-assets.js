import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DS_DIR = path.join(ROOT_DIR, 'public/datasheets');
const DIST_DS_DIR = path.join(ROOT_DIR, 'dist/datasheets');

// Ensure directories exist
if (!fs.existsSync(PUBLIC_DS_DIR)) {
  fs.mkdirSync(PUBLIC_DS_DIR, { recursive: true });
}

function getRemoteFileSize(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          getRemoteFileSize(res.headers.location).then(resolve);
          return;
        }
        const len = res.headers['content-length'];
        resolve(len ? parseInt(len, 10) : null);
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    } catch {
      resolve(null);
    }
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

export async function syncAssets() {
  console.log('🚀 Synchronizing all product datasheets from Supabase (Zero-Egress Mode)...');

  // Load products from src/data/products.json
  const productsPath = path.join(ROOT_DIR, 'src/data/products.json');
  if (!fs.existsSync(productsPath)) {
    console.warn('⚠️ products.json not found, skipping dynamic sync.');
    return;
  }

  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  let syncedCount = 0;
  let skippedCount = 0;

  for (const p of products) {
    if (!p.slug || p.slug === 'easyget-wifi') continue;

    const dsUrl = p.datasheetUrl;
    if (!dsUrl || !dsUrl.includes('supabase.co/storage')) {
      continue;
    }

    const destFilename = `${p.slug}.pdf`;
    const destPath = path.join(PUBLIC_DS_DIR, destFilename);

    const localExists = fs.existsSync(destPath);
    const localSize = localExists ? fs.statSync(destPath).size : 0;

    // Special case: pocket-otdr is compressed locally from 14.36MB to ~1MB, don't re-download 14.36MB unless remote URL changed
    if (p.slug === 'pocket-otdr' && localExists && localSize > 500 * 1024 && localSize < 2 * 1024 * 1024) {
      skippedCount++;
      continue;
    }

    const remoteSize = await getRemoteFileSize(dsUrl);

    // If local file exists and matches remote size, skip download
    if (localExists && remoteSize && localSize === remoteSize) {
      skippedCount++;
      continue;
    }

    // Otherwise download new / updated datasheet
    try {
      console.log(`Downloading updated datasheet for ${p.slug} from Supabase...`);
      await downloadFile(dsUrl, destPath);
      const newSizeKb = (fs.statSync(destPath).size / 1024).toFixed(1);
      console.log(`  ✅ Synced ${destFilename} (${newSizeKb} KB)`);
      syncedCount++;

      // If pocket-otdr is downloaded, compress it immediately
      if (p.slug === 'pocket-otdr' && fs.statSync(destPath).size > 2 * 1024 * 1024) {
        console.log('  Optimizing pocket-otdr.pdf via compress-pdf.py...');
        execSync(`python "${path.join(__dirname, 'compress-pdf.py')}"`, { stdio: 'inherit' });
      }
    } catch (err) {
      console.warn(`  ⚠️ Could not sync ${p.slug}: ${err.message}`);
    }
  }

  console.log(`Asset sync summary: ${syncedCount} downloaded, ${skippedCount} up to date.`);

  // Sync all public/datasheets to dist/datasheets
  if (fs.existsSync(DIST_DS_DIR)) {
    const allFiles = fs.readdirSync(PUBLIC_DS_DIR);
    for (const f of allFiles) {
      if (f.endsWith('.pdf')) {
        const src = path.join(PUBLIC_DS_DIR, f);
        const dst = path.join(DIST_DS_DIR, f);
        fs.copyFileSync(src, dst);
      }
    }
    console.log('✅ Synced all datasheets to dist/datasheets/.');
  }

  console.log('🎉 Full-catalog zero-egress asset synchronization complete!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncAssets().catch(console.error);
}
