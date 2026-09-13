// Core type definitions for the anatomy data model.
// Keeping these separate from components/data keeps the app easy to extend
// (e.g. swapping the placeholder primitives for a real GLB model later).

export type SystemId =
  | 'skeletal'
  | 'muscular'
  | 'cardiovascular'
  | 'respiratory'
  | 'digestive'
  | 'urinary'
  | 'reproductive'
  | 'endocrine'
  | 'lymphatic';

// Layers represent anatomical "depth" from the outside in.
// This is independent from SystemId: e.g. the "organs" layer contains
// structures from several systems (cardiovascular, respiratory, etc).
export type LayerId = 'skin' | 'muscles' | 'bones' | 'organs';

export interface SystemDefinition {
  id: SystemId;
  label: string;
  color: string; // hex, used for the sidebar swatch and mesh highlight tint
  description: string;
}

export interface AnatomicalStructure {
  id: string;
  anatomicalName: string;
  commonName: string;
  system: SystemId | 'integumentary';
  layer: LayerId;
  location: string;
  structure: string;
  mainFunction: string;
  relatedStructures: string[];
}

// Describes one primitive mesh placed in the 3D scene.
// Multiple meshes can point at the same AnatomicalStructure (e.g. left/right
// femur), and this is the piece of the codebase to replace once a real
// GLB/GLTF anatomical model is available (see src/components/Viewer/BodyModel.tsx).
export type PrimitiveGeometry = 'box' | 'sphere' | 'cylinder' | 'capsule' | 'torus' | 'cone';

export interface MeshConfig {
  meshId: string;
  structureId: string;
  layer: LayerId;
  system: SystemId | 'integumentary';
  geometry: PrimitiveGeometry;
  args: number[];
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
}

export type ViewPreset = 'front' | 'back' | 'left' | 'right' | 'reset';
