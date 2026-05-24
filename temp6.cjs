async function run() {
    const postsRes = await fetch('https://pdrworld.com/wp-json/wp/v2/posts?search=ova&per_page=100');
    if (postsRes.ok) {
        const posts = await postsRes.json();
        for (const p of posts) {
            console.log('POST: ' + p.slug + ' | ' + p.title.rendered);
        }
    }
    const pagesRes = await fetch('https://pdrworld.com/wp-json/wp/v2/pages?search=ova&per_page=100');
    if (pagesRes.ok) {
        const pages = await pagesRes.json();
        for (const p of pages) {
            console.log('PAGE: ' + p.slug + ' | ' + p.title.rendered);
        }
    }
}
run();
