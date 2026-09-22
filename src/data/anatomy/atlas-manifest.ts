import atlasData from './atlas.generated.json';
import type { AnatomyBinding } from '../../types/anatomy';

/** Exact GLB node-to-ID bindings generated with the interactive atlas export. */
export const ATLAS_MANIFEST = atlasData.bindings as readonly AnatomyBinding[];
