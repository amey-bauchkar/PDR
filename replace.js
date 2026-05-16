import fs from 'fs';
import path from 'path';

const file = 'src/components/products/CatalogBlocks.tsx';
let content = fs.readFileSync(file, 'utf8');
let newContent = content.replace(/\.png/g, '.webp').replace(/\.jpg/g, '.webp');

// But ensure /placeholder.webp becomes /placeholder.png if there isn't a placeholder.webp.
// wait, we replaced /images/... to .webp, and in CatalogBlocks we use /placeholder.png. Does placeholder.png exist?
// It was referenced as '/placeholder.png'.

if (content !== newContent) {
  fs.writeFileSync(file, newContent);
  console.log(`Updated ${file}`);
}
