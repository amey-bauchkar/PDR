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

// Standard connector body colors (matches industry convention)
// APC connectors: green housing | UPC SM: blue housing | UPC MM: beige/ivory housing
function housingColor(apc: boolean, multimode: boolean) {
  if (apc) return 0x16a34a; // green for APC
  if (multimode) return 0xd4a373; // beige/ivory for OM3/OM4
  return 0x1d4ed8; // royal blue for SM-UPC
}

// SC (Subscriber Connector) — square push-pull, ceramic ferrule
function buildSC(side: number, _fc: number, bc: number, apc: boolean, multimode = false) {
  const g = new THREE.Group();
  const housing = housingColor(apc, multimode);

  // Strain-relief boot (tapered, fiber jacket color)
  const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.06, 0.28, 16), pm(bc, 25));
  boot.position.y = 0.14;
  g.add(boot);
  // Boot grip rings
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.084 - i * 0.005, 0.008, 6, 24), pm(bc, 60));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.06 + i * 0.07;
    g.add(ring);
  }

  // Square housing body (the signature SC look)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.45, 0.27), pm(housing, 70, 0x222244));
  body.position.y = 0.5;
  g.add(body);

  // Recessed channel along top for grip
  const channel = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.27), pm(0x111111, 30));
  channel.position.set(0, 0.62, 0);
  g.add(channel);

  // Squeeze-release tab on top (slightly raised wing)
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.16, 0.08), pm(housing, 60));
  tab.position.set(0, 0.55, 0.14);
  g.add(tab);

  // Ferrule guard (raised collar at front)
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.16), pm(housing, 70, 0x222244));
  guard.position.y = 0.78;
  g.add(guard);

  // White ceramic ferrule
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 24), pm(0xf5f5f5, 180, 0xffffff));
  if (apc) fer.rotation.z = 0.14; // angled APC face
  fer.position.y = 0.93;
  g.add(fer);

  // Ferrule tip (slightly different shade)
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.02, 24), pm(0xeaeaea, 200));
  tip.position.y = 1.04;
  g.add(tip);

  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

// LC (Lucent Connector) — half-size, hinged release latch
function buildLC(side: number, _fc: number, bc: number, apc: boolean, multimode = false) {
  const g = new THREE.Group();
  const housing = housingColor(apc, multimode);

  // Strain-relief boot
  const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.22, 16), pm(bc, 25));
  boot.position.y = 0.11;
  g.add(boot);
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.006, 6, 24), pm(bc, 60));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05 + i * 0.08;
    g.add(ring);
  }

  // Small square housing
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.32, 0.16), pm(housing, 70, 0x222244));
  body.position.y = 0.4;
  g.add(body);

  // Hinged release tab on top (LC signature)
  const tabHinge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.06), pm(housing, 50));
  tabHinge.position.set(0, 0.5, 0.08);
  g.add(tabHinge);
  const tabArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.04), pm(housing, 50));
  tabArm.position.set(0, 0.42, 0.09);
  tabArm.rotation.x = -0.4;
  g.add(tabArm);

  // Ferrule guard
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.1), pm(housing, 70, 0x222244));
  guard.position.y = 0.6;
  g.add(guard);

  // 1.25mm ceramic ferrule (smaller than SC)
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 24), pm(0xf5f5f5, 180, 0xffffff));
  if (apc) fer.rotation.z = 0.14;
  fer.position.y = 0.72;
  g.add(fer);

  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 24), pm(0xeaeaea, 200));
  tip.position.y = 0.82;
  g.add(tip);

  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

// FC (Ferrule Connector) — round body, threaded knurled nut
function buildFC(side: number, _fc: number, bc: number, apc = false) {
  const g = new THREE.Group();

  // Strain-relief boot
  const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.24, 16), pm(bc, 25));
  boot.position.y = 0.12;
  g.add(boot);

  // Black backbone behind nut
  const backbone = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 20), pm(0x222222, 80, 0x444444));
  backbone.position.y = 0.3;
  g.add(backbone);

  // Knurled threaded coupling nut (the FC signature)
  // Built from a slightly higher-poly cylinder with surface rings
  const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 32), pm(0xc0c0c0, 180, 0x999999));
  nut.position.y = 0.56;
  g.add(nut);

  // Knurled grip ridges around the nut
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.4, 0.012),
      pm(0xaaaaaa, 140, 0x888888),
    );
    ridge.position.set(Math.sin(angle) * 0.158, 0.56, Math.cos(angle) * 0.158);
    ridge.rotation.y = -angle;
    g.add(ridge);
  }

  // Top and bottom rim of the nut (slightly larger to define the knurled section)
  [0.37, 0.75].forEach((y) => {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.04, 32), pm(0xb0b0b0, 160));
    rim.position.y = y;
    g.add(rim);
  });

  // Key slot indicator (small notch on top)
  const key = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), pm(0x444444, 60));
  key.position.set(0, 0.78, 0.13);
  g.add(key);

  // Ferrule guard
  const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 24), pm(0xb0b0b0, 130));
  guard.position.y = 0.82;
  g.add(guard);

  // 2.5mm ceramic ferrule
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 24), pm(0xf5f5f5, 180, 0xffffff));
  if (apc) fer.rotation.z = 0.14;
  fer.position.y = 0.95;
  g.add(fer);

  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.02, 24), pm(0xeaeaea, 200));
  tip.position.y = 1.05;
  g.add(tip);

  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

// ST (Straight Tip) — round body with bayonet quarter-turn mount
function buildST(side: number, _fc: number, bc: number) {
  const g = new THREE.Group();

  // Strain-relief boot
  const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.24, 16), pm(bc, 25));
  boot.position.y = 0.12;
  g.add(boot);

  // Black backbone
  const backbone = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 20), pm(0x1a1a1a, 80));
  backbone.position.y = 0.28;
  g.add(backbone);

  // Bayonet coupling sleeve (chrome-finish, smooth + flared)
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.32, 28), pm(0xb8b8b8, 200, 0x888888));
  sleeve.position.y = 0.5;
  g.add(sleeve);

  // Sleeve rim
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.06, 28), pm(0xa0a0a0, 160));
  flange.position.y = 0.68;
  g.add(flange);

  // Bayonet slots (two L-shaped cutouts represented as small dark recesses on either side)
  [0, Math.PI].forEach((a) => {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.015), pm(0x222222, 40));
    slot.position.set(Math.sin(a) * 0.151, 0.5, Math.cos(a) * 0.151);
    slot.rotation.y = -a;
    g.add(slot);
    const slotHook = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.015), pm(0x222222, 40));
    slotHook.position.set(Math.sin(a) * 0.151, 0.43, Math.cos(a) * 0.151);
    slotHook.rotation.y = -a;
    g.add(slotHook);
  });

  // Ferrule guard
  const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 24), pm(0xb0b0b0, 130));
  guard.position.y = 0.76;
  g.add(guard);

  // 2.5mm ceramic ferrule
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 24), pm(0xf5f5f5, 180, 0xffffff));
  fer.position.y = 0.9;
  g.add(fer);

  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.02, 24), pm(0xeaeaea, 200));
  tip.position.y = 1.0;
  g.add(tip);

  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

// MPO/MTP (Multi-fiber Push-On) — rectangular face with guide pins, pull tab
function buildMPO(side: number, fc: number, bc: number, apc = false) {
  const g = new THREE.Group();
  const housing = apc ? 0x16a34a : 0x1d4ed8;

  // Strain-relief boot (wider for MPO ribbon cable)
  const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.09, 0.28, 16), pm(bc, 25));
  boot.position.y = 0.14;
  g.add(boot);

  // Housing body — rectangular (taller than wide)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.26), pm(housing, 70, 0x111133));
  body.position.y = 0.53;
  g.add(body);

  // Side grip recesses
  [0.18, -0.18].forEach((x) => {
    const recess = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.34, 0.27), pm(0x0a0a2a, 40));
    recess.position.set(x, 0.53, 0);
    g.add(recess);
  });

  // Pull tab on top (the MPO signature)
  const pullTab = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.18), pm(0xeeeeee, 60));
  pullTab.position.y = 0.8;
  g.add(pullTab);
  const pullTabRibs = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.12), pm(fc, 80));
  pullTabRibs.position.y = 0.82;
  g.add(pullTabRibs);

  // Ferrule face (white ceramic block)
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.16), pm(0xfafafa, 200, 0xffffff));
  face.position.y = 0.85;
  g.add(face);

  // Two precision alignment guide pins
  [-0.13, 0.13].forEach((x) => {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 12), pm(0xcccccc, 200, 0xaaaaaa));
    pin.position.set(x, 0.92, 0);
    g.add(pin);
  });

  // 12 fiber holes (visualized as small dark dots in a single row)
  for (let i = 0; i < 12; i++) {
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.025, 8), pm(0x111111, 10));
    hole.position.set(-0.11 + i * 0.02, 0.91, 0);
    g.add(hole);
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

    const multimode = fiberKey.startsWith('mm_');
    [1, -1].forEach((side) => {
      const c = getBuilder(cd.shape)(side, f.cableColor, f.jacketColor, cd.apc, multimode);
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
