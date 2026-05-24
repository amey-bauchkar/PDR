async function run() {
    const res = await fetch('https://pdrworld.com/attenuator/');
    const content = await res.text();
    const regex = /href=[\"']([^\"']+\.pdf)[\"'][^>]*>([^<]+)/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
        console.log(match[1] + ' -> ' + match[2].trim());
    }
}
run();
