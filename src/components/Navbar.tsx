import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/contexts/AuthContext';
import { Code2, Home, Play, Eye, LogIn, LogOut, User, Brain, Menu, X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/playground', label: 'Playground', icon: Play },
  { path: '/visualizer', label: 'Visualizer', icon: Eye },
  { path: '/arena', label: 'Arena', icon: Trophy },
  { path: '/reverse-engineer', label: 'AI Mode', icon: Brain },
];

export default function Navbar() {
  const location = useLocation();
  const { getOverallProgress } = useProgress();
  const { user, signOut, profile } = useAuth();
  const progress = getOverallProgress();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-xl text-foreground tracking-tight">
            Code<span className="gradient-text">Pilot</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map(link => (
            <Button key={link.path} asChild variant={location.pathname === link.path ? 'default' : 'ghost'} size="sm" className="rounded-full gap-1.5 text-sm">
              <Link to={link.path}><link.icon className="w-3.5 h-3.5" /> {link.label}</Link>
            </Button>
          ))}

          {user && (
            <div className="ml-2 flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5" title={`${progress}% explored`}>
              <svg width="24" height="24" className="-rotate-90">
                <circle cx="12" cy="12" r="9" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <circle cx="12" cy="12" r="9" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5"
                  strokeDasharray={2 * Math.PI * 9} strokeDashoffset={2 * Math.PI * 9 - progress / 100 * 2 * Math.PI * 9}
                  strokeLinecap="round" className="transition-all duration-500" />
              </svg>
              <span className="text-xs font-bold font-mono text-foreground">{progress}%</span>
            </div>
          )}

          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-secondary/60 rounded-full px-3 py-1.5 border border-border/50">
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground max-w-[100px] truncate">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full gap-1.5 text-sm" onClick={signOut}>
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
            </div>
          ) : (
            <Button asChild variant={location.pathname === '/login' ? 'default' : 'ghost'} size="sm" className="rounded-full gap-1.5 text-sm ml-2">
              <Link to="/login"><LogIn className="w-3.5 h-3.5" /> Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-border/50 pt-2 mt-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {profile?.display_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{progress}% progress</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
