import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Code2, Mail, Lock, ArrowRight, Eye, EyeOff,
  Layers, Play, Zap, Users, Brain, Shield, Trophy, Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const stats = [
  { icon: Layers, value: '6', label: 'Structures' },
  { icon: Play, value: '8', label: 'Algorithms' },
  { icon: Zap, value: '22+', label: 'Operations' },
  { icon: Users, value: '10K+', label: 'Learners' },
];

const features = [
  { icon: Brain, label: 'AI-Powered Analysis' },
  { icon: Target, label: 'Interview Prep' },
  { icon: Shield, label: 'Secure & Private' },
  { icon: Trophy, label: 'Progress Tracking' },
];

const codeSnippet = [
  { num: 1, indent: 0, kw: 'function', rest: ' mergeSort(arr) {' },
  { num: 2, indent: 1, kw: 'if', rest: ' (arr.length <= 1) return arr;' },
  { num: 3, indent: 1, kw: 'const', rest: ' mid = Math.floor(arr.length / 2);' },
  { num: 4, indent: 1, kw: 'const', rest: ' left = mergeSort(arr.slice(0, mid));' },
  { num: 5, indent: 1, kw: 'const', rest: ' right = mergeSort(arr.slice(mid));' },
  { num: 6, indent: 1, kw: 'return', rest: ' merge(left, right);' },
  { num: 7, indent: 0, kw: '', rest: '}' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 gradient-warm opacity-60" />
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[180px]" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      <div className="absolute inset-0 opacity-[0.012]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />

      {/* ── LEFT: Info Panel ── */}
      <div className="hidden lg:flex flex-1 items-center justify-center px-16 relative">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[480px] space-y-10"
        >
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Code2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-foreground block leading-none">
                  Code<span className="gradient-text">Pilot</span>
                </span>
                <span className="text-[11px] text-muted-foreground">Master DSA Visually</span>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-black text-foreground leading-[1.15] tracking-tight">
                Welcome back,
                <br />
                <span className="gradient-text">keep learning.</span>
              </h2>
              <p className="text-muted-foreground text-[15px] leading-relaxed mt-3 max-w-sm">
                Pick up where you left off with interactive visualizations and AI-powered code analysis.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="p-4 rounded-2xl bg-card/70 border border-border/30 text-center backdrop-blur-sm hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
              >
                <s.icon className="w-4 h-4 text-primary mx-auto mb-2" />
                <div className="text-lg font-extrabold gradient-text font-mono leading-none">{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Code Preview */}
          <motion.div
            className="rounded-2xl bg-card/80 border border-border/30 p-5 shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground bg-secondary/60 px-2.5 py-0.5 rounded-full">merge_sort.js</span>
            </div>
            <div className="space-y-0.5 font-mono text-[11px] leading-relaxed">
              {codeSnippet.map((line) => (
                <div key={line.num} className="flex" style={{ paddingLeft: line.indent * 20 }}>
                  <span className="text-muted-foreground/25 w-5 text-right mr-3 select-none text-[10px]">{line.num}</span>
                  {line.kw && <span className="text-primary font-semibold">{line.kw}</span>}
                  <span className="text-muted-foreground">{line.rest}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-mono text-primary font-semibold">O(n log n)</span>
              </div>
              <div className="flex gap-1.5">
                <span className="text-[9px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">divide & conquer</span>
                <span className="text-[9px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">recursive</span>
              </div>
            </div>
          </motion.div>

          {/* Features list */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                className="flex items-center gap-2.5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.07 }}
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[13px] text-muted-foreground font-medium">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-xl text-foreground">
              Code<span className="gradient-text">Pilot</span>
            </span>
          </div>

          <div className="glass-card p-8 lg:p-10">
            {/* Form Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-[11px] font-semibold mb-4 border border-primary/15">
                <Shield className="w-3 h-3" /> Secure sign-in
              </div>
              <h1 className="text-2xl lg:text-[28px] font-black text-foreground tracking-tight leading-tight">
                Sign in to your account
              </h1>
              <p className="text-sm text-muted-foreground mt-2">Continue your learning journey</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Email
                </Label>
                <div className={`rounded-xl transition-shadow duration-200 ${focused === 'email' ? 'ring-2 ring-primary/20' : ''}`}>
                  <Input
                    id="email" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    className="h-12 bg-background/50 border-border/40 rounded-xl text-sm focus-visible:ring-primary/30"
                    required maxLength={255}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" /> Password
                </Label>
                <div className={`relative rounded-xl transition-shadow duration-200 ${focused === 'password' ? 'ring-2 ring-primary/20' : ''}`}>
                  <Input
                    id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                    className="h-12 pr-11 bg-background/50 border-border/40 rounded-xl text-sm focus-visible:ring-primary/30"
                    required minLength={6} maxLength={128}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary/50">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl text-[15px] font-bold gap-2 shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 mt-1">
                {loading ? (
                  <motion.div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </form>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 pt-6 border-t border-border/30">
              {['Free forever', 'No credit card', 'AI-powered'].map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium px-2.5 py-1 rounded-full bg-secondary/40 border border-border/20">
                  <span className="w-1 h-1 rounded-full bg-primary" /> {tag}
                </span>
              ))}
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-bold hover:underline underline-offset-4">
                Create one free →
              </Link>
            </p>
          </div>

          {/* Mobile stats */}
          <div className="lg:hidden grid grid-cols-4 gap-2 mt-5">
            {stats.map(s => (
              <div key={s.label} className="p-2.5 rounded-xl bg-card/60 border border-border/30 text-center backdrop-blur-sm">
                <div className="text-sm font-extrabold gradient-text font-mono">{s.value}</div>
                <div className="text-[9px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
