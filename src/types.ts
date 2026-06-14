export type TileOrientation = 'horizontal' | 'vertical';

export type OffsetPattern = 'none' | 'half' | 'third' | 'quarter';

export type WallId = 'back' | 'left' | 'right' | 'floor';

export interface Dimensions {
  width: number;  // inches
  height: number; // inches
}

export interface ShowerConfig {
  presetId: string | null;
  width: number;   // back wall width (inches)
  depth: number;   // side-to-side (inches)
  height: number;  // wall height (inches)
}

export interface TileConfig {
  presetId: string | null;
  width: number;  // inches
  height: number; // inches
}

export interface GroutConfig {
  presetId: string | null;
  size: number; // inches
}

export interface LayoutConfig {
  orientation: TileOrientation;
  offsetPattern: OffsetPattern;
  minCutSize: number; // inches - cuts smaller than this are "slivers"
  manualStartOffsetX: number | null; // null = auto-optimize
  manualStartOffsetY: number | null;
}

export interface PlacedTile {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isCut: boolean;
  cutType: 'full' | 'edge' | 'sliver';
  row: number;
  col: number;
}

export interface WallLayout {
  wallId: WallId;
  wallWidth: number;
  wallHeight: number;
  tiles: PlacedTile[];
  startOffsetX: number;
  startOffsetY: number;
  score: number;
  leftCut: number;
  rightCut: number;
  topCut: number;
  bottomCut: number;
  sliverCount: number;
}

export interface LayoutResult {
  walls: Record<WallId, WallLayout>;
  totalSlivers: number;
  averageScore: number;
}

export interface PresetOption<T> {
  id: string;
  label: string;
  value: T;
}

export const SHOWER_PRESETS: PresetOption<Pick<ShowerConfig, 'width' | 'depth' | 'height'>>[] = [
  { id: 'alcove-36', label: '36" × 36" Alcove', value: { width: 36, depth: 36, height: 96 } },
  { id: 'alcove-48', label: '48" × 36" Alcove', value: { width: 48, depth: 36, height: 96 } },
  { id: 'alcove-60', label: '60" × 36" Alcove', value: { width: 60, depth: 36, height: 96 } },
  { id: 'corner-36', label: '36" × 36" Corner', value: { width: 36, depth: 36, height: 84 } },
  { id: 'walkin-48', label: '48" × 48" Walk-in', value: { width: 48, depth: 48, height: 96 } },
  { id: 'walkin-60', label: '60" × 36" Walk-in', value: { width: 60, depth: 36, height: 96 } },
  { id: 'niche-32', label: '32" × 32" Niche', value: { width: 32, depth: 32, height: 84 } },
];

export const TILE_PRESETS: PresetOption<Pick<TileConfig, 'width' | 'height'>>[] = [
  { id: 'subway-3x6', label: '3" × 6" Subway', value: { width: 3, height: 6 } },
  { id: 'subway-4x12', label: '4" × 12" Subway', value: { width: 4, height: 12 } },
  { id: 'subway-4x16', label: '4" × 16" Subway', value: { width: 4, height: 16 } },
  { id: 'large-6x24', label: '6" × 24" Large Format', value: { width: 6, height: 24 } },
  { id: 'large-12x24', label: '12" × 24" Large Format', value: { width: 12, height: 24 } },
  { id: 'square-6', label: '6" × 6" Square', value: { width: 6, height: 6 } },
  { id: 'square-12', label: '12" × 12" Square', value: { width: 12, height: 12 } },
  { id: 'hex-8', label: '8" Hex (as 8×8)', value: { width: 8, height: 8 } },
];

export const GROUT_PRESETS: PresetOption<Pick<GroutConfig, 'size'>>[] = [
  { id: 'grout-1-16', label: '1/16" (1.5mm)', value: { size: 1 / 16 } },
  { id: 'grout-1-8', label: '1/8" (3mm)', value: { size: 1 / 8 } },
  { id: 'grout-3-16', label: '3/16" (5mm)', value: { size: 3 / 16 } },
  { id: 'grout-1-4', label: '1/4" (6mm)', value: { size: 1 / 4 } },
];

export const OFFSET_OPTIONS: { id: OffsetPattern; label: string; fraction: number }[] = [
  { id: 'none', label: 'Stacked (No Offset)', fraction: 0 },
  { id: 'half', label: '1/2 Offset (Brick)', fraction: 0.5 },
  { id: 'third', label: '1/3 Offset', fraction: 1 / 3 },
  { id: 'quarter', label: '1/4 Offset', fraction: 0.25 },
];

export const DEFAULT_SHOWER: ShowerConfig = {
  presetId: 'alcove-36',
  width: 36,
  depth: 36,
  height: 96,
};

export const DEFAULT_TILE: TileConfig = {
  presetId: 'subway-3x6',
  width: 3,
  height: 6,
};

export const DEFAULT_GROUT: GroutConfig = {
  presetId: 'grout-1-8',
  size: 1 / 8,
};

export const DEFAULT_LAYOUT: LayoutConfig = {
  orientation: 'horizontal',
  offsetPattern: 'half',
  minCutSize: 1.5,
  manualStartOffsetX: null,
  manualStartOffsetY: null,
};

export interface FloorConfig {
  enabled: boolean;
  tile: TileConfig;
  grout: GroutConfig;
  layout: LayoutConfig;
}

export const DEFAULT_FLOOR: FloorConfig = {
  enabled: false,
  tile: { ...DEFAULT_TILE },
  grout: { ...DEFAULT_GROUT },
  layout: { ...DEFAULT_LAYOUT },
};
