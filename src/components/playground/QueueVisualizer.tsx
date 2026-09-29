import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: number[];
  highlighted: string[];
}

export default function QueueVisualizer({ data, highlighted }: Props) {
  return (
    <div className="flex items-center gap-2 p-6 min-h-[200px] justify-center overflow-x-auto">
      {data.length > 0 && (
        <span className="text-[10px] text-muted-foreground font-mono mr-1">front →</span>
      )}
      <AnimatePresence mode="popLayout">
        {data.map((val, i) => {
          const isActive = highlighted.includes(i.toString());
          return (
            <motion.div
              key={`${i}-${val}`}
              layout
              initial={{ opacity: 0, scale: 0.5, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -30 }}
              className={`w-14 h-14 rounded-lg flex items-center justify-center text-sm font-mono font-semibold border transition-colors duration-300 ${
                isActive
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/30 border-accent'
                  : 'bg-card text-foreground border-border'
              }`}
            >
              {val}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {data.length > 0 && (
        <span className="text-[10px] text-muted-foreground font-mono ml-1">← rear</span>
      )}
      {data.length === 0 && (
        <div className="text-muted-foreground text-sm">Empty queue</div>
      )}
    </div>
  );
}
