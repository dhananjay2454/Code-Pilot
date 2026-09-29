import { motion, AnimatePresence } from 'framer-motion';
import { LLNode } from '@/lib/dsOperations';

interface Props {
  data: LLNode[];
  highlighted: string[];
}

export default function LinkedListVisualizer({ data, highlighted }: Props) {
  return (
    <div className="flex items-center gap-0 p-6 min-h-[200px] justify-center overflow-x-auto">
      <AnimatePresence mode="popLayout">
        {data.map((node, i) => {
          const isActive = highlighted.includes(node.id);
          return (
            <motion.div
              key={node.id}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-mono font-semibold border-2 transition-colors duration-300 ${
                  isActive
                    ? 'bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/30'
                    : 'bg-card text-foreground border-primary/30'
                }`}
              >
                {node.value}
              </div>
              {i < data.length - 1 && (
                <svg width="32" height="20" className="flex-shrink-0">
                  <line x1="2" y1="10" x2="22" y2="10" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
                  <polygon points="22,6 30,10 22,14" fill="hsl(var(--muted-foreground))" />
                </svg>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {data.length === 0 && (
        <div className="text-muted-foreground text-sm">Empty list</div>
      )}
    </div>
  );
}
