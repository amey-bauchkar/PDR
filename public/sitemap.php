<?php
/**
 * PDR World — Real-Time Dynamic XML Sitemap (Hostinger Production)
 * 
 * Automatically generates a live sitemap by querying the Supabase database.
 * Whenever products are added, edited, or removed in the Admin Panel,
 * Google immediately discovers them without requiring a manual redeployment.
 * 
 * Includes graceful fallback to the static sitemap.xml on disk.
 */

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600, s-maxage=3600');
header('X-Robots-Tag: noindex, follow');

$siteUrl = 'https://pdrworld.com';
$today = date('Y-m-d');

// Static Pages Definition
$staticPages = [
    ['loc' => $siteUrl . '/', 'priority' => '1.0', 'changefreq' => 'weekly'],
    ['loc' => $siteUrl . '/products', 'priority' => '0.9', 'changefreq' => 'daily'],
    ['loc' => $siteUrl . '/solutions', 'priority' => '0.8', 'changefreq' => 'monthly'],
    ['loc' => $siteUrl . '/cable-configurator', 'priority' => '0.8', 'changefreq' => 'monthly'],
    ['loc' => $siteUrl . '/fiber-selector', 'priority' => '0.8', 'changefreq' => 'monthly'],
    ['loc' => $siteUrl . '/about', 'priority' => '0.7', 'changefreq' => 'monthly'],
    ['loc' => $siteUrl . '/resources', 'priority' => '0.7', 'changefreq' => 'monthly'],
    ['loc' => $siteUrl . '/contact', 'priority' => '0.7', 'changefreq' => 'monthly'],
    ['loc' => $siteUrl . '/terms', 'priority' => '0.3', 'changefreq' => 'yearly'],
    ['loc' => $siteUrl . '/privacy', 'priority' => '0.3', 'changefreq' => 'yearly'],
];

$categoryPaths = [
    '/products/category/passive-components',
    '/products/category/cable-assemblies',
    '/products/category/fiber-management-systems',
    '/products/category/test-equipment',
    '/products/category/cleaning-consumables',
    '/products/category/active-optical-devices',
    '/products/category/ftth-solutions',
    '/products/category/optical-components',
];

$supabaseUrl = 'https://gfzknettmaclomxyimjf.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemtuZXR0bWFjbG9teHlpbWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MTQ2NzksImV4cCI6MjEwMDA5MDY3OX0.0f11BpXLPo6ItGkHgLxi0ihPqCkvmELn0BKK7FCY0qY';

$productSlugs = [];

// Query Supabase for active products
if (function_exists('curl_init')) {
    $ch = curl_init($supabaseUrl . '/rest/v1/catalog_products?select=slug,updated_at');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey,
        'Accept: application/json'
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $products = json_decode($response, true);
        if (is_array($products)) {
            foreach ($products as $p) {
                if (!empty($p['slug']) && $p['slug'] !== 'easyget-wifi') {
                    $lastMod = !empty($p['updated_at']) ? substr($p['updated_at'], 0, 10) : $today;
                    $productSlugs[$p['slug']] = $lastMod;
                }
            }
        }
    }
}

// Fallback: If DB query fails, read static sitemap.xml from disk
if (empty($productSlugs)) {
    $staticFile = __DIR__ . '/sitemap.xml';
    if (file_exists($staticFile)) {
        echo file_get_contents($staticFile);
        exit;
    }
}

// Render dynamic XML
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// 1. Static Pages
foreach ($staticPages as $page) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($page['loc']) . "</loc>\n";
    echo "    <lastmod>" . $today . "</lastmod>\n";
    echo "    <changefreq>" . $page['changefreq'] . "</changefreq>\n";
    echo "    <priority>" . $page['priority'] . "</priority>\n";
    echo "  </url>\n";
}

// 2. Category Pages
foreach ($categoryPaths as $catPath) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($siteUrl . $catPath) . "</loc>\n";
    echo "    <lastmod>" . $today . "</lastmod>\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>0.8</priority>\n";
    echo "  </url>\n";
}

// 3. Product Pages (Dynamic from Supabase)
foreach ($productSlugs as $slug => $lastmod) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($siteUrl . '/products/' . $slug) . "</loc>\n";
    echo "    <lastmod>" . htmlspecialchars($lastmod) . "</lastmod>\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>0.8</priority>\n";
    echo "  </url>\n";
}

echo '</urlset>' . "\n";
