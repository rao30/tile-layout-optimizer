import { Controls } from './components/Controls';
import { LayoutStats } from './components/LayoutStats';
import { ShowerViewer } from './components/ShowerViewer';
import { WallDiagram } from './components/WallDiagram';

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <header className="shrink-0 bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Shower Tile Layout Planner</h1>
          <p className="text-xs text-slate-400">Optimize tile placement · Avoid sliver cuts · Visualize in 3D</p>
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          For contractors & tile installers
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - controls */}
        <aside className="w-80 shrink-0 bg-white border-r border-slate-200 p-4 overflow-y-auto">
          <Controls />
        </aside>

        {/* Center - 3D viewer */}
        <main className="flex-1 p-4 min-w-0">
          <ShowerViewer />
        </main>

        {/* Right panel - analysis */}
        <aside className="w-80 shrink-0 bg-white border-l border-slate-200 p-4 overflow-y-auto space-y-5">
          <LayoutStats />
          <WallDiagram />
        </aside>
      </div>
    </div>
  );
}
