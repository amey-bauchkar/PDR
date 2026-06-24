import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const mediaDir = path.resolve('./public/images/media');

async function generateThumbnails() {
  console.log('Generating thumbnails for public/images/media...');
  const files = fs.readdirSync(mediaDir);

  for (const file of files) {
    if (file.endsWith('.webp') && !file.endsWith('-thumb.webp')) {
      const baseName = file.replace('.webp', '');
      const inputPath = path.join(mediaDir, file);
      const outputPath = path.join(mediaDir, `${baseName}-thumb.webp`);

      if (!fs.existsSync(outputPath)) {
        console.log(`Creating thumbnail for ${file}...`);
        await sharp(inputPath)
          .resize({ width: 400, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outputPath);
        console.log(`Generated: ${baseName}-thumb.webp`);
      } else {
        console.log(`Thumbnail already exists for ${file}`);
      }
    }
  }
  console.log('Thumbnail generation complete.');
}

generateThumbnails().catch(console.error);
