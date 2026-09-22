import type { SystemDefinition } from '../types/anatomy';

export const SYSTEMS: SystemDefinition[] = [
  {
    id: 'skeletal',
    label: 'Skeletal System',
    color: '#B8C7D9',
    description: 'The bony framework that supports the body, protects internal organs, and enables movement via joints.',
  },
  {
    id: 'muscular',
    label: 'Muscular System',
    color: '#BF3E4A',
    description: 'Skeletal muscles that contract to produce movement, maintain posture, and generate heat.',
  },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular System',
    color: '#C92C36',
    description: 'The heart and blood vessels that circulate blood, delivering oxygen and nutrients to tissues.',
  },
  {
    id: 'respiratory',
    label: 'Respiratory System',
    color: '#4D9DE0',
    description: 'The airways and lungs responsible for gas exchange between the body and the atmosphere.',
  },
  {
    id: 'digestive',
    label: 'Digestive System',
    color: '#DE8D35',
    description: 'The organs that break down food, absorb nutrients, and eliminate waste.',
  },
  {
    id: 'urinary',
    label: 'Urinary System',
    color: '#6D72C3',
    description: 'The kidneys and associated organs that filter blood and regulate fluid balance.',
  },
  {
    id: 'reproductive',
    label: 'Reproductive System',
    color: '#C45A9A',
    description: 'The internal organs involved in reproduction.',
  },
  {
    id: 'endocrine',
    label: 'Endocrine System',
    color: '#E5B52D',
    description: 'Glands that secrete hormones to regulate metabolism, growth, and homeostasis.',
  },
  {
    id: 'lymphatic',
    label: 'Lymphatic System',
    color: '#39A96B',
    description: 'The vessels and organs that support immune function and fluid balance.',
  },
];

export const SYSTEM_MAP: Record<string, SystemDefinition> = Object.fromEntries(
  SYSTEMS.map((s) => [s.id, s])
);
