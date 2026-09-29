import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const INITIAL = [35, 65, 20, 80, 45, 55, 30, 70, 25, 60, 40, 50];

export default function SortingAnimation() {
  const [bars, setBars] = useState(INITIAL);
  const [active, setActive] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const mounted = useRef(true);

  const runSort = useCallback(() => {
    const arr = [...INITIAL];
    setBars([...arr]);
    setActive([]);
    setSorted([]);

    const steps: { arr: number[]; active: number[]; sorted: number[] }[] = [];
    const a = [...arr];
    const s: number[] = [];
    for (let i = 0; i < a.length - 1; i++) {
      for (let j = 0; j < a.length - 1 - i; j++) {
        if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ arr: [...a], active: [j, j + 1], sorted: [...s] });
      }
      s.push(a.length - 1 - i);
    }
    s.push(0);
    steps.push({ arr: [...a], active: [], sorted: [...s] });

    const timers: number[] = [];
    steps.forEach((step, idx) => {
      timers.push(window.setTimeout(() => {
        if (!mounted.current) return;
        setBars(step.arr);
        setActive(step.active);
        setSorted(step.sorted);
        if (idx === steps.length - 1) {
          timers.push(window.setTimeout(() => { if (mounted.current) runSort(); }, 2500));
        }
      }, idx * 120));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    mounted.current = true;
    const cleanup = runSort();
    return () => { mounted.current = false; cleanup?.(); };
  }, [runSort]);

  return (
    <div className="flex items-end gap-[3px] h-32">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className={`w-2.5 rounded-t-sm transition-colors duration-200 ${
            active.includes(i) ? 'bg-primary shadow-sm shadow-primary/40'
            : sorted.includes(i) ? 'bg-accent/60'
            : 'bg-primary/20'
          }`}
          animate={{ height: `${height}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      ))}
    </div>
  );
}
