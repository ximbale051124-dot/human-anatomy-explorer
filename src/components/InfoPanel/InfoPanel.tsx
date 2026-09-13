import React from 'react';
import { STRUCTURE_MAP } from '../../data/structures';
import { SYSTEM_MAP } from '../../data/systems';
import { useAnatomy } from '../../context/AnatomyContext';

export function InfoPanel() {
  const { selectedStructureId, selectStructure } = useAnatomy();

  if (!selectedStructureId) {
    return (
      <section className="info-panel info-panel--empty">
        <p>Select a structure in the 3D model, or use search, to see its details here.</p>
      </section>
    );
  }

  const structure = STRUCTURE_MAP[selectedStructureId];
  if (!structure) return null;

  const systemLabel =
    structure.system === 'integumentary' ? 'Integumentary System' : SYSTEM_MAP[structure.system]?.label;

  return (
    <section className="info-panel">
      <header className="info-panel__header">
        <div>
          <h2 className="info-panel__title">{structure.anatomicalName}</h2>
          <p className="info-panel__subtitle">
            {structure.commonName} &middot; {systemLabel}
          </p>
        </div>
        <button
          className="info-panel__close"
          onClick={() => selectStructure(null)}
          aria-label="Close structure details"
        >
          &times;
        </button>
      </header>

      <div className="info-panel__grid">
        <div className="info-panel__field">
          <h3>Location</h3>
          <p>{structure.location}</p>
        </div>
        <div className="info-panel__field">
          <h3>Structure</h3>
          <p>{structure.structure}</p>
        </div>
        <div className="info-panel__field">
          <h3>Main Function</h3>
          <p>{structure.mainFunction}</p>
        </div>
        <div className="info-panel__field">
          <h3>Related Structures</h3>
          <ul className="info-panel__related">
            {structure.relatedStructures.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
