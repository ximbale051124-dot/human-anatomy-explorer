import type { SystemDefinition } from '../types/anatomy';

export const SYSTEMS: SystemDefinition[] = [
  {
    id: 'skeletal',
    label: 'Skeletal System',
    color: '#E4DCC8',
    description: 'The bony framework that supports the body, protects internal organs, and enables movement via joints.',
  },
  {
    id: 'muscular',
    label: 'Muscular System',
    color: '#B5474D',
    description: 'Skeletal muscles that contract to produce movement, maintain posture, and generate heat.',
  },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular System',
    color: '#C0392B',
    description: 'The heart and blood vessels that circulate blood, delivering oxygen and nutrients to tissues.',
  },
  {
    id: 'respiratory',
    label: 'Respiratory System',
    color: '#E8A0A0',
    description: 'The airways and lungs responsible for gas exchange between the body and the atmosphere.',
  },
  {
    id: 'digestive',
    label: 'Digestive System',
    color: '#C97B4A',
    description: 'The organs that break down food, absorb nutrients, and eliminate waste.',
  },
  {
    id: 'urinary',
    label: 'Urinary System',
    color: '#D9A441',
    description: 'The kidneys and associated organs that filter blood and regulate fluid balance.',
  },
  {
    id: 'reproductive',
    label: 'Reproductive System',
    color: '#9B6B9E',
    description: 'The internal organs involved in reproduction.',
  },
  {
    id: 'endocrine',
    label: 'Endocrine System',
    color: '#4FB0A5',
    description: 'Glands that secrete hormones to regulate metabolism, growth, and homeostasis.',
  },
  {
    id: 'lymphatic',
    label: 'Lymphatic System',
    color: '#7FB069',
    description: 'The vessels and organs that support immune function and fluid balance.',
  },
];

export const SYSTEM_MAP: Record<string, SystemDefinition> = Object.fromEntries(
  SYSTEMS.map((s) => [s.id, s])
);
