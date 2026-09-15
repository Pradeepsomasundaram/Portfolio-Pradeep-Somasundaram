import { useId } from 'react';

interface SkillNode {
  name: string;
  level: number;
  color: string;
}

interface NeuralSkillsNetworkProps {
  skills: SkillNode[];
}

/**
 * Renders skill proficiencies as a live "neural network": a central AI core
 * node fans out to one node per skill, edge thickness/opacity encodes
 * proficiency, and a pulse travels each edge on a loop — the site's
 * clearest visual statement that this is an ML-themed portfolio.
 */
export const NeuralSkillsNetwork = ({ skills }: NeuralSkillsNetworkProps) => {
  const uid = useId().replace(/[:]/g, '');
  const width = 900;
  const height = Math.max(420, skills.length * 62);
  const hub = { x: 110, y: height / 2 };
  const nodeX = width - 240;
  const step = (height - 80) / Math.max(skills.length - 1, 1);

  const nodes = skills.map((skill, i) => ({
    ...skill,
    x: nodeX,
    y: 40 + i * step,
  }));

  const pathFor = (n: { x: number; y: number }) => {
    const midX = (hub.x + n.x) / 2;
    return `M ${hub.x},${hub.y} Q ${midX},${hub.y} ${midX},${(hub.y + n.y) / 2} T ${n.x},${n.y}`;
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="Neural network diagram of core skill proficiencies"
    >
      <defs>
        <filter id={`glow-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`hub-${uid}`}>
          <stop offset="0%" stopColor="#0EA57A" />
          <stop offset="100%" stopColor="#C9A227" />
        </radialGradient>
      </defs>

      {/* Edges */}
      {nodes.map((n, i) => (
        <path
          key={`edge-${n.name}`}
          id={`${uid}-path-${i}`}
          d={pathFor(n)}
          fill="none"
          stroke={n.color}
          strokeWidth={1 + (n.level / 100) * 3}
          opacity={0.25 + (n.level / 100) * 0.35}
        />
      ))}

      {/* Traveling pulses */}
      {nodes.map((n, i) => (
        <circle key={`pulse-${n.name}`} r={3.5} fill="white" opacity={0.9}>
          <animateMotion
            dur={`${2.4 + (i % 4) * 0.5}s`}
            begin={`${i * 0.25}s`}
            repeatCount="indefinite"
          >
            <mpath href={`#${uid}-path-${i}`} />
          </animateMotion>
        </circle>
      ))}

      {/* AI core hub */}
      <circle cx={hub.x} cy={hub.y} r={30} fill={`url(#hub-${uid})`} filter={`url(#glow-${uid})`}>
        <animate attributeName="r" values="28;33;28" dur="3s" repeatCount="indefinite" />
      </circle>
      <text
        x={hub.x}
        y={hub.y + 5}
        textAnchor="middle"
        fontSize="13"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="600"
        fill="white"
      >
        AI
      </text>

      {/* Skill nodes + labels */}
      {nodes.map((n) => (
        <g key={n.name}>
          <circle
            cx={n.x}
            cy={n.y}
            r={6 + (n.level / 100) * 10}
            fill={n.color}
            filter={`url(#glow-${uid})`}
          />
          <text
            x={n.x + 24}
            y={n.y - 4}
            fontSize="15"
            fontFamily="Space Grotesk, sans-serif"
            fontWeight="600"
            fill="currentColor"
            className="text-gray-800 dark:text-white"
          >
            {n.name}
          </text>
          <text
            x={n.x + 24}
            y={n.y + 14}
            fontSize="12"
            fontFamily="JetBrains Mono, monospace"
            fill={n.color}
          >
            {n.level}%
          </text>
        </g>
      ))}
    </svg>
  );
};
