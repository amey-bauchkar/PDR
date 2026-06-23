const fs = require('fs');

const p = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const c = JSON.parse(fs.readFileSync('src/data/catalogue.json', 'utf8'));

let cSlugs = [];
c.forEach(cat => {
  cat.groups.forEach(g => {
    g.cards.forEach(card => {
      cSlugs.push(card.slug);
    });
  });
});

const orphans = p.filter(prod => !cSlugs.includes(prod.slug)).map(prod => prod.slug);
console.log(orphans);
