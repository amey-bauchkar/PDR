const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const path = require('path');

async function scrapeEvents() {
    console.log('Starting puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    console.log('Navigating to events page...');
    await page.goto('https://pdrworld.com/resources/events-exhibitions/', { waitUntil: 'networkidle2' });
    
    console.log('Evaluating page content...');
    const events = await page.evaluate(() => {
        const results = [];
        // The page seems to use Elementor. Titles are typically in headings.
        // Let's try to extract h2 or h3 elements and their subsequent gallery images.
        const sections = document.querySelectorAll('.elementor-section');
        
        let currentTitle = 'Gallery';
        let currentImages = [];
        
        sections.forEach(section => {
            const heading = section.querySelector('h1, h2, h3, h4');
            if (heading && heading.innerText.trim()) {
                if (currentImages.length > 0) {
                    results.push({ title: currentTitle, images: currentImages });
                    currentImages = [];
                }
                currentTitle = heading.innerText.trim();
            }
            
            const images = section.querySelectorAll('img');
            images.forEach(img => {
                const src = img.getAttribute('src') || img.getAttribute('data-src');
                if (src && !src.includes('logo') && !src.includes('svg') && !src.includes('chaty')) {
                    // Try to get highest resolution if possible
                    let fullSrc = src;
                    if (fullSrc.includes('-150x150')) fullSrc = fullSrc.replace('-150x150', '');
                    if (fullSrc.includes('-300x225')) fullSrc = fullSrc.replace('-300x225', '');
                    if (fullSrc.includes('-1024x768')) fullSrc = fullSrc.replace('-1024x768', '');
                    
                    if (!currentImages.includes(fullSrc)) {
                        currentImages.push(fullSrc);
                    }
                }
            });
        });
        
        if (currentImages.length > 0) {
            results.push({ title: currentTitle, images: currentImages });
        }
        
        return results;
    });
    
    console.log(JSON.stringify(events, null, 2));
    
    // Download images
    const targetDir = path.join(__dirname, 'public', 'images', 'gallery');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const structuredData = [];
    
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (event.images.length === 0) continue;
        
        const eventData = { title: event.title, images: [] };
        
        for (let j = 0; j < event.images.length; j++) {
            const url = event.images[j];
            const ext = path.extname(url.split('?')[0]) || '.jpg';
            const filename = `event_${i}_${j}${ext}`;
            const destPath = path.join(targetDir, filename);
            
            try {
                console.log(`Downloading ${url} to ${filename}...`);
                await downloadFile(url, destPath);
                eventData.images.push(`/images/gallery/${filename}`);
            } catch (err) {
                console.error(`Failed to download ${url}:`, err.message);
                // Maybe fallback to original if anti-bot triggers on https.get?
                // Actually, let's use page.goto to get image buffer if https.get fails
            }
        }
        
        structuredData.push(eventData);
    }
    
    fs.writeFileSync(path.join(__dirname, 'src', 'data', 'events.json'), JSON.stringify(structuredData, null, 2));
    console.log('Saved data to events.json');
    
    await browser.close();
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, function(response) {
            if (response.statusCode !== 200) {
                reject(new Error(`Status Code: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', function() {
                file.close(resolve);
            });
        }).on('error', function(err) {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

scrapeEvents().catch(console.error);
