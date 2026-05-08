import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Seo from '../components/Seo';
import { useRfqCart } from '../components/RfqCartProvider';
import '../styles/configurator-3d.css';

type Connector = { sub: string; shape: 'sc' | 'lc' | 'fc' | 'st' | 'mpo'; apc: boolean };
type Jacket = { sub: string };
type FiberDef = {
  label: string;
  sub: string;
  dot: string;
  tagBg: string;
  tagColor: string;
  cableColor: number;
  cableR: number;
  jacketColor: number;
  connectors: Record<string, Connector>;
  jackets: Record<string, Jacket>;
  sp: { core: string; wl: string; att: string; std: string };
};

const FIBERS: Record<string, FiberDef> = {
  sm_os2: {
    label: 'Single Mode OS2',
    sub: '9/125 µm · Long-haul & telecom',
    dot: '#2277DD',
    tagBg: '#E8F0FC',
    tagColor: '#1A55AA',
    cableColor: 0x2277dd,
    cableR: 0.065,
    jacketColor: 0x1a55aa,
    connectors: {
      'SC/APC': { sub: 'Angled · lowest back-reflection', shape: 'sc', apc: true },
      'LC/APC': { sub: 'Small form · high density panels', shape: 'lc', apc: true },
      'FC/APC': { sub: 'Threaded · lab & test equipment', shape: 'fc', apc: true },
      'SC/UPC': { sub: 'Flat polish · general SM use', shape: 'sc', apc: false },
      'LC/UPC': { sub: 'Small form · datacom links', shape: 'lc', apc: false },
    },
    jackets: {
      LSZH: { sub: 'Low smoke · indoor safe areas' },
      PVC: { sub: 'Standard indoor · cost effective' },
      Armoured: { sub: 'Crush resistant · ducts & risers' },
      'Outdoor PE': { sub: 'UV stable · external runs' },
    },
    sp: { core: '9/125 µm', wl: '1310/1550 nm', att: '0.36 dB/km', std: 'G.652D' },
  },
  mm_om3: {
    label: 'Multimode OM3',
    sub: '50/125 µm · 10G–100G datacentre',
    dot: '#1A9E6A',
    tagBg: '#E4F7EF',
    tagColor: '#116644',
    cableColor: 0x1a9e6a,
    cableR: 0.088,
    jacketColor: 0x127a50,
    connectors: {
      'SC/UPC': { sub: 'Standard · short-range LAN', shape: 'sc', apc: false },
      'LC/UPC': { sub: 'Most common · SFP/SFP+ modules', shape: 'lc', apc: false },
      'ST/UPC': { sub: 'Bayonet · legacy LAN & CCTV', shape: 'st', apc: false },
      'MPO/MTP': { sub: '12-fibre · parallel optics', shape: 'mpo', apc: false },
    },
    jackets: {
      LSZH: { sub: 'Aqua jacket · plenum rated' },
      PVC: { sub: 'Standard indoor · LAN runs' },
      Armoured: { sub: 'Raised floor protection' },
      'Tight Buffer': { sub: 'Easy termination · patch areas' },
    },
    sp: { core: '50/125 µm', wl: '850/1300 nm', att: '3.5 dB/km', std: 'IEC 11801' },
  },
  mm_om4: {
    label: 'Multimode OM4',
    sub: '50/125 µm · 40G/100G VCSEL',
    dot: '#8844CC',
    tagBg: '#F0EAFF',
    tagColor: '#5522AA',
    cableColor: 0x8844cc,
    cableR: 0.092,
    jacketColor: 0x6622aa,
    connectors: {
      'LC/UPC': { sub: 'Dominant · 40G/100G transceivers', shape: 'lc', apc: false },
      'SC/UPC': { sub: 'Duplex · switch uplinks', shape: 'sc', apc: false },
      'MPO/MTP': { sub: 'High density · 100G SR4', shape: 'mpo', apc: false },
      'E2000/APC': { sub: 'Spring loaded · clean connection', shape: 'sc', apc: true },
    },
    jackets: {
      LSZH: { sub: 'Erika violet · standard OM4' },
      PVC: { sub: 'Budget indoor · short runs' },
      Armoured: { sub: 'Wall/floor penetrations' },
      'Tight Buffer': { sub: 'Flexible · patch cords' },
    },
    sp: { core: '50/125 µm', wl: '850 nm', att: '3.0 dB/km', std: 'TIA-492AAAD' },
  },
};

function pm(color: number, shin = 60, spec = 0x222222) {
  return new THREE.MeshPhongMaterial({ color, shininess: shin, specular: spec });
}

function buildSC(side: number, fc: number, bc: number, apc: boolean) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.085, 0.38, 16), pm(bc, 25)));
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.5, 16), pm(0x363636, 90, 0x444444));
  body.position.y = 0.43;
  g.add(body);
  [0.28, 0.58].forEach((y) => {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.168, 0.168, 0.06, 16), pm(0x2a2a2a));
    r.position.y = y;
    g.add(r);
  });
  const latch = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.34, 0.22), pm(fc, 40));
  latch.position.set(0, 0.43, 0.17);
  g.add(latch);
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.28, 16), pm(0xcccccc, 130, 0x999999));
  if (apc) fer.rotation.z = 0.14;
  fer.position.y = 0.8;
  g.add(fer);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.065, 0.065, 16), pm(0xeeeeee, 150));
  tip.position.set(0, 0.96, 0);
  g.add(tip);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.017, 8, 24), pm(fc, 110));
  ring.position.y = 0.43;
  g.add(ring);
  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

function buildLC(side: number, fc: number, bc: number, apc: boolean) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.058, 0.3, 14), pm(bc, 25)));
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.38, 14), pm(0x383838, 90, 0x444444));
  body.position.y = 0.33;
  g.add(body);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.16), pm(fc, 50));
  tab.position.set(0, 0.33, 0.13);
  g.add(tab);
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.22, 14), pm(0xcccccc, 130));
  if (apc) fer.rotation.z = 0.14;
  fer.position.y = 0.62;
  g.add(fer);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.053, 0.044, 0.055, 14), pm(0xeeeeee, 150));
  tip.position.set(0, 0.76, 0);
  g.add(tip);
  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

function buildFC(side: number, _fc: number, bc: number) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.34, 16), pm(bc, 25)));
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.148, 0.148, 0.5, 16), pm(0xb8a000, 120, 0x666600));
  body.position.y = 0.42;
  g.add(body);
  for (let i = 0; i < 8; i++) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.038, 16), pm(0xaa9000, 60));
    r.position.y = 0.17 + i * 0.063;
    g.add(r);
  }
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.26, 16), pm(0xdddddd, 130));
  fer.position.y = 0.82;
  g.add(fer);
  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

function buildST(side: number, _fc: number, bc: number) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.34, 16), pm(bc, 25)));
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.46, 16), pm(0xb8a000, 110));
  body.position.y = 0.4;
  g.add(body);
  const bay = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 3), pm(0xaa9000, 80));
  bay.position.y = 0.62;
  g.add(bay);
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.24, 16), pm(0xcccccc, 130));
  fer.position.y = 0.79;
  g.add(fer);
  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

function buildMPO(side: number, fc: number, bc: number) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.34, 16), pm(bc, 25)));
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.54, 0.3), pm(0x2e2e2e, 80, 0x444444));
  body.position.y = 0.47;
  g.add(body);
  const key = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.3), pm(fc, 60));
  key.position.set(0, 0.27, 0);
  g.add(key);
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.06), pm(0xcccccc, 120));
  face.position.y = 0.74;
  g.add(face);
  for (let i = 0; i < 6; i++) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 8), pm(0xaaaaaa, 120));
    pin.position.set(-0.12 + i * 0.048, 0.74, 0.06);
    g.add(pin);
  }
  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

function getBuilder(s: Connector['shape']) {
  return ({ sc: buildSC, lc: buildLC, fc: buildFC, st: buildST, mpo: buildMPO } as const)[s] || buildSC;
}

export default function CableConfigurator() {
  const [fiberKey, setFiberKey] = useState<keyof typeof FIBERS>('sm_os2');
  const [connector, setConnector] = useState('SC/APC');
  const [jacket, setJacket] = useState('LSZH');
  const [length, setLength] = useState(3);
  const [localCart, setLocalCart] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState('');

  const { addItem, open: openCart } = useRfqCart();

  const fiber = FIBERS[fiberKey];

  // Refs for Three.js
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const stateRef = useRef({ theta: 0.6, phi: 0.2, dist: 6, drag: false, px: 0, py: 0 });
  const animFrameRef = useRef<number | null>(null);

  // One-time scene setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const kl = new THREE.DirectionalLight(0xffffff, 1.0);
    kl.position.set(4, 6, 6);
    scene.add(kl);
    const fl = new THREE.DirectionalLight(0xffffff, 0.4);
    fl.position.set(-5, 2, -4);
    scene.add(fl);
    const rl = new THREE.DirectionalLight(0xffffff, 0.2);
    rl.position.set(0, -4, 3);
    scene.add(rl);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const onMouseDown = (e: MouseEvent) => {
      stateRef.current.drag = true;
      stateRef.current.px = e.clientX;
      stateRef.current.py = e.clientY;
      canvas.style.cursor = 'grabbing';
    };
    const onMouseUp = () => {
      stateRef.current.drag = false;
      canvas.style.cursor = 'grab';
    };
    const onMouseMove = (e: MouseEvent) => {
      const s = stateRef.current;
      if (!s.drag) return;
      s.theta -= (e.clientX - s.px) * 0.013;
      s.phi = Math.max(-0.85, Math.min(0.85, s.phi + (e.clientY - s.py) * 0.013));
      s.px = e.clientX;
      s.py = e.clientY;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      s.dist = Math.max(3, Math.min(10, s.dist + e.deltaY * 0.009));
    };
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop);
      const s = stateRef.current;
      s.theta += 0.004;
      camera.position.set(
        s.dist * Math.sin(s.theta) * Math.cos(s.phi),
        s.dist * Math.sin(s.phi),
        s.dist * Math.cos(s.theta) * Math.cos(s.phi),
      );
      camera.lookAt(0, 0, 0);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, []);

  // Rebuild cable + connectors on state change
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    while (group.children.length) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    const f = FIBERS[fiberKey];
    const cd = f.connectors[connector] || Object.values(f.connectors)[0];
    const cLen = 1.1 + length * 0.13;
    const isArm = jacket === 'Armoured';
    const isMPO = cd.shape === 'mpo';
    const cr = isMPO ? f.cableR * 1.4 : f.cableR;

    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(cr, cr, cLen, 20),
      pm(f.jacketColor, isArm ? 130 : 28, isArm ? 0x555555 : 0x111111),
    );
    cable.rotation.z = Math.PI / 2;
    group.add(cable);

    if (isArm) {
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const s = new THREE.Mesh(
          new THREE.CylinderGeometry(cr + 0.004, cr + 0.004, cLen, 3),
          pm(0x888888, 200, 0xaaaaaa),
        );
        s.rotation.z = Math.PI / 2;
        s.scale.x = 0.08;
        s.position.set(0, Math.sin(a) * (cr + 0.012), Math.cos(a) * (cr + 0.012));
        group.add(s);
      }
    } else {
      [-0.32, -0.02, 0.28].forEach((x) => {
        const r = new THREE.Mesh(new THREE.TorusGeometry(cr + 0.005, 0.011, 6, 32), pm(0xffffff, 80));
        r.rotation.y = Math.PI / 2;
        r.position.x = x;
        group.add(r);
      });
    }

    [1, -1].forEach((side) => {
      const c = getBuilder(cd.shape)(side, f.cableColor, f.jacketColor, cd.apc);
      c.position.x = side * (cLen / 2 + (isMPO ? 0.09 : 0.06));
      group.add(c);
    });
  }, [fiberKey, connector, jacket, length]);

  // When fiber changes, default connector and jacket to first option
  const onFiberChange = (key: keyof typeof FIBERS) => {
    setFiberKey(key);
    setConnector(Object.keys(FIBERS[key].connectors)[0]);
    setJacket(Object.keys(FIBERS[key].jackets)[0]);
  };

  const cd = fiber.connectors[connector] || Object.values(fiber.connectors)[0];

  const specCells: [string, string, boolean][] = useMemo(
    () => [
      ['Fiber type', fiber.label, true],
      ['Core/Clad', fiber.sp.core, false],
      ['Wavelength', fiber.sp.wl, false],
      ['Attenuation', fiber.sp.att, false],
      ['Standard', fiber.sp.std, false],
      ['Connector', connector, true],
      ['Polish', cd.apc ? 'APC — 8° angle' : 'UPC — flat', false],
      ['Jacket', jacket, false],
      ['Length', `${length} m`, true],
      ['Ins. loss', cd.apc ? '≤ 0.3 dB' : '≤ 0.2 dB', false],
    ],
    [fiber, connector, jacket, length, cd],
  );

  const handleAdd = () => {
    const item = `${fiber.label} · ${connector} · ${jacket} · ${length}m`;
    setLocalCart((prev) => [...prev, item]);
    addItem({
      title: `Custom ${fiber.label} Patchcord`,
      specs: `${connector} · ${jacket} · ${length} m`,
      image: '/images/fiber-patchcord.png',
      qty: 1,
    });
    setConfirmation(`Added: ${item}`);
    window.setTimeout(() => setConfirmation(''), 2500);
  };

  const cartLast = localCart.length ? localCart[localCart.length - 1] : '';
  const cartSummary = localCart.length === 0
    ? 'No items added yet'
    : `${cartLast}${localCart.length > 1 ? ` + ${localCart.length - 1} more` : ''}`;
  const cartCount = localCart.length === 0 ? '' : `${localCart.length} item${localCart.length > 1 ? 's' : ''}`;

  return (
    <div className="cfg3-page">
      <Seo
        title="Custom Cable Configurator | PDR World"
        description="Configure custom fiber optic cable assemblies with a real-time 3D preview. Choose fiber type, connector, jacket, and length — instant quote."
        canonical="https://pdrworld.com/cable-configurator"
      />

      
      <div className="cfg3-wrap">
        <div className="cfg3-title">Custom Cable Builder</div>
        <div className="cfg3-sub">Select your specifications below. The 3D model updates in real time.</div>

        <div className="cfg3-layout">
          <div className="cfg3-left">
            <div className="cfg3-viewer-box">
              <div className="cfg3-canvas-wrap">
                <canvas ref={canvasRef} className="cfg3-canvas" />
                <div className="cfg3-canvas-hint">Drag to rotate · scroll to zoom</div>
                <div
                  className="cfg3-fiber-tag"
                  style={{
                    background: fiber.tagBg,
                    color: fiber.tagColor,
                    border: `1px solid ${fiber.tagColor}44`,
                  }}
                >
                  {fiber.label}
                </div>
              </div>
              <div className="cfg3-spec-wrap">
                <div className="cfg3-sec-label">Live Specification</div>
                <div className="cfg3-spec-grid">
                  {specCells.map(([k, v, hi]) => (
                    <div key={k} className={`cfg3-sc${hi ? ' hi' : ''}`}>
                      <div className="cfg3-sc-k">{k}</div>
                      <div className="cfg3-sc-v">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="cfg3-cart-box">
              <div className="cfg3-cart-label">Quote Cart</div>
              <div className="cfg3-cart-items">{cartSummary}</div>
              <div className="cfg3-cart-count">{cartCount}</div>
              <button
                className="cfg3-rfq-btn"
                onClick={() => {
                  if (!localCart.length) {
                    alert('Add at least one item to your quote cart first.');
                    return;
                  }
                  openCart();
                }}
              >
                Submit RFQ →
              </button>
            </div>
          </div>

          <div className="cfg3-right">
            <div className="cfg3-step-card">
              <div className="cfg3-step-head">Step 1 — Fiber Type</div>
              <div className="cfg3-fiber-list">
                {(Object.entries(FIBERS) as [keyof typeof FIBERS, FiberDef][]).map(([key, def]) => (
                  <div
                    key={key}
                    className={`cfg3-fopt${fiberKey === key ? ' on' : ''}`}
                    onClick={() => onFiberChange(key)}
                  >
                    <div className="cfg3-fdot" style={{ background: def.dot }} />
                    <div>
                      <div className="cfg3-fname">{def.label}</div>
                      <div className="cfg3-fsub">{def.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cfg3-step-card">
              <div className="cfg3-step-head">Step 2 — Connector</div>
              <div className="cfg3-conn-grid">
                {Object.entries(fiber.connectors).map(([key, val]) => (
                  <div
                    key={key}
                    className={`cfg3-copt${connector === key ? ' on' : ''}`}
                    onClick={() => setConnector(key)}
                  >
                    <div className="cfg3-cname">{key}</div>
                    <div className="cfg3-csub">{val.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cfg3-step-card">
              <div className="cfg3-step-head">Step 3 — Cable Jacket</div>
              <div className="cfg3-jack-grid">
                {Object.entries(fiber.jackets).map(([key, val]) => (
                  <div
                    key={key}
                    className={`cfg3-jopt${jacket === key ? ' on' : ''}`}
                    onClick={() => setJacket(key)}
                  >
                    <div className="cfg3-jname">{key}</div>
                    <div className="cfg3-jsub">{val.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cfg3-step-card">
              <div className="cfg3-step-head">Step 4 — Length</div>
              <div className="cfg3-len-row">
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={length}
                  step={1}
                  onChange={(e) => setLength(parseInt(e.target.value, 10))}
                />
                <div className="cfg3-len-val">{length} m</div>
              </div>
            </div>

            <button className="cfg3-add-btn" onClick={handleAdd}>
              + Add to Quote Cart
            </button>
            {confirmation && <div className="cfg3-add-conf" style={{ display: 'block' }}>{confirmation}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
