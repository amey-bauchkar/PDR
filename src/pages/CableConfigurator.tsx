import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Seo from '../components/Seo';
import { BreadcrumbSchema, SoftwareApplicationSchema } from '../components/Schema';
import { useRfqCart } from '../components/RfqCartProvider';
import { generatePartNumber, lengthToCode, getCableOptions } from '../data/orderingCodes';
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
      'FC/PC':  { sub: 'Physical contact · standard SM', shape: 'fc', apc: false },
      'ST/APC': { sub: 'Bayonet · angled polish', shape: 'st', apc: true },
      'ST/PC':  { sub: 'Bayonet · standard polish', shape: 'st', apc: false },
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
  mm_om1: {
    label: 'Multimode OM1',
    sub: '62.5/125 µm · Legacy LAN',
    dot: '#F59E0B',
    tagBg: '#FFF4DB',
    tagColor: '#B45309',
    cableColor: 0xf59e0b,
    cableR: 0.092,
    jacketColor: 0xb45309,
    connectors: {
      'SC/UPC': { sub: 'Standard · legacy datacom', shape: 'sc', apc: false },
      'LC/UPC': { sub: 'Small form factor', shape: 'lc', apc: false },
      'FC/PC':  { sub: 'Physical contact · screw lock', shape: 'fc', apc: false },
      'ST/PC':  { sub: 'Bayonet · classic LAN', shape: 'st', apc: false },
    },
    jackets: {
      LSZH: { sub: 'Orange jacket · plenum rated' },
      PVC: { sub: 'Standard indoor · LAN runs' },
      'Riser': { sub: 'Vertical pathway · CMR rated' },
    },
    sp: { core: '62.5/125 µm', wl: '850/1300 nm', att: '3.5 dB/km', std: 'TIA-492AAAA' },
  },
  mm_om2: {
    label: 'Multimode OM2',
    sub: '50/125 µm · 1G–10G LAN',
    dot: '#F97316',
    tagBg: '#FFE7D6',
    tagColor: '#9A3412',
    cableColor: 0xf97316,
    cableR: 0.088,
    jacketColor: 0x9a3412,
    connectors: {
      'SC/UPC': { sub: 'Standard · short-range LAN', shape: 'sc', apc: false },
      'LC/UPC': { sub: 'Small form · most common', shape: 'lc', apc: false },
      'FC/PC':  { sub: 'Physical contact · lab use', shape: 'fc', apc: false },
      'ST/PC':  { sub: 'Bayonet · LAN & CCTV', shape: 'st', apc: false },
    },
    jackets: {
      LSZH: { sub: 'Orange jacket · plenum rated' },
      PVC: { sub: 'Standard indoor · LAN runs' },
      'Riser': { sub: 'Vertical pathway · CMR rated' },
    },
    sp: { core: '50/125 µm', wl: '850/1300 nm', att: '3.0 dB/km', std: 'TIA-492AAAB' },
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
      'ST/PC':  { sub: 'Bayonet · standard polish', shape: 'st', apc: false },
      'FC/PC':  { sub: 'Physical contact · test rigs', shape: 'fc', apc: false },
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
      'ST/PC':  { sub: 'Bayonet · legacy support', shape: 'st', apc: false },
      'FC/PC':  { sub: 'Physical contact · test gear', shape: 'fc', apc: false },
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

  // Square housing body — cleaner, beveled top corners to read as the SC silhouette
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, 0.28), pm(housing, 90, 0x223355));
  body.position.y = 0.55;
  g.add(body);

  // Side wing recesses (grip indents) — matte black to define the body edges
  [0.142, -0.142].forEach((z) => {
    const recess = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.01), pm(0x0a0a18, 20));
    recess.position.set(0, 0.55, z);
    g.add(recess);
  });

  // Ferrule guard collar — slightly recessed (the SC nose ring before the ferrule)
  const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.08, 24), pm(housing, 100, 0x223355));
  guard.position.y = 0.82;
  g.add(guard);

  // White ceramic ferrule (2.5mm equivalent)
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.22, 24), pm(0xf5f5f5, 180, 0xffffff));
  if (apc) fer.rotation.z = 0.14;
  fer.position.y = 0.97;
  g.add(fer);

  // Ferrule tip
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.02, 24), pm(0xeaeaea, 200));
  tip.position.y = 1.09;
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
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.34, 0.17), pm(housing, 90, 0x223355));
  body.position.y = 0.4;
  g.add(body);

  // Hinged release latch — anchored at the front of the body, arm extends BACK toward the boot.
  // This is the LC signature: an angled lever you press toward the body to unlatch.
  const latchAnchor = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.02, 0.04), pm(housing, 70));
  latchAnchor.position.set(0, 0.56, 0.06);
  g.add(latchAnchor);
  const latchArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.18), pm(housing, 70));
  latchArm.position.set(0, 0.5, -0.02);
  latchArm.rotation.x = 0.22;
  g.add(latchArm);
  // Two release wings at the back of the latch arm (you pinch these to unlatch)
  [-0.06, 0.06].forEach((x) => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.05, 0.06), pm(housing, 70));
    wing.position.set(x, 0.46, -0.1);
    g.add(wing);
  });

  // Ferrule guard (small collar before the ferrule)
  const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.06, 18), pm(housing, 100, 0x223355));
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

// ST (Straight Tip) — round body with knurled bayonet quarter-turn coupling
function buildST(side: number, _fc: number, bc: number, apc = false) {
  const g = new THREE.Group();

  // Strain-relief boot
  const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.24, 16), pm(bc, 25));
  boot.position.y = 0.12;
  g.add(boot);

  // Black backbone behind sleeve
  const backbone = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 20), pm(0x1a1a1a, 80));
  backbone.position.y = 0.28;
  g.add(backbone);

  // Bayonet coupling sleeve (chrome-finish metal)
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.36, 32), pm(0xc8c8c8, 200, 0x9a9a9a));
  sleeve.position.y = 0.52;
  g.add(sleeve);

  // Knurled grip ridges around the sleeve — vertical lines define the metal grip
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.34, 0.01),
      pm(0xa8a8a8, 160, 0x888888),
    );
    ridge.position.set(Math.sin(angle) * 0.149, 0.52, Math.cos(angle) * 0.149);
    ridge.rotation.y = -angle;
    g.add(ridge);
  }

  // Top + bottom rims of the sleeve (slightly bulged to define the knurled section)
  [0.36, 0.7].forEach((y) => {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.158, 0.158, 0.05, 32), pm(0xb8b8b8, 160));
    rim.position.y = y;
    g.add(rim);
  });

  // Two bayonet keyway slots (L-shaped — represented as small dark notches on the sleeve)
  [0, Math.PI].forEach((a) => {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.012), pm(0x222222, 30));
    slot.position.set(Math.sin(a) * 0.156, 0.5, Math.cos(a) * 0.156);
    slot.rotation.y = -a;
    g.add(slot);
  });

  // Ferrule guard
  const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.06, 24), pm(0xb0b0b0, 130));
  guard.position.y = 0.78;
  g.add(guard);

  // 2.5mm ceramic ferrule
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 24), pm(0xf5f5f5, 180, 0xffffff));
  if (apc) fer.rotation.z = 0.14;
  fer.position.y = 0.93;
  g.add(fer);

  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.02, 24), pm(0xeaeaea, 200));
  tip.position.y = 1.04;
  g.add(tip);

  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

// MPO/MTP (Multi-fiber Push-On) — black rectangular body, aqua boot, white pull-tab from rear
function buildMPO(side: number, _fc: number, _bc: number, apc = false) {
  const g = new THREE.Group();
  // MPO body is matte black regardless of fiber type; APC variant has a key indicator
  const body_c = 0x1a1a1a;
  // Boot is industry-standard aqua/teal for MPO (matches OM3/OM4 ribbon cable convention)
  const bootColor = 0x2dd4bf;

  // Strain-relief boot — aqua/teal, wider than single-fiber connectors
  const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.3, 18), pm(bootColor, 50));
  boot.position.y = 0.15;
  g.add(boot);
  // Boot ribbed texture
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14 - i * 0.01, 0.01, 6, 24), pm(0x14b8a6, 80));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.07 + i * 0.07;
    g.add(ring);
  }

  // Pull-tab — extends OUT the back (toward the boot), the MPO signature
  const tabBase = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.12), pm(0xf0f0f0, 60));
  tabBase.position.set(0, 0.34, 0);
  g.add(tabBase);

  // Housing body — matte black rectangle (taller than wide)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.5, 0.28), pm(body_c, 60, 0x222222));
  body.position.y = 0.58;
  g.add(body);

  // Top latch / housing top accent
  const topAccent = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.3), pm(0x0a0a0a, 40));
  topAccent.position.y = 0.81;
  g.add(topAccent);

  // Side grip recesses
  [0.21, -0.21].forEach((x) => {
    const recess = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.4, 0.29), pm(0x0a0a0a, 30));
    recess.position.set(x, 0.58, 0);
    g.add(recess);
  });

  // APC key indicator (small green dot on top to mark angled polish)
  if (apc) {
    const key = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.04), pm(0x16a34a, 60));
    key.position.set(0, 0.83, 0.12);
    g.add(key);
  }

  // Ferrule face (white ceramic block) at the very top
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.18), pm(0xfafafa, 200, 0xffffff));
  face.position.y = 0.87;
  g.add(face);

  // Two precision alignment guide pins flanking the 12-fiber row
  [-0.155, 0.155].forEach((x) => {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), pm(0xdddddd, 200, 0xaaaaaa));
    pin.position.set(x, 0.92, 0);
    g.add(pin);
  });

  // 12 fiber holes
  for (let i = 0; i < 12; i++) {
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.025, 8), pm(0x111111, 10));
    hole.position.set(-0.115 + i * 0.021, 0.91, 0);
    g.add(hole);
  }

  g.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return g;
}

function getBuilder(s: Connector['shape']) {
  return ({ sc: buildSC, lc: buildLC, fc: buildFC, st: buildST, mpo: buildMPO } as const)[s] || buildSC;
}

const asmMap: Record<string, string> = {
  sm_os2: 'S1', mm_om1: 'M1', mm_om2: 'M2', mm_om3: 'M3', mm_om4: 'M4',
};

export default function CableConfigurator() {
  const [fiberKey, setFiberKey] = useState<keyof typeof FIBERS>('sm_os2');
  const [connectorA, setConnectorA] = useState('SC/APC');
  const [connectorB, setConnectorB] = useState('SC/APC');
  const [jacket, setJacket] = useState('LSZH');
  const [cableTypeCode, setCableTypeCode] = useState('01');
  const [length, setLength] = useState(3);
  const [useCustomLen, setUseCustomLen] = useState(false);
  const [customLenValue, setCustomLenValue] = useState('100');
  const [customLenUnit, setCustomLenUnit] = useState<'m' | 'km'>('m');
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
    const cdA = f.connectors[connectorA] || Object.values(f.connectors)[0];
    const cdB = f.connectors[connectorB] || cdA;
    const cLen = 1.1 + length * 0.13;
    const isArm = jacket === 'Armoured';
    const isMPO = cdA.shape === 'mpo' || cdB.shape === 'mpo';
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
    // side=+1 is the RIGHT end (Connector A), side=-1 is the LEFT end (Connector B)
    [
      { side: 1 as 1 | -1, cd: cdA },
      { side: -1 as 1 | -1, cd: cdB },
    ].forEach(({ side, cd }) => {
      const c = getBuilder(cd.shape)(side, f.cableColor, f.jacketColor, cd.apc, multimode);
      c.position.x = side * (cLen / 2 + (cd.shape === 'mpo' ? 0.09 : 0.06));
      group.add(c);
    });
  }, [fiberKey, connectorA, connectorB, jacket, length]);

  // When fiber changes, default both connectors and jacket to first option
  const onFiberChange = (key: keyof typeof FIBERS) => {
    setFiberKey(key);
    const firstConn = Object.keys(FIBERS[key].connectors)[0];
    setConnectorA(firstConn);
    setConnectorB(firstConn);
    setJacket(Object.keys(FIBERS[key].jackets)[0]);
    const asm = asmMap[key] || 'S1';
    setCableTypeCode(getCableOptions(asm)[0].code);
  };


  const connectorSummary = connectorA === connectorB ? connectorA : `${connectorA} → ${connectorB}`;
  const lengthLabel = useCustomLen && customLenValue.trim() ? `${customLenValue.trim()} ${customLenUnit}` : `${length} m`;

  // Map configurator state to ordering code
  const orderingCode = useMemo(() => {
    // Connector mapping (configurator label → ordering code)
    const connMap: Record<string, string> = {
      'SC/APC': 'C6', 'LC/APC': 'L6', 'FC/APC': 'F6', 'ST/APC': 'T2',
      'SC/UPC': 'C2', 'LC/UPC': 'L2', 'FC/PC': 'F2', 'ST/PC': 'T2', 'ST/UPC': 'T2',
      'MPO/MTP': 'M5', 'E2000/APC': 'E6',
    };
    // Cable type: default mapping based on fiber + jacket
    const asm = asmMap[fiberKey] || 'S1';
    const c1 = connMap[connectorA] || 'L2';
    const c2 = connMap[connectorB] || c1;
    const cab = cableTypeCode;
    const effectiveLen = useCustomLen && customLenValue.trim()
      ? (customLenUnit === 'km'
        ? lengthToCode(parseFloat(customLenValue) * 1000)
        : lengthToCode(parseFloat(customLenValue)))
      : lengthToCode(length);
    return generatePartNumber({ assembly: asm, connector1: c1, connector2: c2, cableType: cab, lengthCode: effectiveLen });
  }, [fiberKey, connectorA, connectorB, cableTypeCode, length, useCustomLen, customLenValue, customLenUnit]);

  const currentAsm = asmMap[fiberKey] || 'S1';
  const cableOptions = getCableOptions(currentAsm);
  const cableLabel = cableOptions.find(c => c.code === cableTypeCode)?.label || '';

  const specCells: [string, string, boolean][] = useMemo(
    () => [
      ['Fiber type', fiber.label, true],
      ['Connector A', connectorA, true],
      ['Connector B', connectorB, true],
      ['Cable Type', cableLabel, false],
      ['Length', lengthLabel, true],
      ['Part No.', orderingCode, true],
    ],
    [fiber.label, connectorA, connectorB, cableLabel, lengthLabel, orderingCode],
  );

  const handleAdd = () => {
    const item = `${fiber.label} · ${connectorSummary} · ${jacket} · ${cableLabel} · ${lengthLabel}`;
    setLocalCart((prev) => [...prev, item]);
    addItem({
      title: `Custom ${fiber.label} Patchcord`,
      specs: `${connectorSummary} · ${jacket} · ${cableLabel} · ${lengthLabel}`,
      image: '/images/fiber-patchcord.webp',
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
        canonical="https://pdr-sable.vercel.app/cable-configurator"
      />

      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdr-sable.vercel.app/' },
        { name: 'Configurator Tools', url: 'https://pdr-sable.vercel.app/cable-configurator' },
        { name: 'Custom Cable Builder', url: 'https://pdr-sable.vercel.app/cable-configurator' },
      ]} />
      <SoftwareApplicationSchema 
        name="PDR World Custom Cable Builder"
        description="Interactive 3D configurator for building custom fiber optic patchcords and cable assemblies."
        applicationCategory="BusinessApplication"
      />
      <main className="cfg3-wrap">
        <h1 className="cfg3-title">Custom Fiber Optic Cable Configurator</h1>
        <p className="cfg3-sub">Build and visualize your custom fiber optic patch cords in real-time 3D. Select from Single Mode (OS2) or Multimode (OM3, OM4) fibers, pair with industry-standard SC, LC, FC, ST, or high-density MPO connectors, and choose the optimal jacket type (LSZH, PVC, Armoured, Outdoor PE) for your enterprise network infrastructure. Get an instant quote for your specific data center requirements.</p>

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
              <div className="cfg3-step-head">
                Step 2 — Connectors
                <button
                  type="button"
                  onClick={() => setConnectorB(connectorA)}
                  style={{
                    float: 'right',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    border: '1px solid var(--adm-border, #e5e7eb)',
                    background: 'transparent',
                    color: 'inherit',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                  title="Use the same connector on both ends"
                >
                  Mirror A → B
                </button>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cfg3-muted, #64748b)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Connector A (left end)
              </div>
              <div className="cfg3-conn-grid">
                {Object.entries(fiber.connectors).map(([key, val]) => (
                  <div
                    key={`a-${key}`}
                    className={`cfg3-copt${connectorA === key ? ' on' : ''}`}
                    onClick={() => setConnectorA(key)}
                  >
                    <div className="cfg3-cname">{key}</div>
                    <div className="cfg3-csub">{val.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cfg3-muted, #64748b)', margin: '14px 0 6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Connector B (right end)
              </div>
              <div className="cfg3-conn-grid">
                {Object.entries(fiber.connectors).map(([key, val]) => (
                  <div
                    key={`b-${key}`}
                    className={`cfg3-copt${connectorB === key ? ' on' : ''}`}
                    onClick={() => setConnectorB(key)}
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
              <div className="cfg3-step-head">Step 4 — Cable Type</div>
              <div className="cfg3-jack-grid">
                {cableOptions.map((opt) => (
                  <div
                    key={opt.code}
                    className={`cfg3-jopt${cableTypeCode === opt.code ? ' on' : ''}`}
                    onClick={() => setCableTypeCode(opt.code)}
                  >
                    <div className="cfg3-jname">{opt.label}</div>
                    <div className="cfg3-jsub">Code: {opt.code}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cfg3-step-card">
              <div className="cfg3-step-head">Step 5 — Length</div>
              {!useCustomLen ? (
                <>
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
                  <button
                    type="button"
                    className="cfg3-len-custom-toggle"
                    onClick={() => setUseCustomLen(true)}
                  >
                    Need a custom length? (up to 100s of km) →
                  </button>
                </>
              ) : (
                <>
                  <div className="cfg3-len-custom-row">
                    <input
                      type="number"
                      min={1}
                      className="cfg3-len-input"
                      value={customLenValue}
                      placeholder="Enter length"
                      onChange={(e) => setCustomLenValue(e.target.value)}
                    />
                    <select
                      className="cfg3-len-unit"
                      value={customLenUnit}
                      onChange={(e) => setCustomLenUnit(e.target.value as 'm' | 'km')}
                    >
                      <option value="m">m</option>
                      <option value="km">km</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    className="cfg3-len-custom-toggle"
                    onClick={() => setUseCustomLen(false)}
                  >
                    ← Back to standard lengths
                  </button>
                </>
              )}
            </div>

            <button className="cfg3-add-btn" onClick={handleAdd}>
              + Add to Quote Cart
            </button>
            {confirmation && <div className="cfg3-add-conf" style={{ display: 'block' }}>{confirmation}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
