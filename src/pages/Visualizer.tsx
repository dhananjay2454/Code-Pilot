import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, ArrowRight,
  Timer, Ruler, Search, BarChart3, GitBranch, Info, Eye, Zap, Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Navbar from '@/components/Navbar';
import {
  AlgorithmStep, GraphAlgoStep, SimpleGraph,
  bubbleSortSteps, insertionSortSteps, mergeSortSteps, quickSortSteps,
  linearSearchSteps, binarySearchSteps,
  bfsSteps, dfsSteps, buildSampleGraph,
  PSEUDOCODE, COMPLEXITY,
} from '@/lib/algorithms';

type AlgoCategory = 'sorting' | 'searching' | 'graph';
type AlgoName = string;

const ALGORITHMS: Record<AlgoCategory, { name: string; label: string }[]> = {
  sorting: [
    { name: 'Bubble Sort', label: 'Bubble' },
    { name: 'Insertion Sort', label: 'Insertion' },
    { name: 'Merge Sort', label: 'Merge' },
    { name: 'Quick Sort', label: 'Quick' },
  ],
  searching: [
    { name: 'Linear Search', label: 'Linear' },
    { name: 'Binary Search', label: 'Binary' },
  ],
  graph: [
    { name: 'BFS', label: 'BFS' },
    { name: 'DFS', label: 'DFS' },
  ],
};

const CATEGORY_ICONS: Record<AlgoCategory, typeof BarChart3> = {
  sorting: BarChart3,
  searching: Search,
  graph: GitBranch,
};

const COLOR_LEGEND = [
  { color: 'bg-sky-500', label: 'Comparing' },
  { color: 'bg-rose-500', label: 'Swapping' },
  { color: 'bg-emerald-500', label: 'Sorted / Found' },
  { color: 'bg-amber-500', label: 'Pivot / Searching' },
  { color: 'bg-violet-500', label: 'Visited (Graph)' },
  { color: 'bg-muted', label: 'Default' },
];

// Graph layout positions
const GRAPH_POSITIONS: Record<string, { x: number; y: number }> = {
  A: { x: 200, y: 40 }, B: { x: 100, y: 130 }, C: { x: 300, y: 130 },
  D: { x: 60, y: 230 }, E: { x: 340, y: 230 }, F: { x: 200, y: 310 },
};

function generateArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

export default function Visualizer() {
  const [category, setCategory] = useState<AlgoCategory>('sorting');
  const [algo, setAlgo] = useState<AlgoName>('Bubble Sort');
  const [arraySize, setArraySize] = useState(15);
  const [speed, setSpeed] = useState(300);
  const [searchTarget, setSearchTarget] = useState('');
  const [customInput, setCustomInput] = useState('');

  // Steps state
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [graphSteps, setGraphSteps] = useState<GraphAlgoStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceArray, setSourceArray] = useState<number[]>(() => generateArray(15));
  const [graph] = useState<SimpleGraph>(() => buildSampleGraph());

  const speedRef = useRef(speed);
  speedRef.current = speed;
  const playingRef = useRef(false);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const graphStepsRef = useRef(graphSteps);
  graphStepsRef.current = graphSteps;
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const isGraph = category === 'graph';
  const totalSteps = isGraph ? graphSteps.length : steps.length;
  const currentData = !isGraph && steps[currentStep] ? steps[currentStep] : null;
  const currentGraphData = isGraph && graphSteps[currentStep] ? graphSteps[currentStep] : null;
  const pseudocode = PSEUDOCODE[algo] || [];
  const complexity = COMPLEXITY[algo];
  const activeStep = isGraph ? currentGraphData : currentData;
  const activeLine = isGraph ? (currentGraphData?.currentLine ?? -1) : (currentData?.currentLine ?? -1);

  // Generate steps
  const generate = useCallback(() => {
    setIsPlaying(false);
    playingRef.current = false;
    setCurrentStep(0);

    const parseCustomArray = (): number[] | null => {
      if (!customInput.trim()) return null;
      const nums = customInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      return nums.length >= 2 ? nums : null;
    };

    if (category === 'sorting') {
      const arr = parseCustomArray() || generateArray(arraySize);
      setSourceArray(arr);
      let s: AlgorithmStep[] = [];
      if (algo === 'Bubble Sort') s = bubbleSortSteps(arr);
      else if (algo === 'Insertion Sort') s = insertionSortSteps(arr);
      else if (algo === 'Merge Sort') s = mergeSortSteps(arr);
      else if (algo === 'Quick Sort') s = quickSortSteps(arr);
      setSteps(s);
      setGraphSteps([]);
    } else if (category === 'searching') {
      const arr = parseCustomArray() || generateArray(arraySize);
      setSourceArray(arr);
      const target = parseInt(searchTarget) || arr[Math.floor(Math.random() * arr.length)];
      let s: AlgorithmStep[] = [];
      if (algo === 'Linear Search') s = linearSearchSteps(arr, target);
      else if (algo === 'Binary Search') s = binarySearchSteps(arr, target);
      setSteps(s);
      setGraphSteps([]);
    } else {
      const startNode = graph.nodes[0].id;
      let gs: GraphAlgoStep[] = [];
      if (algo === 'BFS') gs = bfsSteps(graph, startNode);
      else if (algo === 'DFS') gs = dfsSteps(graph, startNode);
      setGraphSteps(gs);
      setSteps([]);
    }
  }, [category, algo, arraySize, searchTarget, graph, customInput]);

  useEffect(() => { generate(); }, [generate]);

  // Playback
  const playAnimation = useCallback(async () => {
    playingRef.current = true;
    setIsPlaying(true);
    const total = isGraph ? graphStepsRef.current.length : stepsRef.current.length;
    let step = currentStepRef.current;
    while (step < total - 1 && playingRef.current) {
      step++;
      setCurrentStep(step);
      currentStepRef.current = step;
      await new Promise(r => setTimeout(r, speedRef.current));
    }
    playingRef.current = false;
    setIsPlaying(false);
  }, [isGraph]);

  const pause = () => { playingRef.current = false; setIsPlaying(false); };
  const stepForward = () => { if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1); };
  const stepBack = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const restart = () => { setCurrentStep(0); pause(); };

  const handleCategoryChange = (c: AlgoCategory) => {
    setCategory(c);
    setAlgo(ALGORITHMS[c][0].name);
  };

  // Get bar color
  const getBarColor = (idx: number, step: AlgorithmStep | null) => {
    if (!step) return 'bg-primary/40';
    if (step.found === idx) return 'bg-emerald-500';
    if (step.sorted?.includes(idx)) return 'bg-emerald-500/80';
    if (step.swapping?.includes(idx)) return 'bg-rose-500';
    if (step.pivot === idx) return 'bg-amber-500';
    if (step.searching === idx) return 'bg-amber-500';
    if (step.comparing?.includes(idx)) return 'bg-sky-500';
    return 'bg-primary/40';
  };

  const maxVal = currentData ? Math.max(...currentData.array, 1) : 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-3 sm:px-4 pb-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <Eye className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Algorithm Visualizer</h1>
                <p className="text-sm text-muted-foreground">Watch sorting, searching, and graph algorithms step by step</p>
              </div>
            </div>
          </motion.div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-4">
            {(Object.keys(ALGORITHMS) as AlgoCategory[]).map(c => {
              const Icon = CATEGORY_ICONS[c];
              return (
                <motion.div key={c} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant={category === c ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full gap-1.5 capitalize ${category === c ? 'shadow-md shadow-primary/20' : ''}`}
                    onClick={() => handleCategoryChange(c)}
                  >
                    <Icon className="w-3.5 h-3.5" /> {c}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Algorithm selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {ALGORITHMS[category].map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Button
                  variant={algo === a.name ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => { setAlgo(a.name); }}
                  className={`text-xs ${algo === a.name ? 'shadow-md shadow-primary/20' : 'hover:bg-secondary/80'}`}
                >
                  {a.label}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-4 sm:gap-6">
            {/* Main visualization area */}
            <div className="space-y-4">
              {/* Visualization canvas */}
              <div className="glass-card overflow-hidden">
                <div className="px-4 py-2 border-b border-border/50 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{algo}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {/* Real-time Time & Space Complexity (Right where user circled) */}
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono gap-1 bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 py-0.5 px-2 transition-all shadow-sm"
                      title={`Real-time Time Complexity: ${activeStep?.stepTime || 'O(1)'} per step (${activeStep?.operations ?? 0} total ops${activeStep?.comparisons !== undefined ? `, ${activeStep.comparisons} comparisons` : ''}${activeStep?.swaps !== undefined ? `, ${activeStep.swaps} swaps` : ''})`}
                    >
                      <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="text-muted-foreground font-normal">Time:</span>
                      <span className="font-semibold">{activeStep?.stepTime || 'O(1)'}</span>
                      {activeStep?.operations !== undefined && (
                        <span className="text-[9px] opacity-75 border-l border-amber-500/30 pl-1 ml-0.5 font-normal">
                          {activeStep.operations} ops
                        </span>
                      )}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono gap-1 bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 py-0.5 px-2 transition-all shadow-sm"
                      title={`Real-time Space Complexity: ${activeStep?.stepSpace || (complexity ? complexity.space : 'O(1)')} (${activeStep?.auxSpaceLabel || 'in-place'})`}
                    >
                      <Cpu className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground font-normal">Space:</span>
                      <span className="font-semibold">{activeStep?.stepSpace || (complexity ? complexity.space : 'O(1)')}</span>
                      {activeStep?.auxSpaceLabel && (
                        <span className="text-[9px] opacity-75 border-l border-emerald-500/30 pl-1 ml-0.5 max-w-[90px] sm:max-w-[130px] truncate font-normal" title={activeStep.auxSpaceLabel}>
                          {activeStep.auxSpaceLabel}
                        </span>
                      )}
                    </Badge>

                    {complexity && (
                      <Badge variant="outline" className="text-[10px] font-mono gap-1">
                        <Timer className="w-3 h-3" /> {complexity.time}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      Step {currentStep + 1}/{totalSteps || 1}
                    </Badge>
                  </div>
                </div>

                {/* Bar chart / Array visualization */}
                {!isGraph && currentData && (
                  <div className="p-4 flex items-end gap-[2px] justify-center" style={{ minHeight: 260 }}>
                    {currentData.array.map((val, i) => (
                      <motion.div
                        key={i}
                        className={`rounded-t-sm transition-colors duration-150 ${getBarColor(i, currentData)}`}
                        style={{ width: `${Math.max(100 / currentData.array.length - 1, 4)}%`, minWidth: 4 }}
                        initial={false}
                        animate={{ height: `${(val / maxVal) * 220}px` }}
                        transition={{ duration: 0.15 }}
                      >
                        {currentData.array.length <= 20 && (
                          <div className="text-[9px] text-center font-mono text-primary-foreground font-bold pt-1 truncate">
                            {val}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Graph visualization */}
                {isGraph && (
                  <div className="p-4" style={{ minHeight: 360 }}>
                    <svg viewBox="0 0 400 360" className="w-full max-w-md mx-auto">
                      {/* Edges */}
                      {graph.edges.map((e, i) => {
                        const from = GRAPH_POSITIONS[e.from];
                        const to = GRAPH_POSITIONS[e.to];
                        return (
                          <line
                            key={i}
                            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                            stroke="hsl(var(--border))" strokeWidth="2"
                          />
                        );
                      })}
                      {/* Nodes */}
                      {graph.nodes.map(n => {
                        const pos = GRAPH_POSITIONS[n.id];
                        const isVisited = currentGraphData?.visited.includes(n.id);
                        const isCurrent = currentGraphData?.current === n.id;
                        return (
                          <g key={n.id}>
                            <motion.circle
                              cx={pos.x} cy={pos.y} r={22}
                              fill={isCurrent ? 'hsl(24 80% 52%)' : isVisited ? 'hsl(162 60% 40%)' : 'hsl(var(--muted))'}
                              stroke={isCurrent ? 'hsl(24 80% 45%)' : 'hsl(var(--border))'}
                              strokeWidth="2"
                              animate={{ scale: isCurrent ? 1.15 : 1 }}
                              transition={{ duration: 0.2 }}
                            />
                            <text
                              x={pos.x} y={pos.y + 5}
                              textAnchor="middle"
                              className="text-sm font-bold"
                              fill={isCurrent || isVisited ? 'white' : 'hsl(var(--foreground))'}
                            >
                              {n.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}

                {/* Empty state */}
                {!isGraph && !currentData && (
                  <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">
                    Click Generate to start
                  </div>
                )}
              </div>

              {/* Step description */}
              <div className="glass-card p-3">
                <p className="text-sm font-mono text-foreground">
                  {isGraph
                    ? (currentGraphData?.description || 'Ready')
                    : (currentData?.description || 'Ready')}
                </p>
              </div>

              {/* Playback controls */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Button variant="outline" size="icon" onClick={restart} className="rounded-full h-9 w-9">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={stepBack} disabled={currentStep === 0} className="rounded-full h-9 w-9">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={isPlaying ? pause : playAnimation}
                    className="rounded-full h-11 w-11 shadow-lg"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={stepForward} disabled={currentStep >= totalSteps - 1} className="rounded-full h-9 w-9">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>

                {/* Size & Speed sliders */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {!isGraph && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                        <Ruler className="w-3 h-3" /> Array Size: {arraySize}
                      </label>
                      <Slider
                        value={[arraySize]} min={5} max={50} step={1}
                        onValueChange={v => setArraySize(v[0])}
                      />
                    </div>
                  )}
                  <div className={isGraph ? 'col-span-2' : ''}>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Timer className="w-3 h-3" /> Speed: {speed}ms
                    </label>
                    <Slider
                      value={[speed]} min={50} max={1000} step={25}
                      onValueChange={v => setSpeed(v[0])}
                    />
                  </div>
                </div>

                {/* Custom data input */}
                {!isGraph && (
                  <div className="mt-4">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Custom Data (comma-separated numbers, or leave empty for random)
                    </label>
                    <Input
                      placeholder="e.g. 42, 17, 88, 5, 63, 29"
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                {/* Search target + Generate */}
                <div className="flex gap-2 mt-4">
                  {category === 'searching' && (
                    <Input
                      type="number"
                      placeholder="Search target"
                      value={searchTarget}
                      onChange={e => setSearchTarget(e.target.value)}
                      className="font-mono text-sm w-32"
                    />
                  )}
                  <Button onClick={generate} className="gap-1.5 flex-1">
                    <ArrowRight className="w-4 h-4" /> Generate & Reset
                  </Button>
                </div>
              </div>

              {/* Color Legend */}
              <div className="glass-card p-4">
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Color Legend
                </h4>
                <div className="flex flex-wrap gap-3">
                  {COLOR_LEGEND.map(c => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-sm ${c.color}`} />
                      <span className="text-[11px] text-muted-foreground">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar: Pseudocode + Complexity */}
            <div className="space-y-4">
              {/* Pseudocode */}
              <div className="glass-card overflow-hidden">
                <div className="px-4 py-2 border-b border-border/50">
                  <h3 className="text-sm font-semibold text-foreground">Pseudocode</h3>
                </div>
                <div className="p-3">
                  {pseudocode.map((line, i) => (
                    <motion.div
                      key={i}
                      className={`font-mono text-xs py-1 px-2 rounded transition-colors ${
                        activeLine === i
                          ? 'bg-primary/15 text-primary font-semibold border-l-2 border-primary'
                          : 'text-muted-foreground'
                      }`}
                      animate={activeLine === i ? { x: [0, 2, 0] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-muted-foreground/50 mr-2 select-none">{i + 1}</span>
                      {line}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Complexity */}
              {complexity && (
                <div className="glass-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Complexity</h3>
                  <div className="space-y-2">
                    {complexity.best && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Best Case</span>
                        <span className="font-mono font-semibold text-accent">{complexity.best}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Average Time</span>
                      <span className="font-mono font-semibold text-primary">{complexity.time}</span>
                    </div>
                    {complexity.worst && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Worst Case</span>
                        <span className="font-mono font-semibold text-destructive">{complexity.worst}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs border-t border-border/50 pt-2">
                      <span className="text-muted-foreground">Space</span>
                      <span className="font-mono font-semibold text-foreground">{complexity.space}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Algorithm info */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">About {algo}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {algo === 'Bubble Sort' && 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Simple but inefficient for large datasets.'}
                  {algo === 'Insertion Sort' && 'Builds the sorted array one element at a time by inserting each element into its correct position. Efficient for small or nearly sorted datasets.'}
                  {algo === 'Merge Sort' && 'Divides the array in half, recursively sorts each half, then merges them. Guaranteed O(n log n) but uses extra space.'}
                  {algo === 'Quick Sort' && 'Picks a pivot, partitions elements around it, then recursively sorts subarrays. Fast in practice with O(n log n) average case.'}
                  {algo === 'Linear Search' && 'Checks each element sequentially until a match is found. Works on unsorted arrays but is slow for large datasets.'}
                  {algo === 'Binary Search' && 'Repeatedly divides a sorted array in half to find the target. Extremely efficient with O(log n) comparisons.'}
                  {algo === 'BFS' && 'Explores all neighbors at the current depth before moving deeper. Uses a queue. Finds shortest path in unweighted graphs.'}
                  {algo === 'DFS' && 'Explores as far as possible along each branch before backtracking. Uses recursion/stack. Useful for cycle detection and topological sorting.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
