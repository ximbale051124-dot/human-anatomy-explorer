import React from 'react';
import { ANATOMY_BY_ID } from '../../data/anatomy/records';
import { SYSTEM_MAP } from '../../data/systems';
import { useAnatomy } from '../../context/AnatomyContext';

export function InfoPanel() {
  const { selectedAnatomyId, selectAnatomyId } = useAnatomy();
  const record = selectedAnatomyId ? ANATOMY_BY_ID.get(selectedAnatomyId) : null;

  if (!record) {
    return <section className="info-panel info-panel--empty"><p>Select a structure in the 3D model, or use search, to see its details here.</p></section>;
  }

  const system = SYSTEM_MAP[record.system];
  const hasTeachingContent = record.description || record.function || record.location;
  return (
    <section className="info-panel">
      <header className="info-panel__header">
        <div>
          <h2 className="info-panel__title">{record.displayName}</h2>
          <p className="info-panel__subtitle">{record.latinName ?? 'Latin name pending'} &middot; {system.label}</p>
        </div>
        <button className="info-panel__close" onClick={() => selectAnatomyId(null)} aria-label="Close structure details">&times;</button>
      </header>
      <div className="info-panel__grid">
        <div className="info-panel__field"><h3>System</h3><p>{system.label}</p></div>
        <div className="info-panel__field"><h3>Side</h3><p>{record.side === 'midline' ? 'Midline' : record.side[0].toUpperCase() + record.side.slice(1)}</p></div>
        {hasTeachingContent ? <>
          <div className="info-panel__field"><h3>Location</h3><p>{record.location}</p></div>
          <div className="info-panel__field"><h3>Main Function</h3><p>{record.function}</p></div>
          <div className="info-panel__field"><h3>Description</h3><p>{record.description}</p></div>
        </> : <div className="info-panel__field"><h3>Learning Note</h3><p>Anatomy information coming soon.</p></div>}
      </div>
    </section>
  );
}
