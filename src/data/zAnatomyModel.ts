import type { LayerId, SystemId } from '../types/anatomy';

// These are clean, Draco-compressed GLB exports from the Z-Anatomy source
// atlas. Keeping this catalogue outside the viewer means a replacement atlas
// can be introduced without changing the UI or anatomy data.
export interface ZAnatomyAsset {
  id: string;
  url: string;
  layer: LayerId;
  system: SystemId | 'integumentary';
}

export const Z_ANATOMY_ASSETS: ZAnatomyAsset[] = [
  { id: 'skin', url: '/models/z-anatomy-clean/skin.glb?v=isolated-20260922', layer: 'skin', system: 'integumentary' },
  { id: 'skeletal', url: '/models/z-anatomy-clean/skeletal.glb?v=isolated-20260922', layer: 'bones', system: 'skeletal' },
  { id: 'joints', url: '/models/z-anatomy-clean/joints.glb?v=isolated-20260922', layer: 'bones', system: 'joints' },
  // Z-Anatomy's complete Myology atlas: independently named muscles across
  // the head, trunk, and limbs, including the associated tendons and cartilage.
  { id: 'muscular', url: '/models/z-anatomy-clean/muscular.glb?v=myology-20260922', layer: 'muscles', system: 'muscular' },
  { id: 'cardiovascular', url: '/models/z-anatomy-clean/cardiovascular.glb?v=isolated-20260922', layer: 'organs', system: 'cardiovascular' },
  { id: 'lymphatic', url: '/models/z-anatomy-clean/lymphatic.glb?v=isolated-20260922', layer: 'organs', system: 'lymphatic' },
  { id: 'visceral', url: '/models/z-anatomy-clean/visceral.glb?v=isolated-20260922', layer: 'organs', system: 'digestive' },
];

/** Removes Z-Anatomy's left/right suffix without collapsing a named sub-part. */
export function atlasNameForMesh(meshName: string): string {
  return meshName
    .replace(/\.(?:l|r)(?:\.\d+)?$/i, '')
    .replace(/\.\d+$/, '')
    .replace(/^\((.+)\)$/, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Only exact atlas labels map to our curated teaching cards. Broad regular
// expressions were assigning, for example, biceps femoris to biceps brachii.
// Every other click remains a distinct atlas record rather than showing a
// plausible but incorrect structure card.
const EXACT_STRUCTURE_IDS: Record<string, string> = {
  'femur': 'femur',
  'humerus': 'humerus',
  'heart': 'heart',
  'aorta': 'aorta',
  'liver': 'liver',
  'stomach': 'stomach',
  'trachea': 'trachea',
  'pancreas': 'pancreas',
  'spleen': 'spleen',
  'thyroid gland': 'thyroid',
  'urinary bladder': 'bladder',
  'left kidney': 'kidney-left',
  'right kidney': 'kidney-right',
  'pectoralis major muscle': 'pectoralis-major',
  'rectus abdominis muscle': 'rectus-abdominis',
  'deltoid muscle': 'deltoid',
  'biceps brachii muscle': 'biceps-brachii',
  'triceps brachii muscle': 'triceps-brachii',
  'gastrocnemius muscle': 'gastrocnemius',
  'trapezius muscle': 'trapezius',
};

export function structureIdForMesh(meshName: string): string | null {
  return EXACT_STRUCTURE_IDS[atlasNameForMesh(meshName).toLowerCase()] ?? null;
}

// The visceral atlas includes several systems in one GLB. This lightweight
// classifier preserves the existing system toggles without duplicating assets.
export function systemForMesh(asset: ZAnatomyAsset, meshName: string): SystemId | 'integumentary' {
  if (asset.id !== 'visceral') return asset.system;
  if (/kidney|ureter|bladder|urethra/i.test(meshName)) return 'urinary';
  if (/uterus|ovary|testis|prostate|penis|vagina|cervix|seminal_vesicle|uterine_tube/i.test(meshName)) return 'reproductive';
  if (/thyroid|parathyroid|adrenal|suprarenal|pancreas/i.test(meshName)) return 'endocrine';
  if (/lung|bronch|trachea|larynx|pleura/i.test(meshName)) return 'respiratory';
  return 'digestive';
}
