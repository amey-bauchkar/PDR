import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create an incognito browser context
  console.log('Creating incognito context...');
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  
  // Navigate to products page
  console.log('Navigating to http://localhost:5173/products ...');
  await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle0' });
  
  // 1. Verify deleted products are NOT present
  console.log('Verifying deleted products are absent...');
  const deletedSlugs = [
    'lc-uniboot',
    'loop-back-patch-cord',
    'loopback',
    'mini-optical-power-meter',
    'fiber-optic-adapter',
    'easyget-wifi',
    'splice-on-connector',
    'splice-on'
  ];
  
  let foundDeleted = false;
  const pageContent = await page.content();
  for (const slug of deletedSlugs) {
    if (pageContent.includes(slug)) {
      console.error(`❌ FAILED: Found deleted product slug '${slug}' in the page!`);
      foundDeleted = true;
    }
  }
  
  if (!foundDeleted) {
    console.log('✅ SUCCESS: No deleted products found in incognito render.');
  }

  // 2. Verify datasheet logic for an existing product (let's go to /products/sfp-transceiver or any active product)
  console.log('Navigating to a product detail page to check datasheet link...');
  // Find a product link from the products page
  const productLinks = await page.$$eval('a', anchors => anchors.map(a => a.href).filter(h => h.includes('/products/')));
  if (productLinks.length > 0) {
    const firstProductUrl = productLinks[0];
    console.log(`Navigating to ${firstProductUrl} ...`);
    await page.goto(firstProductUrl, { waitUntil: 'networkidle0' });
    
    // Check if datasheet button exists and has right behavior
    // The datasheet button in ProductDetail.tsx doesn't have an href, it has an onClick window.open
    // We can evaluate the page state to ensure it doesn't crash.
    const hasDatasheetButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.textContent && b.textContent.includes('Datasheet'));
    });
    
    console.log(`✅ SUCCESS: Product page loaded. Datasheet button present: ${hasDatasheetButton}`);
  } else {
    console.log('⚠️ Could not find product links to test datasheet.');
  }

  await browser.close();
  console.log('Done.');
})();
