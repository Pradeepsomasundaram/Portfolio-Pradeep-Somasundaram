import { useId } from 'react';

interface CareerPathItem {
  id: string;
  role: string;
  company: string;
  dateRange: string;
  featured?: boolean;
}

interface CareerPathProps {
  items: CareerPathItem[];
}

function startYear(dateRange: string): number {
  const match = dateRange.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * "A journey through time" — the career history as a rising mountain-path
 * graph instead of a plain vertical list, with each role plotted by year
 * and climbing toward the present. A compact visual overview that sits
 * above the detailed role cards.
 */
export const CareerPath = ({ items }: CareerPathProps) => {
  const uid = useId().replace(/[:]/g, '');
  const chronological = [...items].reverse(); // oldest first, rising to present
  const width = 900;
  const height = 320;
  const marginX = 60;
  const baseline = height - 50;
  const peak = 70;
  const step = (width - marginX * 2) / Math.max(chronological.length - 1, 1);

  const points = chronological.map((item, i) => {
    const x = marginX + i * step;
    const progress = i / Math.max(chronological.length - 1, 1);
    const wobble = i % 2 === 0 ? 10 : -10;
    const y = baseline - progress * (baseline - peak) + (i === chronological.length - 1 ? 0 : wobble);
    return { ...item, x, y, year: startYear(item.dateRange) };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `Q ${points[i - 1].x + step / 2},${points[i - 1].y} ${p.x},${p.y}`))
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="Career timeline rising from earliest role to present"
    >
      <defs>
        <linearGradient id={`path-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0EA57A" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <line x1={marginX} y1={baseline} x2={width - marginX} y2={baseline} stroke="currentColor" strokeOpacity={0.1} />

      <path
        id={`${uid}-line`}
        d={linePath}
        fill="none"
        stroke={`url(#path-grad-${uid})`}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      <circle r={4} fill="white">
        <animateMotion dur="6s" repeatCount="indefinite">
          <mpath href={`#${uid}-line`} />
        </animateMotion>
      </circle>

      {points.map((p, i) => (
        <g key={p.id}>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.featured ? 9 : 6}
            fill={p.featured ? '#C9A227' : '#0EA57A'}
            filter={p.featured ? `url(#glow-${uid})` : undefined}
          />
          {p.featured && (
            <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="#C9A227" strokeOpacity={0.5}>
              <animate attributeName="r" values="9;18;9" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
            </circle>
          )}
          <text
            x={p.x}
            y={i % 2 === 0 ? p.y - 42 : p.y + 48}
            textAnchor="middle"
            fontSize="13"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="700"
            fill="currentColor"
            className="text-gray-800 dark:text-white"
          >
            {p.year}
          </text>
          <text
            x={p.x}
            y={i % 2 === 0 ? p.y - 26 : p.y + 64}
            textAnchor="middle"
            fontSize="10.5"
            fontFamily="Space Grotesk, sans-serif"
            fontWeight="600"
            fill={p.featured ? '#C9A227' : '#0EA57A'}
          >
            {p.company.length > 18 ? p.company.slice(0, 16) + '…' : p.company}
          </text>
        </g>
      ))}
    </svg>
  );
};
