import type { LayerId, SourceAssetId } from '../types/anatomy';

export interface AnatomyAtlasAsset {
  id: SourceAssetId;
  url: string;
  layer: LayerId;
}

/** Interactive GLBs exported with node extras.anatomyId. */
export const ANATOMY_ATLAS_ASSETS: readonly AnatomyAtlasAsset[] = [
  { id: 'skeletal', url: '/models/anatomy-atlas/skeletal.glb', layer: 'bones' },
  { id: 'joints', url: '/models/anatomy-atlas/joints.glb', layer: 'bones' },
  { id: 'muscular', url: '/models/anatomy-atlas/muscular.glb', layer: 'muscles' },
  { id: 'cardiovascular', url: '/models/anatomy-atlas/cardiovascular.glb', layer: 'organs' },
  { id: 'visceral', url: '/models/anatomy-atlas/visceral.glb', layer: 'organs' },
  { id: 'lymphatic', url: '/models/anatomy-atlas/lymphatic.glb', layer: 'organs' },
  { id: 'integumentary', url: '/models/anatomy-atlas/integumentary.glb', layer: 'skin' },
];
