async function run() {
    const res = await fetch('https://pdrworld.com/post-sitemap.xml');
    const content = await res.text();
    const regex = /<loc>([^<]+)<\/loc>/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
        if (match[1].toLowerCase().includes('attenuator') || match[1].toLowerCase().includes('ova')) {
            console.log(match[1]);
        }
    }
}
run();
