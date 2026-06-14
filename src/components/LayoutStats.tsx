import { useLayoutStore } from '../store/useLayoutStore';
import type { WallLayout, WallId } from '../types';

function formatInches(value: number): string {
  const whole = Math.floor(value);
  const frac = value - whole;
  if (frac < 0.02) return `${whole}"`;
  if (Math.abs(frac - 0.125) < 0.02) return whole > 0 ? `${whole} 1/8"` : `1/8"`;
  if (Math.abs(frac - 0.25) < 0.02) return whole > 0 ? `${whole} 1/4"` : `1/4"`;
  if (Math.abs(frac - 0.375) < 0.02) return whole > 0 ? `${whole} 3/8"` : `3/8"`;
  if (Math.abs(frac - 0.5) < 0.02) return whole > 0 ? `${whole} 1/2"` : `1/2"`;
  if (Math.abs(frac - 0.625) < 0.02) return whole > 0 ? `${whole} 5/8"` : `5/8"`;
  if (Math.abs(frac - 0.75) < 0.02) return whole > 0 ? `${whole} 3/4"` : `3/4"`;
  if (Math.abs(frac - 0.875) < 0.02) return whole > 0 ? `${whole} 7/8"` : `7/8"`;
  return `${value.toFixed(2)}"`;
}

interface WallStatsProps {
  wall: WallLayout;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

function WallStats({ wall, label, isSelected, onSelect }: WallStatsProps) {
  const fullCount = wall.tiles.filter((t) => !t.isCut).length;
  const cutCount = wall.tiles.filter((t) => t.isCut && t.cutType !== 'sliver').length;
  const sliverCount = wall.sliverCount;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-sm text-slate-800">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          sliverCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
        }`}>
          {sliverCount > 0 ? `${sliverCount} sliver${sliverCount > 1 ? 's' : ''}` : 'Good'}
        </span>
      </div>
      <div className="text-xs text-slate-500 space-y-0.5">
        <div>{wall.wallWidth}" × {wall.wallHeight}" · {wall.tiles.length} tiles</div>
        <div>{fullCount} full · {cutCount} cut{sliverCount > 0 ? ` · ${sliverCount} sliver` : ''}</div>
        {(wall.leftCut > 0.01 || wall.rightCut > 0.01) && (
          <div>L/R cuts: {formatInches(wall.leftCut)} / {formatInches(wall.rightCut)}</div>
        )}
        {(wall.topCut > 0.01 || wall.bottomCut > 0.01) && (
          <div>T/B cuts: {formatInches(wall.topCut)} / {formatInches(wall.bottomCut)}</div>
        )}
      </div>
    </button>
  );
}

const WALL_LABELS: Record<WallId, string> = {
  back: 'Back Wall',
  left: 'Left Wall',
  right: 'Right Wall',
  floor: 'Floor',
};

export function LayoutStats() {
  const layoutResult = useLayoutStore((s) => s.layoutResult);
  const selectedWall = useLayoutStore((s) => s.selectedWall);
  const setSelectedWall = useLayoutStore((s) => s.setSelectedWall);

  if (!layoutResult) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Layout Analysis</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          layoutResult.totalSlivers === 0
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {layoutResult.totalSlivers === 0 ? 'Optimized' : `${layoutResult.totalSlivers} slivers total`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(WALL_LABELS) as WallId[]).map((wallId) => (
          <WallStats
            key={wallId}
            wall={layoutResult.walls[wallId]}
            label={WALL_LABELS[wallId]}
            isSelected={selectedWall === wallId}
            onSelect={() => setSelectedWall(wallId)}
          />
        ))}
      </div>
    </div>
  );
}
