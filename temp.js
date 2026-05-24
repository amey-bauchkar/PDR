const fs = require('fs');
const content = fs.readFileSync('C:/Users/SEBIN/.gemini/antigravity-ide/brain/8c3218d5-4dae-4fb5-9126-0ff506699424/.system_generated/steps/333/content.md', 'utf8');
const matches = [...content.matchAll(/href="([^"]+\.pdf)"/gi)];
const urls = matches.map(m => m[1]);
console.log(urls);
