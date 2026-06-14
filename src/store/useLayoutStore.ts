import { create } from 'zustand';
import type {
  GroutConfig,
  LayoutConfig,
  LayoutResult,
  ShowerConfig,
  TileConfig,
  WallId,
} from '../types';
import {
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
  layoutResult: LayoutResult | null;
  selectedWall: WallId;
  showCutLabels: boolean;
  setShower: (shower: Partial<ShowerConfig>) => void;
  setTile: (tile: Partial<TileConfig>) => void;
  setGrout: (grout: Partial<GroutConfig>) => void;
  setLayout: (layout: Partial<LayoutConfig>) => void;
  setSelectedWall: (wall: WallId) => void;
  setShowCutLabels: (show: boolean) => void;
  recompute: () => void;
}

function buildLayoutResult(
  shower: ShowerConfig,
  tile: TileConfig,
  grout: GroutConfig,
  layout: LayoutConfig,
): LayoutResult {
  return computeFullLayout(shower, tile, grout, layout);
}

export const useLayoutStore = create<LayoutStore>((set, get) => ({
  shower: DEFAULT_SHOWER,
  tile: DEFAULT_TILE,
  grout: DEFAULT_GROUT,
  layout: DEFAULT_LAYOUT,
  layoutResult: buildLayoutResult(DEFAULT_SHOWER, DEFAULT_TILE, DEFAULT_GROUT, DEFAULT_LAYOUT),
  selectedWall: 'back',
  showCutLabels: true,

  setShower: (partial) => {
    const shower = { ...get().shower, ...partial };
    const layoutResult = buildLayoutResult(shower, get().tile, get().grout, get().layout);
    set({ shower, layoutResult });
  },

  setTile: (partial) => {
    const tile = { ...get().tile, ...partial };
    const layoutResult = buildLayoutResult(get().shower, tile, get().grout, get().layout);
    set({ tile, layoutResult });
  },

  setGrout: (partial) => {
    const grout = { ...get().grout, ...partial };
    const layoutResult = buildLayoutResult(get().shower, get().tile, grout, get().layout);
    set({ grout, layoutResult });
  },

  setLayout: (partial) => {
    const layout = { ...get().layout, ...partial };
    const layoutResult = buildLayoutResult(get().shower, get().tile, get().grout, layout);
    set({ layout, layoutResult });
  },

  setSelectedWall: (wall) => set({ selectedWall: wall }),
  setShowCutLabels: (show) => set({ showCutLabels: show }),

  recompute: () => {
    const { shower, tile, grout, layout } = get();
    set({ layoutResult: buildLayoutResult(shower, tile, grout, layout) });
  },
}));
