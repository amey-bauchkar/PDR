const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gfzknettmaclomxyimjf.supabase.co';

/**
 * Local asset mapping — maps Supabase Storage slugs to local paths served from Hostinger.
 * This eliminates egress for all existing product images and datasheets.
 * New admin-uploaded assets fall back to Supabase URL automatically.
 */
const LOCAL_IMAGE_MAP: Record<string, string> = {
  "aoc": "/images/products/aoc.png",
  "attenuator": "/images/products/attenuator.png",
  "cat6-panel": "/images/products/cat6-panel.jpeg",
  "dac": "/images/products/dac.png",
  "drone": "/images/products/drone.png",
  "fiber-spool": "/images/products/fiber-spool.png",
  "horizontal-closure": "/images/products/horizontal-closure.png",
  "hybrid-adapter": "/images/products/hybrid-adapter.png",
  "next-gen-splicer": "/images/products/next-gen-splicer.png",
  "olps": "/images/products/olps.png",
  "pocket-otdr": "/images/products/pocket-otdr.png",
  "pof-patchcord": "/images/products/pof-patchcord.png",
  "pon-power-meter": "/images/products/pon-power-meter.png",
  "sfp-100g-bidi": "/images/products/sfp-100g-bidi.png",
  "sfp-10g-bidi": "/images/products/sfp-10g-bidi.png",
  "sfp-10g-dual": "/images/products/sfp-10g-dual.png",
  "sfp-1g-bidi": "/images/products/sfp-1g-bidi.png",
  "sfp-25g-bidi": "/images/products/sfp-25g-bidi.png",
  "sfp-400g": "/images/products/sfp-400g.png",
  "sfp-40g": "/images/products/sfp-40g.png",
  "sfp-copper": "/images/products/sfp-copper.png",
  "smart-sfp": "/images/products/smart-sfp.jpeg",
  "vfl": "/images/products/vfl.png",
  "bypass-switch": "/images/products/bypass-switch.jpeg",
  "htb": "/images/products/htb.jpeg",
  "sfp-1g-dual": "/images/products/sfp-1g-dual.png",
  "uav-fiber-optic-spool": "/images/products/uav-fiber-optic-spool.png",
  "fpv-optical-terminal": "/images/products/fpv-optical-terminal.png",
  "wifi-wireless-fiber-endface-microscope": "/images/products/wifi-wireless-fiber-endface-microscope.png",
};

const LOCAL_DATASHEET_MAP: Record<string, string> = {
  "aoc": "/datasheets/aoc.pdf",
  "attenuator": "/datasheets/attenuator.pdf",
  "bare-fiber-adapter": "/datasheets/bare-fiber-adapter.pdf",
  "cassette-cleaner": "/datasheets/cassette-cleaner.pdf",
  "cat6-panel": "/datasheets/cat6-panel.pdf",
  "cat6-patch-cord": "/datasheets/cat6-patch-cord.pdf",
  "cleaner-pen": "/datasheets/cleaner-pen.pdf",
  "cpri-patchcord": "/datasheets/cpri-patchcord.pdf",
  "cwdm": "/datasheets/cwdm.pdf",
  "dac": "/datasheets/dac.pdf",
  "drone": "/datasheets/drone.pdf",
  "dwdm": "/datasheets/dwdm.pdf",
  "fanout-patch-cords": "/datasheets/fanout-patch-cords.pdf",
  "fdb": "/datasheets/fdb.pdf",
  "fiber-spool": "/datasheets/fiber-spool.pdf",
  "field-connector": "/datasheets/field-connector.pdf",
  "fo-patchcords": "/datasheets/fo-patchcords.pdf",
  "fusion-splicer": "/datasheets/fusion-splicer.pdf",
  "heat-shrink-closure": "/datasheets/heat-shrink-closure.pdf",
  "horizontal-closure": "/datasheets/horizontal-closure.pdf",
  "hybrid-adapter": "/datasheets/hybrid-adapter.pdf",
  "mode-conditioning": "/datasheets/mode-conditioning.pdf",
  "mpo-assembly": "/datasheets/mpo-assembly.pdf",
  "mpo-cleaner": "/datasheets/mpo-cleaner.pdf",
  "next-gen-splicer": "/datasheets/next-gen-splicer.pdf",
  "olps": "/datasheets/olps.pdf",
  "plc-splitter": "/datasheets/plc-splitter.pdf",
  "pocket-otdr": "/datasheets/pocket-otdr.pdf",
  "pof-patchcord": "/datasheets/pof-patchcord.pdf",
  "pon-power-meter": "/datasheets/pon-power-meter.pdf",
  "rack-mount-fms": "/datasheets/rack-mount-fms.pdf",
  "rapid-push": "/datasheets/rapid-push.pdf",
  "regular-opm": "/datasheets/regular-opm.pdf",
  "sfp-100g-bidi": "/datasheets/sfp-100g-bidi.pdf",
  "sfp-10g-bidi": "/datasheets/sfp-10g-bidi.pdf",
  "sfp-10g-dual": "/datasheets/sfp-10g-dual.pdf",
  "sfp-1g-bidi": "/datasheets/sfp-1g-bidi.pdf",
  "sfp-25g-bidi": "/datasheets/sfp-25g-bidi.pdf",
  "sfp-400g": "/datasheets/sfp-400g.pdf",
  "sfp-40g": "/datasheets/sfp-40g.pdf",
  "sfp-copper": "/datasheets/sfp-copper.pdf",
  "smart-sfp": "/datasheets/smart-sfp.pdf",
  "smpte-assembly": "/datasheets/smpte-assembly.pdf",
  "vfl": "/datasheets/vfl.pdf",
  "wall-mount": "/datasheets/wall-mount.pdf",
  "bypass-switch": "/datasheets/bypass-switch.pdf",
  "htb": "/datasheets/htb.pdf",
  "sfp-1g-dual": "/datasheets/sfp-1g-dual.pdf",
  "uav-fiber-optic-spool": "/datasheets/uav-fiber-optic-spool.pdf",
  "fpv-optical-terminal": "/datasheets/fpv-optical-terminal.pdf",
  "fiber-optic-adapter": "/datasheets/fiber-optic-adapter.pdf",
  "wifi-wireless-fiber-endface-microscope": "/datasheets/wifi-wireless-fiber-endface-microscope.pdf",
};

const SYNCED_DATASHEET_FILENAMES: Record<string, string> = {
  "attenuator": "1783331246231-variablefiberopticattenuator_datasheet.pdf",
  "bare-fiber-adapter": "1783331270086-bare_fiber_adapter_datasheet.pdf",
  "cassette-cleaner": "1783331297990-fiberopticconnectorcleaner_datasheet.pdf",
  "cat6-panel": "1783331102628-cat6_patchpanel_datasheet_v3.pdf",
  "cat6-patch-cord": "1783684524968-utp_cat6_patchcord_datasheet_corrected.pdf",
  "cleaner-pen": "1783331345207-fiberopticcleanerpen_datasheet.pdf",
  "cpri-patchcord": "1783331367036-cpri_patchcord_datasheet_corrected.pdf",
  "cwdm": "1783331394449-cwdm_muxdemux_datasheet.pdf",
  "dac": "1783598330651-dac_datasheet_revised.pdf",
  "drone": "1783768884035-fpv_optical_terminal_datasheet.pdf",
  "dwdm": "1783331412913-dwdm_muxdemux_datasheet.pdf",
  "fanout-patch-cords": "1783331439851-fanoutpatchcord_datasheet_corrected.pdf",
  "fdb": "1783331124478-fdb24b_datasheet_v2.pdf",
  "fiber-spool": "1783935128770-g652d_fiberspool_datasheet.pdf",
  "field-connector": "1783934825982-fastconnector_datasheet.pdf",
  "fo-patchcords": "1783331574671-patchcord_pigtail_datasheet_corrected.pdf",
  "fusion-splicer": "1786047550061-fusionsplicer_pdr618h_datasheet.pdf",
  "heat-shrink-closure": "1786047183918-spliceclosure_datasheet_v2.pdf",
  "horizontal-closure": "1786047223882-horizontalspliceclosure_htsc-tl16_datasheet.pdf",
  "hybrid-adapter": "1786046950530-hybrid-adapter-datasheet.pdf",
  "mode-conditioning": "1786098830941-modeconditioningpatchcord_datasheet.pdf",
  "mpo-assembly": "1784550973009-mpo_cableassembly_datasheet_corrected.pdf",
  "mpo-cleaner": "mpo_cleaner_pen_datasheet.pdf",
  "next-gen-splicer": "1786047600801-fusion-splicer-pdr4107s-datasheet.pdf",
  "olps": "1786046587454-olps_datasheet.pdf",
  "plc-splitter": "1786115520063-plc_splitter_datasheet.pdf",
  "pocket-otdr": "1786095647272-nanootdr_datasheet.pdf",
  "pof-patchcord": "1786046896967-pof_cableassembly_datasheet.pdf",
  "pon-power-meter": "1786047409006-pdr4213b_ponpowermeter_datasheet.pdf",
  "rack-mount-fms": "1786041407889-rackmount_fms_datasheet_v5_rackonly.pdf",
  "rapid-push": "1786103244212-fttx-smart-bullet-drop-cable-assembly.pdf",
  "regular-opm": "1786095956617-miniopticalpowermeter_pdr60_datasheet.pdf",
  "sfp-100g-bidi": "1786046230361-optical_transceivers_datasheet_v2_compressed-1-.pdf",
  "sfp-10g-bidi": "1786046265208-optical_transceivers_datasheet_v2_compressed-1-.pdf",
  "sfp-10g-dual": "1786046420493-optical_transceivers_datasheet_v2_compressed-1-.pdf",
  "sfp-1g-bidi": "1786046458495-optical_transceivers_datasheet_v2_compressed-1-.pdf",
  "sfp-25g-bidi": "1786046391302-optical_transceivers_datasheet_v2_compressed-1-.pdf",
  "sfp-400g": "1786046329452-optical_transceivers_datasheet_v2_compressed-1-.pdf",
  "sfp-40g": "1786046359681-optical_transceivers_datasheet_v2_compressed-1-.pdf",
  "sfp-copper": "1786046535110-optical_transceivers_datasheet_v2_compressed-1-.pdf",
  "smart-sfp": "1787749869657-optismart-sfp_otdr.pdf",
  "smpte-assembly": "1786115559927-smpte_cableassembly_datasheet.pdf",
  "vfl": "1786103196405-bml209_faultlocator_datasheet.pdf",
  "wall-mount": "1786047123982-wallmountenclosure_datasheet_v2.pdf",
  "bypass-switch": "1783598428726-optical_bypass_switch_datasheet.pdf",
  "htb": "1786041472279-htb_datasheet_v2.pdf",
  "sfp-1g-dual": "1786046500544-optical_transceivers_datasheet_v2_compressed-1-.pdf",
  "uav-fiber-optic-spool": "1786092970636-pdr_drone_fiber_optic_spool_datasheet.pdf",
  "fpv-optical-terminal": "1787750364419-fpv_optical_terminal_datasheet.pdf",
  "fiber-optic-adapter": "1783949043808-fiber_optic_adapter_datasheet.pdf",
  "wifi-wireless-fiber-endface-microscope": "1786095925238-easyget-wifi-wireless-fiber-endface-microscope.pdf",
};

/**
 * Extracts the product slug from a Supabase Storage URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/product-images/aoc/product-image.png" → "aoc"
 */
function extractSlugFromSupabaseUrl(url: string, bucket: string): string | null {
  const pattern = new RegExp(`/storage/v1/object/public/${bucket}/([^/]+)/`);
  const match = url.match(pattern);
  return match ? match[1] : null;
}

function extractFileNameFromUrl(url: string): string | null {
  const clean = url.split('?')[0];
  const parts = clean.split('/');
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

/**
 * Converts a stored object key, Supabase Storage URL, or legacy proxy path
 * into a URL that is served locally from Hostinger (zero egress) for baseline files,
 * while seamlessly allowing new admin uploads to pass through immediately.
 */
export function getAssetUrl(key: string | undefined | null): string {
  if (!key) return '';

  // Intercept Supabase Storage URLs for product-images bucket → serve locally
  if (key.includes('supabase.co/storage') && key.includes('/product-images/')) {
    const slug = extractSlugFromSupabaseUrl(key, 'product-images');
    if (slug && LOCAL_IMAGE_MAP[slug]) {
      return LOCAL_IMAGE_MAP[slug];
    }
    // No local mapping (new admin-uploaded product) — fall through to original URL
  }

  // Intercept Supabase Storage URLs for product-datasheets bucket:
  // Only serve locally if this matches the baseline file that was synced to disk at build time.
  // If an admin uploaded a newer datasheet in Supabase, pass through the new URL directly!
  if (key.includes('supabase.co/storage') && key.includes('/product-datasheets/')) {
    const slug = extractSlugFromSupabaseUrl(key, 'product-datasheets');
    const fileName = extractFileNameFromUrl(key);
    if (slug && LOCAL_DATASHEET_MAP[slug] && fileName && SYNCED_DATASHEET_FILENAMES[slug] === fileName) {
      return LOCAL_DATASHEET_MAP[slug]; // Baseline file → local zero egress
    }
    // Newly uploaded file with different timestamp or new slug → return authentic URL directly
    return key;
  }

  // For backward compatibility: if a URL was previously saved as a CDN proxy URL (which fails on Hostinger due to static file interception),
  // we rewrite it BACK to the absolute Supabase URL.
  if (key.includes('/cdn/storage/')) {
    const supabaseBaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gfzknettmaclomxyimjf.supabase.co';
    return key.replace('/cdn/storage/', `${supabaseBaseUrl}/storage/v1/object/public/`);
  }

  // If it's already a full HTTP/HTTPS URL, pass it through untouched
  if (key.startsWith('http')) return key;

  // If it's a relative static asset path (e.g. "/datasheets/..." or "/images/..."), keep it
  if (key.startsWith('/') || key.startsWith('./')) return key;

  // Otherwise treat as a raw bucket object key and route through proxy
  return `/cdn/storage/${key}`;
}
