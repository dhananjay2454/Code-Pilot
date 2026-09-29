import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, Code2, Timer, Shield, Target, Zap,
  AlertTriangle, CheckCircle2, XCircle, HelpCircle, TrendingUp,
  Send, RotateCcw, Loader2, ChevronRight, Lightbulb, Award,
  SlidersHorizontal, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import AiSettingsModal from '@/components/AiSettingsModal';
import {
  Evaluation,
  AiConfig,
  getStoredAiConfig,
  evaluateCodeAnalysis,
} from '@/services/aiEvaluator';

const sampleCodes = [
  {
    label: 'Two Sum',
    code: `function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) {
      return [map[complement], i];
    }
    map[nums[i]] = i;
  }
  return [];
}`
  },
  {
    label: 'Binary Search',
    code: `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`
  },
  {
    label: 'Merge Sort',
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(l, r) {
  const result = [];
  let i = 0, j = 0;
  while (i < l.length && j < r.length) {
    if (l[i] <= r[j]) result.push(l[i++]);
    else result.push(r[j++]);
  }
  return result.concat(l.slice(i)).concat(r.slice(j));
}`
  }
];

function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label: string }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'hsl(var(--primary))' : score >= 50 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-lg font-bold font-mono text-foreground">{score}</span>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

function CheckItem({ correct, label, feedback }: { correct: boolean; label: string; feedback: string }) {
  return (
    <motion.div
      className={`p-4 rounded-xl border ${correct ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-1">
        {correct ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-destructive" />}
        <span className="font-semibold text-sm text-foreground">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground pl-6 leading-relaxed">{feedback}</p>
    </motion.div>
  );
}

export default function ReverseEngineer() {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState({
    problemStatement: '',
    inputOutput: '',
    algorithmPurpose: '',
    timeComplexity: '',
    spaceComplexity: '',
    edgeCases: '',
  });
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AiConfig>(getStoredAiConfig);
  const [evalSource, setEvalSource] = useState<'groq' | 'gemini' | 'supabase' | 'offline' | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({ title: 'Missing code', description: 'Paste a code snippet to analyze.', variant: 'destructive' });
      return;
    }
    const filled = Object.values(analysis).some(v => v.trim());
    if (!filled) {
      toast({ title: 'Missing analysis', description: 'Fill in at least one analysis field.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setEvaluation(null);

    try {
      const result = await evaluateCodeAnalysis(code, analysis, aiConfig);
      setEvaluation(result.evaluation);
      setEvalSource(result.source);
      setActiveStep(2);

      if (result.errorWarning) {
        toast({
          title: 'Offline Fallback Used',
          description: result.errorWarning,
          variant: 'default',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Evaluation failed',
        description: err.message || 'Something went wrong. Please check your AI Settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setAnalysis({ problemStatement: '', inputOutput: '', algorithmPurpose: '', timeComplexity: '', spaceComplexity: '', edgeCases: '' });
    setEvaluation(null);
    setActiveStep(0);
  };

  const steps = [
    { label: 'Paste Code', icon: Code2 },
    { label: 'Your Analysis', icon: Brain },
    { label: 'AI Evaluation', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero header */}
      <section className="pt-24 sm:pt-28 pb-8 sm:pb-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-warm opacity-60" />
        <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        <motion.div
          className="container mx-auto max-w-4xl relative text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Brain className="w-4 h-4" />
            AI-Powered Code Analysis
          </motion.div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-4 tracking-tight">
            Reverse Engineering{' '}
            <span className="gradient-text">AI Mode</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Paste any algorithm, write your analysis, and let AI evaluate your understanding.
            Get scored on comprehension, complexity accuracy, and edge case awareness.
          </p>
        </motion.div>
      </section>

      {/* Stepper + AI Engine Controls */}
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <motion.button
                onClick={() => { if (i <= (evaluation ? 2 : code ? 1 : 0)) setActiveStep(i); }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeStep === i
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : i < activeStep || (i === 2 && evaluation)
                    ? 'bg-primary/15 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <step.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {step.label}
              </motion.button>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-secondary/80 hover:bg-secondary border border-border/80 hover:border-primary/40 text-xs font-medium text-foreground transition-all shadow-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">AI Engine:</span>
          <span className="font-semibold text-foreground capitalize">
            {aiConfig.provider === 'auto'
              ? 'Auto'
              : aiConfig.provider === 'groq'
              ? 'Groq Cloud'
              : aiConfig.provider === 'gemini'
              ? 'Gemini'
              : aiConfig.provider === 'offline'
              ? 'Smart Offline'
              : 'Supabase'}
          </span>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse ml-0.5" />
        </motion.button>
      </div>

      {/* Main content */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <AnimatePresence mode="wait">
          {/* Step 0: Paste Code */}
          {activeStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Paste Your Code</h2>
                    <p className="text-sm text-muted-foreground">Any algorithm or data structure implementation</p>
                  </div>
                </div>

                {/* Quick samples */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-semibold text-muted-foreground">Try a sample:</span>
                  {sampleCodes.map((s) => (
                    <Button
                      key={s.label}
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs h-7"
                      onClick={() => { setCode(s.code); }}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>

                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="function twoSum(nums, target) {&#10;  // paste your code here...&#10;}"
                  className="min-h-[250px] font-mono text-sm bg-secondary/50 border-border/50 rounded-xl"
                />

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setActiveStep(1)}
                    disabled={!code.trim()}
                    className="rounded-full px-6 gap-2"
                  >
                    Continue to Analysis <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Analysis Form */}
          {activeStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Your Analysis</h2>
                    <p className="text-sm text-muted-foreground">Write what you understand about the code — AI will evaluate your reasoning</p>
                  </div>
                </div>

                {/* Code preview */}
                <div className="mb-6 p-4 rounded-xl bg-secondary/60 border border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                    <span className="text-[10px] font-mono text-muted-foreground ml-auto">code preview</span>
                  </div>
                  <pre className="font-mono text-xs text-muted-foreground overflow-x-auto max-h-32 overflow-y-auto">{code}</pre>
                </div>

                <div className="grid gap-5">
                  {[
                    { key: 'problemStatement', label: 'Problem Statement', placeholder: 'What problem does this code solve?', icon: Target },
                    { key: 'inputOutput', label: 'Input & Output', placeholder: 'What are the inputs and expected outputs?', icon: Zap },
                    { key: 'algorithmPurpose', label: 'Algorithm Purpose', placeholder: 'What approach/technique does it use?', icon: Lightbulb },
                    { key: 'timeComplexity', label: 'Time Complexity', placeholder: 'e.g., O(n), O(n log n), O(n²)', icon: Timer },
                    { key: 'spaceComplexity', label: 'Space Complexity', placeholder: 'e.g., O(1), O(n)', icon: Shield },
                    { key: 'edgeCases', label: 'Edge Cases', placeholder: 'Empty input, duplicates, negative values, single element...', icon: AlertTriangle },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                        <field.icon className="w-4 h-4 text-primary" />
                        {field.label}
                      </label>
                      {field.key === 'edgeCases' ? (
                        <Textarea
                          value={analysis[field.key as keyof typeof analysis]}
                          onChange={(e) => setAnalysis({ ...analysis, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="bg-secondary/30 border-border/40 rounded-xl min-h-[80px]"
                        />
                      ) : (
                        <Input
                          value={analysis[field.key as keyof typeof analysis]}
                          onChange={(e) => setAnalysis({ ...analysis, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="bg-secondary/30 border-border/40 rounded-xl"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <Button variant="outline" onClick={() => setActiveStep(0)} className="rounded-full gap-2">
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="rounded-full px-8 gap-2 shadow-lg shadow-primary/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit for AI Evaluation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Results */}
          {activeStep === 2 && evaluation && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Overall Score Card */}
              <div className="glass-card p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">AI Confidence Score</h2>
                      <p className="text-sm text-muted-foreground">How well you reverse-engineered this code</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/70 hover:bg-secondary border border-border/60 text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Engine:</span>
                    <strong className="text-foreground capitalize">
                      {evalSource === 'groq'
                        ? 'Groq Cloud'
                        : evalSource === 'gemini'
                        ? 'Google Gemini'
                        : evalSource === 'offline'
                        ? 'Smart Offline Mode'
                        : 'Supabase Backend'}
                    </strong>
                    <Settings2 className="w-3 h-3 ml-1 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-4">
                  {[
                    { score: evaluation.confidenceBreakdown.understanding, label: 'Understanding' },
                    { score: evaluation.confidenceBreakdown.complexityAccuracy, label: 'Complexity' },
                    { score: evaluation.confidenceBreakdown.edgeCaseAwareness, label: 'Edge Cases' },
                    { score: evaluation.confidenceBreakdown.overall, label: 'Overall', size: 100 },
                  ].map((item) => (
                    <div key={item.label} className="relative flex flex-col items-center">
                      <ScoreRing score={item.score} size={item.size || 80} label={item.label} />
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                <motion.div
                  className="mt-6 p-5 rounded-xl bg-primary/5 border border-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">{evaluation.feedback}</p>
                  </div>
                </motion.div>
              </div>

              {/* Code Understanding */}
              <div className="glass-card p-5 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Code Understanding</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={evaluation.codeUnderstanding.score} className="w-24 h-2" />
                    <span className="text-sm font-bold font-mono text-foreground">{evaluation.codeUnderstanding.score}%</span>
                  </div>
                </div>
                <div className="grid gap-3">
                  <CheckItem correct={evaluation.codeUnderstanding.problemStatement.correct} label="Problem Statement" feedback={evaluation.codeUnderstanding.problemStatement.feedback} />
                  <CheckItem correct={evaluation.codeUnderstanding.inputOutput.correct} label="Input & Output" feedback={evaluation.codeUnderstanding.inputOutput.feedback} />
                  <CheckItem correct={evaluation.codeUnderstanding.algorithmPurpose.correct} label="Algorithm Purpose" feedback={evaluation.codeUnderstanding.algorithmPurpose.feedback} />
                </div>
              </div>

              {/* Complexity Analysis */}
              <div className="glass-card p-5 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Complexity Analysis</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={evaluation.complexityAnalysis.score} className="w-24 h-2" />
                    <span className="text-sm font-bold font-mono text-foreground">{evaluation.complexityAnalysis.score}%</span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <CheckItem
                    correct={evaluation.complexityAnalysis.timeComplexity.correct}
                    label={`Time: ${evaluation.complexityAnalysis.timeComplexity.expected}`}
                    feedback={evaluation.complexityAnalysis.timeComplexity.feedback}
                  />
                  <CheckItem
                    correct={evaluation.complexityAnalysis.spaceComplexity.correct}
                    label={`Space: ${evaluation.complexityAnalysis.spaceComplexity.expected}`}
                    feedback={evaluation.complexityAnalysis.spaceComplexity.feedback}
                  />
                </div>
                {evaluation.complexityAnalysis.hint && (
                  <motion.div
                    className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/20 flex items-start gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground">{evaluation.complexityAnalysis.hint}</p>
                  </motion.div>
                )}
              </div>

              {/* Edge Cases */}
              <div className="glass-card p-5 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Edge Case Detection</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={evaluation.edgeCaseDetection.score} className="w-24 h-2" />
                    <span className="text-sm font-bold font-mono text-foreground">{evaluation.edgeCaseDetection.score}%</span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Identified
                    </h4>
                    <div className="space-y-1.5">
                      {evaluation.edgeCaseDetection.identified.length > 0 ? (
                        evaluation.edgeCaseDetection.identified.map((ec, i) => (
                          <div key={i} className="text-xs text-foreground bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">{ec}</div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">None identified</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Missed
                    </h4>
                    <div className="space-y-1.5">
                      {evaluation.edgeCaseDetection.missed.length > 0 ? (
                        evaluation.edgeCaseDetection.missed.map((ec, i) => (
                          <div key={i} className="text-xs text-foreground bg-destructive/5 px-3 py-2 rounded-lg border border-destructive/10">{ec}</div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">You caught them all! 🎉</p>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{evaluation.edgeCaseDetection.feedback}</p>
              </div>

              {/* Socratic Questions + Optimization */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Think Deeper</h3>
                  </div>
                  <div className="space-y-3">
                    {evaluation.socraticQuestions.map((q, i) => (
                      <motion.div
                        key={i}
                        className="p-4 rounded-xl bg-secondary/50 border border-border/40"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.15 }}
                      >
                        <div className="flex items-start gap-2">
                          <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-foreground leading-relaxed">{q}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Optimization Challenge</h3>
                  </div>
                  <motion.div
                    className="p-5 rounded-xl bg-accent/5 border border-accent/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-sm font-semibold text-foreground mb-3">{evaluation.optimizationChallenge.challenge}</p>
                    <div className="flex items-start gap-2 mt-3 pt-3 border-t border-accent/10">
                      <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground italic">{evaluation.optimizationChallenge.hint}</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                <Button variant="outline" onClick={handleReset} className="rounded-full gap-2">
                  <RotateCcw className="w-4 h-4" /> Try Another
                </Button>
                <Button onClick={() => { setEvaluation(null); setActiveStep(1); }} className="rounded-full gap-2">
                  <Brain className="w-4 h-4" /> Revise & Resubmit
                </Button>
              </div>
            </motion.div>
          )}

          {/* Loading state */}
          {loading && activeStep === 1 && (
            <motion.div
              key="loading-overlay"
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="glass-card p-10 text-center max-w-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary mx-auto mb-5"
                />
                <h3 className="text-lg font-bold text-foreground mb-2">AI is analyzing...</h3>
                <p className="text-sm text-muted-foreground">Evaluating your understanding, checking complexity, and generating Socratic questions.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Settings Modal */}
      <AiSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onConfigSaved={setAiConfig}
      />
    </div>
  );
}
