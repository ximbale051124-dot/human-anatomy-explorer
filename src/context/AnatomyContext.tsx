import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { LayerId, SystemId, ViewPreset } from '../types/anatomy';
import { SYSTEMS } from '../data/systems';

export type ViewCommand =
  | { type: 'preset'; preset: ViewPreset }
  | { type: 'focus'; position: [number, number, number] };

interface AnatomyContextValue {
  // Selection
  selectedStructureId: string | null;
  selectStructure: (id: string | null) => void;

  // Systems visibility
  systemVisibility: Record<SystemId, boolean>;
  toggleSystem: (id: SystemId) => void;
  showAllSystems: () => void;
  hideAllSystems: () => void;
  showOnlySystem: (id: SystemId) => void;

  // Layer visibility
  layerVisibility: Record<LayerId, boolean>;
  toggleLayer: (id: LayerId) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Camera
  viewCommand: ViewCommand | null;
  requestView: (cmd: ViewCommand) => void;
  clearViewCommand: () => void;
}

const AnatomyContext = createContext<AnatomyContextValue | null>(null);

const ALL_SYSTEMS_TRUE = Object.fromEntries(SYSTEMS.map((s) => [s.id, true])) as Record<
  SystemId,
  boolean
>;

export function AnatomyProvider({ children }: { children: React.ReactNode }) {
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [systemVisibility, setSystemVisibility] = useState<Record<SystemId, boolean>>(
    ALL_SYSTEMS_TRUE
  );
  const [layerVisibility, setLayerVisibility] = useState<Record<LayerId, boolean>>({
    // Start beneath the translucent surface so the contrasting system colours
    // are immediately useful; learners can enable Skin when they need it.
    skin: false,
    muscles: true,
    bones: true,
    organs: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewCommand, setViewCommand] = useState<ViewCommand | null>(null);

  const selectStructure = useCallback((id: string | null) => setSelectedStructureId(id), []);

  const toggleSystem = useCallback((id: SystemId) => {
    setSystemVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const showAllSystems = useCallback(() => {
    setSystemVisibility(Object.fromEntries(SYSTEMS.map((s) => [s.id, true])) as Record<SystemId, boolean>);
  }, []);

  const hideAllSystems = useCallback(() => {
    setSystemVisibility(Object.fromEntries(SYSTEMS.map((s) => [s.id, false])) as Record<SystemId, boolean>);
  }, []);

  const showOnlySystem = useCallback((id: SystemId) => {
    setSystemVisibility(
      Object.fromEntries(SYSTEMS.map((s) => [s.id, s.id === id])) as Record<SystemId, boolean>
    );
  }, []);

  const toggleLayer = useCallback((id: LayerId) => {
    setLayerVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const requestView = useCallback((cmd: ViewCommand) => setViewCommand(cmd), []);
  const clearViewCommand = useCallback(() => setViewCommand(null), []);

  const value = useMemo(
    () => ({
      selectedStructureId,
      selectStructure,
      systemVisibility,
      toggleSystem,
      showAllSystems,
      hideAllSystems,
      showOnlySystem,
      layerVisibility,
      toggleLayer,
      searchQuery,
      setSearchQuery,
      viewCommand,
      requestView,
      clearViewCommand,
    }),
    [
      selectedStructureId,
      selectStructure,
      systemVisibility,
      toggleSystem,
      showAllSystems,
      hideAllSystems,
      showOnlySystem,
      layerVisibility,
      toggleLayer,
      searchQuery,
      viewCommand,
      requestView,
      clearViewCommand,
    ]
  );

  return <AnatomyContext.Provider value={value}>{children}</AnatomyContext.Provider>;
}

export function useAnatomy(): AnatomyContextValue {
  const ctx = useContext(AnatomyContext);
  if (!ctx) throw new Error('useAnatomy must be used within an AnatomyProvider');
  return ctx;
}
