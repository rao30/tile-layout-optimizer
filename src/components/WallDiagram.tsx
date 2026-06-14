import { useLayoutStore } from '../store/useLayoutStore';
import type { PlacedTile } from '../types';

const TILE_COLOR = '#e8e4df';
const CUT_COLOR = '#d4cfc8';
const SLIVER_COLOR = '#f5a623';

function formatInches(value: number): string {
  if (value < 0.02) return '—';
  const whole = Math.floor(value);
  const frac = value - whole;
  if (frac < 0.02) return `${whole}"`;
  if (Math.abs(frac - 0.5) < 0.02) return whole > 0 ? `${whole}½"` : `½"`;
  if (Math.abs(frac - 0.25) < 0.02) return whole > 0 ? `${whole}¼"` : `¼"`;
  if (Math.abs(frac - 0.75) < 0.02) return whole > 0 ? `${whole}¾"` : `¾"`;
  return `${value.toFixed(1)}"`;
}

interface TileCellProps {
  tile: PlacedTile;
  scale: number;
  groutPx: number;
}

function TileCell({ tile, scale, groutPx }: TileCellProps) {
  const color = tile.cutType === 'sliver' ? SLIVER_COLOR : tile.isCut ? CUT_COLOR : TILE_COLOR;

  return (
    <div
      className="absolute border border-slate-300/50 flex items-center justify-center overflow-hidden"
      style={{
        left: tile.x * scale,
        bottom: tile.y * scale,
        width: tile.width * scale - groutPx,
        height: tile.height * scale - groutPx,
        backgroundColor: color,
      }}
      title={`${formatInches(tile.width)} × ${formatInches(tile.height)}${tile.isCut ? ' (cut)' : ''}`}
    >
      {tile.isCut && tile.width * scale > 20 && tile.height * scale > 16 && (
        <span className="text-[8px] text-slate-500 leading-tight text-center px-0.5">
          {formatInches(tile.width)}
          <br />×
          <br />
          {formatInches(tile.height)}
        </span>
      )}
    </div>
  );
}

export function WallDiagram() {
  const layoutResult = useLayoutStore((s) => s.layoutResult);
  const selectedWall = useLayoutStore((s) => s.selectedWall);
  const grout = useLayoutStore((s) => s.grout);
  const floor = useLayoutStore((s) => s.floor);

  if (!layoutResult) return null;

  const wall = layoutResult.walls[selectedWall];
  const wallLabel = selectedWall === 'floor' ? 'Floor' : `${selectedWall.charAt(0).toUpperCase() + selectedWall.slice(1)} Wall`;
  const groutSize = selectedWall === 'floor' && floor.enabled ? floor.grout.size : grout.size;
  const isFloorDisabled = selectedWall === 'floor' && !floor.enabled;
  const maxWidth = 340;
  const scale = maxWidth / wall.wallWidth;
  const diagramHeight = wall.wallHeight * scale;
  const groutPx = Math.max(groutSize * scale, 1);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-700">
        2D Layout — {wallLabel}
      </h3>

      <div
        className="relative mx-auto border-2 border-slate-400 bg-[#b8b3ad]"
        style={{ width: maxWidth, height: diagramHeight }}
      >
        {isFloorDisabled ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
            No floor tile selected
          </div>
        ) : (
          wall.tiles.map((tile) => (
            <TileCell key={tile.id} tile={tile} scale={scale} groutPx={groutPx} />
          ))
        )}

        {/* Dimension annotations */}
        <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-slate-500">
          {wall.wallWidth}"
        </div>
        <div
          className="absolute -left-8 top-0 bottom-0 flex items-center text-xs text-slate-500"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {wall.wallHeight}"
        </div>
      </div>

      <div className="text-xs text-slate-500 text-center">
        {isFloorDisabled
          ? `${wall.wallWidth}" × ${wall.wallHeight}" shower pan`
          : `Offset: ${formatInches(wall.startOffsetX)} from left, ${formatInches(wall.startOffsetY)} from bottom`}
      </div>
    </div>
  );
}
