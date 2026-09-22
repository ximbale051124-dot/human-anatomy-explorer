import React, { useMemo, useState } from 'react';
import { ANATOMY_RECORDS } from '../../data/anatomy/records';
import { useAnatomy } from '../../context/AnatomyContext';
import type { AnatomyRecord } from '../../types/anatomy';

export function SearchBar() {
  const { searchQuery, setSearchQuery, selectAnatomyId, requestView } = useAnatomy();
  const [isFocused, setIsFocused] = useState(false);
  const results = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return ANATOMY_RECORDS.filter((record) => [record.displayName, record.latinName, ...record.aliases]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(query))).slice(0, 8);
  }, [searchQuery]);
  const selectRecord = (record: AnatomyRecord) => {
    selectAnatomyId(record.id);
    requestView({ type: 'focus', anatomyId: record.id });
    setSearchQuery('');
    setIsFocused(false);
  };
  return <div className="search-bar">
    <input className="search-bar__input" type="text" placeholder="Search structures (e.g. left femur, biceps brachii)..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setTimeout(() => setIsFocused(false), 150)} aria-label="Search anatomical structures" />
    {isFocused && results.length > 0 && <ul className="search-bar__results">{results.map((record) => <li key={record.id}><button className="search-bar__result-btn" onClick={() => selectRecord(record)}><span className="search-bar__result-common">{record.displayName}</span><span className="search-bar__result-anatomical">{record.latinName ?? record.system}</span></button></li>)}</ul>}
    {isFocused && searchQuery.trim() && results.length === 0 && <div className="search-bar__no-results">No structures found for &quot;{searchQuery}&quot;.</div>}
  </div>;
}
