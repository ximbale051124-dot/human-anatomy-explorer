import atlasData from './atlas.generated.json';
import type { AnatomyId, AnatomyRecord } from '../../types/anatomy';

export const ANATOMY_RECORDS = atlasData.records as readonly AnatomyRecord[];

export const ANATOMY_BY_ID: ReadonlyMap<AnatomyId, AnatomyRecord> = new Map(
  ANATOMY_RECORDS.map((record) => [record.id, record])
);
