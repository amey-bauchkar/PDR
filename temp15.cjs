const https = require('https');
const fs = require('fs');
const path = require('path');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : require('http');
    mod.get(url, { headers: { 'User-Agent': 'PDR-Migration-Bot/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return resolve({ ok: false, status: res.statusCode });
      }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => ws.close(() => resolve({ ok: true })));
      ws.on('error', reject);
    }).on('error', reject);
  });
}

function validatePdf(filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size < 100) return { valid: false, reason: 'Too small' };
    const buf = Buffer.alloc(5);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, 5, 0);
    fs.closeSync(fd);
    if (buf.toString('ascii') !== '%PDF-') return { valid: false, reason: 'Invalid PDF header' };
    return { valid: true, size: stat.size };
  } catch (e) {
    return { valid: false, reason: e.message };
  }
}

const downloads = [
  { slug: 'high-power-patchcord', url: 'https://pdrworld.com/wp-content/uploads/2023/04/High-Power-Patch-Cord-Datasheet.pdf' },
  { slug: 'fo-patchcords', url: 'https://pdrworld.com/wp-content/uploads/2022/12/Patch-Cord-data-sheet.pdf' },
  { slug: 'field-connector', url: 'https://pdrworld.com/wp-content/uploads/2022/12/Fiber-Optic-Connector-Field-Installable.pdf' },
  { slug: 'hybrid-adapter', url: 'https://pdrworld.com/wp-content/uploads/2022/12/SC-APC-FEMALEtoSC-UPC-MALE.pdf' },
];

const DEST_DIR = path.join(__dirname, 'public', 'datasheets');

async function run() {
  for (const d of downloads) {
    const dest = path.join(DEST_DIR, `${d.slug}.pdf`);
    console.log(`\nDownloading: ${d.slug}`);
    console.log(`  Source: ${d.url}`);
    console.log(`  Dest: ${dest}`);
    
    const result = await downloadFile(d.url, dest);
    if (!result.ok) {
      console.log(`  FAILED: HTTP ${result.status}`);
      continue;
    }
    
    const validation = validatePdf(dest);
    if (!validation.valid) {
      console.log(`  INVALID PDF: ${validation.reason}`);
      fs.unlinkSync(dest);
      continue;
    }
    
    console.log(`  SUCCESS: Valid PDF, ${(validation.size / 1024).toFixed(1)} KB`);
    
    await new Promise(r => setTimeout(r, 500));
  }
}

run();
