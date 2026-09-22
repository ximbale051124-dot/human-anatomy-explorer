import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { SYSTEMS } from '../data/systems';
import type { AnatomyId, LayerId, SystemId, ViewPreset } from '../types/anatomy';

export type ViewCommand =
  | { type: 'preset'; preset: ViewPreset }
  | { type: 'focus'; anatomyId: AnatomyId };

interface AnatomyContextValue {
  hoveredAnatomyId: AnatomyId | null;
  setHoveredAnatomyId: (id: AnatomyId | null) => void;
  selectedAnatomyId: AnatomyId | null;
  selectAnatomyId: (id: AnatomyId | null) => void;
  systemVisibility: Record<SystemId, boolean>;
  toggleSystem: (id: SystemId) => void;
  showAllSystems: () => void;
  hideAllSystems: () => void;
  showOnlySystem: (id: SystemId) => void;
  layerVisibility: Record<LayerId, boolean>;
  toggleLayer: (id: LayerId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  registerAnatomyPosition: (id: AnatomyId, position: [number, number, number]) => void;
  getAnatomyPosition: (id: AnatomyId) => [number, number, number] | null;
  viewCommand: ViewCommand | null;
  requestView: (command: ViewCommand) => void;
  clearViewCommand: () => void;
}

const AnatomyContext = createContext<AnatomyContextValue | null>(null);

const ALL_SYSTEMS_VISIBLE = Object.fromEntries(SYSTEMS.map((system) => [system.id, true])) as Record<SystemId, boolean>;

export function AnatomyProvider({ children }: { children: React.ReactNode }) {
  const [hoveredAnatomyId, setHoveredAnatomyId] = useState<AnatomyId | null>(null);
  const [selectedAnatomyId, setSelectedAnatomyId] = useState<AnatomyId | null>(null);
  const [systemVisibility, setSystemVisibility] = useState<Record<SystemId, boolean>>(ALL_SYSTEMS_VISIBLE);
  const [layerVisibility, setLayerVisibility] = useState<Record<LayerId, boolean>>({
    skin: false,
    muscles: true,
    bones: true,
    organs: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewCommand, setViewCommand] = useState<ViewCommand | null>(null);
  const positions = useRef(new Map<AnatomyId, [number, number, number]>());

  const selectAnatomyId = useCallback((id: AnatomyId | null) => setSelectedAnatomyId(id), []);
  const toggleSystem = useCallback((id: SystemId) => {
    setSystemVisibility((previous) => ({ ...previous, [id]: !previous[id] }));
  }, []);
  const showAllSystems = useCallback(() => setSystemVisibility(ALL_SYSTEMS_VISIBLE), []);
  const hideAllSystems = useCallback(() => {
    setSystemVisibility(Object.fromEntries(SYSTEMS.map((system) => [system.id, false])) as Record<SystemId, boolean>);
  }, []);
  const showOnlySystem = useCallback((id: SystemId) => {
    setSystemVisibility(Object.fromEntries(SYSTEMS.map((system) => [system.id, system.id === id])) as Record<SystemId, boolean>);
  }, []);
  const toggleLayer = useCallback((id: LayerId) => {
    setLayerVisibility((previous) => ({ ...previous, [id]: !previous[id] }));
  }, []);
  const registerAnatomyPosition = useCallback((id: AnatomyId, position: [number, number, number]) => {
    positions.current.set(id, position);
  }, []);
  const getAnatomyPosition = useCallback((id: AnatomyId) => positions.current.get(id) ?? null, []);
  const requestView = useCallback((command: ViewCommand) => setViewCommand(command), []);
  const clearViewCommand = useCallback(() => setViewCommand(null), []);

  const value = useMemo(() => ({
    hoveredAnatomyId,
    setHoveredAnatomyId,
    selectedAnatomyId,
    selectAnatomyId,
    systemVisibility,
    toggleSystem,
    showAllSystems,
    hideAllSystems,
    showOnlySystem,
    layerVisibility,
    toggleLayer,
    searchQuery,
    setSearchQuery,
    registerAnatomyPosition,
    getAnatomyPosition,
    viewCommand,
    requestView,
    clearViewCommand,
  }), [
    hoveredAnatomyId, selectedAnatomyId, systemVisibility, toggleSystem, showAllSystems,
    hideAllSystems, showOnlySystem, layerVisibility, toggleLayer, searchQuery,
    registerAnatomyPosition, getAnatomyPosition, viewCommand, requestView, clearViewCommand,
  ]);

  return <AnatomyContext.Provider value={value}>{children}</AnatomyContext.Provider>;
}

export function useAnatomy(): AnatomyContextValue {
  const context = useContext(AnatomyContext);
  if (!context) throw new Error('useAnatomy must be used within an AnatomyProvider');
  return context;
}
