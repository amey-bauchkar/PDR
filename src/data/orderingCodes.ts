// ─── PDR Ordering Code System ───
// 5-segment part number: [Assembly] - [End#1 Connector] - [End#2 Connector] - [Cable Type] - [Length]

export type CodeEntry = { code: string; label: string; group?: string };

// ──────────────────────────────────────────
// SEGMENT 1 — Assembly Information (Fiber)
// ──────────────────────────────────────────
export const ASSEMBLY_CODES: CodeEntry[] = [
  { code: 'S1', label: 'Single Mode G652D', group: 'Single Mode' },
  { code: 'S2', label: 'Single Mode G657A1', group: 'Single Mode' },
  { code: 'S3', label: 'Single Mode G65721', group: 'Single Mode' },
  { code: 'M1', label: 'Multimode OM1', group: 'Multimode' },
  { code: 'M2', label: 'Multimode OM2', group: 'Multimode' },
  { code: 'M3', label: 'Multimode OM3', group: 'Multimode' },
  { code: 'M4', label: 'Multimode OM4', group: 'Multimode' },
  { code: 'M5', label: 'Multimode OM5', group: 'Multimode' },
];

// ──────────────────────────────────────────
// SEGMENT 2 & 3 — Connector Types
// End #2 uses the same codes, or "00" for pigtail
// ──────────────────────────────────────────

export const CONNECTOR_CODES_SM: CodeEntry[] = [
  { code: 'F2', label: 'FC type UPC', group: 'Single Mode' },
  { code: 'C2', label: 'SC type UPC', group: 'Single Mode' },
  { code: 'T2', label: 'ST type UPC', group: 'Single Mode' },
  { code: 'L2', label: 'LC type UPC', group: 'Single Mode' },
  { code: 'L6', label: 'LC TYPE APC', group: 'Single Mode' },
  { code: 'F6', label: 'FC TYPE APC', group: 'Single Mode' },
  { code: 'C6', label: 'SC type APC', group: 'Single Mode' },
  { code: 'U6', label: 'MU type UPC', group: 'Single Mode' },
];

export const CONNECTOR_CODES_MM: CodeEntry[] = [
  { code: 'F8', label: 'FC', group: 'Multimode' },
  { code: 'C8', label: 'SC', group: 'Multimode' },
  { code: 'T8', label: 'ST', group: 'Multimode' },
  { code: 'L8', label: 'LC', group: 'Multimode' },
  { code: 'A5', label: 'SMA905', group: 'Multimode' },
  { code: 'L12', label: 'LC type 90 deg', group: 'Multimode' },
  { code: 'C3', label: 'CS', group: 'Multimode' },
  { code: 'L3', label: 'LC Uniboot', group: 'Multimode' },
  { code: 'M5', label: 'MPO (M) 12F', group: 'Multimode' },
  { code: 'M6', label: 'MPO (F) 12F', group: 'Multimode' },
  { code: 'M7', label: 'MPO (M) 24F', group: 'Multimode' },
  { code: 'M8', label: 'MPO (F) 24F', group: 'Multimode' },
];

export const CONNECTOR_CODES_SHARED: CodeEntry[] = [
  { code: 'E2', label: 'E2000/UPC', group: 'Shared' },
  { code: 'E6', label: 'E2000/APC', group: 'Shared' },
  { code: 'L9', label: 'LC type 90 deg', group: 'Shared' },
  { code: 'C1', label: 'CS type UPC', group: 'Shared' },
  { code: 'L1', label: 'LC type UPC Uniboot', group: 'Shared' },
  { code: 'M1', label: 'MPO/UPC (M) 12F', group: 'Shared' },
  { code: 'M2', label: 'MPO/UPC (F) 12F', group: 'Shared' },
  { code: 'M3', label: 'MPO/UPC (M) 24F', group: 'Shared' },
  { code: 'M4', label: 'MPO/UPC (F) 24F', group: 'Shared' },
];

export const PIGTAIL_CODE: CodeEntry = { code: '00', label: 'Pigtail (no connector)' };

/** All connector codes merged for lookup */
export const ALL_CONNECTOR_CODES: CodeEntry[] = [
  PIGTAIL_CODE,
  ...CONNECTOR_CODES_SM,
  ...CONNECTOR_CODES_MM,
  ...CONNECTOR_CODES_SHARED,
];

/** Get connector options based on selected assembly */
export function getConnectorOptions(assemblyCode: string): CodeEntry[] {
  const isSM = assemblyCode.startsWith('S');
  const base = isSM ? CONNECTOR_CODES_SM : CONNECTOR_CODES_MM;
  return [PIGTAIL_CODE, ...base, ...CONNECTOR_CODES_SHARED];
}

// ──────────────────────────────────────────
// SEGMENT 4 — Cable Type
// ──────────────────────────────────────────

export const CABLE_CODES_SM: CodeEntry[] = [
  { code: '01', label: 'Jacket Simplex, 3.0mm', group: 'Single Mode 9/125µm' },
  { code: '02', label: 'Jacket Duplex, 3.0mm×2', group: 'Single Mode 9/125µm' },
  { code: '03', label: '900µm Fiber', group: 'Single Mode 9/125µm' },
  { code: '09', label: 'Jacket Simplex, 2.0mm', group: 'Single Mode 9/125µm' },
  { code: '16', label: 'Jacket Duplex, 2.0mm×2', group: 'Single Mode 9/125µm' },
  { code: '10', label: 'Mini-zipcord Duplex 1.8mm×2', group: 'Single Mode 9/125µm' },
  { code: '31', label: 'FTA Arm Duplex, 8mm', group: 'Single Mode 9/125µm' },
  { code: '43', label: 'FTTH Jacket Simplex, 3.0mm', group: 'Single Mode 9/125µm' },
  { code: '51', label: '12F Fanout, 3.0mm', group: 'Single Mode 9/125µm' },
  { code: '52', label: '24F Fanout, 3.5mm', group: 'Single Mode 9/125µm' },
  { code: '61', label: '12F Fanout, 8mm', group: 'Single Mode 9/125µm' },
  { code: '62', label: '24F Fanout, 10mm', group: 'Single Mode 9/125µm' },
];

export const CABLE_CODES_MM: CodeEntry[] = [
  { code: '07', label: 'Jacket Simplex, 3.0mm', group: 'Multimode 50/125µm' },
  { code: '08', label: 'Jacket Duplex, 3.0mm×2', group: 'Multimode 50/125µm' },
  { code: '20', label: '900µm Fiber', group: 'Multimode 50/125µm' },
  { code: '21', label: 'Jacket Simplex, 2.0mm', group: 'Multimode 50/125µm' },
  { code: '22', label: 'Jacket Duplex, 2.0mm×2', group: 'Multimode 50/125µm' },
  { code: '11', label: 'Mini-zipcord Duplex 1.8mm×2', group: 'Multimode 50/125µm' },
  { code: '32', label: 'FTA Arm Duplex, 7mm', group: 'Multimode 50/125µm' },
  { code: '54', label: '12F Fanout, 3.0mm', group: 'Multimode 50/125µm' },
  { code: '55', label: '24F Fanout, 3.5mm', group: 'Multimode 50/125µm' },
  { code: '64', label: '12F Fanout, 8mm', group: 'Multimode 50/125µm' },
  { code: '65', label: '24F Fanout, 10mm', group: 'Multimode 50/125µm' },
];

/** Get cable options based on selected assembly */
export function getCableOptions(assemblyCode: string): CodeEntry[] {
  return assemblyCode.startsWith('S') ? CABLE_CODES_SM : CABLE_CODES_MM;
}

// ──────────────────────────────────────────
// SEGMENT 5 — Patch Cord Length
// 4-digit code ÷ 10 = length in meters
// ──────────────────────────────────────────

export const LENGTH_PRESETS: { code: string; label: string }[] = [
  { code: '0005', label: '0.5 meter' },
  { code: '0010', label: '1.0 meter' },
  { code: '0015', label: '1.5 meter' },
  { code: '0020', label: '2.0 meter' },
  { code: '0030', label: '3.0 meter' },
  { code: '0050', label: '5.0 meter' },
  { code: '0100', label: '10.0 meter' },
  { code: '0150', label: '15.0 meter' },
  { code: '0200', label: '20.0 meter' },
  { code: '0300', label: '30.0 meter' },
  { code: '0500', label: '50.0 meter' },
  { code: '1000', label: '100.0 meter' },
];

/** Convert length in meters to 4-digit code */
export function lengthToCode(meters: number): string {
  const val = Math.round(meters * 10);
  return String(val).padStart(4, '0');
}

/** Convert 4-digit code to length in meters */
export function codeToLength(code: string): number {
  return parseInt(code, 10) / 10;
}

// ──────────────────────────────────────────
// Part Number Generation & Parsing
// ──────────────────────────────────────────

export interface PartNumberConfig {
  assembly: string;
  connector1: string;
  connector2: string;
  cableType: string;
  lengthCode: string;
}

export function generatePartNumber(config: PartNumberConfig): string {
  return `${config.assembly}-${config.connector1}-${config.connector2}-${config.cableType}-${config.lengthCode}`;
}

export interface ParsedPartNumber {
  valid: boolean;
  assembly?: CodeEntry;
  connector1?: CodeEntry;
  connector2?: CodeEntry;
  cableType?: CodeEntry;
  lengthCode?: string;
  lengthMeters?: number;
  errors: string[];
}

export function parsePartNumber(pn: string): ParsedPartNumber {
  const errors: string[] = [];
  const parts = pn.trim().split('-').map((s) => s.trim());

  if (parts.length !== 5) {
    return { valid: false, errors: ['Part number must have exactly 5 segments separated by dashes (e.g. S1-L6-C2-01-0030)'] };
  }

  const [asmCode, c1Code, c2Code, cabCode, lenCode] = parts;

  // Assembly
  const assembly = ASSEMBLY_CODES.find((c) => c.code === asmCode);
  if (!assembly) errors.push(`Invalid assembly code "${asmCode}". Expected: ${ASSEMBLY_CODES.map((c) => c.code).join(', ')}`);

  // Connector 1
  const connector1 = ALL_CONNECTOR_CODES.find((c) => c.code === c1Code);
  if (!connector1) errors.push(`Invalid End #1 connector code "${c1Code}".`);

  // Connector 2
  const connector2 = ALL_CONNECTOR_CODES.find((c) => c.code === c2Code);
  if (!connector2) errors.push(`Invalid End #2 connector code "${c2Code}".`);

  // Cable type
  const allCables = [...CABLE_CODES_SM, ...CABLE_CODES_MM];
  const cableType = allCables.find((c) => c.code === cabCode);
  if (!cableType) errors.push(`Invalid cable type code "${cabCode}".`);

  // Length
  const lenNum = parseInt(lenCode, 10);
  const validLen = /^\d{4}$/.test(lenCode) && lenNum >= 1 && lenNum <= 9990;
  if (!validLen) errors.push(`Invalid length code "${lenCode}". Must be 4 digits, 0001–9990.`);

  return {
    valid: errors.length === 0,
    assembly,
    connector1,
    connector2,
    cableType,
    lengthCode: lenCode,
    lengthMeters: validLen ? lenNum / 10 : undefined,
    errors,
  };
}
