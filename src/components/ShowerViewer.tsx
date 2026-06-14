import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Grid } from '@react-three/drei';
import { ShowerEnclosure } from './Shower3D';
import { useLayoutStore } from '../store/useLayoutStore';
import { inchesToMeters } from '../lib/layoutOptimizer';

function Scene() {
  const shower = useLayoutStore((s) => s.shower);
  const grout = useLayoutStore((s) => s.grout);
  const layoutResult = useLayoutStore((s) => s.layoutResult);

  if (!layoutResult) return null;

  const w = inchesToMeters(shower.width);
  const d = inchesToMeters(shower.depth);
  const h = inchesToMeters(shower.height);

  const centerX = w / 2;
  const centerZ = d / 2;
  const centerY = h / 2;

  return (
    <>
      <PerspectiveCamera makeDefault position={[centerX + 2.5, centerY + 1.5, centerZ + 3]} fov={45} />
      <OrbitControls
        target={[centerX, centerY, centerZ]}
        enableDamping
        dampingFactor={0.1}
        minDistance={1}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2 + 0.3}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} />

      <Environment preset="apartment" />

      <ShowerEnclosure
        width={shower.width}
        depth={shower.depth}
        height={shower.height}
        backLayout={layoutResult.walls.back}
        leftLayout={layoutResult.walls.left}
        rightLayout={layoutResult.walls.right}
        floorLayout={layoutResult.walls.floor}
        groutSize={grout.size}
      />

      <Grid
        position={[centerX, -0.001, centerZ]}
        args={[10, 10]}
        cellSize={0.25}
        cellThickness={0.5}
        cellColor="#cccccc"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#aaaaaa"
        fadeDistance={12}
        fadeStrength={1}
        infiniteGrid
      />
    </>
  );
}

export function ShowerViewer() {
  return (
    <div className="relative h-full w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden">
      <Canvas shadows>
        <Scene />
      </Canvas>

      <div className="absolute bottom-3 left-3 flex gap-3 text-xs text-slate-300">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#e8e4df]" /> Full tile
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#d4cfc8]" /> Cut tile
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#f5a623]" /> Sliver (avoid)
        </span>
      </div>

      <div className="absolute top-3 right-3 text-xs text-slate-400">
        Drag to rotate · Scroll to zoom
      </div>
    </div>
  );
}
