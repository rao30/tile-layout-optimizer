# Shower Tile Layout Planner

An interactive tool for contractors and tile installers to plan shower tile layouts, avoid ugly sliver cuts, and visualize the result in real-time 3D.

## Features

- **Shower presets** — Common alcove, corner, and walk-in sizes, or custom dimensions
- **Tile presets** — Subway, large format, and square tiles, or custom sizes
- **Grout options** — Standard joint sizes (1/16" to 1/4") or custom
- **Layout patterns** — Horizontal/vertical orientation with stacked, 1/2, 1/3, or 1/4 row offsets
- **Smart optimizer** — Automatically finds the best starting position to minimize sliver cuts and balance edge pieces
- **3D visualization** — Real-time Three.js rendering as you adjust settings
- **2D wall diagram** — Detailed cut layout for each wall with dimensions
- **Layout analysis** — Per-wall stats showing full tiles, cuts, and slivers

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## How the Optimizer Works

The layout engine tries multiple starting offsets across the tile grid and scores each layout based on:

1. **Sliver penalty** — Cuts smaller than the minimum threshold (default 1.5") are heavily penalized
2. **Edge balance** — Rewards equal-sized cuts on opposite edges
3. **Partial tile aesthetics** — Prefers cuts between 1/3 and 2/3 of a full tile

Tiles are color-coded in the 3D view:
- **Light** — Full tile
- **Medium** — Cut tile (acceptable)
- **Orange** — Sliver (should be avoided)

## Tech Stack

- React 19 + TypeScript
- Vite
- Three.js via React Three Fiber
- Zustand for state management
- Tailwind CSS
