import React from 'react';
import { useAnatomy } from '../../context/AnatomyContext';
import type { ViewPreset } from '../../types/anatomy';

const VIEWS: { preset: ViewPreset; label: string }[] = [
  { preset: 'front', label: 'Front' },
  { preset: 'back', label: 'Back' },
  { preset: 'left', label: 'Left' },
  { preset: 'right', label: 'Right' },
  { preset: 'reset', label: 'Reset View' },
];

export function ViewControls() {
  const { requestView } = useAnatomy();

  return (
    <div className="view-controls">
      {VIEWS.map((v) => (
        <button
          key={v.preset}
          className="view-controls__btn"
          onClick={() => requestView({ type: 'preset', preset: v.preset })}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
