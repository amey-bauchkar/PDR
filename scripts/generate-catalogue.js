import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/products.json'), 'utf8'));

async function generateCatalogue() {
  console.log('Generating Master PDR Product Catalogue PDF...');

  // 1. Organize products by category
  const categories = {
    'Active Components': 'Active Components',
    'Passive Components': 'Passive Components',
    'Cable Management': 'Cable Management',
    'Test & Measuring': 'Test & Measuring',
    'Specialty Drones': 'Specialty Drones',
    'Maintenance Tools': 'Maintenance Tools',
  };

  const categorizedProducts = {};
  for (const key of Object.keys(categories)) {
    categorizedProducts[key] = [];
  }

  for (const product of productsData) {
    const cat = product.category || 'Passive Components';
    if (!categorizedProducts[cat]) {
      categorizedProducts[cat] = [];
      categories[cat] = cat;
    }
    categorizedProducts[cat].push(product);
  }

  // 2. Build HTML Template
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      body {
        font-family: 'Inter', sans-serif;
        margin: 0;
        padding: 0;
        color: #1E293B;
        background-color: #FFFFFF;
        line-height: 1.5;
      }
      .page-break { page-break-before: always; }
      .avoid-break { page-break-inside: avoid; }
      
      /* Cover Page */
      .cover-page {
        height: 230mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 10mm 5mm;
        box-sizing: border-box;
      }
      .cover-header {
        border-left: 8px solid #4A9FD8;
        padding-left: 20px;
      }
      .cover-title {
        font-size: 44px;
        font-weight: 700;
        color: #07008F;
        margin: 0 0 10px 0;
        line-height: 1.15;
      }
      .cover-subtitle {
        font-size: 22px;
        font-weight: 500;
        color: #475569;
        margin: 0;
      }
      .cover-middle {
        margin: auto 0;
      }
      .cover-accent-box {
        background: linear-gradient(135deg, #07008F 0%, #4A9FD8 100%);
        padding: 45px;
        border-radius: 12px;
        color: white;
        box-shadow: 0 10px 25px -5px rgba(7, 0, 143, 0.2);
      }
      .cover-accent-title {
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 15px 0;
        letter-spacing: -0.5px;
      }
      .cover-accent-desc {
        font-size: 18px;
        opacity: 0.9;
        margin: 0;
        line-height: 1.6;
      }
      .cover-footer {
        border-top: 2px solid #E2E8F0;
        padding-top: 25px;
        display: flex;
        justify-content: space-between;
        font-size: 15px;
        color: #64748B;
        font-weight: 500;
      }

      /* Table of Contents */
      .toc-page {
        padding: 10mm 5mm;
      }
      .section-title {
        font-size: 32px;
        font-weight: 700;
        color: #07008F;
        margin: 0 0 35px 0;
        padding-bottom: 12px;
        border-bottom: 3px solid #4A9FD8;
      }
      .toc-category {
        margin-bottom: 30px;
      }
      .toc-category-title {
        font-size: 20px;
        font-weight: 700;
        color: #07008F;
        margin: 0 0 16px 0;
        background-color: #F8FAFC;
        padding: 10px 16px;
        border-radius: 6px;
        border-left: 5px solid #4A9FD8;
        border: 1px solid #E2E8F0;
        border-left: 5px solid #4A9FD8;
      }
      .toc-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px 24px;
        padding: 0 16px;
      }
      .toc-item {
        font-size: 15px;
        color: #334155;
        display: flex;
        align-items: center;
        font-weight: 500;
      }
      .toc-bullet {
        width: 7px;
        height: 7px;
        background-color: #4A9FD8;
        border-radius: 50%;
        margin-right: 12px;
        flex-shrink: 0;
      }

      /* Product Page */
      .product-section {
        padding: 10mm 5mm;
      }
      .product-header {
        margin-bottom: 28px;
        border-bottom: 2px solid #E2E8F0;
        padding-bottom: 20px;
      }
      .product-category {
        font-size: 13px;
        font-weight: 700;
        color: #4A9FD8;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin: 0 0 8px 0;
      }
      .product-name {
        font-size: 34px;
        font-weight: 700;
        color: #07008F;
        margin: 0 0 12px 0;
        line-height: 1.2;
        letter-spacing: -0.5px;
      }
      .product-tagline {
        font-size: 18px;
        font-style: italic;
        color: #475569;
        margin: 0;
        font-weight: 400;
      }
      .product-description {
        font-size: 15px;
        color: #334155;
        margin-bottom: 35px;
        line-height: 1.65;
        white-space: pre-wrap;
      }
      .sub-heading {
        font-size: 20px;
        font-weight: 700;
        color: #07008F;
        margin: 0 0 18px 0;
        display: flex;
        align-items: center;
      }
      .sub-heading::after {
        content: "";
        flex: 1;
        height: 2px;
        background-color: #E2E8F0;
        margin-left: 18px;
      }
      .list-box {
        margin-bottom: 35px;
      }
      .feature-list, .app-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px 24px;
      }
      .list-item {
        font-size: 15px;
        color: #334155;
        display: flex;
        align-items: baseline;
        line-height: 1.5;
      }
      .list-item::before {
        content: "";
        display: inline-block;
        width: 7px;
        height: 7px;
        background-color: #4A9FD8;
        border-radius: 50%;
        margin-right: 12px;
        flex-shrink: 0;
      }
      .app-list .list-item::before {
        background-color: #64748B;
      }
      
      /* Specs Table */
      .specs-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
        margin-top: 20px;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        overflow: hidden;
      }
      .specs-table th {
        background-color: #07008F;
        color: white;
        text-align: left;
        padding: 12px 18px;
        font-weight: 600;
        font-size: 15px;
      }
      .specs-table td {
        padding: 12px 18px;
        border-bottom: 1px solid #E2E8F0;
        color: #334155;
      }
      .specs-table tr:last-child td {
        border-bottom: none;
      }
      .specs-table tr:nth-child(even) td {
        background-color: #F8FAFC;
      }
      .specs-table td.spec-label {
        font-weight: 600;
        color: #475569;
        width: 40%;
        border-right: 1px solid #E2E8F0;
      }
    </style>
  </head>
  <body>
    <!-- Cover Page -->
    <div class="cover-page">
      <div class="cover-header">
        <h1 class="cover-title">PDR WORLD</h1>
        <h2 class="cover-subtitle">MASTER PRODUCT CATALOGUE 2024–2025</h2>
      </div>
      <div class="cover-middle">
        <div class="cover-accent-box">
          <h2 class="cover-accent-title">Empowering Global Connectivity</h2>
          <p class="cover-accent-desc">Discover our comprehensive suite of state-of-the-art optical fiber solutions, carrier-grade passive and active components, advanced cable management systems, and precision testing equipment.</p>
        </div>
      </div>
      <div class="cover-footer">
        <span>www.pdrworld.com</span>
        <span>info@pdrworld.com</span>
        <span>ISO 9001:2015 & 14001:2015 Certified</span>
      </div>
    </div>

    <!-- Table of Contents -->
    <div class="toc-page page-break">
      <h2 class="section-title">Table of Contents</h2>
  `;

  // Render TOC Categories
  for (const [catKey, catName] of Object.entries(categories)) {
    const prods = categorizedProducts[catKey] || [];
    if (prods.length === 0) continue;

    html += `
      <div class="toc-category avoid-break">
        <h3 class="toc-category-title">${catName}</h3>
        <div class="toc-grid">
    `;
    for (const p of prods) {
      html += `
          <div class="toc-item">
            <div class="toc-bullet"></div>
            <span>${p.name}</span>
          </div>
      `;
    }
    html += `
        </div>
      </div>
    `;
  }
  html += `</div>`; // End TOC Page

  // Render Product Pages
  for (const product of productsData) {
    const catName = categories[product.category || 'passive-components'] || product.category;
    
    html += `
    <div class="product-section page-break">
      <div class="product-header">
        <div class="product-category">${catName}</div>
        <h2 class="product-name">${product.name}</h2>
        ${product.tagline ? `<div class="product-tagline">${product.tagline}</div>` : ''}
      </div>

      ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
    `;

    if (product.features && product.features.length > 0) {
      html += `
      <div class="list-box avoid-break">
        <div class="sub-heading">Key Features</div>
        <ul class="feature-list">
          ${product.features.map(f => `<li class="list-item">${f}</li>`).join('')}
        </ul>
      </div>
      `;
    }

    if (product.applications && product.applications.length > 0) {
      html += `
      <div class="list-box avoid-break">
        <div class="sub-heading">Applications</div>
        <ul class="app-list">
          ${product.applications.map(a => `<li class="list-item">${a}</li>`).join('')}
        </ul>
      </div>
      `;
    }

    if (product.specs && product.specs.length > 0) {
      html += `
      <div class="avoid-break">
        <div class="sub-heading">Technical Specifications</div>
        <table class="specs-table">
          <thead>
            <tr>
              <th>Parameter / Specification</th>
              <th>Value / Detail</th>
            </tr>
          </thead>
          <tbody>
            ${product.specs.map(s => `
              <tr>
                <td class="spec-label">${s.label}</td>
                <td>${s.value}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      `;
    }

    html += `</div>`; // End Product Section
  }

  html += `
  </body>
  </html>
  `;

  // 3. Setup output directory
  const filesDir = path.join(__dirname, '../public/files');
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }
  const outputPath = path.join(filesDir, 'PDR-Catalogue-2024.pdf');

  // 4. Launch Puppeteer and generate PDF
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
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const headerTemplate = `
    <div style="width: 100%; font-size: 9px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #64748B; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; margin: 0 15mm; display: flex; justify-content: space-between;">
      <span style="font-weight: bold; color: #07008F;">PDR WORLD</span>
      <span>MASTER PRODUCT CATALOGUE 2024-2025</span>
    </div>
  `;

  const footerTemplate = `
    <div style="width: 100%; font-size: 9px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 5px; margin: 0 15mm; display: flex; justify-content: space-between;">
      <span>PDR World | www.pdrworld.com | info@pdrworld.com</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `;

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate,
    footerTemplate,
    margin: {
      top: '25mm',
      bottom: '25mm',
      left: '15mm',
      right: '15mm',
    },
  });

  await browser.close();
  console.log(`Master catalogue PDF successfully generated at: ${outputPath}`);
}

generateCatalogue().catch(err => {
  console.error('Error generating catalogue:', err);
  process.exit(1);
});
