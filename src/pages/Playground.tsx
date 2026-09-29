import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Layers, Link as LinkIcon, ArrowUpFromLine, ArrowRightLeft, GitBranch, Share2, Shuffle, Code2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import { useProgress, DSType, OPERATIONS, ALL_DS, DS_LABELS } from '@/hooks/useProgress';
import { BSTNode, LLNode, GraphData, genId, bstInsert, bstSearch, bstInorder, bstPreorder, bstPostorder, graphBFS, graphDFS, buildDefaultBST, buildDefaultGraph } from '@/lib/dsOperations';
import { DS_COMPLEXITY } from '@/lib/algorithms';
import ArrayVisualizer from '@/components/playground/ArrayVisualizer';
import StackVisualizer from '@/components/playground/StackVisualizer';
import QueueVisualizer from '@/components/playground/QueueVisualizer';
import LinkedListVisualizer from '@/components/playground/LinkedListVisualizer';
import BSTVisualizer from '@/components/playground/BSTVisualizer';
import GraphVisualizer from '@/components/playground/GraphVisualizer';

interface LogEntry { time: string; message: string; type: 'info' | 'success' | 'error' }

const DS_ICONS: Record<DSType, typeof Layers> = {
  array: Layers, 'linked-list': LinkIcon, stack: ArrowUpFromLine,
  queue: ArrowRightLeft, bst: GitBranch, graph: Share2,
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function Playground() {
  const { markExplored, getProgress } = useProgress();
  const [selectedDS, setSelectedDS] = useState<DSType>('array');
  const [arrayData, setArrayData] = useState([15, 42, 8, 23, 36]);
  const [stackData, setStackData] = useState([10, 25, 5]);
  const [queueData, setQueueData] = useState([12, 34, 7, 19]);
  const [llData, setLLData] = useState<LLNode[]>(() => [3, 7, 11, 4].map(v => ({ id: genId(), value: v })));
  const [bstRoot, setBstRoot] = useState<BSTNode | null>(() => buildDefaultBST());
  const [graphData, setGraphData] = useState<GraphData>(() => buildDefaultGraph());
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [speed, setSpeed] = useState(400);
  const [inputVal, setInputVal] = useState('');
  const [inputIdx, setInputIdx] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLog(prev => [{ time, message, type }, ...prev].slice(0, 50));
  }, []);

  const highlightSeq = useCallback(async (ids: string[]) => {
    for (const id of ids) {
      setHighlighted(prev => [...prev, id]);
      await sleep(speedRef.current);
    }
    await sleep(speedRef.current);
    setHighlighted([]);
  }, []);

  const handleOp = useCallback(async (op: string) => {
    if (isAnimating) return;
    setIsAnimating(true);
    markExplored(selectedDS, op);
    const val = parseInt(inputVal);
    const idx = parseInt(inputIdx);

    try {
      switch (selectedDS) {
        case 'array': {
          switch (op) {
            case 'Insert': {
              if (isNaN(val)) { addLog('Enter a number to insert', 'error'); return; }
              const i = isNaN(idx) ? arrayData.length : Math.max(0, Math.min(idx, arrayData.length));
              const a = [...arrayData]; a.splice(i, 0, val); setArrayData(a);
              setHighlighted([i.toString()]); addLog(`Inserted ${val} at index ${i}`, 'success');
              await sleep(speedRef.current); setHighlighted([]); break;
            }
            case 'Delete': {
              const i = isNaN(idx) ? arrayData.length - 1 : idx;
              if (i < 0 || i >= arrayData.length) { addLog('Invalid index', 'error'); return; }
              setHighlighted([i.toString()]); addLog(`Deleting ${arrayData[i]} at index ${i}`);
              await sleep(speedRef.current);
              setArrayData(arrayData.filter((_, j) => j !== i));
              setHighlighted([]); addLog('Deleted', 'success'); break;
            }
            case 'Search': {
              if (isNaN(val)) { addLog('Enter a value to search', 'error'); return; }
              addLog(`Searching for ${val}...`);
              for (let i = 0; i < arrayData.length; i++) {
                setHighlighted([i.toString()]); await sleep(speedRef.current);
                if (arrayData[i] === val) { addLog(`Found ${val} at index ${i}`, 'success'); await sleep(speedRef.current); setHighlighted([]); return; }
              }
              addLog(`${val} not found`, 'error'); setHighlighted([]); break;
            }
            case 'Sort': {
              const a = [...arrayData]; addLog('Bubble sort starting...');
              for (let i = 0; i < a.length - 1; i++) {
                for (let j = 0; j < a.length - 1 - i; j++) {
                  setHighlighted([j.toString(), (j + 1).toString()]);
                  if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; setArrayData([...a]); }
                  await sleep(speedRef.current);
                }
              }
              setHighlighted([]); addLog('Array sorted', 'success'); break;
            }
            case 'Reverse': {
              const a = [...arrayData].reverse(); setArrayData(a);
              addLog('Array reversed', 'success'); break;
            }
          }
          break;
        }
        case 'stack': {
          switch (op) {
            case 'Push': {
              if (isNaN(val)) { addLog('Enter a number', 'error'); return; }
              const newStack = [...stackData, val]; setStackData(newStack);
              setHighlighted([(newStack.length - 1).toString()]);
              addLog(`Pushed ${val}`, 'success'); await sleep(speedRef.current); setHighlighted([]); break;
            }
            case 'Pop': {
              if (!stackData.length) { addLog('Stack is empty', 'error'); return; }
              const top = stackData[stackData.length - 1];
              setHighlighted([(stackData.length - 1).toString()]);
              addLog(`Popping ${top}...`); await sleep(speedRef.current);
              setStackData(stackData.slice(0, -1)); setHighlighted([]);
              addLog(`Popped ${top}`, 'success'); break;
            }
            case 'Peek': {
              if (!stackData.length) { addLog('Stack is empty', 'error'); return; }
              setHighlighted([(stackData.length - 1).toString()]);
              addLog(`Top element: ${stackData[stackData.length - 1]}`, 'success');
              await sleep(speedRef.current * 2); setHighlighted([]); break;
            }
          }
          break;
        }
        case 'queue': {
          switch (op) {
            case 'Enqueue': {
              if (isNaN(val)) { addLog('Enter a number', 'error'); return; }
              const newQ = [...queueData, val]; setQueueData(newQ);
              setHighlighted([(newQ.length - 1).toString()]);
              addLog(`Enqueued ${val}`, 'success'); await sleep(speedRef.current); setHighlighted([]); break;
            }
            case 'Dequeue': {
              if (!queueData.length) { addLog('Queue is empty', 'error'); return; }
              const front = queueData[0]; setHighlighted(['0']);
              addLog(`Dequeuing ${front}...`); await sleep(speedRef.current);
              setQueueData(queueData.slice(1)); setHighlighted([]);
              addLog(`Dequeued ${front}`, 'success'); break;
            }
            case 'Peek': {
              if (!queueData.length) { addLog('Queue is empty', 'error'); return; }
              setHighlighted(['0']);
              addLog(`Front element: ${queueData[0]}`, 'success');
              await sleep(speedRef.current * 2); setHighlighted([]); break;
            }
          }
          break;
        }
        case 'linked-list': {
          switch (op) {
            case 'Insert Head': {
              if (isNaN(val)) { addLog('Enter a number', 'error'); return; }
              const node = { id: genId(), value: val };
              setLLData([node, ...llData]); setHighlighted([node.id]);
              addLog(`Inserted ${val} at head`, 'success'); await sleep(speedRef.current); setHighlighted([]); break;
            }
            case 'Insert Tail': {
              if (isNaN(val)) { addLog('Enter a number', 'error'); return; }
              const node = { id: genId(), value: val };
              setLLData([...llData, node]); setHighlighted([node.id]);
              addLog(`Inserted ${val} at tail`, 'success'); await sleep(speedRef.current); setHighlighted([]); break;
            }
            case 'Delete': {
              if (isNaN(val)) { addLog('Enter value to delete', 'error'); return; }
              const nodeIdx = llData.findIndex(n => n.value === val);
              if (nodeIdx === -1) { addLog(`${val} not found`, 'error'); return; }
              setHighlighted([llData[nodeIdx].id]); addLog(`Deleting ${val}...`);
              await sleep(speedRef.current);
              setLLData(llData.filter((_, i) => i !== nodeIdx)); setHighlighted([]);
              addLog(`Deleted ${val}`, 'success'); break;
            }
            case 'Search': {
              if (isNaN(val)) { addLog('Enter value to search', 'error'); return; }
              addLog(`Searching for ${val}...`);
              for (const node of llData) {
                setHighlighted([node.id]); await sleep(speedRef.current);
                if (node.value === val) { addLog(`Found ${val}`, 'success'); await sleep(speedRef.current); setHighlighted([]); return; }
              }
              addLog(`${val} not found`, 'error'); setHighlighted([]); break;
            }
          }
          break;
        }
        case 'bst': {
          switch (op) {
            case 'Insert': {
              if (isNaN(val)) { addLog('Enter a number', 'error'); return; }
              const result = bstInsert(bstRoot, val);
              setBstRoot(result.root); addLog(`Inserting ${val}...`);
              await highlightSeq(result.path);
              addLog(`Inserted ${val}`, 'success'); break;
            }
            case 'Search': {
              if (isNaN(val)) { addLog('Enter a value', 'error'); return; }
              const result = bstSearch(bstRoot, val);
              addLog(`Searching for ${val}...`);
              await highlightSeq(result.path);
              addLog(result.found ? `Found ${val}` : `${val} not found`, result.found ? 'success' : 'error'); break;
            }
            case 'Inorder': {
              const order = bstInorder(bstRoot); addLog('Inorder traversal: Left → Root → Right');
              await highlightSeq(order); addLog('Traversal complete', 'success'); break;
            }
            case 'Preorder': {
              const order = bstPreorder(bstRoot); addLog('Preorder traversal: Root → Left → Right');
              await highlightSeq(order); addLog('Traversal complete', 'success'); break;
            }
            case 'Postorder': {
              const order = bstPostorder(bstRoot); addLog('Postorder traversal: Left → Right → Root');
              await highlightSeq(order); addLog('Traversal complete', 'success'); break;
            }
          }
          break;
        }
        case 'graph': {
          switch (op) {
            case 'Add Vertex': {
              if (isNaN(val)) { addLog('Enter a value', 'error'); return; }
              const v = { id: genId(), value: val };
              setGraphData(prev => ({ ...prev, vertices: [...prev.vertices, v] }));
              setHighlighted([v.id]); addLog(`Added vertex ${val}`, 'success');
              await sleep(speedRef.current); setHighlighted([]); break;
            }
            case 'Add Edge': {
              const from = parseInt(inputVal);
              const to = parseInt(inputIdx);
              if (isNaN(from) || isNaN(to)) { addLog('Enter "From" value and "To" value', 'error'); return; }
              const fv = graphData.vertices.find(v => v.value === from);
              const tv = graphData.vertices.find(v => v.value === to);
              if (!fv || !tv) { addLog('Vertices not found', 'error'); return; }
              setGraphData(prev => ({ ...prev, edges: [...prev.edges, { from: fv.id, to: tv.id }] }));
              setHighlighted([fv.id, tv.id]); addLog(`Added edge ${from} — ${to}`, 'success');
              await sleep(speedRef.current); setHighlighted([]); break;
            }
            case 'BFS': {
              if (!graphData.vertices.length) { addLog('Graph is empty', 'error'); return; }
              const startV = isNaN(val) ? graphData.vertices[0] : graphData.vertices.find(v => v.value === val) || graphData.vertices[0];
              addLog(`BFS from vertex ${startV.value}...`);
              const order = graphBFS(graphData, startV.id);
              await highlightSeq(order);
              const vals = order.map(id => graphData.vertices.find(v => v.id === id)?.value);
              addLog(`BFS order: ${vals.join(' → ')}`, 'success'); break;
            }
            case 'DFS': {
              if (!graphData.vertices.length) { addLog('Graph is empty', 'error'); return; }
              const startV = isNaN(val) ? graphData.vertices[0] : graphData.vertices.find(v => v.value === val) || graphData.vertices[0];
              addLog(`DFS from vertex ${startV.value}...`);
              const order = graphDFS(graphData, startV.id);
              await highlightSeq(order);
              const vals = order.map(id => graphData.vertices.find(v => v.id === id)?.value);
              addLog(`DFS order: ${vals.join(' → ')}`, 'success'); break;
            }
          }
          break;
        }
      }
    } finally {
      setIsAnimating(false);
    }
  }, [isAnimating, selectedDS, inputVal, inputIdx, arrayData, stackData, queueData, llData, bstRoot, graphData, markExplored, addLog, highlightSeq]);

  const generateRandom = () => {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const arr = Array.from({ length: rand(5, 10) }, () => rand(1, 99));
    switch (selectedDS) {
      case 'array': setArrayData(arr); break;
      case 'stack': setStackData(arr.slice(0, 5)); break;
      case 'queue': setQueueData(arr.slice(0, 6)); break;
      case 'linked-list': setLLData(arr.slice(0, 5).map(v => ({ id: genId(), value: v }))); break;
      case 'bst': {
        let root: BSTNode | null = null;
        arr.slice(0, 7).forEach(v => { root = bstInsert(root, v).root; });
        setBstRoot(root); break;
      }
      case 'graph': {
        const verts = arr.slice(0, 5).map(v => ({ id: genId(), value: v }));
        const edges: { from: string; to: string }[] = [];
        for (let i = 0; i < verts.length - 1; i++) edges.push({ from: verts[i].id, to: verts[i + 1].id });
        if (verts.length > 2) edges.push({ from: verts[0].id, to: verts[verts.length - 1].id });
        setGraphData({ vertices: verts, edges }); break;
      }
    }
    addLog(`Generated random ${DS_LABELS[selectedDS]}`, 'success');
  };

  const showIndexInput = selectedDS === 'array' || (selectedDS === 'graph' && true);
  const indexLabel = selectedDS === 'graph' ? 'To (value)' : 'Index';
  const valueLabel = selectedDS === 'graph' ? 'Value / From' : 'Value';
  const progress = getProgress(selectedDS);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-3 sm:px-4 pb-8">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Interactive Playground</h1>
                <p className="text-sm text-muted-foreground">Explore data structures with hands-on, animated operations</p>
              </div>
            </div>
          </motion.div>

          {/* DS Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mb-6">
            {ALL_DS.map((ds, i) => {
              const Icon = DS_ICONS[ds];
              const p = getProgress(ds);
              return (
                <motion.button
                  key={ds}
                  onClick={() => { setSelectedDS(ds); setHighlighted([]); }}
                  className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all text-left group ${
                    selectedDS === ds
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
                  }`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                    selectedDS === ds ? 'bg-primary/15' : 'bg-muted group-hover:bg-primary/10'
                  }`}>
                    <Icon className={`w-4.5 h-4.5 ${selectedDS === ds ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                  </div>
                  <div className="text-sm font-semibold text-foreground">{DS_LABELS[ds]}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.done}/{p.total} ops</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.percent}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-4 sm:gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Operations */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Operations</h3>
                <div className="flex flex-wrap gap-2">
                  {OPERATIONS[selectedDS].map(op => (
                    <Button
                      key={op} size="sm" variant="outline"
                      disabled={isAnimating}
                      onClick={() => handleOp(op)}
                      className="text-xs"
                    >
                      {op}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Input</h3>
                <div>
                  <label className="text-xs text-muted-foreground">{valueLabel}</label>
                  <Input
                    type="number" value={inputVal} onChange={e => setInputVal(e.target.value)}
                    placeholder="Enter number" className="mt-1 font-mono text-sm"
                  />
                </div>
                {showIndexInput && (
                  <div>
                    <label className="text-xs text-muted-foreground">{indexLabel}</label>
                    <Input
                      type="number" value={inputIdx} onChange={e => setInputIdx(e.target.value)}
                      placeholder="Optional" className="mt-1 font-mono text-sm"
                    />
                  </div>
                )}
                <Button onClick={generateRandom} variant="secondary" size="sm" className="w-full gap-2">
                  <Shuffle className="w-3.5 h-3.5" /> Generate Random
                </Button>
              </div>

              {/* Speed */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Speed</h3>
                <Slider
                  value={[speed]} min={100} max={1000} step={50}
                  onValueChange={v => setSpeed(v[0])}
                />
                <div className="text-xs text-muted-foreground mt-1 font-mono">{speed}ms / step</div>
              </div>

              {/* Progress */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Progress</h3>
                <Progress value={progress.percent} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {progress.done}/{progress.total} operations explored
                </div>
              </div>

              {/* Complexity Table */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Time & Space Complexity</h3>
                <div className="space-y-1.5">
                  {OPERATIONS[selectedDS].map(op => {
                    const c = DS_COMPLEXITY[DS_LABELS[selectedDS]]?.[op];
                    return c ? (
                      <div key={op} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{op}</span>
                        <div className="flex gap-3">
                          <span className="font-mono font-semibold text-primary">{c.time}</span>
                          <span className="font-mono text-muted-foreground">{c.space}</span>
                        </div>
                      </div>
                    ) : null;
                  })}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 border-t border-border/50 pt-1 mt-1">
                    <span></span>
                    <div className="flex gap-3">
                      <span>Time</span>
                      <span>Space</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Area */}
            <div className="space-y-4">
              {/* Canvas */}
              <div className="glass-card overflow-hidden">
                <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{DS_LABELS[selectedDS]} Visualization</h3>
                  {isAnimating && (
                    <Badge variant="secondary" className="text-xs animate-pulse">Animating...</Badge>
                  )}
                </div>
                {selectedDS === 'array' && <ArrayVisualizer data={arrayData} highlighted={highlighted} />}
                {selectedDS === 'stack' && <StackVisualizer data={stackData} highlighted={highlighted} />}
                {selectedDS === 'queue' && <QueueVisualizer data={queueData} highlighted={highlighted} />}
                {selectedDS === 'linked-list' && <LinkedListVisualizer data={llData} highlighted={highlighted} />}
                {selectedDS === 'bst' && <BSTVisualizer root={bstRoot} highlighted={highlighted} />}
                {selectedDS === 'graph' && <GraphVisualizer data={graphData} highlighted={highlighted} />}
              </div>

              {/* Log */}
              <div className="glass-card">
                <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Output Log
                  </h3>
                  {log.length > 0 && (
                    <button onClick={() => setLog([])} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                      Clear
                    </button>
                  )}
                </div>
                <ScrollArea className="h-44 p-4">
                  {log.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                      <Code2 className="w-8 h-8 mb-2 opacity-30" />
                      <span className="text-sm">Perform an operation to see output here</span>
                    </div>
                  )}
                  {log.map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={i === 0 ? { opacity: 0, x: -10 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-2 text-xs mb-1.5 font-mono py-1 px-2 rounded-md ${
                        i === 0 ? 'bg-secondary/50' : ''
                      }`}
                    >
                      <span className="text-muted-foreground/60 flex-shrink-0">{entry.time}</span>
                      <span className={`flex items-center gap-1 ${
                        entry.type === 'success' ? 'text-primary font-medium' : entry.type === 'error' ? 'text-destructive font-medium' : 'text-foreground'
                      }`}>
                        {entry.type === 'success' && <CheckCircle2 className="w-3 h-3 flex-shrink-0" />}
                        {entry.message}
                      </span>
                    </motion.div>
                  ))}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
