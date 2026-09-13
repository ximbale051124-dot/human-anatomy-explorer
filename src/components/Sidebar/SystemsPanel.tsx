import React from 'react';
import { SYSTEMS } from '../../data/systems';
import { useAnatomy } from '../../context/AnatomyContext';

export function SystemsPanel() {
  const { systemVisibility, toggleSystem, showAllSystems, hideAllSystems, showOnlySystem } =
    useAnatomy();

  return (
    <section className="panel">
      <h2 className="panel__title">Anatomy Systems</h2>

      <div className="panel__bulk-actions">
        <button className="btn btn--ghost" onClick={showAllSystems}>
          Show All
        </button>
        <button className="btn btn--ghost" onClick={hideAllSystems}>
          Hide All
        </button>
      </div>

      <ul className="system-list">
        {SYSTEMS.map((system) => (
          <li key={system.id} className="system-list__item">
            <label className="system-list__label">
              <input
                type="checkbox"
                checked={systemVisibility[system.id]}
                onChange={() => toggleSystem(system.id)}
              />
              <span
                className="system-list__swatch"
                style={{ backgroundColor: system.color }}
                aria-hidden="true"
              />
              <span className="system-list__name">{system.label}</span>
            </label>
            <button
              className="system-list__only-btn"
              onClick={() => showOnlySystem(system.id)}
              title={`Show only ${system.label}`}
            >
              Only
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
