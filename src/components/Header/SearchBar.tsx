import React, { useMemo, useState } from 'react';
import { STRUCTURES } from '../../data/structures';
import { useAnatomy } from '../../context/AnatomyContext';
import { findStructurePosition } from '../Viewer/CameraRig';

export function SearchBar() {
  const { searchQuery, setSearchQuery, selectStructure, requestView } = useAnatomy();
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return STRUCTURES.filter(
      (s) =>
        s.anatomicalName.toLowerCase().includes(q) ||
        s.commonName.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  function handleSelect(structureId: string) {
    selectStructure(structureId);
    const pos = findStructurePosition(structureId);
    if (pos) requestView({ type: 'focus', position: pos });
    setSearchQuery('');
    setIsFocused(false);
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search structures (e.g. femur, heart, liver)..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        aria-label="Search anatomical structures"
      />
      {isFocused && results.length > 0 && (
        <ul className="search-bar__results">
          {results.map((s) => (
            <li key={s.id}>
              <button className="search-bar__result-btn" onClick={() => handleSelect(s.id)}>
                <span className="search-bar__result-common">{s.commonName}</span>
                <span className="search-bar__result-anatomical">{s.anatomicalName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {isFocused && searchQuery.trim() && results.length === 0 && (
        <div className="search-bar__no-results">No structures found for "{searchQuery}".</div>
      )}
    </div>
  );
}
