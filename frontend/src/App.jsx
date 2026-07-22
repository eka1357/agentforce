import React from 'react';
import { Header } from './canvas/Header';
import { Sidebar } from './canvas/Sidebar';
import { Canvas } from './canvas/Canvas';
import { NodeInspector } from './canvas/NodeInspector';

export function App() {
  return (
    <div className="w-screen h-screen flex flex-col bg-dark-900 overflow-hidden select-none">
      <Header />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 h-full relative bg-dark-900">
          <Canvas />
        </main>
        <NodeInspector />
      </div>
    </div>
  );
}

export default App;
