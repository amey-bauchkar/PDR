import catalogueData from '../data/catalogue.json';
import attenuatorImg from '../assets/images/products/passive/attenuator.webp';
import bareFiber from '../assets/images/products/passive/bare-fiber-adapter.webp';
import cat6Cord from '../assets/images/products/passive/cat6-patch-cord.webp';
import cat6Panel from '../assets/images/products/passive/cat6-patch-panel.webp';
import cpri from '../assets/images/products/passive/cpri-patchcord.webp';
import cwdm from '../assets/images/products/passive/cwdm-mux.webp';
import dwdm from '../assets/images/products/passive/dwdm-mux.webp';
import fanout from '../assets/images/products/passive/fanout-patch-cords.webp';
import fiberConnector from '../assets/images/products/passive/fiber-connector.webp';
import fiberPigtails from '../assets/images/products/passive/fiber-patch-pigtails.webp';
import loopback from '../assets/images/products/passive/loopback-patch-cord.webp';
import modeConditioning from '../assets/images/products/passive/mode-conditioning-patchcord.webp';
import mpoCable from '../assets/images/products/passive/mpo-cable-assembly.webp';
import plcSplitter from '../assets/images/products/passive/plc-splitter.webp';
import rapidPush from '../assets/images/products/passive/rapid-push-cable.webp';
import scAdapter from '../assets/images/products/passive/sc-apc-to-sc-upc-adapter.webp';
import smpteCable from '../assets/images/products/passive/smpte-cable.webp';

export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  active: '/images/sfp-transceiver.webp',
  passive: '/images/fiber-patchcord.webp',
  cable: '/images/fiber-patch-panel.webp',
  test: '/images/fiber-patch-panel.webp',
  specialty: '/images/hero-infrastructure.webp',
  tools: '/images/fiber-patch-panel.webp',
  'Active Components': '/images/sfp-transceiver.webp',
  'Passive Components': '/images/fiber-patchcord.webp',
  'Cable Management Devices': '/images/fiber-patch-panel.webp',
  'Test and Measurement': '/images/fiber-patch-panel.webp',
  'Maintenance Tools': '/images/fiber-patch-panel.webp',
  'Specialty Products': '/images/hero-infrastructure.webp',
};

export const PASSIVE_IMAGE_MAP: Record<string, string> = {
  attenuator: attenuatorImg,
  'bare-fiber-adapter': bareFiber,
  'cat6-patch-cord': cat6Cord,
  'cat6-patch-panel': cat6Panel,
  'cat6-panel': cat6Panel,
  'cpri-patchcord': cpri,
  cwdm,
  dwdm,
  'fanout-patch-cords': fanout,
  'field-connector': fiberConnector,
  'fo-patchcords': fiberPigtails,
  loopback,
  'mode-conditioning': modeConditioning,
  'mpo-assembly': mpoCable,
  'plc-splitter': plcSplitter,
  'rapid-push': rapidPush,
  'hybrid-adapter': scAdapter,
  'smpte-assembly': smpteCable,
  soc: '/images/live/fiber-optic-connector-field-installable.webp',
  drone: '/images/hero-infrastructure.webp',
  // --- Previously missing products (Layer 1 canonical fix) ---
  'armoured-patchcord': fiberPigtails,
  'pof-patchcord': fiberPigtails,
  'bendiboot-patchcord': fiberPigtails,
  'lc-uniboot': fiberPigtails,
  'mating-sleeve': bareFiber,
  'regular-opm': '/images/live/mini-optical-power-meter.webp',
  'pocket-otdr': '/images/live/mini-otdr-pdr4402s.webp',
  'next-gen-splicer': '/images/live/fusion-splicer-pdr618h.webp',
  vfl: '/images/live/fiber-optic-cleaner-pen.webp',
  'splice-sleeves': '/images/live/cold-shrink-sleeve.webp',
  'fiber-spool': '/images/live/rapid-push-cable-assembly.webp',
};

const catalogueImageBySlug = new Map<string, string>();

for (const section of (catalogueData as { sections?: { groups?: { cards?: { slug: string; img?: string }[] }[] }[] }).sections ?? []) {
  for (const group of section.groups ?? []) {
    for (const card of group.cards ?? []) {
      if (card.img && card.img.trim()) {
        catalogueImageBySlug.set(card.slug, card.img);
      }
    }
  }
}

/**
 * Global image resolver to ensure consistency across the app.
 * Priority:
 * 1. Bundled assets via PASSIVE_IMAGE_MAP
 * 2. catalogue.json (card.img)
 * 3. products.json (product.imageUrl)
 * 4. CATEGORY_IMAGE_MAP (fallback)
 */
export const resolveCanonicalProductImage = (slug?: string, productImageUrl?: string, categoryOrSectionId?: string): string => {
  if (productImageUrl && productImageUrl.trim()) {
    return productImageUrl;
  }

  if (slug && PASSIVE_IMAGE_MAP[slug]) {
    return PASSIVE_IMAGE_MAP[slug];
  }

  if (slug) {
    const catalogImg = catalogueImageBySlug.get(slug);
    if (catalogImg && catalogImg.trim()) {
      return catalogImg;
    }
  }

  if (categoryOrSectionId && CATEGORY_IMAGE_MAP[categoryOrSectionId]) {
    return CATEGORY_IMAGE_MAP[categoryOrSectionId];
  }

  return CATEGORY_IMAGE_MAP.passive || '/images/fiber-patchcord.webp';
};

/**
 * Returns a guaranteed valid fallback image path based on the category.
 * Used primarily for `onError` handlers in `img` tags.
 */
export const getFallbackImage = (categoryOrSectionId?: string): string => {
  if (categoryOrSectionId && CATEGORY_IMAGE_MAP[categoryOrSectionId]) {
    return CATEGORY_IMAGE_MAP[categoryOrSectionId];
  }
  return CATEGORY_IMAGE_MAP['Passive Components'] || '/images/fiber-patchcord.webp';
};
