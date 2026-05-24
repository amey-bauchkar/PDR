const fs = require('fs');
const content = fs.readFileSync('C:/Users/SEBIN/.gemini/antigravity-ide/brain/8c3218d5-4dae-4fb5-9126-0ff506699424/.system_generated/steps/375/content.md', 'utf8');
const regex = /href=[\"']([^\"']+)[\"'][^>]*>([^<]+)/gi;
let match;
while ((match = regex.exec(content)) !== null) {
    if (match[2].toLowerCase().includes('ova') || match[1].toLowerCase().includes('ova')) {
        console.log(match[1] + ' -> ' + match[2].trim());
    }
}
