import { useState, useMemo } from 'react';
import Seo from '../components/Seo';
import { BreadcrumbSchema, SoftwareApplicationSchema } from '../components/Schema';
import { useRfqCart } from '../components/RfqCartProvider';

/* ──────────────────────────── TYPES ──────────────────────────── */

type ExtraDropdown = { label: string; options: string[] };

type CatalogItem = {
  id: string;
  title: string;
  desc: string;
  image: string;
  tags: string[];
  env: string[];          // filter dimension
  mount: string[];        // filter dimension
  cap: number | null;     // null = excluded from capacity filter (e.g. Networking Rack)
  ports: string[] | null; // null = hide Port Interface dropdown
  accessories: string[] | null; // null = hide Accessories dropdown
  extraDropdowns?: ExtraDropdown[];
  /** If true, the Fiber Count extra dropdown is driven by the FMS ordering matrix */
  fmsDynamic?: boolean;
};

/* ──────────────────────── FMS ORDERING MATRIX ──────────────────────── */

// §3 of spec: Rack Height × Interface → fiber count options
const FMS_MATRIX: Record<string, Record<string, string[]>> = {
  'Rack 1U': {
    SC:  ['6F', '12F', '24F', '48F'],
    LC:  ['6F', '12F', '24F', '48F', '96F'],
    FC:  ['6F', '12F', '24F', '48F'],
    ST:  ['6F', '12F', '24F', '48F'],
    MPO: ['Up to 96F'],
  },
  'Rack 2U': {
    SC:  ['48F', '96F'],
    LC:  ['48F', '96F', '192F'],
    FC:  ['48F', '96F'],
    ST:  ['48F', '96F'],
    MPO: ['Up to 96F'],
  },
  'Rack 4U': {
    SC:  ['96F', '192F'],
    LC:  ['192F', '384F'],
    FC:  ['96F', '192F'],
    ST:  ['96F', '192F'],
    MPO: ['Up to 96F'],
  },
  'Rack 6U': {
    SC:  ['144F', '288F'],
    LC:  ['288F', '576F'],
    FC:  ['144F', '288F'],
    ST:  ['144F', '288F'],
    MPO: ['Up to 96F'],
  },
};

function getFmsFiberCounts(rackHeight: string, portInterface: string): string[] {
  const row = FMS_MATRIX[rackHeight];
  if (!row) return [];
  // Normalize port interface — "LC" covers both LC/PC and LC/APC per spec
  const key = portInterface.startsWith('LC') ? 'LC'
    : portInterface.startsWith('SC') ? 'SC'
    : portInterface.startsWith('FC') ? 'FC'
    : portInterface.startsWith('ST') ? 'ST'
    : portInterface;
  return row[key] || row['SC'] || [];
}

/* ──────────────────────── PRODUCT CATALOG ──────────────────────── */

const CATALOG: CatalogItem[] = [
  // Card 1 — PDR Cat 6 24/48-Port Patch Panel
  {
    id: 'cat6-patch-panel',
    title: 'PDR Cat 6 24/48-Port Patch Panel',
    desc: 'High-performance Cat 6 copper patch panel for 19-inch racks. Keystone RJ-45 ports with T568A/B termination for reliable Gigabit and 10G-Base-T structured cabling.',
    image: '/images/live/cat-6-patch-panel.webp',
    tags: ['Indoor', 'Rack Mount', '1U', '24/48-Port', 'Cat 6'],
    env: ['Indoor'],
    mount: ['Rack Mount (19"/21")'],
    cap: 48,
    ports: ['RJ-45 (Cat 6)'],
    accessories: ['Keystone Jack (F-to-F)', 'Keystone Jack (F-to-Punchdown)', 'Krone Module'],
    extraDropdowns: [
      { label: 'Port Count', options: ['24', '48'] },
    ],
  },
  // Card 2 — PDR Fiber Distribution Box (FDB24B)
  {
    id: 'fdb24b',
    title: 'PDR Fiber Distribution Box (FDB24B)',
    desc: 'Rugged IP65 distribution box for FTTx premises. Houses up to 24 SC ports and two 1×8 PLC/LGX splitter modules, with separate drop-cable and loose-tube storage for fast fault isolation. Wall or pole mount.',
    image: '/images/live/fiber-distribution-box-fdb.webp',
    tags: ['Indoor/Outdoor', 'IP65', 'Wall/Pole Mount', '24 Core'],
    env: ['Indoor', 'Outdoor (IP-rated)'],
    mount: ['Wall Mount', 'Pole Mount'],
    cap: 24,
    ports: ['SC'],
    accessories: ['Splice Only', '1×8 Splitter Loaded', '1×16 Splitter Loaded', '2×8 Splitter Loaded', 'Empty Frame'],
  },
  // Card 3 — PDR Home Termination Box (HTB)
  {
    id: 'htb',
    title: 'PDR Home Termination Box (HTB)',
    desc: 'Compact wall-mounted termination point for inside customer premises — the neat interface between in-building fiber and the ONT patch cord. Available as 2-way and 4-way; accepts SC and LC adapters with built-in slack and splice storage.',
    image: '/images/live/home-termination-box-htb.webp',
    tags: ['Indoor', 'Wall Mount', '2-way / 4-way', 'SC/LC'],
    env: ['Indoor'],
    mount: ['Wall Mount'],
    cap: 12,
    ports: ['SC', 'LC'],
    accessories: ['Loaded (with adapters)', 'Unloaded'],
    extraDropdowns: [
      { label: 'Variant', options: ['2-way', '4-way'] },
    ],
  },
  // Card 4 — PDR Horizontal Splice Closure (HTSC-TL16)
  {
    id: 'htsc-tl16',
    title: 'PDR Horizontal Splice Closure (HTSC-TL16)',
    desc: 'Re-enterable horizontal splice closure for outdoor fiber management. Up to 48 splices (2×24) and 16 SC simplex adapters; 4 main and 16 drop ports. UV-resistant, RoHS compliant, all hardware included.',
    image: '/images/live/fiber-optic-splitter-closure-gjs-2016.webp',
    tags: ['Outdoor', 'IP65', 'Duct/Aerial/Wall', '48 Splice'],
    env: ['Outdoor (IP-rated)'],
    mount: ['Wall Mount', 'Aerial/Duct/Underground'],
    cap: 48,
    ports: ['SC Simplex'],
    accessories: ['Splice Trays Only (2 × 24F included)'],
  },
  // Card 5 — PDR Heat Shrink Splice Closure
  {
    id: 'heat-shrink-closure',
    title: 'PDR Heat Shrink Splice Closure',
    desc: 'Weatherproof heat-shrink dome closure for buried and aerial joints. Butt-type configuration with up to 6 cable entries and 8 splice trays (12 splices per tray), neoprene O-ring sealing rated IP68 — installs with no specialised tools.',
    image: '/images/live/heat-shrink-splice-closure.webp',
    tags: ['Outdoor', 'IP68', 'Aerial/Underground/Wall', 'Splice Closure'],
    env: ['Outdoor (IP-rated)'],
    mount: ['Wall Mount', 'Aerial/Duct/Underground'],
    cap: 96,
    ports: null, // hide — splice-only, no adapters
    accessories: ['Splice Trays — up to 8 (12 splices/tray)'],
  },
  // Card 6 — PDR Optical Fiber Wall Mount Enclosure
  {
    id: 'wall-mount-enclosure',
    title: 'PDR Optical Fiber Wall Mount Enclosure',
    desc: 'Double-door, lockable wall-mount ODF for sites where a 19" cabinet isn\'t practical. Scalable 12 / 24 / 48 / 96 ports, Singlemode & Multimode, ST/FC/SC/LC adapter plates, 2 in / 2 out cable entry.',
    image: '/images/live/optical-fiber-wall-mount-enclosure.webp',
    tags: ['Indoor', 'Wall Mount', '12–96 Port', 'ST/FC/SC/LC'],
    env: ['Indoor'],
    mount: ['Wall Mount'],
    cap: 96,
    ports: ['SC', 'LC', 'ST', 'FC'],
    accessories: ['Loaded', 'Unloaded', 'Splice Trays Only', 'Empty Frame'],
    extraDropdowns: [
      { label: 'Port Count', options: ['12', '24', '48', '96'] },
    ],
  },
  // Card 7 — PDR Rack Mount Fiber Management System (FMS)
  {
    id: 'rack-mount-fms',
    title: 'PDR Rack Mount Fiber Management System (FMS)',
    desc: 'Modular, scalable rack-mount fiber management for data centres and telecom rooms. 19"/21" enclosures in 1U, 2U, 4U and 6U; 6F to 576F per enclosure; sliding-tray access and CRCA steel build. Fully loaded in SM or MM, including MPO (up to 96F in 1U).',
    image: '/images/live/rack-mount-fiber-management-system.webp',
    tags: ['Indoor', 'Rack Mount (1U–6U)', '6F–576F', 'FC/SC/ST/LC/MPO', 'High Density'],
    env: ['Indoor'],
    mount: ['Rack Mount (19"/21")'],
    cap: 576,
    ports: ['SC', 'LC', 'FC', 'ST', 'MPO'],
    accessories: ['SM Loaded', 'MM Loaded', 'Splice Trays Only', 'Empty Frame'],
    extraDropdowns: [
      { label: 'Rack Height', options: ['Rack 1U', 'Rack 2U', 'Rack 4U', 'Rack 6U'] },
    ],
    fmsDynamic: true,
  },
  // Card 8 — PDR DIN Rail Mount Fiber Termination Box (6/8 Port)
  {
    id: 'din-rail-ftb',
    title: 'PDR DIN Rail Mount Fiber Termination Box (6/8 Port)',
    desc: 'Compact wall- and DIN-rail-mountable steel termination box for indoor fiber distribution and splice protection. 6- and 8-port configurations, SC/FC/ST/LC duplex adapters, integrated sleeve holder and PVC routing rings. Siemens Gray 7032 finish, 203 × 145 × 42 mm.',
    image: '/images/fiber-patch-panel.webp',
    tags: ['Indoor', 'DIN Rail / Wall Mount', '6/8 Port', 'SC/FC/ST/LC'],
    env: ['Indoor'],
    mount: ['DIN Rail Mount', 'Wall Mount'],
    cap: 24,
    ports: ['SC', 'FC', 'ST', 'LC Duplex'],
    accessories: ['Loaded (with adapters)', 'Unloaded'],
    extraDropdowns: [
      { label: 'Fiber Count', options: ['SC: 6F', 'SC: 8F', 'LC: 12F', 'LC: 16F'] },
    ],
  },
  // Card 9 — PDR Mini Mount Fiber Termination Box (12F)
  {
    id: 'mini-mount-ftb',
    title: 'PDR Mini Mount Fiber Termination Box (12F)',
    desc: 'Compact wall-mount CRCA steel termination box for organised fiber termination and splice protection. Sleeve holder and PVC routing rings, seven-tank powder coat in Siemens Gray 7032, 203 × 145 × 42 mm.',
    image: '/images/fiber-patch-panel.webp',
    tags: ['Indoor', 'Wall / Mini Mount', '12F (SC) / 24F (LC)', 'SC/LC'],
    env: ['Indoor'],
    mount: ['Wall Mount'],
    cap: 24,
    ports: ['SC', 'LC'],
    accessories: ['Loaded (with adapters)', 'Unloaded'],
    extraDropdowns: [
      { label: 'Fiber Count', options: ['SC: 12F', 'LC: 24F'] },
    ],
  },
  // Card 10 — PDR Wall Mount Networking Rack
  {
    id: 'wall-mount-rack',
    title: 'PDR Wall Mount Networking Rack',
    desc: 'CRCA steel wall-mount network rack, 4U–15U, with lockable toughened-glass front door, fan provision and DIN 41494 compliant 19" verticals. Depth options 400–600 mm.',
    image: '/images/fiber-patch-panel.webp',
    tags: ['Indoor', 'Wall Mount', '4U–15U', 'Glass Door'],
    env: ['Indoor'],
    mount: ['Wall Mount'],
    cap: null, // not a fiber product — excluded from capacity filter
    ports: null, // hide — not a fiber-adapter product
    accessories: null, // hide
    extraDropdowns: [
      { label: 'Size', options: ['4U', '6U', '9U', '12U', '15U'] },
      { label: 'Depth', options: ['400 mm', '450 mm', '500 mm', '600 mm'] },
    ],
  },
];

/* ──────────────────────── FILTER CONSTANTS ──────────────────────── */

const ENV_VALUES = ['Indoor', 'Outdoor (IP-rated)'] as const;

const MOUNT_VALUES = [
  'Rack Mount (19"/21")',
  'Wall Mount',
  'Pole Mount',
  'DIN Rail Mount',
  'Aerial/Duct/Underground',
] as const;

const CAP_BUCKETS = [
  { value: 12,  label: 'Up to 12' },
  { value: 24,  label: 'Up to 24' },
  { value: 48,  label: 'Up to 48' },
  { value: 96,  label: 'Up to 96' },
  { value: 577, label: '144F+ (High Density, up to 576F)' },
] as const;

function capBucketMatches(cap: number | null, selectedBuckets: Set<number>): boolean {
  // null cap (e.g. Networking Rack) always passes the capacity filter
  if (cap === null) return true;
  if (selectedBuckets.size === 0) return false;
  if (cap <= 12)  return selectedBuckets.has(12);
  if (cap <= 24)  return selectedBuckets.has(24);
  if (cap <= 48)  return selectedBuckets.has(48);
  if (cap <= 96)  return selectedBuckets.has(96);
  return selectedBuckets.has(577); // 144F+
}

/* ──────────────────────── RESULT CARD ──────────────────────── */

function ResultCard({ item }: { item: CatalogItem }) {
  const [expanded, setExpanded] = useState(false);
  const [port, setPort] = useState(item.ports?.[0] ?? '');
  const [acc, setAcc] = useState(item.accessories?.[0] ?? '');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useRfqCart();

  // Extra dropdown state: keyed by label
  const [extras, setExtras] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    item.extraDropdowns?.forEach((d) => {
      init[d.label] = d.options[0];
    });
    return init;
  });

  const setExtra = (label: string, value: string) => {
    setExtras((prev) => ({ ...prev, [label]: value }));
  };

  // FMS dynamic Fiber Count
  const fmsFiberOptions = useMemo(() => {
    if (!item.fmsDynamic) return null;
    const rackHeight = extras['Rack Height'] || 'Rack 1U';
    return getFmsFiberCounts(rackHeight, port);
  }, [item.fmsDynamic, extras['Rack Height'], port]);

  const [fmsFiber, setFmsFiber] = useState('');

  // Reset FMS fiber count when options change
  const currentFmsFiber = useMemo(() => {
    if (!fmsFiberOptions || fmsFiberOptions.length === 0) return '';
    if (fmsFiberOptions.includes(fmsFiber)) return fmsFiber;
    return fmsFiberOptions[0];
  }, [fmsFiberOptions, fmsFiber]);

  const handleAdd = () => {
    const specParts: string[] = [];
    if (port) specParts.push(port);
    if (acc) specParts.push(acc);
    Object.entries(extras).forEach(([label, value]) => {
      specParts.push(`${label}: ${value}`);
    });
    if (item.fmsDynamic && currentFmsFiber) {
      specParts.push(`Fiber Count: ${currentFmsFiber}`);
    }

    addItem({
      title: item.title,
      specs: specParts.join(' · ') || 'Standard Specs',
      image: item.image,
      qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasConfig = item.ports || item.accessories || (item.extraDropdowns && item.extraDropdowns.length > 0);

  return (
    <div className={`sel-card${expanded ? ' expanded' : ''}`}>
      <div className="sel-card-img">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            if (!e.currentTarget.src.endsWith('/images/fiber-patch-panel.webp')) {
              e.currentTarget.src = '/images/fiber-patch-panel.webp';
            }
          }}
        />
      </div>
      <div className="sel-card-body">
        <div className="sel-badges">
          {item.tags.map((t) => (
            <span key={t} className="sel-badge sel-tag">{t}</span>
          ))}
        </div>
        <h3>{item.title}</h3>
        <p>{item.desc}</p>
        {hasConfig ? (
          <button
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Close Options' : 'Configure & Quote'}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleAdd}
          >
            {added ? '✓ Added to Quote' : 'Add to Quote'}
          </button>
        )}
      </div>

      {/* Expandable Configuration Panel */}
      <div className="sel-config-panel">
        {/* Port Interface */}
        {item.ports && item.ports.length > 0 && (
          <div className="sel-config-row">
            <label>Port Interface</label>
            {item.ports.length === 1 ? (
              <div className="sel-config-single">{item.ports[0]}</div>
            ) : (
              <select value={port} onChange={(e) => setPort(e.target.value)}>
                {item.ports.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Accessories / Load State */}
        {item.accessories && item.accessories.length > 0 && (
          <div className="sel-config-row">
            <label>Accessories / Load State</label>
            {item.accessories.length === 1 ? (
              <div className="sel-config-single">{item.accessories[0]}</div>
            ) : (
              <select value={acc} onChange={(e) => setAcc(e.target.value)}>
                {item.accessories.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Extra Dropdowns */}
        {item.extraDropdowns?.map((d) => (
          <div key={d.label} className="sel-config-row">
            <label>{d.label}</label>
            <select
              value={extras[d.label] || d.options[0]}
              onChange={(e) => setExtra(d.label, e.target.value)}
            >
              {d.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}

        {/* FMS Dynamic Fiber Count */}
        {item.fmsDynamic && fmsFiberOptions && fmsFiberOptions.length > 0 && (
          <div className="sel-config-row">
            <label>Fiber Count</label>
            <select value={currentFmsFiber} onChange={(e) => setFmsFiber(e.target.value)}>
              {fmsFiberOptions.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity + Add to Quote */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ width: 60, padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
            aria-label="Quantity"
          />
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={handleAdd}
          >
            {added ? '✓ Added' : 'Add to Quote'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── MAIN PAGE ──────────────────────── */

export default function FiberSelector() {
  const [envFilters, setEnvFilters] = useState<Set<string>>(new Set(ENV_VALUES));
  const [mountFilters, setMountFilters] = useState<Set<string>>(new Set(MOUNT_VALUES));
  const [capFilters, setCapFilters] = useState<Set<number>>(new Set(CAP_BUCKETS.map((b) => b.value)));

  function toggleSet<T>(prev: Set<T>, value: T): Set<T> {
    const next = new Set(prev);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  const filtered = CATALOG.filter((item) => {
    // Environment: item matches if ANY of its env values are in the selected set
    const envMatch = item.env.some((e) => envFilters.has(e));
    // Mount: item matches if ANY of its mount values are in the selected set
    const mountMatch = item.mount.some((m) => mountFilters.has(m));
    // Capacity
    const capMatch = capBucketMatches(item.cap, capFilters);
    return envMatch && mountMatch && capMatch;
  });

  return (
    <>
      <Seo
        title="Cable Management Selector | PDR World"
        description="Filter, configure, and specify PDR cable management products — patch panels, ODFs, splice closures, termination boxes, and networking racks for your network build."
        canonical="https://pdr-sable.vercel.app/fiber-selector"
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdr-sable.vercel.app/' },
        { name: 'Products', url: 'https://pdr-sable.vercel.app/products' },
        { name: 'Cable Management Selector', url: 'https://pdr-sable.vercel.app/fiber-selector' },
      ]} />
      <SoftwareApplicationSchema
        name="PDR World Cable Management Selector"
        description="Interactive tool for filtering and configuring PDR cable management products: patch panels, fiber termination boxes, splice closures, wall mount enclosures, and networking racks."
        applicationCategory="BusinessApplication"
      />

      <section style={{ paddingTop: 120, paddingBottom: 80, background: 'var(--surface-3)' }}>
        <div className="container">
          <div style={{ maxWidth: 800 }}>
            <div className="eyebrow">Cable Management Devices</div>
            <h1 className="h2" style={{ marginBottom: '1rem' }}>
              Termination Boxes, ODFs &amp; Splice Closures
            </h1>
            <p>
              Indoor and outdoor enclosures built for telecom, ISP, and data centre installations. Filter by environment, mount type, and capacity — then configure port interfaces, load states, and accessories for each product.
            </p>
          </div>

          <div className="sel-layout">
            {/* ─── SIDEBAR FILTERS ─── */}
            <div className="sel-sidebar">
              {/* Environment */}
              <div className="sel-filter-group">
                <h4>Environment</h4>
                {ENV_VALUES.map((v) => (
                  <label key={v} className="sel-checkbox">
                    <input
                      type="checkbox"
                      checked={envFilters.has(v)}
                      onChange={() => setEnvFilters((p) => toggleSet(p, v))}
                    />
                    {' '}
                    {v}
                  </label>
                ))}
              </div>

              {/* Mount Type */}
              <div className="sel-filter-group">
                <h4>Mount Type</h4>
                {MOUNT_VALUES.map((v) => (
                  <label key={v} className="sel-checkbox">
                    <input
                      type="checkbox"
                      checked={mountFilters.has(v)}
                      onChange={() => setMountFilters((p) => toggleSet(p, v))}
                    />
                    {' '}
                    {v}
                  </label>
                ))}
              </div>

              {/* Max Capacity */}
              <div className="sel-filter-group">
                <h4>Max Capacity</h4>
                {CAP_BUCKETS.map((b) => (
                  <label key={b.value} className="sel-checkbox">
                    <input
                      type="checkbox"
                      checked={capFilters.has(b.value)}
                      onChange={() => setCapFilters((p) => toggleSet(p, b.value))}
                    />
                    {' '}
                    {b.label}
                  </label>
                ))}
              </div>
            </div>

            {/* ─── PRODUCT GRID ─── */}
            <div>
              <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--muted)' }}>
                Showing {filtered.length} product{filtered.length === 1 ? '' : 's'}
              </div>
              <div className="sel-grid">
                {filtered.length > 0 ? (
                  filtered.map((item) => <ResultCard key={item.id} item={item} />)
                ) : (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--muted)',
                    fontSize: 15,
                  }}>
                    No products match your current filters. Try adjusting the sidebar selections.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand footer line */}
      <section style={{
        textAlign: 'center',
        padding: '40px 20px',
        fontSize: 14,
        color: 'var(--muted)',
        fontStyle: 'italic',
      }}>
        Partner with PDR — we help you watch your bottom line.
      </section>
    </>
  );
}
