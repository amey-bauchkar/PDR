import { useState } from 'react';
import Seo from '../components/Seo';
import { useRfqCart } from '../components/RfqCartProvider';

type CatalogItem = {
  id: string;
  title: string;
  desc: string;
  image: string;
  env: 'Indoor' | 'Outdoor';
  mount: 'Rack Mount' | 'Wall Mount' | 'Pole Mount';
  cap: number;
  ports: string[];
  accessories: string[];
};

const CATALOG: CatalogItem[] = [
  {
    id: 'FMS-1U-24',
    title: '1U Rack Mount LIU - 24 Core',
    desc: 'Sliding tray patch panel for standard 19-inch racks.',
    image: '/images/fiber-patch-panel.png',
    env: 'Indoor',
    mount: 'Rack Mount',
    cap: 24,
    ports: ['LC Duplex', 'SC Simplex', 'ST Simplex'],
    accessories: ['Splice Trays Only', 'Pre-loaded Pigtails', 'Fully Loaded (Adapters + Pigtails)'],
  },
  {
    id: 'FMS-2U-48',
    title: '2U High Density ODF - 48 Core',
    desc: 'High density patch panel with integrated cable management.',
    image: '/images/fiber-patch-panel.png',
    env: 'Indoor',
    mount: 'Rack Mount',
    cap: 48,
    ports: ['LC Duplex', 'SC Duplex'],
    accessories: ['Splice Trays Only', 'Fully Loaded (Adapters + Pigtails)'],
  },
  {
    id: 'FDB-OUT-16',
    title: 'Outdoor IP65 Termination Box',
    desc: 'Weatherproof enclosure for FTTH drops and pole mounting.',
    image: '/images/fiber-patch-panel.png',
    env: 'Outdoor',
    mount: 'Pole Mount',
    cap: 24,
    ports: ['SC Simplex', 'LC Duplex'],
    accessories: ['Splitter Installed', 'Empty'],
  },
  {
    id: 'WMS-IN-48',
    title: 'Indoor Wall Mount Enclosure',
    desc: 'Compact dual-door lockable enclosure for building telecom rooms.',
    image: '/images/fiber-patch-panel.png',
    env: 'Indoor',
    mount: 'Wall Mount',
    cap: 48,
    ports: ['LC Duplex', 'SC Simplex'],
    accessories: ['Splice Trays Only', 'Fully Loaded'],
  },
  {
    id: 'FMS-4U-144',
    title: '4U Enterprise ODF - 144 Core',
    desc: 'Maximum capacity data center distribution frame.',
    image: '/images/fiber-patch-panel.png',
    env: 'Indoor',
    mount: 'Rack Mount',
    cap: 144,
    ports: ['LC Duplex', 'MPO Cassettes'],
    accessories: ['Empty Frame', 'Loaded with Cassettes'],
  },
];

const ENV_VALUES = ['Indoor', 'Outdoor'] as const;
const MOUNT_VALUES = ['Rack Mount', 'Wall Mount', 'Pole Mount'] as const;
const CAP_BUCKETS = [24, 48, 96, 144] as const;

function capBucketMatches(cap: number, buckets: Set<number>) {
  if (cap <= 24) return buckets.has(24);
  if (cap <= 48) return buckets.has(48);
  if (cap <= 96) return buckets.has(96);
  return buckets.has(144);
}

function ResultCard({ item }: { item: CatalogItem }) {
  const [expanded, setExpanded] = useState(false);
  const [port, setPort] = useState(item.ports[0]);
  const [acc, setAcc] = useState(item.accessories[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useRfqCart();

  const handleAdd = () => {
    addItem({ title: item.title, specs: `${port} · ${acc}`, image: item.image, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`sel-card${expanded ? ' expanded' : ''}`}>
      <div className="sel-card-img">
        <img src={item.image} alt={item.title} />
      </div>
      <div className="sel-card-body">
        <div className="sel-badges">
          <span className="sel-badge">{item.env}</span>
          <span className="sel-badge">{item.mount}</span>
          <span className="sel-badge">{item.cap} Core Max</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.desc}</p>
        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Close Options' : 'Configure Options'}
        </button>
      </div>

      <div className="sel-config-panel">
        <div className="sel-config-row">
          <label>Port Interface</label>
          <select value={port} onChange={(e) => setPort(e.target.value)}>
            {item.ports.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="sel-config-row">
          <label>Accessories / Load State</label>
          <select value={acc} onChange={(e) => setAcc(e.target.value)}>
            {item.accessories.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ width: 60, padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
          />
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAdd}>
            {added ? '✓ Added' : 'Add to Quote'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FiberSelector() {
  const [envFilters, setEnvFilters] = useState<Set<string>>(new Set(ENV_VALUES));
  const [mountFilters, setMountFilters] = useState<Set<string>>(new Set(MOUNT_VALUES));
  const [capFilters, setCapFilters] = useState<Set<number>>(new Set(CAP_BUCKETS));

  function toggleSet<T>(prev: Set<T>, value: T): Set<T> {
    const next = new Set(prev);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  const filtered = CATALOG.filter(
    (i) => envFilters.has(i.env) && mountFilters.has(i.mount) && capBucketMatches(i.cap, capFilters),
  );

  return (
    <>
      <Seo
        title="Fiber Management Selector | PDR World"
        description="Filter, configure, and specify rack and wall mount fiber enclosures for your network build."
        canonical="https://pdrworld.com/fiber-selector"
      />

      <section style={{ paddingTop: 120, paddingBottom: 80, background: 'var(--surface-3)' }}>
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Interactive Selector</div>
            <h2>Fiber Management Selector</h2>
            <p>Filter, configure, and specify rack and wall mount enclosures for your network build.</p>
          </div>

          <div className="sel-layout">
            <div className="sel-sidebar">
              <div className="sel-filter-group">
                <h4>Environment</h4>
                {ENV_VALUES.map((v) => (
                  <label key={v} className="sel-checkbox">
                    <input type="checkbox" checked={envFilters.has(v)} onChange={() => setEnvFilters((p) => toggleSet(p, v))} />
                    {' '}
                    {v === 'Outdoor' ? 'Outdoor / IP65+' : v}
                  </label>
                ))}
              </div>

              <div className="sel-filter-group">
                <h4>Mount Type</h4>
                {MOUNT_VALUES.map((v) => (
                  <label key={v} className="sel-checkbox">
                    <input type="checkbox" checked={mountFilters.has(v)} onChange={() => setMountFilters((p) => toggleSet(p, v))} />
                    {' '}
                    {v === 'Rack Mount' ? '19" Rack Mount' : v}
                  </label>
                ))}
              </div>

              <div className="sel-filter-group">
                <h4>Max Capacity</h4>
                {CAP_BUCKETS.map((v) => (
                  <label key={v} className="sel-checkbox">
                    <input type="checkbox" checked={capFilters.has(v)} onChange={() => setCapFilters((p) => toggleSet(p, v))} />
                    {' '}
                    {v === 144 ? '144+ Core (High Density)' : `Up to ${v} Core`}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--muted)' }}>
                Showing {filtered.length} product{filtered.length === 1 ? '' : 's'}
              </div>
              <div className="sel-grid">
                {filtered.map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
