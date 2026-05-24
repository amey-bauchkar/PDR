async function run() {
    const mediaRes = await fetch('https://pdrworld.com/wp-json/wp/v2/media?search=OVA&per_page=100');
    if (mediaRes.ok) {
        const media = await mediaRes.json();
        for (const p of media) {
            console.log('MEDIA: ' + p.source_url + ' | ' + p.title.rendered);
        }
    }
}
run();
