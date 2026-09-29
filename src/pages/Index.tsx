import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Play, Eye, BarChart3, Zap, ArrowRight, Layers, GitBranch, Share2,
  ArrowUpFromLine, ArrowRightLeft, Link as LinkIcon, CheckCircle2,
  BookOpen, Code2, Rocket, TrendingUp, Cpu, Star, Trophy, Target,
  GraduationCap, Timer, Brain, Sparkles, Shield, Users } from
'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import SortingAnimation from '@/components/landing/SortingAnimation';

function AnimatedCounter({ target, suffix = '', label, description, icon: Icon }: {target: number;suffix?: string;label: string;description: string;icon: typeof Layers;}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const totalFrames = 45;
    const timer = setInterval(() => {
      frame++;
      setCount(Math.round(frame / totalFrames * target));
      if (frame >= totalFrames) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <motion.div
      ref={ref}
      className="text-center p-8 rounded-2xl bg-card border border-border/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group"
      whileHover={{ y: -6 }}>

      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <div className="text-4xl font-extrabold font-mono gradient-text mb-1">
        {inView ? count : 0}{suffix}
      </div>
      <div className="text-sm font-bold text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </motion.div>);

}

const features = [
{
  icon: Play,
  title: 'Interactive Playground',
  description: 'Hands-on practice with 6 core data structures. Insert, delete, search, sort, traverse — watch every operation animate step-by-step with full speed control and detailed output logs.',
  highlights: ['Step-by-step animations', 'Adjustable speed control', '22+ operations covered', 'Real-time output logs'],
  gradient: 'from-primary/10 to-primary/5'
},
{
  icon: Eye,
  title: 'Algorithm Visualizer',
  description: 'Visualize 8 essential algorithms across Sorting (Bubble, Insertion, Merge, Quick), Searching (Linear, Binary), and Graph Traversal (BFS, DFS) with synchronized pseudocode.',
  highlights: ['8 algorithms visualized', 'Synced pseudocode panel', 'Time & space complexity', 'Playback controls'],
  gradient: 'from-accent/10 to-accent/5'
},
{
  icon: BarChart3,
  title: 'Progress Tracking',
  description: 'Your learning journey is automatically saved. Track which operations you\'ve explored per data structure with visual progress bars and overall completion percentage.',
  highlights: ['Auto-save to browser', 'Per-structure tracking', 'Visual progress bars', 'Completion percentage'],
  gradient: 'from-primary/10 to-accent/5'
}];


const dsCards = [
{ icon: Layers, name: 'Array', ops: 'Insert, Delete, Search, Sort, Reverse', detail: 'Dynamic resizing & index-based access', color: 'bg-emerald-500/10 text-emerald-600' },
{ icon: LinkIcon, name: 'Linked List', ops: 'Insert Head/Tail, Delete, Search', detail: 'Node-based sequential structure', color: 'bg-teal-500/10 text-teal-600' },
{ icon: ArrowUpFromLine, name: 'Stack', ops: 'Push, Pop, Peek', detail: 'LIFO — Last In, First Out', color: 'bg-green-500/10 text-green-600' },
{ icon: ArrowRightLeft, name: 'Queue', ops: 'Enqueue, Dequeue, Peek', detail: 'FIFO — First In, First Out', color: 'bg-cyan-500/10 text-cyan-600' },
{ icon: GitBranch, name: 'Binary Search Tree', ops: 'Insert, Search, Inorder, Pre/Post', detail: 'Hierarchical sorted structure', color: 'bg-lime-500/10 text-lime-600' },
{ icon: Share2, name: 'Graph', ops: 'Add Vertex/Edge, BFS, DFS', detail: 'Vertices & edges with traversals', color: 'bg-sky-500/10 text-sky-600' }];





const whyCards = [
{ icon: Brain, title: 'Visual Learning', desc: 'Research shows visual learners retain 65% more information. Our animations make abstract concepts concrete and memorable.' },
{ icon: Timer, title: 'Save Time', desc: 'Stop spending hours reading textbooks. Understand any algorithm in minutes with interactive, step-by-step visualizations.' },
{ icon: Target, title: 'Interview Ready', desc: 'Practice the exact data structures and algorithms asked in FAANG interviews with real-time complexity analysis.' },
{ icon: Shield, title: 'Zero Setup', desc: 'No installations, no sign-ups, no configuration. Open your browser and start learning immediately — it just works.' }];


export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 sm:pt-36 pb-16 sm:pb-32 px-4 sm:px-6 relative overflow-hidden">
        {/* Animated background layers */}
        <div className="absolute inset-0 gradient-warm opacity-60" />
        <div className="absolute top-10 right-10 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 left-10 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-accent/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-primary/5 rounded-full blur-[80px]" />
        
        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-24 left-[15%] w-2 h-2 bg-primary/30 rounded-full"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

        <motion.div
          className="absolute top-40 right-[20%] w-3 h-3 bg-accent/25 rounded-full"
          animate={{ y: [0, 15, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

        <motion.div
          className="absolute bottom-32 left-[25%] w-1.5 h-1.5 bg-primary/40 rounded-full"
          animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />


        <div className="container mx-auto max-w-6xl relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}>

              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2 }}>

                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>

                  <Sparkles className="w-4 h-4" />
                </motion.span>
                Free & Open-Source · Trusted by 10,000+ Learners
              </motion.div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-foreground leading-[1.05] mb-4 tracking-tight">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="block">

                  Decode Algorithms,
                </motion.span>
                <motion.span
                  className="gradient-text block mt-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}>

                  One Step at a Time
                </motion.span>
              </h1>

              {/* Subtitle */}
              <motion.p
                className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-xl leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}>

                The most intuitive way to learn <strong className="text-foreground">Data Structures & Algorithms</strong>. 
                Interactive visualizations for <strong className="text-foreground">6 data structures</strong>, <strong className="text-foreground">8 algorithms</strong>, and <strong className="text-foreground">22+ operations</strong> — all with real-time, step-by-step animations.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex gap-3 justify-center lg:justify-start flex-wrap"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}>

                <Button asChild size="lg" className="rounded-full px-6 sm:px-8 gap-2 text-sm sm:text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all h-12 sm:h-13 font-semibold">
                  <Link to="/playground"><Rocket className="w-5 h-5" /> Launch Playground</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-6 sm:px-8 gap-2 text-sm sm:text-base border-2 hover:bg-secondary hover:scale-105 transition-all h-12 sm:h-13 font-semibold">
                  <Link to="/visualizer"><Eye className="w-5 h-5" /> Explore Algorithms</Link>
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                className="flex items-center gap-3 sm:gap-5 mt-8 sm:mt-10 justify-center lg:justify-start text-sm text-muted-foreground flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}>

                {[
                { label: 'No sign-up needed', icon: CheckCircle2 },
                { label: '100% free forever', icon: CheckCircle2 },
                { label: 'Works offline', icon: CheckCircle2 },
                { label: 'No ads', icon: CheckCircle2 }].
                map((badge) =>
                <span key={badge.label} className="flex items-center gap-1.5 bg-secondary/60 px-3 py-1.5 rounded-full border border-border/50">
                    <badge.icon className="w-3.5 h-3.5 text-primary" /> {badge.label}
                  </span>
                )}
              </motion.div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              className="flex-shrink-0 hidden md:block"
              initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}>

              <div className="relative">
                <div className="absolute -inset-8 bg-primary/10 rounded-[2rem] blur-3xl" />
                <motion.div
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />

                <div className="glass-card p-8 w-80 relative overflow-hidden">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-primary/50" />
                    <div className="w-3 h-3 rounded-full bg-accent/60" />
                    <span className="text-xs font-mono text-muted-foreground ml-auto">bubble_sort.js</span>
                  </div>

                  {/* Sorting animation */}
                  <SortingAnimation />

                  {/* Status bar */}
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }} />

                      <span className="text-xs font-mono text-primary font-semibold">sorting...</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border/50">O(n²)</span>
                  </div>

                  {/* Mini code preview */}
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <div className="space-y-1 font-mono text-[10px] text-muted-foreground/70">
                      <div><span className="text-primary/60">for</span> (i = 0; i {'<'} n-1; i++)</div>
                      <div className="pl-3"><span className="text-primary/60">if</span> (arr[j] {'>'} arr[j+1])</div>
                      <div className="pl-6 text-accent/70">swap(arr[j], arr[j+1])</div>
                    </div>
                  </div>
                </div>

                {/* Floating stat cards */}
                










                










              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why CodePilot */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>

            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Why CodePilot?</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 text-foreground">Built for how you actually learn</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mt-3">Stop memorizing — start understanding. CodePilot transforms abstract algorithms into visual, interactive experiences.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyCards.map((card, i) =>
            <motion.div
              key={card.title}
              className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}>

                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                  <card.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Data Structures Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>

            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Data Structures</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 text-foreground">6 Core Structures, Fully Interactive</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mt-3">Each structure comes with dedicated operations, SVG/HTML animations, real-time output logs, and time complexity analysis for every operation.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dsCards.map((ds, i) =>
            <motion.div
              key={ds.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}>

                <Link
                to="/playground"
                className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group">

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${ds.color} group-hover:scale-110 transition-transform`}>
                    <ds.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{ds.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">{ds.detail}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1.5 font-mono">{ds.ops}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>

            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Platform Features</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 text-foreground">Everything you need to master DSA</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-3">Three powerful tools designed to take you from confused to confident.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {features.map((f, i) =>
            <motion.div
              key={f.title}
              className={`relative p-8 rounded-2xl bg-gradient-to-br ${f.gradient} border border-border/40 hover:shadow-2xl transition-all duration-300 group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -6 }}>

                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-md">
                  <f.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{f.description}</p>
                <ul className="space-y-2.5">
                  {f.highlights.map((h) =>
                <li key={h} className="flex items-center gap-2 text-xs text-foreground font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" /> {h}
                    </li>
                )}
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>

            <span className="text-sm font-semibold text-primary uppercase tracking-wider">By The Numbers</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 text-foreground">Built for comprehensive, in-depth learning</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mt-3">Covering the essential data structures and algorithms every developer needs to know.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <AnimatedCounter target={6} label="Data Structures" description="Array, List, Stack, Queue, BST, Graph" icon={Layers} />
            <AnimatedCounter target={22} suffix="+" label="Operations" description="Insert, delete, search, sort & more" icon={Cpu} />
            <AnimatedCounter target={8} label="Algorithms" description="Sorting, searching & graph traversal" icon={GitBranch} />
            <AnimatedCounter target={100} suffix="%" label="Free Forever" description="No paywalls, no limits, no sign-up" icon={Trophy} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>

            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Getting Started</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 text-foreground">Start learning in under 30 seconds</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mt-3">No installation, no configuration, no account needed. Just three simple steps.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
            {[
            { step: '01', icon: BookOpen, title: 'Choose Your Topic', desc: 'Pick from 6 data structures or 8 algorithms. Each comes with a dedicated, purpose-built visualization.' },
            { step: '02', icon: Code2, title: 'Run Operations', desc: 'Insert values, search, sort, traverse — trigger any operation with one click and watch it execute step-by-step.' },
            { step: '03', icon: TrendingUp, title: 'Watch, Learn, Repeat', desc: 'See each step animate with color-coded highlights, pseudocode sync, output logs, and complexity analysis.' }].
            map((item, i) =>
            <motion.div
              key={item.step}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}>

                <div className="text-7xl font-black gradient-text opacity-15 mb-2">{item.step}</div>
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <item.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="py-16 sm:py-28 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            className="text-center p-8 sm:p-14 rounded-2xl sm:rounded-3xl gradient-primary relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />
            <div className="relative">
              <GraduationCap className="w-10 h-10 text-primary-foreground/80 mx-auto mb-5" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-primary-foreground">Ready to decode algorithms?</h2>
              <p className="text-primary-foreground/80 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                Jump into the playground and start building intuition for data structures today. No sign-up, no paywall — just pure learning.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button asChild size="lg" variant="secondary" className="rounded-full px-10 text-base font-bold shadow-lg h-12">
                  <Link to="/playground">Start Learning Free <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
                <Button asChild size="lg" className="rounded-full px-10 text-base font-bold bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0 h-12">
                  <Link to="/visualizer">View Algorithms <Eye className="w-4 h-4 ml-2" /></Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">CodePilot</span> — Decode Algorithms, One Step at a Time
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/playground" className="hover:text-foreground transition-colors">Playground</Link>
            <Link to="/visualizer" className="hover:text-foreground transition-colors">Visualizer</Link>
          </div>
          <span>Built with React & TypeScript · 100% Free</span>
        </div>
      </footer>
    </div>);

}