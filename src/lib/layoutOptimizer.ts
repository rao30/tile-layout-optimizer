import type { OffsetPattern, PlacedTile, TileOrientation, WallId, WallLayout } from '../types';
import { OFFSET_OPTIONS } from '../types';

const INCH_TO_SCENE = 0.0254; // meters per inch for Three.js

export function inchesToMeters(inches: number): number {
  return inches * INCH_TO_SCENE;
}

export function getEffectiveTileSize(
  tileWidth: number,
  tileHeight: number,
  orientation: TileOrientation,
): { width: number; height: number } {
  if (orientation === 'horizontal') {
    return { width: tileWidth, height: tileHeight };
  }
  return { width: tileHeight, height: tileWidth };
}

export function getOffsetFraction(pattern: OffsetPattern): number {
  return OFFSET_OPTIONS.find((o) => o.id === pattern)?.fraction ?? 0;
}

export interface LayoutParams {
  wallWidth: number;
  wallHeight: number;
  tileWidth: number;
  tileHeight: number;
  groutSize: number;
  orientation: TileOrientation;
  offsetPattern: OffsetPattern;
  minCutSize: number;
  startOffsetX?: number;
  startOffsetY?: number;
}

export interface LayoutScore {
  score: number;
  leftCut: number;
  rightCut: number;
  topCut: number;
  bottomCut: number;
  sliverCount: number;
  tiles: PlacedTile[];
  startOffsetX: number;
  startOffsetY: number;
}

function classifyCut(size: number, fullSize: number, minCut: number): 'full' | 'edge' | 'sliver' {
  if (Math.abs(size - fullSize) < 0.01) return 'full';
  if (size < minCut) return 'sliver';
  return 'edge';
}

export function computeLayout(params: LayoutParams): LayoutScore {
  const {
    wallWidth,
    wallHeight,
    groutSize,
    orientation,
    offsetPattern,
    minCutSize,
  } = params;

  const effective = getEffectiveTileSize(params.tileWidth, params.tileHeight, orientation);
  const tileW = effective.width;
  const tileH = effective.height;
  const offsetFrac = getOffsetFraction(offsetPattern);

  const startOffsetX = params.startOffsetX ?? 0;
  const startOffsetY = params.startOffsetY ?? 0;

  const unitW = tileW + groutSize;
  const unitH = tileH + groutSize;

  const tiles: PlacedTile[] = [];
  let tileId = 0;

  // Compute rows from bottom up (contractor convention)
  const rows: { y: number; height: number; rowIndex: number }[] = [];
  let y = startOffsetY;
  let rowIndex = 0;

  while (y < wallHeight - 0.001) {
    const remaining = wallHeight - y;
    const rowH = Math.min(tileH, remaining);
    rows.push({ y, height: rowH, rowIndex });
    y += unitH;
    rowIndex++;
  }

  const topCut = rows.length > 0 ? rows[rows.length - 1].height : 0;
  const bottomCut = rows.length > 0 ? rows[0].height : 0;

  for (const row of rows) {
    const rowOffset = offsetFrac > 0 && row.rowIndex % 2 === 1
      ? unitW * offsetFrac
      : 0;

    let x = startOffsetX - rowOffset;
    let col = 0;

    // Handle negative start from offset
    while (x + tileW < 0) {
      x += unitW;
      col++;
    }

    while (x < wallWidth - 0.001) {
      const tileStart = Math.max(0, x);
      const tileEnd = Math.min(wallWidth, x + tileW);
      const visibleW = tileEnd - tileStart;

      if (visibleW > 0.01) {
        const isCutW = visibleW < tileW - 0.01 || tileStart > 0.01;
        const isCutH = row.height < tileH - 0.01;
        const isCut = isCutW || isCutH;

        let cutType: 'full' | 'edge' | 'sliver' = 'full';
        if (isCut) {
          const wClass = classifyCut(visibleW, tileW, minCutSize);
          const hClass = classifyCut(row.height, tileH, minCutSize);
          if (wClass === 'sliver' || hClass === 'sliver') cutType = 'sliver';
          else cutType = 'edge';
        }

        tiles.push({
          id: `t-${tileId++}`,
          x: tileStart,
          y: row.y,
          width: visibleW,
          height: row.height,
          isCut,
          cutType,
          row: row.rowIndex,
          col,
        });
      }

      x += unitW;
      col++;
    }
  }

  // Edge cuts
  const firstRowTiles = tiles.filter((t) => t.row === 0);

  const leftCut = firstRowTiles.length > 0
    ? Math.min(...firstRowTiles.map((t) => t.x === 0 ? t.width : t.x))
    : 0;
  const rightCut = firstRowTiles.length > 0
    ? Math.min(...firstRowTiles.map((t) => wallWidth - (t.x + t.width)))
    : 0;

  const sliverCount = tiles.filter((t) => t.cutType === 'sliver').length;

  const score = scoreLayout({
    leftCut,
    rightCut,
    topCut: rows.length > 0 && topCut < tileH ? topCut : tileH,
    bottomCut: rows.length > 0 && bottomCut < tileH ? bottomCut : tileH,
    sliverCount,
    tileW,
    tileH,
    minCutSize,
  });

  return {
    score,
    leftCut,
    rightCut,
    topCut: topCut < tileH ? topCut : 0,
    bottomCut: bottomCut < tileH ? bottomCut : 0,
    sliverCount,
    tiles,
    startOffsetX,
    startOffsetY,
  };
}

interface ScoreInput {
  leftCut: number;
  rightCut: number;
  topCut: number;
  bottomCut: number;
  sliverCount: number;
  tileW: number;
  tileH: number;
  minCutSize: number;
}

function scoreLayout(input: ScoreInput): number {
  const { leftCut, rightCut, topCut, bottomCut, sliverCount, tileW, tileH, minCutSize } = input;

  let score = 1000;

  // Heavy penalty for slivers
  score -= sliverCount * 500;

  // Penalize thin cuts (but less than slivers)
  const cuts = [
    { size: leftCut, full: tileW },
    { size: rightCut, full: tileW },
    { size: topCut, full: tileH },
    { size: bottomCut, full: tileH },
  ];

  for (const { size, full } of cuts) {
    if (size > 0.01 && size < full - 0.01) {
      if (size < minCutSize) {
        score -= 200;
      } else if (size < full * 0.25) {
        score -= 80;
      } else if (size < full * 0.33) {
        score -= 30;
      }
    }
  }

  // Reward balanced horizontal cuts
  if (leftCut > 0.01 && rightCut > 0.01) {
    const hBalance = 1 - Math.abs(leftCut - rightCut) / Math.max(leftCut, rightCut);
    score += hBalance * 50;
  }

  // Reward balanced vertical cuts
  if (topCut > 0.01 && bottomCut > 0.01 && topCut < tileH && bottomCut < tileH) {
    const vBalance = 1 - Math.abs(topCut - bottomCut) / Math.max(topCut, bottomCut);
    score += vBalance * 40;
  }

  // Reward centered layout (equal cuts on both sides)
  const hSymmetry = Math.abs(leftCut - rightCut);
  score -= hSymmetry * 5;

  // Prefer cuts that are at least 1/3 of tile (aesthetic sweet spot)
  for (const { size, full } of cuts) {
    if (size > 0.01 && size < full - 0.01) {
      const ratio = size / full;
      if (ratio >= 0.33 && ratio <= 0.67) {
        score += 25; // nice partial tile size
      }
    }
  }

  return score;
}

export function optimizeLayout(params: Omit<LayoutParams, 'startOffsetX' | 'startOffsetY'>): LayoutScore {
  const effective = getEffectiveTileSize(params.tileWidth, params.tileHeight, params.orientation);
  const unitW = effective.width + params.groutSize;
  const unitH = effective.height + params.groutSize;

  const steps = 20;
  let best: LayoutScore | null = null;

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const startOffsetX = (i / steps) * unitW;
      const startOffsetY = (j / steps) * unitH;

      const result = computeLayout({ ...params, startOffsetX, startOffsetY });

      if (!best || result.score > best.score) {
        best = result;
      }
    }
  }

  return best!;
}

function emptyWallLayout(wallId: WallId, wallWidth: number, wallHeight: number): WallLayout {
  return {
    wallId,
    wallWidth,
    wallHeight,
    tiles: [],
    startOffsetX: 0,
    startOffsetY: 0,
    score: 0,
    leftCut: 0,
    rightCut: 0,
    topCut: 0,
    bottomCut: 0,
    sliverCount: 0,
  };
}

export function computeFullLayout(
  shower: { width: number; depth: number; height: number },
  tile: { width: number; height: number },
  grout: { size: number },
  layout: {
    orientation: TileOrientation;
    offsetPattern: OffsetPattern;
    minCutSize: number;
    manualStartOffsetX: number | null;
    manualStartOffsetY: number | null;
  },
  floorConfig?: {
    enabled: boolean;
    tile: { width: number; height: number };
    grout: { size: number };
    layout: {
      orientation: TileOrientation;
      offsetPattern: OffsetPattern;
      minCutSize: number;
      manualStartOffsetX: number | null;
      manualStartOffsetY: number | null;
    };
  },
) {
  const baseParams = {
    tileWidth: tile.width,
    tileHeight: tile.height,
    groutSize: grout.size,
    orientation: layout.orientation,
    offsetPattern: layout.offsetPattern,
    minCutSize: layout.minCutSize,
  };

  const computeWall = (wallWidth: number, wallHeight: number) => {
    if (layout.manualStartOffsetX !== null && layout.manualStartOffsetY !== null) {
      return computeLayout({
        ...baseParams,
        wallWidth,
        wallHeight,
        startOffsetX: layout.manualStartOffsetX,
        startOffsetY: layout.manualStartOffsetY,
      });
    }
    return optimizeLayout({ ...baseParams, wallWidth, wallHeight });
  };

  const back = computeWall(shower.width, shower.height);
  const left = computeWall(shower.depth, shower.height);
  const right = computeWall(shower.depth, shower.height);

  let floor;
  if (floorConfig?.enabled) {
    const floorParams = {
      tileWidth: floorConfig.tile.width,
      tileHeight: floorConfig.tile.height,
      groutSize: floorConfig.grout.size,
      orientation: floorConfig.layout.orientation,
      offsetPattern: floorConfig.layout.offsetPattern,
      minCutSize: floorConfig.layout.minCutSize,
    };
    const computeFloor = () => {
      if (floorConfig.layout.manualStartOffsetX !== null && floorConfig.layout.manualStartOffsetY !== null) {
        return computeLayout({
          ...floorParams,
          wallWidth: shower.width,
          wallHeight: shower.depth,
          startOffsetX: floorConfig.layout.manualStartOffsetX,
          startOffsetY: floorConfig.layout.manualStartOffsetY,
        });
      }
      return optimizeLayout({ ...floorParams, wallWidth: shower.width, wallHeight: shower.depth });
    };
    floor = computeFloor();
  } else {
    floor = emptyWallLayout('floor', shower.width, shower.depth);
  }

  const walls = {
    back: { wallId: 'back' as const, wallWidth: shower.width, wallHeight: shower.height, ...back },
    left: { wallId: 'left' as const, wallWidth: shower.depth, wallHeight: shower.height, ...left },
    right: { wallId: 'right' as const, wallWidth: shower.depth, wallHeight: shower.height, ...right },
    floor: { wallId: 'floor' as const, wallWidth: shower.width, wallHeight: shower.depth, ...floor },
  };

  const scoredWalls = floorConfig?.enabled
    ? Object.values(walls)
    : [walls.back, walls.left, walls.right];
  const totalSlivers = scoredWalls.reduce((sum, w) => sum + w.sliverCount, 0);
  const averageScore = scoredWalls.reduce((sum, w) => sum + w.score, 0) / scoredWalls.length;

  return { walls, totalSlivers, averageScore };
}
