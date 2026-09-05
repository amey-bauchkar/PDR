import catalogueData from '../data/catalogue.json';
import { getAssetUrl } from './assetUrl';

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
  active: '/images/active-components.webp',
  passive: '/images/live/fiber-optic-patch-cords-and-pigtails.webp',
  cable: '/images/live/rack-mount-fiber-management-system.webp',
  test: '/images/test-and-measurement.png',
  specialty: '/images/drone-optical-fiber-kit.png',
  tools: '/images/maintenance.png',
  'Active Components': '/images/active-components.webp',
  'Passive Components': '/images/live/fiber-optic-patch-cords-and-pigtails.webp',
  'Cable Management Devices': '/images/live/rack-mount-fiber-management-system.webp',
  'Test and Measurement': '/images/test-and-measurement.png',
  'Maintenance Tools': '/images/maintenance.png',
  'Specialty Products': '/images/drone-optical-fiber-kit.png',
  'Specialty Drones': '/images/drone-optical-fiber-kit.png',
  'Test and Measurement Equipment': '/images/test-and-measurement.png',
};

export const PASSIVE_IMAGE_MAP: Record<string, string> = {
  // Maintenance Tools
  'cleaner-pen': '/images/live/fiber-optic-cleaner-pen.webp',
  'mpo-cleaner': '/images/live/fiber-optic-cleaner-pen-mpo.webp',
  'cassette-cleaner': '/images/live/cassette-cleaner.webp',

  // Cable Management Devices
  'wall-mount': '/images/live/optical-fiber-wall-mount-enclosure.webp',
  'rack-mount-fms': '/images/live/rack-mount-fiber-management-system.webp',
  'fdb': '/images/live/fiber-distribution-box-fdb.webp',
  'htb': '/images/live/home-termination-box-htb.webp',
  'heat-shrink-closure': '/images/live/heat-shrink-splice-closure.webp',
  'horizontal-closure': '/images/products/horizontal-closure.png',
  'splitter-closure': '/images/live/fiber-optic-splitter-closure-gjs-2016.webp',
  'cat6-panel': cat6Panel,
  'cat6-patch-panel': cat6Panel,

  // Test and Measurement
  'fusion-splicer': '/images/live/fusion-splicer-pdr618h.webp',
  'next-gen-splicer': '/images/products/next-gen-splicer.png',
  'easyget-wifi': '/images/live/easyget-wifi-wireless-fiber-endface-microscope.webp',
  'wifi-wireless-fiber-endface-microscope': '/images/live/easyget-wifi-wireless-fiber-endface-microscope.webp',
  'regular-opm': '/images/live/mini-optical-power-meter.webp',
  'mini-opm': '/images/live/mini-optical-power-meter.webp',
  'mini-optical-power-meter': '/images/live/mini-optical-power-meter.webp',
  'pocket-otdr': '/images/live/mini-otdr-pdr4402s.webp',
  'pon-power-meter': '/images/live/pon-power-meter.webp',
  'vfl': '/images/products/vfl.png',

  // Passive Components
  'cat6-patch-cord': cat6Cord,
  'cpri-patchcord': cpri,
  'cwdm': cwdm,
  'dwdm': dwdm,
  'fanout-patch-cords': fanout,
  'field-connector': fiberConnector,
  'fo-patchcords': fiberPigtails,
  'mode-conditioning': modeConditioning,
  'mpo-assembly': mpoCable,
  'plc-splitter': plcSplitter,
  'rapid-push': rapidPush,
  'fttx-smart-bullet-drop-cable': rapidPush,
  'smpte-assembly': smpteCable,
  'attenuator': '/images/live/variable-fiber-attenuator.webp',
  'bare-fiber-adapter': bareFiber,
  'fiber-optic-adapter': scAdapter,
  'hybrid-adapter': scAdapter,
  'fiber-spool': '/images/products/fiber-spool.png',
  'pof-patchcord': '/images/products/pof-patchcord.png',
  'splice-sleeves': '/images/live/cold-shrink-sleeve.webp',
  'loopback-patch-cord': loopback,

  // Active Components & Drones (Each product has its own distinct photo)
  'active-components': '/images/active-components.webp',
  'sfp-400g': '/images/sfp-400g.webp',
  'sfp-100g-bidi': '/images/sfp-100g.webp',
  'sfp-40g': '/images/products/sfp-40g.png',
  'sfp-25g-bidi': '/images/sfp-25g.webp',
  'sfp-10g-bidi': '/images/products/sfp-10g-bidi.png',
  'sfp-10g-dual': '/images/products/sfp-10g-dual.png',
  'sfp-1g-bidi': '/images/products/sfp-1g-bidi.png',
  'sfp-1g-dual': '/images/products/sfp-1g-dual.png',
  'sfp-copper': '/images/products/sfp-copper.png',
  'smart-sfp': '/images/sfp-smart.webp',
  'bypass-switch': '/images/live/bypass-switch.webp',
  'olps': '/images/live/optical-line-protection-system.webp',
  'dac': '/images/products/dac.png',
  'aoc': '/images/products/aoc.png',
  'drone': '/images/live/optical-fiber-drone.webp',
  'ground-unit': '/images/live/optical-fiber-drone.webp',
  'sky-unit': '/images/products/fpv-optical-terminal.png',
  'fpv-optical-terminal': '/images/products/fpv-optical-terminal.png',
  'uav-fiber-optic-spool': '/images/products/uav-fiber-optic-spool.png',
  'nano-otdr': '/images/live/mini-otdr-pdr4402s.webp',
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
 * 1. Remote database image (product.imageUrl) - The ultimate source of truth
 * 2. Verified high-res local image via PASSIVE_IMAGE_MAP
 * 3. catalogue.json (card.img)
 * 4. CATEGORY_IMAGE_MAP (category fallback)
 */
export const resolveCanonicalProductImage = (slug?: string, productImageUrl?: string, categoryOrSectionId?: string): string => {
  // Priority #1: Supabase / Database / User-provided remote image
  // Skip data: URIs — they are massive base64 blobs that break rendering; fall through to proper images
  if (productImageUrl && productImageUrl.trim() && !productImageUrl.startsWith('data:')) {
    return getAssetUrl(productImageUrl.trim());
  }

  // Priority #2: Local fallback map (source of truth for standard catalog with high-res distinct images)
  if (slug && PASSIVE_IMAGE_MAP[slug]) {
    return getAssetUrl(PASSIVE_IMAGE_MAP[slug]);
  }

  if (slug) {
    const catalogImg = catalogueImageBySlug.get(slug);
    if (catalogImg && catalogImg.trim()) {
      return getAssetUrl(catalogImg.trim());
    }
  }

  if (categoryOrSectionId && CATEGORY_IMAGE_MAP[categoryOrSectionId]) {
    return getAssetUrl(CATEGORY_IMAGE_MAP[categoryOrSectionId]);
  }

  return getAssetUrl(CATEGORY_IMAGE_MAP.passive || '/images/fiber-patchcord.webp');
};

/**
 * Returns a guaranteed valid fallback image path based on the category.
 * Used primarily for `onError` handlers in `img` tags.
 */
export const getFallbackImage = (categoryOrSectionId?: string): string => {
  if (categoryOrSectionId && CATEGORY_IMAGE_MAP[categoryOrSectionId]) {
    return getAssetUrl(CATEGORY_IMAGE_MAP[categoryOrSectionId]);
  }
  return getAssetUrl(CATEGORY_IMAGE_MAP['Passive Components'] || '/images/fiber-patchcord.webp');
};
