import { motion } from 'framer-motion';
import { BSTNode, bstToArray, bstEdges } from '@/lib/dsOperations';

interface Props {
  root: BSTNode | null;
  highlighted: string[];
}

export default function BSTVisualizer({ root, highlighted }: Props) {
  if (!root) return <div className="p-6 text-muted-foreground text-sm text-center min-h-[200px] flex items-center justify-center">Empty BST — insert values to begin</div>;

  const nodes = bstToArray(root);
  const edges = bstEdges(root);
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <div className="p-4 min-h-[300px] overflow-auto">
      <svg width="600" height={Math.max(250, nodes.length * 30)} className="mx-auto">
        {edges.map(e => {
          const from = nodeMap[e.from];
          const to = nodeMap[e.to];
          if (!from || !to) return null;
          return (
            <motion.line
              key={`${e.from}-${e.to}`}
              x1={from.x} y1={from.y + 18} x2={to.x} y2={to.y - 18}
              stroke="hsl(var(--border))" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            />
          );
        })}
        {nodes.map(node => {
          const isActive = highlighted.includes(node.id);
          return (
            <motion.g key={node.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
              <circle
                cx={node.x} cy={node.y} r="20"
                fill={isActive ? 'hsl(var(--accent))' : 'hsl(var(--card))'}
                stroke={isActive ? 'hsl(var(--accent))' : 'hsl(var(--primary) / 0.3)'}
                strokeWidth="2"
                className="transition-colors duration-300"
              />
              <text
                x={node.x} y={node.y + 5}
                textAnchor="middle"
                className="text-xs font-mono font-semibold"
                fill={isActive ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))'}
              >
                {node.value}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
