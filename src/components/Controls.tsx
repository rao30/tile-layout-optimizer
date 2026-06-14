import { useLayoutStore } from '../store/useLayoutStore';
import {
  SHOWER_PRESETS,
  TILE_PRESETS,
  GROUT_PRESETS,
  OFFSET_OPTIONS,
} from '../types';
import type { TileOrientation, OffsetPattern } from '../types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-1">{title}</h3>
      {children}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min = 1,
  max = 200,
  step = 0.5,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-1 mt-0.5">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <span className="text-xs text-slate-400 shrink-0">in</span>
      </div>
    </label>
  );
}

function PresetSelect<T extends { width?: number; height?: number; depth?: number; size?: number }>({
  presets,
  selectedId,
  onSelect,
  customLabel,
}: {
  presets: { id: string; label: string; value: T }[];
  selectedId: string | null;
  onSelect: (id: string | null, value?: T) => void;
  customLabel?: string;
}) {
  return (
    <select
      value={selectedId ?? 'custom'}
      onChange={(e) => {
        const id = e.target.value;
        if (id === 'custom') {
          onSelect(null);
        } else {
          const preset = presets.find((p) => p.id === id);
          if (preset) onSelect(preset.id, preset.value);
        }
      }}
      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {presets.map((p) => (
        <option key={p.id} value={p.id}>{p.label}</option>
      ))}
      <option value="custom">{customLabel ?? 'Custom'}</option>
    </select>
  );
}

export function Controls() {
  const shower = useLayoutStore((s) => s.shower);
  const tile = useLayoutStore((s) => s.tile);
  const grout = useLayoutStore((s) => s.grout);
  const layout = useLayoutStore((s) => s.layout);
  const setShower = useLayoutStore((s) => s.setShower);
  const setTile = useLayoutStore((s) => s.setTile);
  const setGrout = useLayoutStore((s) => s.setGrout);
  const setLayout = useLayoutStore((s) => s.setLayout);

  return (
    <div className="space-y-5 overflow-y-auto max-h-full pr-1">
      <Section title="Shower Size">
        <PresetSelect
          presets={SHOWER_PRESETS}
          selectedId={shower.presetId}
          onSelect={(id, value) => {
            if (id && value) {
              setShower({ presetId: id, width: value.width!, depth: value.depth!, height: value.height! });
            } else {
              setShower({ presetId: null });
            }
          }}
          customLabel="Custom dimensions"
        />
        <div className="grid grid-cols-3 gap-2">
          <NumberInput label="Width (back)" value={shower.width} onChange={(v) => setShower({ width: v, presetId: null })} />
          <NumberInput label="Depth" value={shower.depth} onChange={(v) => setShower({ depth: v, presetId: null })} />
          <NumberInput label="Height" value={shower.height} onChange={(v) => setShower({ height: v, presetId: null })} />
        </div>
      </Section>

      <Section title="Tile Size">
        <PresetSelect
          presets={TILE_PRESETS}
          selectedId={tile.presetId}
          onSelect={(id, value) => {
            if (id && value) {
              setTile({ presetId: id, width: value.width!, height: value.height! });
            } else {
              setTile({ presetId: null });
            }
          }}
          customLabel="Custom tile"
        />
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="Width" value={tile.width} min={0.5} step={0.25} onChange={(v) => setTile({ width: v, presetId: null })} />
          <NumberInput label="Height" value={tile.height} min={0.5} step={0.25} onChange={(v) => setTile({ height: v, presetId: null })} />
        </div>
      </Section>

      <Section title="Grout Joint">
        <PresetSelect
          presets={GROUT_PRESETS}
          selectedId={grout.presetId}
          onSelect={(id, value) => {
            if (id && value) {
              setGrout({ presetId: id, size: value.size! });
            } else {
              setGrout({ presetId: null });
            }
          }}
          customLabel="Custom grout"
        />
        <NumberInput label="Grout width" value={grout.size} min={0.0625} max={0.5} step={0.0625} onChange={(v) => setGrout({ size: v, presetId: null })} />
      </Section>

      <Section title="Layout Pattern">
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-slate-500">Orientation</span>
            <select
              value={layout.orientation}
              onChange={(e) => setLayout({ orientation: e.target.value as TileOrientation })}
              className="w-full mt-0.5 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-slate-500">Row Offset</span>
            <select
              value={layout.offsetPattern}
              onChange={(e) => setLayout({ offsetPattern: e.target.value as OffsetPattern })}
              className="w-full mt-0.5 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OFFSET_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        <NumberInput
          label="Min cut size (sliver threshold)"
          value={layout.minCutSize}
          min={0.5}
          max={6}
          step={0.25}
          onChange={(v) => setLayout({ minCutSize: v })}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="auto-optimize"
            checked={layout.manualStartOffsetX === null}
            onChange={(e) => {
              if (e.target.checked) {
                setLayout({ manualStartOffsetX: null, manualStartOffsetY: null });
              } else {
                setLayout({ manualStartOffsetX: 0, manualStartOffsetY: 0 });
              }
            }}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="auto-optimize" className="text-sm text-slate-600">
            Auto-optimize start position
          </label>
        </div>

        {layout.manualStartOffsetX !== null && (
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Start offset X"
              value={layout.manualStartOffsetX}
              min={0}
              step={0.125}
              onChange={(v) => setLayout({ manualStartOffsetX: v })}
            />
            <NumberInput
              label="Start offset Y"
              value={layout.manualStartOffsetY ?? 0}
              min={0}
              step={0.125}
              onChange={(v) => setLayout({ manualStartOffsetY: v })}
            />
          </div>
        )}
      </Section>
    </div>
  );
}
