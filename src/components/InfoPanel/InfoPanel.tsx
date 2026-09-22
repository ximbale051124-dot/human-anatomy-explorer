import React from 'react';
import { STRUCTURE_MAP } from '../../data/structures';
import { SYSTEM_MAP } from '../../data/systems';
import { useAnatomy } from '../../context/AnatomyContext';

export function InfoPanel() {
  const { selectedStructureId, selectedMesh, selectMesh, selectStructure } = useAnatomy();

  if (!selectedStructureId && !selectedMesh) {
    return (
      <section className="info-panel info-panel--empty">
        <p>Select a structure in the 3D model, or use search, to see its details here.</p>
      </section>
    );
  }

  if (selectedMesh) {
    const systemLabel = selectedMesh.system === 'integumentary'
      ? 'Integumentary System'
      : SYSTEM_MAP[selectedMesh.system]?.label;
    const meshLabel = selectedMesh.meshName.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');

    return (
      <section className="info-panel">
        <header className="info-panel__header">
          <div>
            <h2 className="info-panel__title">{meshLabel}</h2>
            <p className="info-panel__subtitle">Z-Anatomy atlas mesh &middot; {systemLabel}</p>
          </div>
          <button className="info-panel__close" onClick={() => selectMesh(null)} aria-label="Close structure details">
            &times;
          </button>
        </header>
        <div className="info-panel__grid">
          <div className="info-panel__field">
            <h3>Selected Structure</h3>
            <p>This is the precise structure label supplied by the Z-Anatomy atlas.</p>
          </div>
          <div className="info-panel__field">
            <h3>System</h3>
            <p>{systemLabel}</p>
          </div>
          <div className="info-panel__field">
            <h3>Learning Note</h3>
            <p>Detailed teaching text for this fine-grained atlas mesh has not yet been curated. No unrelated structure details are shown.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!selectedStructureId) return null;

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
