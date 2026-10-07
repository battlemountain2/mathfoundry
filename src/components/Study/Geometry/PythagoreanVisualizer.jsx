import React, { useState } from 'react';

/**
 * PythagoreanVisualizer.jsx
 *
 * Interactive Right Triangle and Square-Tile Area Proof Visualizer for Unit 2.
 * Demonstrates physically that the area of the squares on the legs (a² + b²)
 * exactly equals the area of the square on the hypotenuse (c²).
 */
export default function PythagoreanVisualizer({
  initialA = 3,
  initialB = 4,
  embedded = false,
}) {
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  const [isPacked, setIsPacked] = useState(false);

  const cSquared = a * a + b * b;
  const c = Math.sqrt(cSquared);
  const isPerfectSquare = Number.isInteger(c);

  const handlePreset = (presetA, presetB) => {
    setA(presetA);
    setB(presetB);
    setIsPacked(false);
  };

  // Dimensions for SVG canvas
  // Scale factor to fit inside SVG view
  const scale = 22; // pixels per unit
  const svgWidth = 460;
  const svgHeight = 360;

  // Triangle right-angle vertex at (ox, oy)
  const ox = 150;
  const oy = 210;

  // Vertex 1: (ox, oy) - Right angle
  // Vertex 2: (ox + b * scale, oy) - End of leg b (horizontal base)
  // Vertex 3: (ox, oy - a * scale) - End of leg a (vertical height)
  // Let leg b be horizontal, leg a be vertical
  const ax = ox;
  const ay = oy - a * scale;
  const bx = ox + b * scale;
  const by = oy;

  return (
    <div
      className={`pythagorean-visualizer rounded-2xl border border-[var(--line)] bg-[var(--surface)] ${
        embedded ? 'p-4' : 'p-6'
      } space-y-5`}
      data-testid="pythagorean-visualizer"
    >
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-xs uppercase text-[var(--accent)] font-semibold tracking-wider">
            Geometric Area Proof
          </span>
          <h3 className="text-lg font-bold text-[var(--ink)]">
            Pythagorean Square-Tile Proof Visualizer
          </h3>
        </div>

        {/* Live Equation Badge */}
        <div className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] font-mono text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
          <span className="text-[var(--accent)]">a² ({a * a})</span>
          <span>+</span>
          <span className="text-[var(--good)]">b² ({b * b})</span>
          <span>=</span>
          <span className="text-[var(--heat)]">
            c² ({cSquared}) {isPerfectSquare ? `(c = ${c})` : `(c ≈ ${c.toFixed(2)})`}
          </span>
        </div>
      </div>

      {/* Preset Buttons & Pack Tiles Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--ink-3)] font-mono mr-1">Triplets:</span>
          {[
            { a: 3, b: 4, label: '3-4-5' },
            { a: 6, b: 8, label: '6-8-10' },
            { a: 5, b: 12, label: '5-12-13 (scaled)' },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => handlePreset(t.a === 5 ? 3 : t.a, t.b === 12 ? 4 : t.b)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all ${
                a === (t.a === 5 ? 3 : t.a) && b === (t.b === 12 ? 4 : t.b)
                  ? 'bg-[var(--accent)] text-[var(--surface)] border-[var(--accent)]'
                  : 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:bg-[var(--line)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsPacked(!isPacked)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            isPacked
              ? 'bg-[var(--good)] text-[var(--surface)] border-[var(--good)]'
              : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--surface)]'
          }`}
        >
          <span>{isPacked ? '✓' : '📦'}</span>
          <span>{isPacked ? 'Tiles Packed in c²' : 'Verify Tile Packing'}</span>
        </button>
      </div>

      {/* SVG Canvas */}
      <div className="relative border border-[var(--line)] rounded-xl bg-[var(--ground)] p-3 overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-md h-auto select-none"
          style={{ maxHeight: '320px' }}
        >
          {/* Square on Leg a (Left of vertical leg) */}
          <rect
            x={ox - a * scale}
            y={oy - a * scale}
            width={a * scale}
            height={a * scale}
            fill={isPacked ? 'var(--accent-soft)' : 'rgba(99, 102, 241, 0.25)'}
            stroke="var(--accent)"
            strokeWidth="2"
            strokeDasharray={isPacked ? '4,4' : 'none'}
          />
          <text
            x={ox - (a * scale) / 2}
            y={oy - (a * scale) / 2 + 4}
            fill="var(--accent)"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            a² = {a * a}
          </text>

          {/* Square on Leg b (Below horizontal leg) */}
          <rect
            x={ox}
            y={oy}
            width={b * scale}
            height={b * scale}
            fill={isPacked ? 'var(--good-soft)' : 'rgba(16, 185, 129, 0.25)'}
            stroke="var(--good)"
            strokeWidth="2"
            strokeDasharray={isPacked ? '4,4' : 'none'}
          />
          <text
            x={ox + (b * scale) / 2}
            y={oy + (b * scale) / 2 + 4}
            fill="var(--good)"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            b² = {b * b}
          </text>

          {/* Right Triangle itself */}
          <polygon
            points={`${ox},${oy} ${bx},${by} ${ax},${ay}`}
            fill="var(--surface-2)"
            stroke="var(--ink)"
            strokeWidth="2.5"
          />

          {/* Right Angle Marker (square at vertex ox, oy) */}
          <polyline
            points={`${ox + 10},${oy} ${ox + 10},${oy - 10} ${ox},${oy - 10}`}
            fill="none"
            stroke="var(--ink-2)"
            strokeWidth="1.5"
          />

          {/* Leg labels on the triangle edges */}
          <text
            x={ox + 6}
            y={oy - (a * scale) / 2}
            fill="var(--ink)"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            a = {a}
          </text>
          <text
            x={ox + (b * scale) / 2}
            y={oy - 8}
            fill="var(--ink)"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            b = {b}
          </text>

          {/* Hypotenuse edge label */}
          <text
            x={(ax + bx) / 2 + 10}
            y={(ay + by) / 2 - 8}
            fill="var(--heat)"
            fontSize="13"
            fontFamily="monospace"
            fontWeight="bold"
          >
            c = {isPerfectSquare ? c : c.toFixed(2)}
          </text>

          {/* Hypotenuse Square (Rotated along hypotenuse) */}
          {/* Vector from (ax, ay) to (bx, by) is (b*scale, a*scale) */}
          {/* Normal vector pointing outwards is (-a*scale, b*scale) */}
          {(() => {
            const hx = bx - ax; // b * scale
            const hy = by - ay; // a * scale
            // Outward normal:
            const nx = -hy;
            const ny = hx;
            const p1 = `${ax},${ay}`;
            const p2 = `${bx},${by}`;
            const p3 = `${bx + nx},${by + ny}`;
            const p4 = `${ax + nx},${ay + ny}`;

            return (
              <g>
                <polygon
                  points={`${p1} ${p2} ${p3} ${p4}`}
                  fill={isPacked ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.12)'}
                  stroke="var(--heat)"
                  strokeWidth="2.5"
                />
                <text
                  x={(ax + bx + nx) / 2}
                  y={(ay + by + ny) / 2 + 4}
                  fill="var(--heat)"
                  fontSize="13"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {isPacked ? `Packed: ${a * a} + ${b * b} = ${cSquared}` : `c² = ${cSquared}`}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Interactive Controls for Leg a and Leg b */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[var(--ink-2)]">
            <label htmlFor="leg-a-slider" className="font-semibold">
              Vertical Leg (a): <span className="text-[var(--accent)] font-mono font-bold">{a}</span>
            </label>
            <span className="font-mono text-[var(--ink-3)]">a² = {a * a} tiles</span>
          </div>
          <input
            id="leg-a-slider"
            type="range"
            min="2"
            max="6"
            value={a}
            onChange={(e) => {
              setA(Number(e.target.value));
              setIsPacked(false);
            }}
            className="w-full accent-[var(--accent)] cursor-pointer"
            aria-label="Vertical leg a length"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[var(--ink-2)]">
            <label htmlFor="leg-b-slider" className="font-semibold">
              Horizontal Leg (b): <span className="text-[var(--good)] font-mono font-bold">{b}</span>
            </label>
            <span className="font-mono text-[var(--ink-3)]">b² = {b * b} tiles</span>
          </div>
          <input
            id="leg-b-slider"
            type="range"
            min="2"
            max="6"
            value={b}
            onChange={(e) => {
              setB(Number(e.target.value));
              setIsPacked(false);
            }}
            className="w-full accent-[var(--good)] cursor-pointer"
            aria-label="Horizontal leg b length"
          />
        </div>
      </div>

      {/* Engineering Insight Callout */}
      <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] leading-relaxed">
        <p>
          🏗️ <strong className="font-bold">Engineering Foundation:</strong> The Pythagorean theorem isn't just an abstract algebra formula—it is the physical geometric conservation of area:
          <span className="font-mono font-bold mx-1 text-[var(--heat)]">Area(a²) + Area(b²) ≡ Area(c²)</span>.
          In mechanical and civil engineering, this provides the foundation for Cartesian distance <span className="font-mono font-bold">d = √(Δx² + Δy²)</span>, 3D stress tensors, and vector resultant forces.
        </p>
      </div>
    </div>
  );
}
