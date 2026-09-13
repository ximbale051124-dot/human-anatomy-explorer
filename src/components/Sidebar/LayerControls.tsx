import React from 'react';
import { useAnatomy } from '../../context/AnatomyContext';
import type { LayerId } from '../../types/anatomy';

const LAYERS: { id: LayerId; label: string }[] = [
  { id: 'skin', label: 'Skin' },
  { id: 'muscles', label: 'Muscles' },
  { id: 'bones', label: 'Bones' },
  { id: 'organs', label: 'Organs' },
];

export function LayerControls() {
  const { layerVisibility, toggleLayer } = useAnatomy();

  return (
    <section className="panel">
      <h2 className="panel__title">Layers</h2>
      <p className="panel__hint">Hide outer layers to explore what's underneath.</p>
      <ul className="layer-list">
        {LAYERS.map((layer) => (
          <li key={layer.id} className="layer-list__item">
            <label className="layer-list__label">
              <input
                type="checkbox"
                checked={layerVisibility[layer.id]}
                onChange={() => toggleLayer(layer.id)}
              />
              <span>{layer.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
