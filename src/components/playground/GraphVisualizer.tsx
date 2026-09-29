import { motion } from 'framer-motion';
import { GraphData } from '@/lib/dsOperations';
import { useMemo } from 'react';

interface Props {
  data: GraphData;
  highlighted: string[];
}

export default function GraphVisualizer({ data, highlighted }: Props) {
  const positions = useMemo(() => {
    const cx = 200, cy = 160, r = 110;
    const n = data.vertices.length;
    return Object.fromEntries(
      data.vertices.map((v, i) => [
        v.id,
        {
          x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
          y: cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
        },
      ])
    );
  }, [data.vertices]);

  return (
    <div className="p-4 min-h-[300px] flex items-center justify-center">
      <svg width="400" height="340">
        {data.edges.map((edge, i) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to) return null;
          return (
            <motion.line
              key={i}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="hsl(var(--border))" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            />
          );
        })}
        {data.vertices.map(v => {
          const pos = positions[v.id];
          if (!pos) return null;
          const isActive = highlighted.includes(v.id);
          return (
            <motion.g key={v.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
              <circle
                cx={pos.x} cy={pos.y} r="22"
                fill={isActive ? 'hsl(var(--accent))' : 'hsl(var(--card))'}
                stroke={isActive ? 'hsl(var(--accent))' : 'hsl(var(--primary) / 0.3)'}
                strokeWidth="2"
                className="transition-colors duration-300"
              />
              <text
                x={pos.x} y={pos.y + 5}
                textAnchor="middle"
                className="text-xs font-mono font-semibold"
                fill={isActive ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))'}
              >
                {v.value}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
