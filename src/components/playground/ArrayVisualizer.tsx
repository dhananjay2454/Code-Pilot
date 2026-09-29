import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: number[];
  highlighted: string[];
}

export default function ArrayVisualizer({ data, highlighted }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-2 p-6 justify-center min-h-[200px]">
      <AnimatePresence mode="popLayout">
        {data.map((val, i) => {
          const isActive = highlighted.includes(i.toString());
          return (
            <motion.div
              key={`${i}-${val}`}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`flex flex-col items-center gap-1`}
            >
              <div
                className={`w-14 h-14 rounded-lg flex items-center justify-center text-sm font-mono font-semibold transition-colors duration-300 ${
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/30'
                    : 'bg-primary/10 text-foreground border border-border'
                }`}
              >
                {val}
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{i}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {data.length === 0 && (
        <div className="text-muted-foreground text-sm">Empty array — insert elements to begin</div>
      )}
    </div>
  );
}
