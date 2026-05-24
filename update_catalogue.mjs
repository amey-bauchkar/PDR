import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/catalogue.json', 'utf8'));

// 1. Active Components
const active = data.sections.find(s => s.id === 'active');
const otherActive = active.groups.find(g => g.subhead === 'Other Active Components');
const otherActiveCards = otherActive.cards;

active.groups = [
  active.groups.find(g => g.subhead === 'SFP Transceivers'),
  {
    subhead: "Bypass Switch",
    cards: otherActiveCards.filter(c => c.slug === 'bypass-switch')
  },
  {
    subhead: "Optical Line Protection System (OLPS)",
    cards: otherActiveCards.filter(c => c.slug === 'olps')
  },
  {
    subhead: "Direct Attached Cable (DAC)",
    cards: otherActiveCards.filter(c => c.slug === 'dac')
  },
  {
    subhead: "Active Optical Cable (AOC)",
    cards: otherActiveCards.filter(c => c.slug === 'aoc')
  },
  {
    subhead: "HD-SDI Optical Transceiver",
    cards: otherActiveCards.filter(c => c.slug === 'hd-sdi')
  },
  {
    subhead: "PoE Injector",
    cards: otherActiveCards.filter(c => c.slug === 'poe-injector')
  }
].filter(g => g.cards.length > 0);

// 2. Passive Components
const passive = data.sections.find(s => s.id === 'passive');
const connectorsGroup = passive.groups.find(g => g.subhead === 'Connectors');
const adaptersGroup = passive.groups.find(g => g.subhead === 'Adapters');

// extract the hybrid adapter and change it
let hybridAdapter = connectorsGroup.cards.find(c => c.slug === 'sc-apc-female-to-sc-upc-male-adapter-converter');
if (hybridAdapter) {
  hybridAdapter.slug = 'hybrid-adapter';
  hybridAdapter.detailsSlug = 'hybrid-adapter';
  hybridAdapter.name = 'SC/APC to SC/UPC Adapter';
  hybridAdapter.tag = 'Hybrid';
  adaptersGroup.cards.push(hybridAdapter);
}

// remove attenuator, cat-6-patch-panel, and the old hybrid adapter from connectors
connectorsGroup.cards = connectorsGroup.cards.filter(c => 
  c.slug !== 'attenuator' && 
  c.slug !== 'cat-6-patch-panel' && 
  c.slug !== 'sc-apc-female-to-sc-upc-male-adapter-converter' &&
  c.slug !== 'hybrid-adapter'
);

// add soc to connectors
connectorsGroup.cards.push({
  slug: "soc",
  tag: "SOC",
  img: "/images/live/splice-on-connector.webp",
  heroSvg: "",
  name: "Splice-On Connector (SOC)",
  blurb: "Field installable connector without epoxy or polishing.",
  pills: ["IL < 0.2dB", "No Epoxy", "Fusion Splicing"],
  detailsSlug: "soc",
  addItem: {
    title: "Splice-On Connector",
    specs: "Standard Factory Specs",
    image: "/images/live/splice-on-connector.webp"
  }
});

// 3. Test & Measuring
const test = data.sections.find(s => s.id === 'test');
const endfaceGroup = test.groups.find(g => g.subhead === 'Endface Inspector');
const otherTestSlugs = ['laser-source', 'e1-ber-tester', 'twoway-fiber-polarity-and-return-loss-meter', 'optical-talk-set'];
const otherTestCards = endfaceGroup.cards.filter(c => otherTestSlugs.includes(c.slug));

// Remove variable-fiber-attenuator and the otherTestCards
endfaceGroup.cards = endfaceGroup.cards.filter(c => 
  c.slug !== 'variable-fiber-attenuator' && 
  !otherTestSlugs.includes(c.slug)
);

test.groups.push({
  subhead: "Other Test Equipment",
  cards: otherTestCards
});

// 4. Specialty
const specialty = data.sections.find(s => s.id === 'specialty');
specialty.eyebrow = "Optical Fiber Drone";
specialty.heading = "Aerial Deployment Solutions";

const specGroup = specialty.groups[0];
const highPowerCard = specGroup.cards.find(c => c.slug === 'high-power-patch-cord');
if (highPowerCard) {
  highPowerCard.slug = 'high-power-patchcord';
  if(highPowerCard.detailsSlug) highPowerCard.detailsSlug = 'high-power-patchcord';
}

// Add drone
specGroup.cards.push({
  slug: "drone",
  tag: "Drone",
  img: "/images/live/optical-fiber-drone.webp",
  heroSvg: "",
  name: "Optical Fiber Drone",
  blurb: "Rapid aerial deployment in inaccessible areas.",
  pills: ["Aerial Deployment", "4K / Thermal", "Secure Link"],
  detailsSlug: "drone",
  addItem: {
    title: "Optical Fiber Drone",
    specs: "Standard Factory Specs",
    image: "/images/live/optical-fiber-drone.webp"
  }
});

// 5. Tabs & Hero
const specialtyTab = data.tabs.find(t => t.target === 'specialty');
if (specialtyTab) specialtyTab.label = "Optical Fiber Drone";

// 6. Tools (Option B: Grouping)
const tools = data.sections.find(s => s.id === 'tools');
const toolsGroup = tools.groups[0];
const toolsCards = toolsGroup.cards;

const getCards = (slugs) => slugs.map(slug => toolsCards.find(c => c.slug === slug)).filter(Boolean);

tools.groups = [
  {
    subhead: "Cleaning Tools",
    cards: getCards(['cleaner-pen', 'cassette-cleaner', 'mpo-cleaner'])
  },
  {
    subhead: "Fault Locators",
    cards: getCards(['vfl'])
  },
  {
    subhead: "Splicing Tools & Accessories",
    cards: getCards(['fiber-cleaver-clv-b1', 'splice-sleeves', 'cold-shrink-sleeve'])
  },
  {
    subhead: "Spools",
    cards: getCards(['fiber-spool'])
  }
].filter(g => g.cards.length > 0);

fs.writeFileSync('src/data/catalogue.json', JSON.stringify(data, null, 2) + '\n');
console.log('Update complete.');
