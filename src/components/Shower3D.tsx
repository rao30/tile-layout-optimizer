import * as THREE from 'three';
import type { PlacedTile, WallLayout } from '../types';
import { inchesToMeters } from '../lib/layoutOptimizer';

const TILE_COLOR = '#e8e4df';
const CUT_COLOR = '#d4cfc8';
const SLIVER_COLOR = '#f5a623';

interface TileMeshProps {
  tile: PlacedTile;
  groutSize: number;
}

function TileMesh({ tile, groutSize }: TileMeshProps) {
  const color = tile.cutType === 'sliver' ? SLIVER_COLOR : tile.isCut ? CUT_COLOR : TILE_COLOR;

  const w = inchesToMeters(tile.width - groutSize * 0.5);
  const h = inchesToMeters(tile.height - groutSize * 0.5);
  const grout = inchesToMeters(groutSize);

  // Position: origin at bottom-left of wall, Y up
  const x = inchesToMeters(tile.x + tile.width / 2);
  const y = inchesToMeters(tile.y + tile.height / 2);

  return (
    <mesh position={[x, y, grout * 0.5]}>
      <boxGeometry args={[Math.max(w, 0.001), Math.max(h, 0.001), inchesToMeters(0.25)]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
    </mesh>
  );
}

interface TiledWallProps {
  layout: WallLayout;
  groutSize: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
}

export function TiledWall({ layout, groutSize, rotation = [0, 0, 0], position = [0, 0, 0] }: TiledWallProps) {
  const wallW = inchesToMeters(layout.wallWidth);
  const wallH = inchesToMeters(layout.wallHeight);

  return (
    <group rotation={rotation} position={position}>
      {/* Wall backing */}
      <mesh position={[wallW / 2, wallH / 2, -0.005]}>
        <boxGeometry args={[wallW, wallH, 0.01]} />
        <meshStandardMaterial color="#c8c4be" roughness={0.9} />
      </mesh>

      {layout.tiles.map((tile) => (
        <TileMesh
          key={tile.id}
          tile={tile}
          groutSize={groutSize}
        />
      ))}
    </group>
  );
}

interface ShowerEnclosureProps {
  width: number;
  depth: number;
  height: number;
  backLayout: WallLayout;
  leftLayout: WallLayout;
  rightLayout: WallLayout;
  floorLayout: WallLayout;
  groutSize: number;
}

export function ShowerEnclosure({
  width,
  depth,
  height,
  backLayout,
  leftLayout,
  rightLayout,
  floorLayout,
  groutSize,
}: ShowerEnclosureProps) {
  const w = inchesToMeters(width);
  const d = inchesToMeters(depth);
  const h = inchesToMeters(height);

  return (
    <group>
      {/* Back wall */}
      <TiledWall
        layout={backLayout}
        groutSize={groutSize}
        position={[0, 0, 0]}
      />

      {/* Left wall */}
      <TiledWall
        layout={leftLayout}
        groutSize={groutSize}
        rotation={[0, Math.PI / 2, 0]}
        position={[0, 0, 0]}
      />

      {/* Right wall */}
      <TiledWall
        layout={rightLayout}
        groutSize={groutSize}
        rotation={[0, -Math.PI / 2, 0]}
        position={[w, 0, 0]}
      />

      {/* Floor */}
      <TiledWall
        layout={floorLayout}
        groutSize={groutSize}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      />

      {/* Glass panel hint (front opening) */}
      <mesh position={[w / 2, h / 2, d + 0.01]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#88ccee" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Shower curb */}
      <mesh position={[w / 2, -0.02, d / 2]}>
        <boxGeometry args={[w + 0.08, 0.04, d + 0.08]} />
        <meshStandardMaterial color="#b0aca6" roughness={0.7} />
      </mesh>
    </group>
  );
}
