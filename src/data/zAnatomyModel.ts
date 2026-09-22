import type { LayerId, SystemId } from '../types/anatomy';

// Z-Anatomy distributes its atlas as separate FBX system files. Keeping this
// catalogue outside the viewer means a future, optimised GLB export can be
// swapped in without changing the UI or anatomy data.
export interface ZAnatomyAsset {
  id: string;
  url: string;
  layer: LayerId;
  system: SystemId | 'integumentary';
}

export const Z_ANATOMY_ASSETS: ZAnatomyAsset[] = [
  { id: 'skin', url: '/models/z-anatomy/Regions%20of%20human%20body100.fbx', layer: 'skin', system: 'integumentary' },
  { id: 'skeletal', url: '/models/z-anatomy/SkeletalSystem100.fbx', layer: 'bones', system: 'skeletal' },
  { id: 'muscular', url: '/models/z-anatomy/MuscularSystem100.fbx', layer: 'muscles', system: 'muscular' },
  { id: 'cardiovascular', url: '/models/z-anatomy/CardioVascular41.fbx', layer: 'organs', system: 'cardiovascular' },
  { id: 'lymphatic', url: '/models/z-anatomy/LymphoidOrgans100.fbx', layer: 'organs', system: 'lymphatic' },
  { id: 'visceral', url: '/models/z-anatomy/VisceralSystem100.fbx', layer: 'organs', system: 'digestive' },
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
  ['pectoralis-major', /pectoralis_major/i],
  ['rectus-abdominis', /rectus_abdominis/i],
  ['deltoid', /deltoid/i],
  ['biceps-brachii', /biceps_brachii/i],
  ['triceps-brachii', /triceps_brachii/i],
  ['quadriceps-femoris', /quadriceps|rectus_femoris|vastus_/i],
  ['hamstrings', /hamstring|biceps_femoris|semitendinosus|semimembranosus/i],
  ['gastrocnemius', /gastrocnemius/i],
  ['trapezius', /trapezius/i],
  ['heart', /heart|atrium|ventricle/i],
  ['aorta', /aorta/i],
  ['trachea', /trachea/i],
  ['lung-left', /left_lung/i],
  ['lung-right', /right_lung/i],
  ['liver', /liver/i],
  ['stomach', /stomach/i],
  ['intestines', /intestin|duodenum|jejunum|ileum|colon|rectum/i],
  ['kidney-left', /left_kidney/i],
  ['kidney-right', /right_kidney/i],
  ['bladder', /bladder/i],
  ['reproductive-organs', /uterus|ovary|testis|prostate|penis|vagina|cervix|seminal_vesicle|uterine_tube/i],
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

// The visceral atlas includes several systems in one FBX. This lightweight
// classifier preserves the existing system toggles without duplicating assets.
export function systemForMesh(asset: ZAnatomyAsset, meshName: string): SystemId | 'integumentary' {
  if (asset.id !== 'visceral') return asset.system;
  if (/kidney|ureter|bladder|urethra/i.test(meshName)) return 'urinary';
  if (/uterus|ovary|testis|prostate|penis|vagina|cervix|seminal_vesicle|uterine_tube/i.test(meshName)) return 'reproductive';
  if (/thyroid|parathyroid|adrenal|suprarenal|pancreas/i.test(meshName)) return 'endocrine';
  if (/lung|bronch|trachea|larynx|pleura/i.test(meshName)) return 'respiratory';
  return 'digestive';
}

// Z-Anatomy has thousands of fine-grained meshes, while the MVP information
// catalogue currently describes major teaching structures. A click on an
// unmapped fine detail therefore opens a useful system representative instead
// of leaving the details panel empty.
export function fallbackStructureForSystem(system: SystemId | 'integumentary'): string {
  const fallback: Record<SystemId | 'integumentary', string> = {
    integumentary: 'skin',
    skeletal: 'skull',
    muscular: 'pectoralis-major',
    cardiovascular: 'heart',
    respiratory: 'lung-right',
    digestive: 'liver',
    urinary: 'kidney-right',
    reproductive: 'reproductive-organs',
    endocrine: 'thyroid',
    lymphatic: 'spleen',
  };
  return fallback[system];
}
