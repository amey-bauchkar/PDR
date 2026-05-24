async function run() {
    const postsRes = await fetch('https://pdrworld.com/wp-json/wp/v2/posts?search=attenuator&per_page=100');
    if (postsRes.ok) {
        const posts = await postsRes.json();
        for (const p of posts) {
            console.log('POST: ' + p.slug + ' | ' + p.title.rendered);
        }
    }
}
run();
