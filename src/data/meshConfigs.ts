import type { MeshConfig } from '../types/anatomy';
import { SYSTEM_MAP } from './systems';

// -----------------------------------------------------------------------
// PLACEHOLDER 3D MODEL
// -----------------------------------------------------------------------
// This file positions simple primitive geometries (boxes, spheres,
// cylinders) into a rough humanoid figure. It exists so the rest of the
// app (selection, systems, layers, search, camera) can be fully built and
// tested without a real anatomical model.
//
// >>> TO ADD A REAL GLB/GLTF MODEL <<<
// Replace the contents of src/components/Viewer/BodyModel.tsx with a
// component that loads your model (e.g. via `useGLTF` from
// `@react-three/drei`) and maps mesh names inside the GLB to structure ids
// from src/data/structures.ts. See the comment at the top of BodyModel.tsx
// for a step-by-step guide. This file (meshConfigs.ts) can then be deleted.
// -----------------------------------------------------------------------

const SKIN_COLOR = '#E8C4A0';
const bone = SYSTEM_MAP.skeletal.color;
const muscle = SYSTEM_MAP.muscular.color;
const cardio = SYSTEM_MAP.cardiovascular.color;
const resp = SYSTEM_MAP.respiratory.color;
const digest = SYSTEM_MAP.digestive.color;
const urinary = SYSTEM_MAP.urinary.color;
const repro = SYSTEM_MAP.reproductive.color;
const endocrine = SYSTEM_MAP.endocrine.color;
const lymph = SYSTEM_MAP.lymphatic.color;

export const MESH_CONFIGS: MeshConfig[] = [
  // ------------------------------------------------------------- SKIN
  { meshId: 'skin-head', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'sphere', args: [0.14], position: [0, 1.87, 0], color: SKIN_COLOR },
  { meshId: 'skin-torso', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'capsule', args: [0.24, 0.5, 4, 8], position: [0, 1.5, 0], color: SKIN_COLOR },
  { meshId: 'skin-pelvis', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'capsule', args: [0.2, 0.15, 4, 8], position: [0, 1.15, 0], color: SKIN_COLOR },
  { meshId: 'skin-arm-l-upper', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'capsule', args: [0.07, 0.34, 4, 8], position: [-0.35, 1.42, 0], color: SKIN_COLOR },
  { meshId: 'skin-arm-r-upper', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'capsule', args: [0.07, 0.34, 4, 8], position: [0.35, 1.42, 0], color: SKIN_COLOR },
  { meshId: 'skin-arm-l-lower', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'capsule', args: [0.06, 0.32, 4, 8], position: [-0.37, 1.06, 0], color: SKIN_COLOR },
  { meshId: 'skin-arm-r-lower', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'capsule', args: [0.06, 0.32, 4, 8], position: [0.37, 1.06, 0], color: SKIN_COLOR },
  { meshId: 'skin-leg-l-upper', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'capsule', args: [0.11, 0.45, 4, 8], position: [-0.12, 0.8, 0], color: SKIN_COLOR },
  { meshId: 'skin-leg-r-upper', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'capsule', args: [0.11, 0.45, 4, 8], position: [0.12, 0.8, 0], color: SKIN_COLOR },
  { meshId: 'skin-leg-l-lower', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'capsule', args: [0.09, 0.4, 4, 8], position: [-0.12, 0.33, 0], color: SKIN_COLOR },
  { meshId: 'skin-leg-r-lower', structureId: 'skin', layer: 'skin', system: 'integumentary', geometry: 'capsule', args: [0.09, 0.4, 4, 8], position: [0.12, 0.33, 0], color: SKIN_COLOR },

  // ---------------------------------------------------------- SKELETAL
  { meshId: 'bone-skull', structureId: 'skull', layer: 'bones', system: 'skeletal', geometry: 'sphere', args: [0.12], position: [0, 1.87, 0], color: bone },
  { meshId: 'bone-spine', structureId: 'vertebral-column', layer: 'bones', system: 'skeletal', geometry: 'cylinder', args: [0.03, 0.03, 0.85, 8], position: [0, 1.4, -0.05], color: bone },
  { meshId: 'bone-ribcage', structureId: 'ribcage', layer: 'bones', system: 'skeletal', geometry: 'capsule', args: [0.19, 0.3, 4, 8], position: [0, 1.62, 0], color: bone },
  { meshId: 'bone-pelvis', structureId: 'pelvis', layer: 'bones', system: 'skeletal', geometry: 'box', args: [0.34, 0.18, 0.2], position: [0, 1.15, 0], color: bone },
  { meshId: 'bone-humerus-l', structureId: 'humerus', layer: 'bones', system: 'skeletal', geometry: 'cylinder', args: [0.035, 0.035, 0.34, 8], position: [-0.35, 1.42, 0], color: bone },
  { meshId: 'bone-humerus-r', structureId: 'humerus', layer: 'bones', system: 'skeletal', geometry: 'cylinder', args: [0.035, 0.035, 0.34, 8], position: [0.35, 1.42, 0], color: bone },
  { meshId: 'bone-forearm-l', structureId: 'forearm-bones', layer: 'bones', system: 'skeletal', geometry: 'cylinder', args: [0.03, 0.03, 0.32, 8], position: [-0.37, 1.06, 0], color: bone },
  { meshId: 'bone-forearm-r', structureId: 'forearm-bones', layer: 'bones', system: 'skeletal', geometry: 'cylinder', args: [0.03, 0.03, 0.32, 8], position: [0.37, 1.06, 0], color: bone },
  { meshId: 'bone-femur-l', structureId: 'femur', layer: 'bones', system: 'skeletal', geometry: 'cylinder', args: [0.05, 0.05, 0.5, 8], position: [-0.12, 0.8, 0], color: bone },
  { meshId: 'bone-femur-r', structureId: 'femur', layer: 'bones', system: 'skeletal', geometry: 'cylinder', args: [0.05, 0.05, 0.5, 8], position: [0.12, 0.8, 0], color: bone },
  { meshId: 'bone-lowerleg-l', structureId: 'lower-leg-bones', layer: 'bones', system: 'skeletal', geometry: 'cylinder', args: [0.04, 0.04, 0.45, 8], position: [-0.12, 0.33, 0], color: bone },
  { meshId: 'bone-lowerleg-r', structureId: 'lower-leg-bones', layer: 'bones', system: 'skeletal', geometry: 'cylinder', args: [0.04, 0.04, 0.45, 8], position: [0.12, 0.33, 0], color: bone },

  // ---------------------------------------------------------- MUSCULAR
  { meshId: 'muscle-pec', structureId: 'pectoralis-major', layer: 'muscles', system: 'muscular', geometry: 'box', args: [0.32, 0.16, 0.1], position: [0, 1.68, 0.13], color: muscle },
  { meshId: 'muscle-abs', structureId: 'rectus-abdominis', layer: 'muscles', system: 'muscular', geometry: 'box', args: [0.18, 0.24, 0.08], position: [0, 1.42, 0.14], color: muscle },
  { meshId: 'muscle-deltoid-l', structureId: 'deltoid', layer: 'muscles', system: 'muscular', geometry: 'sphere', args: [0.08], position: [-0.32, 1.58, 0], color: muscle },
  { meshId: 'muscle-deltoid-r', structureId: 'deltoid', layer: 'muscles', system: 'muscular', geometry: 'sphere', args: [0.08], position: [0.32, 1.58, 0], color: muscle },
  { meshId: 'muscle-biceps-l', structureId: 'biceps-brachii', layer: 'muscles', system: 'muscular', geometry: 'capsule', args: [0.05, 0.22, 4, 8], position: [-0.36, 1.42, 0.03], color: muscle },
  { meshId: 'muscle-biceps-r', structureId: 'biceps-brachii', layer: 'muscles', system: 'muscular', geometry: 'capsule', args: [0.05, 0.22, 4, 8], position: [0.36, 1.42, 0.03], color: muscle },
  { meshId: 'muscle-triceps-l', structureId: 'triceps-brachii', layer: 'muscles', system: 'muscular', geometry: 'capsule', args: [0.045, 0.22, 4, 8], position: [-0.34, 1.42, -0.04], color: muscle },
  { meshId: 'muscle-triceps-r', structureId: 'triceps-brachii', layer: 'muscles', system: 'muscular', geometry: 'capsule', args: [0.045, 0.22, 4, 8], position: [0.34, 1.42, -0.04], color: muscle },
  { meshId: 'muscle-quad-l', structureId: 'quadriceps-femoris', layer: 'muscles', system: 'muscular', geometry: 'capsule', args: [0.075, 0.4, 4, 8], position: [-0.12, 0.8, 0.05], color: muscle },
  { meshId: 'muscle-quad-r', structureId: 'quadriceps-femoris', layer: 'muscles', system: 'muscular', geometry: 'capsule', args: [0.075, 0.4, 4, 8], position: [0.12, 0.8, 0.05], color: muscle },
  { meshId: 'muscle-ham-l', structureId: 'hamstrings', layer: 'muscles', system: 'muscular', geometry: 'capsule', args: [0.07, 0.4, 4, 8], position: [-0.12, 0.8, -0.05], color: muscle },
  { meshId: 'muscle-ham-r', structureId: 'hamstrings', layer: 'muscles', system: 'muscular', geometry: 'capsule', args: [0.07, 0.4, 4, 8], position: [0.12, 0.8, -0.05], color: muscle },
  { meshId: 'muscle-calf-l', structureId: 'gastrocnemius', layer: 'muscles', system: 'muscular', geometry: 'capsule', args: [0.06, 0.3, 4, 8], position: [-0.12, 0.33, -0.03], color: muscle },
  { meshId: 'muscle-calf-r', structureId: 'gastrocnemius', layer: 'muscles', system: 'muscular', geometry: 'capsule', args: [0.06, 0.3, 4, 8], position: [0.12, 0.33, -0.03], color: muscle },
  { meshId: 'muscle-trap', structureId: 'trapezius', layer: 'muscles', system: 'muscular', geometry: 'box', args: [0.3, 0.14, 0.1], position: [0, 1.72, -0.1], color: muscle },

  // ------------------------------------------------------ CARDIOVASCULAR
  { meshId: 'organ-heart', structureId: 'heart', layer: 'organs', system: 'cardiovascular', geometry: 'sphere', args: [0.08], position: [-0.04, 1.62, 0.05], color: cardio },
  { meshId: 'organ-aorta', structureId: 'aorta', layer: 'organs', system: 'cardiovascular', geometry: 'cylinder', args: [0.015, 0.015, 0.3, 8], position: [0, 1.68, -0.02], color: cardio },

  // -------------------------------------------------------- RESPIRATORY
  { meshId: 'organ-trachea', structureId: 'trachea', layer: 'organs', system: 'respiratory', geometry: 'cylinder', args: [0.02, 0.02, 0.14, 8], position: [0, 1.78, 0.02], color: resp },
  { meshId: 'organ-lung-l', structureId: 'lung-left', layer: 'organs', system: 'respiratory', geometry: 'capsule', args: [0.08, 0.22, 4, 8], position: [-0.13, 1.65, -0.02], color: resp },
  { meshId: 'organ-lung-r', structureId: 'lung-right', layer: 'organs', system: 'respiratory', geometry: 'capsule', args: [0.08, 0.22, 4, 8], position: [0.13, 1.65, -0.02], color: resp },

  // ---------------------------------------------------------- DIGESTIVE
  { meshId: 'organ-liver', structureId: 'liver', layer: 'organs', system: 'digestive', geometry: 'box', args: [0.2, 0.1, 0.12], position: [0.08, 1.42, 0.03], color: digest },
  { meshId: 'organ-stomach', structureId: 'stomach', layer: 'organs', system: 'digestive', geometry: 'sphere', args: [0.08], position: [-0.1, 1.4, 0.02], color: digest },
  { meshId: 'organ-intestines', structureId: 'intestines', layer: 'organs', system: 'digestive', geometry: 'torus', args: [0.11, 0.045, 8, 16], position: [0, 1.28, 0.02], rotation: [Math.PI / 2, 0, 0], color: digest },

  // ------------------------------------------------------------ URINARY
  { meshId: 'organ-kidney-l', structureId: 'kidney-left', layer: 'organs', system: 'urinary', geometry: 'sphere', args: [0.045], position: [-0.15, 1.33, -0.08], color: urinary },
  { meshId: 'organ-kidney-r', structureId: 'kidney-right', layer: 'organs', system: 'urinary', geometry: 'sphere', args: [0.045], position: [0.15, 1.31, -0.08], color: urinary },
  { meshId: 'organ-bladder', structureId: 'bladder', layer: 'organs', system: 'urinary', geometry: 'sphere', args: [0.06], position: [0, 1.13, 0.03], color: urinary },

  // -------------------------------------------------------- REPRODUCTIVE
  { meshId: 'organ-reproductive', structureId: 'reproductive-organs', layer: 'organs', system: 'reproductive', geometry: 'box', args: [0.1, 0.06, 0.08], position: [0, 1.08, 0.02], color: repro },

  // ---------------------------------------------------------- ENDOCRINE
  { meshId: 'organ-thyroid', structureId: 'thyroid', layer: 'organs', system: 'endocrine', geometry: 'sphere', args: [0.03], position: [0, 1.78, 0.05], color: endocrine },
  { meshId: 'organ-pancreas', structureId: 'pancreas', layer: 'organs', system: 'endocrine', geometry: 'cylinder', args: [0.02, 0.02, 0.16, 8], position: [0.02, 1.37, -0.03], rotation: [0, 0, Math.PI / 2], color: endocrine },
  { meshId: 'organ-adrenal-l', structureId: 'adrenal-glands', layer: 'organs', system: 'endocrine', geometry: 'sphere', args: [0.02], position: [-0.15, 1.37, -0.08], color: endocrine },
  { meshId: 'organ-adrenal-r', structureId: 'adrenal-glands', layer: 'organs', system: 'endocrine', geometry: 'sphere', args: [0.02], position: [0.15, 1.35, -0.08], color: endocrine },

  // --------------------------------------------------------- LYMPHATIC
  { meshId: 'organ-spleen', structureId: 'spleen', layer: 'organs', system: 'lymphatic', geometry: 'sphere', args: [0.05], position: [-0.16, 1.45, -0.05], color: lymph },
  { meshId: 'organ-thymus', structureId: 'thymus', layer: 'organs', system: 'lymphatic', geometry: 'sphere', args: [0.035], position: [0, 1.7, 0.06], color: lymph },
  { meshId: 'organ-lymphnode-neck', structureId: 'lymph-nodes', layer: 'organs', system: 'lymphatic', geometry: 'sphere', args: [0.015], position: [0.04, 1.79, 0.04], color: lymph },
  { meshId: 'organ-lymphnode-armpit-l', structureId: 'lymph-nodes', layer: 'organs', system: 'lymphatic', geometry: 'sphere', args: [0.015], position: [-0.22, 1.6, 0], color: lymph },
];
