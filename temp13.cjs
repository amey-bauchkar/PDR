const fs = require('fs');

async function searchWp(query) {
    try {
        const res = await fetch(`https://pdrworld.com/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&per_page=5`);
        if (res.ok) {
            const data = await res.json();
            return data.map(d => ({ slug: d.slug, title: d.title.rendered }));
        }
    } catch (e) {
        return null;
    }
    return [];
}

async function run() {
    const r = JSON.parse(fs.readFileSync('datasheet_migration_report.json'));
    const unmapped = r.unmappedProducts || [];
    
    for (const p of unmapped) {
        console.log(`\nSearching for: ${p.productName} (${p.productSlug})`);
        
        // Try searching by name
        let results = await searchWp(p.productName);
        if (results && results.length > 0) {
            console.log(`  Found by name: ${JSON.stringify(results)}`);
            continue;
        }
        
        // Try searching by slug words
        const slugWords = p.productSlug.split('-').join(' ');
        results = await searchWp(slugWords);
        if (results && results.length > 0) {
            console.log(`  Found by slug words: ${JSON.stringify(results)}`);
            continue;
        }
        
        console.log(`  No results found in WP API.`);
    }
}
run();
