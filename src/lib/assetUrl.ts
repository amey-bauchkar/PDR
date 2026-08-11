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

/**
 * Extracts the product slug from a Supabase Storage URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/product-images/aoc/product-image.png" → "aoc"
 */
function extractSlugFromSupabaseUrl(url: string, bucket: string): string | null {
  const pattern = new RegExp(`/storage/v1/object/public/${bucket}/([^/]+)/`);
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * Converts a stored object key, Supabase Storage URL, or legacy proxy path
 * into a URL that is served locally from Hostinger (zero egress) when possible,
 * falling back to the original Supabase URL for any new admin-uploaded assets.
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

  // Intercept Supabase Storage URLs for product-datasheets bucket → serve locally
  if (key.includes('supabase.co/storage') && key.includes('/product-datasheets/')) {
    const slug = extractSlugFromSupabaseUrl(key, 'product-datasheets');
    if (slug && LOCAL_DATASHEET_MAP[slug]) {
      return LOCAL_DATASHEET_MAP[slug];
    }
    // No local mapping (new admin-uploaded datasheet) — fall through to original URL
  }

  // If it's already a full HTTP/HTTPS URL and does not contain /cdn/storage, pass through untouched
  if (key.startsWith('http') && !key.includes('/cdn/storage/')) return key;

  // Replace legacy "/cdn/storage/" prefix with canonical Supabase Storage public path
  if (key.includes('/cdn/storage/')) {
    return key.replace(/^.*\/cdn\/storage\//, `${SUPABASE_URL}/storage/v1/object/public/`);
  }

  // If it's a relative static asset path (e.g. "/datasheets/..." or "/images/..."), keep it
  if (key.startsWith('/') || key.startsWith('./')) return key;

  // Otherwise treat as a raw bucket object key
  return `${SUPABASE_URL}/storage/v1/object/public/${key}`;
}
