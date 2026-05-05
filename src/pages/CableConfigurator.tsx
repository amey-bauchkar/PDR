import { useMemo, useState } from 'react';
import Seo from '../components/Seo';
import { useRfqCart } from '../components/RfqCartProvider';

type Selections = {
  fiber: string | null;
  connector: string | null;
  length: string | null;
  jacket: string | null;
};

const FIBER_OPTIONS = [
  { value: 'OS2', name: 'Single-mode OS2', desc: '9/125µm. Yellow Jacket. Up to 100km.' },
  { value: 'OM3', name: 'Multi-mode OM3', desc: '50/125µm. Aqua Jacket. 10G up to 300m.' },
  { value: 'OM4', name: 'Multi-mode OM4', desc: '50/125µm. Magenta Jacket. 10G up to 400m.' },
];
const CONNECTOR_OPTIONS = [
  { value: 'LC-LC', name: 'LC to LC', desc: 'High density. Push-pull latch.' },
  { value: 'SC-SC', name: 'SC to SC', desc: 'Standard density. Push-pull.' },
  { value: 'LC-SC', name: 'LC to SC', desc: 'Hybrid termination.' },
  { value: 'MPO', name: 'MPO/MTP', desc: '12 or 24 fiber high density.' },
];
const LENGTH_OPTIONS = [
  { value: '1m', name: '1 Meter', desc: '' },
  { value: '3m', name: '3 Meters', desc: '' },
  { value: '5m', name: '5 Meters', desc: '' },
  { value: '10m', name: '10 Meters', desc: '' },
  { value: 'Custom', name: 'Custom Length', desc: 'Specify in notes' },
];
const JACKET_OPTIONS = [
  { value: 'LSZH', name: 'LSZH (Standard)', desc: 'Low Smoke Zero Halogen. Indoor use.' },
  { value: 'Armored', name: 'Steel Armored', desc: 'Crush resistant. Tactical/Harsh environment.' },
  { value: 'Outdoor', name: 'Outdoor PE', desc: 'UV resistant. Waterproof.' },
];

const STEP_KEYS: (keyof Selections)[] = ['fiber', 'connector', 'length', 'jacket'];

export default function CableConfigurator() {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<Selections>({ fiber: null, connector: null, length: null, jacket: null });
  const [qty, setQty] = useState(1);
  const { addItem } = useRfqCart();

  const liveSpec = useMemo(() => {
    if (step === 5) return `${sel.connector} · ${sel.length} · ${sel.jacket}`;
    if (sel.fiber) return `${sel.fiber} Selected`;
    return 'Select Fiber Type';
  }, [step, sel]);

  const previewTitle = sel.fiber ? `Custom ${sel.fiber} Patch Cord` : 'Custom Assembly';

  const previewFilter = sel.fiber === 'OM3' ? 'hue-rotate(180deg)' : sel.fiber === 'OM4' ? 'hue-rotate(280deg)' : 'hue-rotate(0deg)';

  const mpoDisabled = sel.fiber === 'OS2';

  const select = (cat: keyof Selections, value: string) => {
    setSel((prev) => {
      const next = { ...prev, [cat]: value };
      // OS2 disables MPO
      if (cat === 'fiber' && value === 'OS2' && prev.connector === 'MPO') next.connector = null;
      return next;
    });
  };

  const canAdvance = sel[STEP_KEYS[step - 1]] != null || step === 5;

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const finalize = () => {
    if (!sel.fiber || !sel.connector || !sel.length || !sel.jacket) return;
    addItem({
      title: `Custom ${sel.fiber} Assembly`,
      specs: `${sel.connector}, ${sel.length}, ${sel.jacket}`,
      image: '/images/fiber-patchcord.png',
      qty,
    });
  };

  return (
    <>
      <Seo
        title="Custom Cable Configurator | PDR World"
        description="Configure custom fiber optic cable assemblies. Real-time validation and instant quoting from PDR World's Mumbai facility."
        canonical="https://pdrworld.com/cable-configurator"
      />

      <section style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Interactive Builder</div>
            <h2>Custom Cable Configurator</h2>
            <p>Configure custom fiber optic cable assemblies. Real-time validation and instant quoting.</p>
          </div>

          <div className="conf-layout">
            {/* Visualizer */}
            <div className="conf-visualizer">
              <div className="conf-summary-pill">{liveSpec}</div>
              <img
                src="/images/fiber-patchcord.png"
                alt="Cable Preview"
                style={{ filter: previewFilter, transition: 'filter .3s ease' }}
              />
              <h3 style={{ marginTop: 24, fontSize: 18 }}>{previewTitle}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8 }}>Estimated Lead Time: 2-3 Days (Mumbai Factory)</p>
            </div>

            {/* Wizard */}
            <div className="conf-wizard">
              {step === 1 && (
                <div className="conf-step active">
                  <h3>Step 1: Fiber Type</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>Select the core fiber specification.</p>
                  <div className="conf-options">
                    {FIBER_OPTIONS.map((o) => (
                      <div
                        key={o.value}
                        className={`conf-opt${sel.fiber === o.value ? ' selected' : ''}`}
                        onClick={() => select('fiber', o.value)}
                      >
                        <h4>{o.name}</h4>
                        <p>{o.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="conf-step active">
                  <h3>Step 2: Connector Ends</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>Select termination for End A and End B.</p>
                  <div className="conf-options">
                    {CONNECTOR_OPTIONS.map((o) => {
                      const disabled = o.value === 'MPO' && mpoDisabled;
                      return (
                        <div
                          key={o.value}
                          className={`conf-opt${sel.connector === o.value ? ' selected' : ''}`}
                          onClick={() => !disabled && select('connector', o.value)}
                          style={disabled ? { opacity: 0.3, pointerEvents: 'none' } : undefined}
                        >
                          <h4>{o.name}</h4>
                          <p>{disabled ? 'Not available for OS2' : o.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="conf-step active">
                  <h3>Step 3: Length</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>Select total cable length end-to-end.</p>
                  <div className="conf-options">
                    {LENGTH_OPTIONS.map((o) => (
                      <div
                        key={o.value}
                        className={`conf-opt${sel.length === o.value ? ' selected' : ''}`}
                        onClick={() => select('length', o.value)}
                      >
                        <h4>{o.name}</h4>
                        {o.desc && <p>{o.desc}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="conf-step active">
                  <h3>Step 4: Jacket / Environment</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>Select the physical cable protection.</p>
                  <div className="conf-options">
                    {JACKET_OPTIONS.map((o) => (
                      <div
                        key={o.value}
                        className={`conf-opt${sel.jacket === o.value ? ' selected' : ''}`}
                        onClick={() => select('jacket', o.value)}
                      >
                        <h4>{o.name}</h4>
                        <p>{o.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="conf-step active">
                  <h3>Review &amp; Add to Quote</h3>
                  <div
                    style={{
                      background: 'var(--surface-2)',
                      padding: 24,
                      borderRadius: 12,
                      marginTop: 24,
                      border: '1px solid var(--line)',
                    }}
                  >
                    {[
                      { label: 'Fiber Type', value: sel.fiber },
                      { label: 'Connectors', value: sel.connector },
                      { label: 'Length', value: sel.length },
                      { label: 'Jacket', value: sel.jacket },
                    ].map((row, i, arr) => (
                      <div
                        key={row.label}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: i === arr.length - 1 ? 0 : 12,
                          borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--line)',
                          paddingBottom: i === arr.length - 1 ? 0 : 12,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--muted)', fontSize: 14 }}>{row.label}</span>
                        <strong>{row.value || '-'}</strong>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ padding: 12, borderRadius: 8, border: '1px solid var(--line)', width: 100, fontSize: 16 }}
                    />
                  </div>
                </div>
              )}

              <div className="conf-nav">
                <button
                  className="btn btn-outline"
                  style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
                  onClick={back}
                >
                  ← Back
                </button>
                {step === 5 ? (
                  <button className="btn btn-primary add-to-quote-btn" onClick={finalize}>
                    Add to Quote
                  </button>
                ) : (
                  <button className="btn btn-primary" disabled={!canAdvance} onClick={next}>
                    Next Step →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
