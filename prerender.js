import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
// We use dynamic imports for Puppeteer and Chromium to handle Vercel environment

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import product data directly (parsing JSON)
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/products.json'), 'utf8'));

// Static routes
const routes = [
  '/',
  '/about',
  '/products',
  '/solutions',
  '/resources',
  '/contact',
  '/cable-configurator',
  '/fiber-selector',
  '/terms',
  '/privacy',
  '/products/active-components',
  '/products/passive-components',
  '/products/cable-management',
  '/products/test-measuring',
  '/products/specialty-drones',
  '/products/maintenance-tools',
  '/404',
];

// Product routes
for (const product of productsData) {
  if (product.slug) {
    routes.push(`/products/${product.slug}`);
  }
}

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'dist');

async function run() {
  console.log(`Starting prerender for ${routes.length} routes...`);

  const originalIndexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');

  // Start a local server to serve the React SPA
  const app = express();
  // Serve static assets but NOT index.html to avoid serving the modified homepage
  app.use(express.static(DIST_DIR, { index: false }));
  // Fallback to the original index.html for SPA routing
  app.use((req, res) => {
    res.send(originalIndexHtml);
  });

  const server = app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`);

    const isVercel = process.env.VERCEL === '1';
    let browser;
    
    if (isVercel) {
      console.log('Running in Vercel environment. Using @sparticuz/chromium...');
      const chromium = (await import('@sparticuz/chromium')).default;
      const puppeteerCore = (await import('puppeteer-core')).default;
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      console.log('Running locally. Using standard puppeteer...');
      const puppeteer = (await import('puppeteer')).default;
      browser = await puppeteer.launch({ headless: true });
    }

    const page = await browser.newPage();

    for (const route of routes) {
      console.log(`Prerendering ${route}...`);
      try {
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0' });
        // Wait for React to render something into #root
        await page.waitForFunction('document.querySelector("#root").innerHTML.length > 0', { timeout: 10000 }).catch(() => {});
        // Small delay to ensure any immediate useEffects complete
        await new Promise((r) => setTimeout(r, 500));

        const html = await page.content();

        // Create directory if it's not the root
        let outputPath;
        if (route === '/') {
          outputPath = path.join(DIST_DIR, 'index.html');
        } else if (route === '/404') {
          outputPath = path.join(DIST_DIR, '404.html');
        } else {
          const routeDir = path.join(DIST_DIR, route);
          if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
          }
          outputPath = path.join(routeDir, 'index.html');
        }

        fs.writeFileSync(outputPath, html);
      } catch (err) {
        console.error(`Failed to prerender ${route}`, err);
      }
    }

    await browser.close();
    server.close();
    console.log('Prerendering complete!');
  });
}

run();
