export type AnatomyId = string;

export type SystemId =
  | 'skeletal'
  | 'muscular'
  | 'joints'
  | 'cardiovascular'
  | 'visceral'
  | 'lymphatic'
  | 'integumentary';

export type SourceAssetId = SystemId;
export type Side = 'left' | 'right' | 'midline';
export type LayerId = 'skin' | 'muscles' | 'bones' | 'organs';
export type ViewPreset = 'front' | 'back' | 'left' | 'right' | 'reset';

export interface SystemDefinition {
  id: SystemId;
  label: string;
  color: string;
  description: string;
}

/** One learner-facing anatomical structure, always identified by its atlas ID. */
export interface AnatomyRecord {
  id: AnatomyId;
  displayName: string;
  latinName: string | null;
  aliases: string[];
  system: SystemId;
  layer: LayerId;
  side: Side;
  sourceAsset: SourceAssetId;
  sourceNode: string;
  description: string | null;
  function: string | null;
  location: string | null;
  relatedAnatomyIds: AnatomyId[];
}

/** Exact source-node binding produced with the interactive GLB export. */
export interface AnatomyBinding {
  anatomyId: AnatomyId;
  sourceAsset: SourceAssetId;
  sourceNode: string;
}
