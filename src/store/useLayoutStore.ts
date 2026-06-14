import { create } from 'zustand';
import type {
  FloorConfig,
  GroutConfig,
  LayoutConfig,
  LayoutResult,
  ShowerConfig,
  TileConfig,
  WallId,
} from '../types';
import {
  DEFAULT_FLOOR,
  DEFAULT_GROUT,
  DEFAULT_LAYOUT,
  DEFAULT_SHOWER,
  DEFAULT_TILE,
} from '../types';
import { computeFullLayout } from '../lib/layoutOptimizer';

interface LayoutStore {
  shower: ShowerConfig;
  tile: TileConfig;
  grout: GroutConfig;
  layout: LayoutConfig;
  floor: FloorConfig;
  layoutResult: LayoutResult | null;
  selectedWall: WallId;
  showCutLabels: boolean;
  setShower: (shower: Partial<ShowerConfig>) => void;
  setTile: (tile: Partial<TileConfig>) => void;
  setGrout: (grout: Partial<GroutConfig>) => void;
  setLayout: (layout: Partial<LayoutConfig>) => void;
  setFloor: (floor: Partial<FloorConfig>) => void;
  setFloorTile: (tile: Partial<TileConfig>) => void;
  setFloorGrout: (grout: Partial<GroutConfig>) => void;
  setFloorLayout: (layout: Partial<LayoutConfig>) => void;
  setSelectedWall: (wall: WallId) => void;
  setShowCutLabels: (show: boolean) => void;
  recompute: () => void;
}

function buildLayoutResult(
  shower: ShowerConfig,
  tile: TileConfig,
  grout: GroutConfig,
  layout: LayoutConfig,
  floor: FloorConfig,
): LayoutResult {
  return computeFullLayout(shower, tile, grout, layout, floor);
}

export const useLayoutStore = create<LayoutStore>((set, get) => ({
  shower: DEFAULT_SHOWER,
  tile: DEFAULT_TILE,
  grout: DEFAULT_GROUT,
  layout: DEFAULT_LAYOUT,
  floor: DEFAULT_FLOOR,
  layoutResult: buildLayoutResult(DEFAULT_SHOWER, DEFAULT_TILE, DEFAULT_GROUT, DEFAULT_LAYOUT, DEFAULT_FLOOR),
  selectedWall: 'back',
  showCutLabels: true,

  setShower: (partial) => {
    const shower = { ...get().shower, ...partial };
    const { tile, grout, layout, floor } = get();
    const layoutResult = buildLayoutResult(shower, tile, grout, layout, floor);
    set({ shower, layoutResult });
  },

  setTile: (partial) => {
    const tile = { ...get().tile, ...partial };
    const { shower, grout, layout, floor } = get();
    const layoutResult = buildLayoutResult(shower, tile, grout, layout, floor);
    set({ tile, layoutResult });
  },

  setGrout: (partial) => {
    const grout = { ...get().grout, ...partial };
    const { shower, tile, layout, floor } = get();
    const layoutResult = buildLayoutResult(shower, tile, grout, layout, floor);
    set({ grout, layoutResult });
  },

  setLayout: (partial) => {
    const layout = { ...get().layout, ...partial };
    const { shower, tile, grout, floor } = get();
    const layoutResult = buildLayoutResult(shower, tile, grout, layout, floor);
    set({ layout, layoutResult });
  },

  setFloor: (partial) => {
    const floor = { ...get().floor, ...partial };
    const { shower, tile, grout, layout } = get();
    const layoutResult = buildLayoutResult(shower, tile, grout, layout, floor);
    set({ floor, layoutResult });
  },

  setFloorTile: (partial) => {
    const floor = { ...get().floor, tile: { ...get().floor.tile, ...partial } };
    const { shower, tile, grout, layout } = get();
    const layoutResult = buildLayoutResult(shower, tile, grout, layout, floor);
    set({ floor, layoutResult });
  },

  setFloorGrout: (partial) => {
    const floor = { ...get().floor, grout: { ...get().floor.grout, ...partial } };
    const { shower, tile, grout, layout } = get();
    const layoutResult = buildLayoutResult(shower, tile, grout, layout, floor);
    set({ floor, layoutResult });
  },

  setFloorLayout: (partial) => {
    const floor = { ...get().floor, layout: { ...get().floor.layout, ...partial } };
    const { shower, tile, grout, layout } = get();
    const layoutResult = buildLayoutResult(shower, tile, grout, layout, floor);
    set({ floor, layoutResult });
  },

  setSelectedWall: (wall) => set({ selectedWall: wall }),
  setShowCutLabels: (show) => set({ showCutLabels: show }),

  recompute: () => {
    const { shower, tile, grout, layout, floor } = get();
    set({ layoutResult: buildLayoutResult(shower, tile, grout, layout, floor) });
  },
}));
