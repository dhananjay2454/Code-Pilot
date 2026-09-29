import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: number[];
  highlighted: string[];
}

export default function StackVisualizer({ data, highlighted }: Props) {
  return (
    <div className="flex flex-col-reverse items-center gap-1.5 p-6 min-h-[200px] justify-start">
      <div className="w-24 h-1 bg-border rounded-full" />
      <AnimatePresence mode="popLayout">
        {data.map((val, i) => {
          const isTop = i === data.length - 1;
          const isActive = highlighted.includes(i.toString());
          return (
            <motion.div
              key={`${i}-${val}`}
              layout
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`w-24 h-12 rounded-lg flex items-center justify-center text-sm font-mono font-semibold border transition-colors duration-300 ${
                isActive
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/30 border-accent'
                  : isTop
                  ? 'bg-primary/15 text-foreground border-primary/30'
                  : 'bg-card text-foreground border-border'
              }`}
            >
              {val}
              {isTop && <span className="ml-2 text-[10px] text-muted-foreground">← top</span>}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {data.length === 0 && (
        <div className="text-muted-foreground text-sm mt-4">Empty stack</div>
      )}
    </div>
  );
}
