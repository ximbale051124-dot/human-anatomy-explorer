import React, { useState } from 'react';
import { AnatomyProvider } from './context/AnatomyContext';
import { SearchBar } from './components/Header/SearchBar';
import { SystemsPanel } from './components/Sidebar/SystemsPanel';
import { LayerControls } from './components/Sidebar/LayerControls';
import { Scene3D } from './components/Viewer/Scene3D';
import { ViewControls } from './components/Viewer/ViewControls';
import { InfoPanel } from './components/InfoPanel/InfoPanel';

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <button
            className="app-header__menu-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle systems menu"
          >
            &#9776;
          </button>
          <h1>Human Anatomy Explorer</h1>
        </div>
        <SearchBar />
      </header>

      <div className="app-body">
        <aside className={`app-sidebar ${sidebarOpen ? 'app-sidebar--open' : ''}`}>
          <SystemsPanel />
          <LayerControls />
        </aside>

        <main className="app-main">
          <div className="app-viewer">
            <Scene3D />
            <ViewControls />
          </div>
        </main>
      </div>

      <footer className="app-footer">
        <InfoPanel />
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AnatomyProvider>
      <AppShell />
    </AnatomyProvider>
  );
}
