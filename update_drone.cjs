const fs = require('fs');
const file = 'src/data/products.json';
const p = JSON.parse(fs.readFileSync(file, 'utf8'));

const drone = {
  slug: 'drone',
  name: 'Drone Optical Fiber Kit',
  category: 'Specialty Drones',
  title: 'Drone Optical Fiber Kit | PDR World',
  description: 'Secure, jam-proof fiber-optic communication for defence and FPV drones.',
  canonical: 'https://pdr-sable.vercel.app/products/drone',
  tagline: 'Secure, jam-proof fiber-optic communication for defence and FPV drones.',
  heroIcon: '<svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M2 12h4l2-8 4 16 2-8h4"/></svg>',
  features: [
    'Fiber-tethered data link — immune to jamming, interception, and RF interference',
    'Secure real-time HD / 4K + thermal video downlink',
    'Lightweight payload spool for FPV and tactical UAVs',
    'Selectable fiber length from 1 km to 50 km (custom lengths on request)'
  ],
  applications: [
    'Defence ISR & secure communications',
    'FPV reconnaissance & tactical missions',
    'Perimeter / border surveillance',
    'EW / jam-resistant operations'
  ],
  specs: [
    { label: 'Fiber Length', value: '1–50 km, selectable (custom available)' },
    { label: 'Camera', value: '4K / Thermal' },
    { label: 'Data Link', value: 'Secure fiber-optic — EW / jam-resistant' },
    { label: 'Deployment', value: 'High-speed aerial spooling' }
  ],
  related: []
};

const idx = p.findIndex(x => x.slug === 'drone');
if (idx >= 0) {
  p[idx] = drone;
} else {
  p.push(drone);
}

fs.writeFileSync(file, JSON.stringify(p, null, 2));
console.log('Drone product updated');
