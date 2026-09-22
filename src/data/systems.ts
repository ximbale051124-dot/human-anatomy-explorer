import type { SystemDefinition } from '../types/anatomy';

export const SYSTEMS: readonly SystemDefinition[] = [
  { id: 'skeletal', label: 'Skeleton', color: '#B8C7D9', description: 'Bones of the human body.' },
  { id: 'muscular', label: 'Muscles', color: '#B96839', description: 'Skeletal muscles and associated tendons.' },
  { id: 'joints', label: 'Joints', color: '#63A89A', description: 'Joints, cartilage, ligaments, and capsules.' },
  { id: 'cardiovascular', label: 'Cardiovascular', color: '#C92C36', description: 'Heart and blood vessels.' },
  { id: 'visceral', label: 'Visceral', color: '#DE8D35', description: 'Thoracic, abdominal, pelvic, and endocrine organs.' },
  { id: 'lymphatic', label: 'Lymphatic', color: '#39A96B', description: 'Lymphatic organs and vessels.' },
  { id: 'integumentary', label: 'Skin', color: '#E9B28C', description: 'Surface regions and integument.' },
];

export const SYSTEM_MAP: Record<SystemDefinition['id'], SystemDefinition> = Object.fromEntries(
  SYSTEMS.map((system) => [system.id, system])
) as Record<SystemDefinition['id'], SystemDefinition>;
