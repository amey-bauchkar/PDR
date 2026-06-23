const fs = require('fs');
const path = require('path');
const https = require('https');

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve(true); // skip if already exists
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve(true));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const urls = [
  'https://pdrworld.com/wp-content/uploads/2023/10/IMG_5717-1024x768.jpg',
  'https://pdrworld.com/wp-content/uploads/2023/10/IMG_5715-1024x768.jpg',
  'https://pdrworld.com/wp-content/uploads/2023/10/IMG_5712-1024x768.jpg',
  'https://pdrworld.com/wp-content/uploads/2023/10/IMG_5714-1024x768.jpg',
  'https://pdrworld.com/wp-content/uploads/2023/04/convergence-india-2023-scaled.jpg',
  'https://pdrworld.com/wp-content/uploads/2023/04/pdr-stall-scaled.jpg',
  'https://pdrworld.com/wp-content/uploads/2022/10/WhatsApp-Image-2022-10-17-at-12.39.16-PM-1.jpeg',
  'https://pdrworld.com/wp-content/uploads/2022/10/WhatsApp-Image-2022-10-17-at-12.39.16-PM.jpeg'
];

async function run() {
  const targetDir = path.join(__dirname, 'public', 'images', 'gallery');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const scrapedImages = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const filename = path.basename(url);
    const dest = path.join(targetDir, filename);
    console.log(`Downloading ${filename}...`);
    try {
      await downloadImage(url, dest);
      scrapedImages.push(`/images/gallery/${filename}`);
    } catch (e) {
      console.error(`Failed to download ${filename}`);
    }
  }

  // Generate gallery.json
  const dataPath = path.join(__dirname, 'src', 'data', 'gallery.json');
  fs.writeFileSync(dataPath, JSON.stringify(scrapedImages, null, 2));
  console.log('Done!');
}

run();
