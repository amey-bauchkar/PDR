import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir('./src/assets/images').filter(f => f.match(/\.(png|jpg|jpeg)$/i));

async function run() {
  for (const file of files) {
    const ext = path.extname(file);
    const newFile = file.replace(new RegExp(`${ext}$`), '.webp');
    await sharp(file)
      .webp({ quality: 80 })
      .toFile(newFile);
    fs.unlinkSync(file);
    console.log(`Converted and deleted ${file}`);
  }
}

run();
