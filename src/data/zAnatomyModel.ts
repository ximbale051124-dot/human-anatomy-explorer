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
  { id: 'skin', url: '/models/z-anatomy-clean/skin.glb', layer: 'skin', system: 'integumentary' },
  { id: 'skeletal', url: '/models/z-anatomy-clean/skeletal.glb', layer: 'bones', system: 'skeletal' },
  { id: 'muscular', url: '/models/z-anatomy-clean/muscular.glb', layer: 'muscles', system: 'muscular' },
  { id: 'cardiovascular', url: '/models/z-anatomy-clean/cardiovascular.glb', layer: 'organs', system: 'cardiovascular' },
  { id: 'lymphatic', url: '/models/z-anatomy-clean/lymphatic.glb', layer: 'organs', system: 'lymphatic' },
  { id: 'visceral', url: '/models/z-anatomy-clean/visceral.glb', layer: 'organs', system: 'digestive' },
];

const structureMatchers: Array<[string, RegExp]> = [
  ['skin', /region_of_human_body|body_region|skin/i],
  ['skull', /cranium|skull/i],
  ['vertebral-column', /vertebral_column|vertebra(?!l_artery)/i],
  ['ribcage', /rib|sternum|thoracic_cage/i],
  ['pelvis', /pelvis|hip_bone|ilium|ischium|pubis/i],
  ['humerus', /humerus/i],
  ['forearm-bones', /radius|ulna/i],
  ['femur', /femur/i],
  ['lower-leg-bones', /tibia|fibula/i],
  ['pectoralis-major', /pectoralis[ _.-]major/i],
  ['rectus-abdominis', /rectus[ _.-]abdominis/i],
  ['deltoid', /deltoid/i],
  ['biceps-brachii', /biceps[ _.-]brachii/i],
  ['triceps-brachii', /triceps[ _.-]brachii/i],
  ['quadriceps-femoris', /quadriceps|rectus[ _.-]femoris|vastus[ _.-]/i],
  ['hamstrings', /hamstring|biceps[ _.-]femoris|semitendinosus|semimembranosus/i],
  ['gastrocnemius', /gastrocnemius/i],
  ['trapezius', /trapezius/i],
  ['heart', /heart|atrium|ventricle/i],
  ['aorta', /aorta/i],
  ['trachea', /trachea/i],
  ['lung-left', /left[ _.-]lung/i],
  ['lung-right', /right[ _.-]lung/i],
  ['liver', /liver/i],
  ['stomach', /stomach/i],
  ['intestines', /intestin|duodenum|jejunum|ileum|colon|rectum/i],
  ['kidney-left', /left[ _.-]kidney/i],
  ['kidney-right', /right[ _.-]kidney/i],
  ['bladder', /bladder/i],
  ['reproductive-organs', /uterus|ovary|testis|prostate|penis|vagina|cervix|seminal[ _.-]vesicle|uterine[ _.-]tube/i],
  ['thyroid', /thyroid/i],
  ['pancreas', /pancreas/i],
  ['adrenal-glands', /adrenal|suprarenal/i],
  ['spleen', /spleen/i],
  ['thymus', /thymus/i],
  ['lymph-nodes', /lymph.*node|lymphatic.*node/i],
];

export function structureIdForMesh(meshName: string): string | null {
  return structureMatchers.find(([, pattern]) => pattern.test(meshName))?.[0] ?? null;
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
