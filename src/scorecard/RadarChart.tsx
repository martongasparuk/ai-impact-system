// Radar chart — pure SVG, 6 axes, scale 0-4.
// No dependencies. Renders in any modern browser.

import { pillarOrder, type Pillar } from './questions';

type Props = {
  scores: Record<Pillar, number>;
  strongestPillars?: Pillar[];
  weakestPillars?: Pillar[];
  size?: number;
};

const MAX = 4;
const LEVELS = 4; // 4 rings representing 1, 2, 3, 4
const START_ANGLE = -Math.PI / 2; // top

function polarToCartesian(
  radius: number,
  angleRad: number,
  cx = 0,
  cy = 0,
): [number, number] {
  return [cx + radius * Math.cos(angleRad), cy + radius * Math.sin(angleRad)];
}

export default function RadarChart({
  scores,
  strongestPillars = [],
  weakestPillars = [],
  size = 340,
}: Props) {
  const viewBoxPad = 70; // room for labels
  const radius = (size - viewBoxPad * 2) / 2;
  const cx = 0;
  const cy = 0;

  const anglePer = (2 * Math.PI) / pillarOrder.length;

  // Grid polygons (one per level)
  const gridPolygons: string[] = [];
  for (let l = 1; l <= LEVELS; l++) {
    const r = (radius * l) / LEVELS;
    const pts = pillarOrder.map((_, i) => {
      const [x, y] = polarToCartesian(r, START_ANGLE + i * anglePer);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    gridPolygons.push(pts.join(' '));
  }

  // Axis lines
  const axisLines = pillarOrder.map((_, i) => {
    const [x, y] = polarToCartesian(radius, START_ANGLE + i * anglePer);
    return { x1: cx, y1: cy, x2: x, y2: y };
  });

  // Data polygon
  const dataPoints = pillarOrder.map((p, i) => {
    const score = Math.max(0, Math.min(MAX, scores[p] ?? 0));
    const r = (radius * score) / MAX;
    const [x, y] = polarToCartesian(r, START_ANGLE + i * anglePer);
    return { x, y, score, pillar: p };
  });
  const dataPath = dataPoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(2)},${pt.y.toFixed(2)}`)
    .join(' ') + ' Z';

  // Labels
  const labels = pillarOrder.map((p, i) => {
    const [x, y] = polarToCartesian(radius + 24, START_ANGLE + i * anglePer);
    return { x, y, pillar: p };
  });

  const view = -size / 2;
  const strong = new Set(strongestPillars);
  const weak = new Set(weakestPillars);

  return (
    <svg
      viewBox={`${view} ${view} ${size} ${size}`}
      width={size}
      height={size}
      aria-label="AI Impact pillar scores radar chart"
      role="img"
    >
      {/* Grid polygons */}
      {gridPolygons.map((pts, i) => (
        <polygon
          key={`grid-${i}`}
          points={pts}
          fill="none"
          stroke="#232336"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((l, i) => (
        <line
          key={`axis-${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#232336"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon — filled indigo */}
      <path
        d={dataPath}
        fill="#6366f1"
        fillOpacity="0.28"
        stroke="#818cf8"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((pt, i) => {
        const isStrong = strong.has(pt.pillar);
        const isWeak = weak.has(pt.pillar);
        const color = isStrong ? '#22d3ee' : isWeak ? '#f87171' : '#818cf8';
        return (
          <circle
            key={`pt-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={6}
            fill={color}
            stroke="#0a0a12"
            strokeWidth="2"
          />
        );
      })}

      {/* Labels with score */}
      {labels.map((l, i) => {
        const score = dataPoints[i].score;
        const isStrong = strong.has(l.pillar);
        const isWeak = weak.has(l.pillar);
        const anchor =
          l.x > 2 ? 'start' : l.x < -2 ? 'end' : 'middle';
        return (
          <g key={`label-${i}`}>
            <text
              x={l.x}
              y={l.y - 4}
              fontSize="13"
              fontWeight="700"
              textAnchor={anchor}
              fill={isStrong ? '#22d3ee' : isWeak ? '#f87171' : '#ffffff'}
              style={{ fontFamily: 'Inter Variable, Inter, sans-serif' }}
            >
              {l.pillar}
            </text>
            <text
              x={l.x}
              y={l.y + 12}
              fontSize="11"
              fontWeight="500"
              textAnchor={anchor}
              fill="#6b6f76"
              style={{ fontFamily: 'Inter Variable, Inter, sans-serif' }}
            >
              {score.toFixed(1)} / 4
            </text>
          </g>
        );
      })}
    </svg>
  );
}
