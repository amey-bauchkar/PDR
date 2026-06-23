const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDirs = [
  { dir: '../public/images/media', maxWidth: 800, quality: 50 },
  { dir: '../public/images/gallery', maxWidth: 800, quality: 50 },
  { dir: '../public/images/live', maxWidth: 600, quality: 60 }
];

async function processDirectory({ dir, maxWidth, quality }) {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) return;

  const files = fs.readdirSync(fullPath);
  
  for (const file of files) {
    if (!file.match(/\.(webp)$/i)) continue;
    
    const filePath = path.join(fullPath, file);
    const tempPath = path.join(fullPath, `temp_${file}`);
    
    try {
      const stats = fs.statSync(filePath);
      // Skip very small files already
      if (stats.size < 30 * 1024) continue;

      let isThumb = file.includes('-thumb');
      let w = isThumb ? 400 : maxWidth;
      let q = isThumb ? 40 : quality;

      await sharp(filePath)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: q, effort: 6 })
        .toFile(tempPath);
      
      const newStats = fs.statSync(tempPath);
      console.log(`Optimized ${file}: ${Math.round(stats.size/1024)}KB -> ${Math.round(newStats.size/1024)}KB`);
      
      // Replace original
      fs.renameSync(tempPath, filePath);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }
}

async function run() {
  for (const target of targetDirs) {
    console.log(`Processing ${target.dir}...`);
    await processDirectory(target);
  }
  console.log('Done.');
}

run();
