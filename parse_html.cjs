const fs = require('fs');

const content = fs.readFileSync('temp_scrape.html', 'utf8');

const regex = /<img[^>]+src="([^">]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(match[1]);
}
