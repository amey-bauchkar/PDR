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
const CONCURRENCY = 3; // Render 3 pages in parallel

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  try {
    // Block unnecessary resources to speed up rendering
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      // Block images, fonts, media — we only need the HTML
      if (['image', 'font', 'media', 'stylesheet'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Use networkidle2 instead of networkidle0 — Supabase keeps websocket connections open
    // which causes networkidle0 to hang until timeout
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: 'networkidle2',
      timeout: 10000, // 10s instead of 30s default
    });

    // Wait for React to render something into #root
    await page.waitForFunction(
      'document.querySelector("#root").innerHTML.length > 0',
      { timeout: 5000 }
    ).catch(() => {});

    // Small delay for useEffects
    await new Promise((r) => setTimeout(r, 200));

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
    console.error(`Failed to prerender ${route}`, err.message || err);
  } finally {
    await page.close();
  }
}

async function run() {
  console.log(`Starting prerender for ${routes.length} routes (concurrency: ${CONCURRENCY})...`);

  const originalIndexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');

  // Start a local server to serve the React SPA
  const app = express();
  app.use(express.static(DIST_DIR, { index: false }));
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
        args: [...chromium.args, '--disable-web-security', '--no-sandbox'],
        defaultViewport: { width: 1280, height: 720 },
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      console.log('Running locally. Using standard puppeteer...');
      const puppeteer = (await import('puppeteer')).default;
      browser = await puppeteer.launch({ headless: true });
    }

    // Process routes in batches of CONCURRENCY
    for (let i = 0; i < routes.length; i += CONCURRENCY) {
      const batch = routes.slice(i, i + CONCURRENCY);
      console.log(`Prerendering batch ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(routes.length / CONCURRENCY)}: ${batch.join(', ')}`);
      await Promise.all(batch.map((route) => prerenderRoute(browser, route)));
    }

    await browser.close();
    server.close();
    console.log('Prerendering complete!');
  });
}

run();
