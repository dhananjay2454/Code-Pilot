import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy, Flame, Clock, Play, Send, CheckCircle2, XCircle,
  Plus, Users, Key, ThumbsUp, Code2, Award, ChevronRight,
  Sparkles, AlertCircle, FileCode2, Copy, Check, RotateCcw,
  BookOpen, ShieldCheck, ChevronDown, Filter, Calendar,
  Ban, Trash2, UserMinus, UserCheck, Crown
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { arenaService, DEFAULT_TEACHER_CODE, SUPER_ADMIN_EMAIL } from '@/services/arenaService';
import { executeCode } from '@/lib/codeRunner';
import { Challenge, Submission, LeaderboardUser, RunResults } from '@/types/arena';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function Arena() {
  const { user, profile } = useAuth();

  // State
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userCode, setUserCode] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [timeComplexity, setTimeComplexity] = useState<string>('O(n)');
  const [spaceComplexity, setSpaceComplexity] = useState<string>('O(1)');

  // Test Runner state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [runResults, setRunResults] = useState<RunResults | null>(null);
  const [activeTestTab, setActiveTestTab] = useState<number>(0);

  // Admin state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showNewChallengeModal, setShowNewChallengeModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [teacherPasscode, setTeacherPasscode] = useState<string>('');
  const [newTeacherEmail, setNewTeacherEmail] = useState<string>('');
  const [adminsList, setAdminsList] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isCurrentUserBlocked, setIsCurrentUserBlocked] = useState<boolean>(false);

  // New Challenge Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [newCategory, setNewCategory] = useState('Arrays');
  const [newPoints, setNewPoints] = useState(50);
  const [newDescription, setNewDescription] = useState('');
  const [newStarterCode, setNewStarterCode] = useState(`function solution(input) {\n  // Your code here\n  \n}`);
  const [newFunctionName, setNewFunctionName] = useState('solution');
  const [newTestCasesStr, setNewTestCasesStr] = useState(`[\n  {"input": [[1, 2, 3]], "expected": 6, "label": "Sample 1"},\n  {"input": [[4, 5]], "expected": 9, "label": "Sample 2"}\n]`);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  // Copied code feedback
  const [copiedSubId, setCopiedSubId] = useState<string | null>(null);

  // Load initial data
  const loadData = () => {
    const chs = arenaService.getChallenges();
    setChallenges(chs);
    const active = arenaService.getActiveChallenge();
    if (active && (!selectedChallenge || !chs.some(c => c.id === selectedChallenge.id))) {
      setSelectedChallenge(active);
      setUserCode(active.starterCode);
    } else if (chs.length > 0 && !selectedChallenge) {
      setSelectedChallenge(chs[0]);
      setUserCode(chs[0].starterCode);
    }

    setLeaderboard(arenaService.getLeaderboard());
    setAdminsList(arenaService.getAdmins());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update submissions when challenge changes
  useEffect(() => {
    if (selectedChallenge) {
      setSubmissions(arenaService.getSubmissions(selectedChallenge.id));
      setUserCode(selectedChallenge.starterCode);
      setRunResults(null);
    }
  }, [selectedChallenge?.id]);

  // Check admin privileges and block status
  useEffect(() => {
    const adminStatus = arenaService.isUserAdmin(user?.email, user?.id);
    setIsAdmin(adminStatus);
    setIsSuperAdmin(arenaService.isSuperAdmin(user?.email));
    const identifier = user?.email || user?.id;
    if (identifier) {
      setIsCurrentUserBlocked(arenaService.isUserBlocked(identifier));
    }
    setBlockedUsers(arenaService.getBlockedUsers());
  }, [user]);

  // Live countdown timer for active challenge
  useEffect(() => {
    if (!selectedChallenge) return;

    const updateCountdown = () => {
      const difference = new Date(selectedChallenge.expiresAt).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [selectedChallenge?.expiresAt]);

  // Handle Code Tab key support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = userCode.substring(0, start) + '  ' + userCode.substring(end);
      setUserCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Run tests (visible cases)
  const handleRunTests = async () => {
    if (!selectedChallenge) return;
    setIsRunning(true);
    setRunResults(null);

    const results = await executeCode(userCode, selectedChallenge.functionName, selectedChallenge.testCases, true);
    setRunResults(results);
    setIsRunning(false);
    setActiveTestTab(0);

    if (results.allPassed) {
      toast.success(`All visible tests passed in ${results.runtimeMs}ms! Ready to submit!`);
    } else {
      toast.error(`Some tests failed. Check the test results below.`);
    }
  };

  // Submit Solution (All cases including hidden)
  const handleSubmit = async () => {
    const identifier = user?.email || user?.id;
    if (identifier && arenaService.isUserBlocked(identifier)) {
      toast.error('You have been blocked by a teacher and cannot submit solutions.');
      return;
    }
    if (!selectedChallenge) return;
    setIsSubmitting(true);

    const results = await executeCode(userCode, selectedChallenge.functionName, selectedChallenge.testCases, false);
    setRunResults(results);
    setIsSubmitting(false);
    setActiveTestTab(0);

    const currentUserName = profile?.display_name || user?.email?.split('@')[0] || 'Student ' + Math.floor(Math.random() * 900 + 100);
    const currentUserId = user?.id || 'guest-' + Date.now();

    if (results.allPassed) {
      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      const newSub = arenaService.addSubmission({
        challengeId: selectedChallenge.id,
        userId: currentUserId,
        userName: currentUserName,
        userAvatar: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUserName)}`,
        code: userCode,
        language: 'JavaScript',
        status: 'Accepted',
        passedTests: results.passedTests,
        totalTests: results.totalTests,
        runtimeMs: results.runtimeMs,
        timeComplexity,
        spaceComplexity,
        explanation: explanation || 'Clean solution passing all test cases!',
        pointsEarned: selectedChallenge.points,
      });

      setSubmissions(prev => [newSub, ...prev]);
      setLeaderboard(arenaService.getLeaderboard());

      toast.success(`🎉 Accepted! You earned +${selectedChallenge.points} points!`, {
        description: 'Your solution is now posted in the Community Solutions feed below!',
      });
    } else {
      arenaService.addSubmission({
        challengeId: selectedChallenge.id,
        userId: currentUserId,
        userName: currentUserName,
        code: userCode,
        language: 'JavaScript',
        status: 'Wrong Answer',
        passedTests: results.passedTests,
        totalTests: results.totalTests,
        runtimeMs: results.runtimeMs,
        timeComplexity,
        spaceComplexity,
        explanation,
        pointsEarned: 0,
      });

      toast.error(`Submission Failed (${results.passedTests}/${results.totalTests} tests passed)`, {
        description: 'Review the failing test cases and try again!',
      });
    }
  };

  // Upvote submission
  const handleUpvote = (subId: string) => {
    const currentUserId = user?.id || 'current-device-user';
    const updated = arenaService.toggleUpvoteSubmission(subId, currentUserId);
    if (updated) {
      setSubmissions(prev => prev.map(s => s.id === subId ? updated : s));
    }
  };

  // Copy code helper
  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSubId(id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedSubId(null), 2000);
  };

  // Block / Unblock student
  const handleBlockUser = (emailOrId: string, name: string) => {
    const blocked = arenaService.isUserBlocked(emailOrId);
    if (blocked) {
      arenaService.unblockUser(emailOrId);
      setBlockedUsers(arenaService.getBlockedUsers());
      toast.success(`Unblocked ${name}`);
    } else {
      const ok = arenaService.blockUser(emailOrId);
      if (ok) {
        setBlockedUsers(arenaService.getBlockedUsers());
        toast.success(`Blocked ${name} — they can no longer submit.`);
      } else {
        toast.error('Cannot block another admin or the platform owner.');
      }
    }
  };

  // Delete submission (admin)
  const handleDeleteSubmission = (subId: string) => {
    arenaService.deleteSubmission(subId);
    setSubmissions(prev => prev.filter(s => s.id !== subId));
    toast.success('Submission removed.');
  };

  // Remove teacher (admin)
  const handleRemoveTeacher = (email: string) => {
    const ok = arenaService.removeAdmin(email);
    if (ok) {
      setAdminsList(arenaService.getAdmins());
      toast.success(`Removed teacher access for ${email}.`);
    } else {
      toast.error('The platform owner cannot be removed.');
    }
  };

  // Redeem teacher code
  const handleRedeemTeacher = () => {
    const identifier = user?.email || user?.id || 'admin-local-user';
    const success = arenaService.redeemTeacherPasscode(teacherPasscode, identifier);
    if (success) {
      setIsAdmin(true);
      setAdminsList(arenaService.getAdmins());
      toast.success('Access Granted!', {
        description: 'You are now an authorized Teacher / Admin in CodePilot Arena.',
      });
      setShowAdminModal(false);
      setTeacherPasscode('');
    } else {
      toast.error('Invalid Teacher Code. Please verify with your department head.');
    }
  };

  // Add teacher by email
  const handleAddTeacherEmail = () => {
    if (!newTeacherEmail.trim()) return;
    const ok = arenaService.promoteToAdmin(newTeacherEmail.trim());
    if (ok) {
      setAdminsList(arenaService.getAdmins());
      setNewTeacherEmail('');
      toast.success(`Promoted ${newTeacherEmail} to Teacher / Admin!`);
    } else {
      toast.info('That email is already registered as an admin.');
    }
  };

  // Create Challenge submission
  const handleCreateChallenge = () => {
    try {
      const parsedTestCases = JSON.parse(newTestCasesStr);
      if (!Array.isArray(parsedTestCases) || parsedTestCases.length === 0) {
        throw new Error('Test cases must be a non-empty array of objects');
      }

      const created = arenaService.createChallenge({
        title: newTitle,
        difficulty: newDifficulty,
        category: newCategory,
        points: Number(newPoints),
        description: newDescription,
        examples: [
          {
            input: 'Sample input',
            output: 'Sample output',
            explanation: 'Sample explanation'
          }
        ],
        constraints: ['Follow time complexity constraints'],
        starterCode: newStarterCode,
        functionName: newFunctionName.trim(),
        testCases: parsedTestCases,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        createdBy: profile?.display_name || user?.email || 'Teacher Faculty',
      });

      loadData();
      setSelectedChallenge(created);
      setShowNewChallengeModal(false);
      toast.success(`Bi-Daily Challenge "${created.title}" published!`, {
        description: 'Students can now compete and earn points for the next 48 hours.',
      });
    } catch (err: any) {
      toast.error('Invalid Test Cases JSON: ' + (err?.message || 'Check syntax'));
    }
  };

  // Current user's rank on leaderboard
  const currentUserRank = useMemo(() => {
    const id = user?.id;
    if (!id) return null;
    return leaderboard.find(u => u.userId === id) || null;
  }, [leaderboard, user?.id]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-20 px-3 sm:px-6 pb-12 max-w-7xl mx-auto space-y-6">
        {/* Top Header Banner */}
        <div className="glass-card p-5 sm:p-6 relative overflow-hidden border border-border/60 shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  <Flame className="w-3.5 h-3.5 text-primary animate-pulse" /> Bi-Daily Arena
                </span>
                {isAdmin ? (
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3" /> Teacher Mode Active
                  </Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdminModal(true)}
                    className="h-6 text-[11px] text-muted-foreground hover:text-foreground gap-1 px-2 rounded-full"
                  >
                    <Key className="w-3 h-3" /> Teacher Login
                  </Button>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                CodePilot <span className="gradient-text">Arena</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Compete in bi-daily algorithm challenges, write automated solutions, earn points, and climb the student leaderboard!
              </p>
            </div>

            {/* Countdown & Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Bi-Daily Countdown */}
              <div className="bg-secondary/70 border border-border/70 rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 animate-spin-slow" />
                <div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Next Challenge in
                  </div>
                  <div className="font-mono text-sm font-bold text-foreground">
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                  </div>
                </div>
              </div>

              {/* Leaderboard Trigger Button */}
              <Button
                variant="outline"
                className="gap-2 shadow-sm rounded-xl font-medium"
                onClick={() => setShowLeaderboardModal(true)}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Leaderboard</span>
                {currentUserRank && (
                  <Badge variant="secondary" className="ml-1 text-[11px] font-mono">
                    #{currentUserRank.rank}
                  </Badge>
                )}
              </Button>

              {/* Admin Actions */}
              {isAdmin && (
                <>
                  <Button
                    onClick={() => setShowNewChallengeModal(true)}
                    className="gap-1.5 gradient-primary rounded-xl text-primary-foreground font-semibold shadow-md shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" /> Add Challenge
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAdminModal(true)}
                    className="rounded-xl"
                    title="Manage Teachers"
                  >
                    <Users className="w-4 h-4 text-foreground" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Challenge Selector Tabs (Active vs Archive) */}
          <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
                <Calendar className="w-3.5 h-3.5" /> Challenges:
              </span>
              {challenges.map((c) => {
                const isSelected = selectedChallenge?.id === c.id;
                return (
                  <Button
                    key={c.id}
                    variant={isSelected ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedChallenge(c)}
                    className={`rounded-lg text-xs gap-1.5 transition-all shrink-0 ${
                      isSelected ? 'shadow-md shadow-primary/25 font-bold' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    {c.active && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    {c.title}
                    <Badge variant={isSelected ? 'secondary' : 'outline'} className="text-[10px] ml-1 py-0 px-1 font-mono">
                      {c.difficulty}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {selectedChallenge && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Author:</span> {selectedChallenge.createdBy}
              </div>
            )}
          </div>
        </div>

        {/* Main Coding Workspace (Split Pane) */}
        {selectedChallenge && (
          <div className="grid lg:grid-cols-12 gap-5">
            {/* Left: Problem Details */}
            <div className="lg:col-span-5 glass-card overflow-hidden flex flex-col h-[650px] border border-border/60">
              {/* Challenge Title Bar */}
              <div className="p-4 border-b border-border/50 bg-secondary/30">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-mono text-muted-foreground font-medium uppercase tracking-wider">
                    {selectedChallenge.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      className={`text-[11px] font-semibold ${
                        selectedChallenge.difficulty === 'Easy'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : selectedChallenge.difficulty === 'Medium'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      }`}
                      variant="outline"
                    >
                      {selectedChallenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] font-mono font-semibold bg-primary/10 text-primary border-primary/30">
                      +{selectedChallenge.points} pts
                    </Badge>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  {selectedChallenge.title}
                </h2>
              </div>

              {/* Description Content */}
              <ScrollArea className="flex-1 p-5">
                <div className="space-y-4 text-sm leading-relaxed">
                  <div className="whitespace-pre-line text-foreground/90 font-sans">
                    {selectedChallenge.description}
                  </div>

                  {/* Examples */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <FileCode2 className="w-3.5 h-3.5" /> Examples
                    </h4>
                    {selectedChallenge.examples.map((ex, i) => (
                      <div key={i} className="bg-secondary/40 border border-border/60 rounded-xl p-3.5 space-y-1.5 font-mono text-xs">
                        <div className="font-semibold text-muted-foreground">Example {i + 1}:</div>
                        <div>
                          <span className="text-primary font-bold">Input: </span>
                          <span className="text-foreground">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-emerald-500 font-bold">Output: </span>
                          <span className="text-foreground">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="text-[11px] text-muted-foreground font-sans pt-1 border-t border-border/40">
                            <span className="font-semibold">Explanation: </span>{ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  {selectedChallenge.constraints?.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Constraints
                      </h4>
                      <ul className="list-disc list-inside space-y-1 font-mono text-xs text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border/40">
                        {selectedChallenge.constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right: Interactive Code Editor & Test Runner (Option B) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="glass-card overflow-hidden flex flex-col h-[650px] border border-border/60">
                {/* Editor Header Bar */}
                <div className="px-4 py-2.5 border-b border-border/50 bg-secondary/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold font-mono text-foreground">
                      JavaScript (ES6+)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserCode(selectedChallenge.starterCode)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Code
                    </Button>
                  </div>
                </div>

                {/* Code Textarea / Editor */}
                <div className="flex-1 relative flex flex-col bg-[#0d1117] text-white">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    className="w-full flex-1 p-4 bg-transparent text-emerald-400 font-mono text-xs sm:text-sm resize-none focus:outline-none leading-relaxed selection:bg-primary/30"
                    placeholder="// Write your algorithm here..."
                  />

                  {/* Complexity & Approach Note Strip */}
                  <div className="bg-[#161b22] border-t border-border/40 p-2.5 flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>Time Complexity:</span>
                      <Input
                        value={timeComplexity}
                        onChange={(e) => setTimeComplexity(e.target.value)}
                        className="h-6 w-20 text-[11px] font-mono bg-background/50 border-border/60 py-0"
                        placeholder="e.g. O(n)"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>Space Complexity:</span>
                      <Input
                        value={spaceComplexity}
                        onChange={(e) => setSpaceComplexity(e.target.value)}
                        className="h-6 w-20 text-[11px] font-mono bg-background/50 border-border/60 py-0"
                        placeholder="e.g. O(1)"
                      />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <Input
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        className="h-6 text-[11px] bg-background/50 border-border/60 py-0"
                        placeholder="Brief approach explanation (optional)..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons & Results Panel */}
                <div className="border-t border-border/50 bg-secondary/30 p-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>Automated Test Runner</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRunTests}
                        disabled={isRunning || isSubmitting}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <Play className="w-3.5 h-3.5 text-primary" />
                        {isRunning ? 'Running...' : 'Run Tests'}
                      </Button>

                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isRunning || isSubmitting}
                        className="gap-1.5 text-xs font-semibold gradient-primary shadow-md shadow-primary/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
                      </Button>
                    </div>
                  </div>

                  {/* Run Results Console */}
                  {runResults && (
                    <div className="bg-background/80 border border-border/70 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {runResults.allPassed ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted ({runResults.passedTests}/{runResults.totalTests} Passed)
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 text-xs font-semibold">
                              <XCircle className="w-3.5 h-3.5" /> {runResults.error ? 'Runtime Error' : `Wrong Answer (${runResults.passedTests}/${runResults.totalTests} Passed)`}
                            </Badge>
                          )}
                          <span className="text-[11px] font-mono text-muted-foreground">
                            Runtime: {runResults.runtimeMs} ms
                          </span>
                        </div>
                      </div>

                      {/* Test Case Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                        {runResults.results.map((r, idx) => (
                          <Button
                            key={idx}
                            variant={activeTestTab === idx ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTestTab(idx)}
                            className={`h-6 text-[10px] font-mono gap-1 px-2 ${
                              r.passed
                                ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                                : 'border-rose-500/40 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {r.passed ? '✓' : '✕'} Case {idx + 1}
                            {r.isHidden && <span className="text-[9px] opacity-70">(Hidden)</span>}
                          </Button>
                        ))}
                      </div>

                      {/* Selected Test Case Details */}
                      {runResults.results[activeTestTab] && (
                        <div className="bg-secondary/40 p-2.5 rounded-lg font-mono text-xs space-y-1 border border-border/40">
                          <div>
                            <span className="text-muted-foreground">Input: </span>
                            <span className="text-foreground">{runResults.results[activeTestTab].inputStr}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expected: </span>
                            <span className="text-emerald-500 font-semibold">{runResults.results[activeTestTab].expectedStr}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actual: </span>
                            <span className={runResults.results[activeTestTab].passed ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>
                              {runResults.results[activeTestTab].actualStr}
                            </span>
                          </div>
                          {runResults.results[activeTestTab].error && (
                            <div className="text-rose-400 text-[11px] mt-1 pt-1 border-t border-border/40">
                              Error: {runResults.results[activeTestTab].error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Solutions & Results Feed (Below the Question) */}
        <section className="glass-card p-5 sm:p-6 border border-border/60 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Community Solutions & Discussions
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Students earn points and publish their algorithms below. Review approaches, learn optimizations, and upvote!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {submissions.length} Submissions
              </Badge>
            </div>
          </div>

          {/* Solutions Feed List */}
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Code2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Be the first student to solve this challenge and post your solution!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {submissions.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
                >
                  <div className="space-y-2.5">
                    {/* Student Info & Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={sub.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sub.userName)}`}
                          alt={sub.userName}
                          className="w-8 h-8 rounded-full border border-border bg-background"
                        />
                        <div>
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            {sub.userName}
                            {sub.status === 'Accepted' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {sub.timeComplexity && (
                          <Badge variant="outline" className="text-[10px] font-mono py-0 text-primary border-primary/30">
                            Time: {sub.timeComplexity}
                          </Badge>
                        )}
                        {sub.spaceComplexity && (
                          <Badge variant="outline" className="text-[10px] font-mono py-0 text-emerald-500 border-emerald-500/30">
                            Space: {sub.spaceComplexity}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Student's explanation */}
                    {sub.explanation && (
                      <p className="text-xs text-foreground/80 bg-background/50 p-2.5 rounded-lg border border-border/40 italic">
                        "{sub.explanation}"
                      </p>
                    )}

                    {/* Syntax Highlighted Code Box */}
                    <div className="relative group rounded-lg overflow-hidden border border-border/50 bg-[#0d1117]">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyCode(sub.id, sub.code)}
                          className="h-6 w-6 rounded bg-secondary/80 text-foreground"
                          title="Copy Code"
                        >
                          {copiedSubId === sub.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <pre className="p-3 text-xs font-mono text-emerald-400 overflow-x-auto max-h-40 leading-relaxed">
                        <code>{sub.code}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Card Footer: Points, Upvotes & Admin Controls */}
                  <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[11px]">
                      +{sub.pointsEarned} Points Awarded
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpvote(sub.id)}
                        className="h-7 text-xs gap-1.5 hover:text-primary transition-colors px-2 rounded-full"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{sub.upvotes}</span>
                      </Button>

                      {/* Admin-only actions */}
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBlockUser(sub.userId, sub.userName)}
                            className={`h-7 text-xs gap-1 px-2 rounded-full ${
                              blockedUsers.includes(sub.userId)
                                ? 'text-emerald-500 hover:text-emerald-400'
                                : 'text-amber-500 hover:text-amber-400'
                            }`}
                            title={blockedUsers.includes(sub.userId) ? 'Unblock student' : 'Block student'}
                          >
                            {blockedUsers.includes(sub.userId)
                              ? <><UserCheck className="w-3.5 h-3.5" /><span>Unblock</span></>
                              : <><Ban className="w-3.5 h-3.5" /><span>Block</span></>}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="h-7 text-xs gap-1 px-2 rounded-full text-rose-500 hover:text-rose-400"
                            title="Delete submission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Leaderboard Modal */}
      <Dialog open={showLeaderboardModal} onOpenChange={setShowLeaderboardModal}>
        <DialogContent className="max-w-md glass-card border-border/80">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Trophy className="w-5 h-5 text-amber-500" /> Student Arena Leaderboard
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Students ranked by points earned solving bi-daily algorithmic challenges.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[420px] pr-2 mt-2">
            <div className="space-y-2">
              {leaderboard.map((student) => {
                const isTop3 = student.rank <= 3;
                return (
                  <div
                    key={student.userId}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      student.rank === 1
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : student.rank === 2
                        ? 'bg-slate-400/10 border-slate-400/30'
                        : student.rank === 3
                        ? 'bg-amber-700/10 border-amber-700/30'
                        : 'bg-secondary/40 border-border/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center font-bold font-mono text-sm">
                        {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : `#${student.rank}`}
                      </div>
                      <img
                        src={student.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(student.userName)}`}
                        alt={student.userName}
                        className="w-9 h-9 rounded-full border border-border bg-background"
                      />
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          {student.userName}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <span>{student.solvedCount} solved</span>
                          <span>•</span>
                          <span className="flex items-center text-amber-500 font-medium">
                            <Flame className="w-2.5 h-2.5 mr-0.5" /> {student.streak} streak
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-extrabold text-primary">
                        {student.points} <span className="text-[10px] font-normal text-muted-foreground">pts</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 font-semibold">
                        {student.badge}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Teacher / Admin Passcode & Management Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="max-w-md glass-card border-border/80">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Faculty & Teacher Administration
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Teachers can create challenges every 2 days and designate other faculty as admins.
            </DialogDescription>
          </DialogHeader>

          {!isAdmin ? (
            <div className="space-y-4 py-2">
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 text-xs space-y-1">
                <span className="font-semibold text-foreground">Teacher Authentication:</span>
                <p className="text-muted-foreground">
                  Enter your institution's teacher passcode to unlock faculty permissions.
                </p>
                <div className="mt-1 text-[11px] text-primary">
                  (Default testing code: <span className="font-mono font-bold">{DEFAULT_TEACHER_CODE}</span>)
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Enter Teacher Code</Label>
                <Input
                  type="password"
                  placeholder="e.g. TEACHER2026"
                  value={teacherPasscode}
                  onChange={(e) => setTeacherPasscode(e.target.value)}
                  className="font-mono"
                />
              </div>

              <Button onClick={handleRedeemTeacher} className="w-full gradient-primary font-semibold">
                Verify & Unlock Teacher Mode
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Promote Another Teacher by Email</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="teacher@school.edu"
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    className="text-xs"
                  />
                  <Button onClick={handleAddTeacherEmail} size="sm" className="font-semibold shrink-0">
                    Add Teacher
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Active Teachers / Admins</Label>
                <div className="bg-secondary/30 rounded-xl p-2.5 max-h-36 overflow-y-auto space-y-1 border border-border/40 text-xs font-mono">
                  {adminsList.map((adminEmail, i) => {
                    const isPermanent = adminEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                    return (
                      <div key={i} className="flex items-center justify-between text-muted-foreground py-0.5">
                        <span className="flex items-center gap-1">
                          {isPermanent && <Crown className="w-3 h-3 text-amber-500" title="Platform Owner" />}
                          {adminEmail}
                        </span>
                        {!isPermanent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTeacher(adminEmail)}
                            className="h-5 text-[10px] gap-0.5 px-1.5 text-rose-500 hover:text-rose-400 rounded"
                            title="Remove teacher access"
                          >
                            <UserMinus className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blocked Students List */}
              {blockedUsers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-amber-600 dark:text-amber-400">Blocked Students</Label>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-2.5 max-h-28 overflow-y-auto space-y-1 text-xs font-mono">
                    {blockedUsers.map((uid, i) => (
                      <div key={i} className="flex items-center justify-between text-amber-600 dark:text-amber-400 py-0.5">
                        <span className="flex items-center gap-1">
                          <Ban className="w-3 h-3" />{uid}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBlockUser(uid, uid)}
                          className="h-5 text-[10px] gap-0.5 px-1.5 text-emerald-500 hover:text-emerald-400 rounded"
                          title="Unblock"
                        >
                          <UserCheck className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Faculty Passcode: </span>
                <span className="font-mono font-bold text-primary">{arenaService.getTeacherPasscode()}</span>
                <p className="text-[11px] mt-0.5">Share this code with fellow teachers for instant access.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Post New Challenge Modal (Admins / Teachers) */}
      <Dialog open={showNewChallengeModal} onOpenChange={setShowNewChallengeModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto glass-card border-border/80">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Plus className="w-5 h-5 text-primary" /> Post New Bi-Daily Challenge
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the problem statement, points, starter code, and automated test cases. Active for 48 hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Challenge Title</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Reverse Linked List"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Difficulty</Label>
                <select
                  value={newDifficulty}
                  onChange={(e: any) => setNewDifficulty(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                >
                  <option value="Easy">Easy (50 pts)</option>
                  <option value="Medium">Medium (100 pts)</option>
                  <option value="Hard">Hard (150 pts)</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Category / Topic</Label>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Dynamic Programming, Trees"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Function Name to Test</Label>
                <Input
                  value={newFunctionName}
                  onChange={(e) => setNewFunctionName(e.target.value)}
                  placeholder="e.g. reverseList"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Problem Description</Label>
              <Textarea
                rows={4}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Explain the problem statement clearly..."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Starter Code Template</Label>
              <Textarea
                rows={4}
                value={newStarterCode}
                onChange={(e) => setNewStarterCode(e.target.value)}
                className="font-mono text-xs bg-[#0d1117] text-emerald-400"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Automated Test Cases (JSON format)</Label>
              <Textarea
                rows={4}
                value={newTestCasesStr}
                onChange={(e) => setNewTestCasesStr(e.target.value)}
                className="font-mono text-xs bg-[#0d1117] text-white"
                placeholder='[{"input": [[1, 2]], "expected": 3, "label": "Case 1"}]'
              />
              <span className="text-[10px] text-muted-foreground">
                Each object must have `input` (array of arguments) and `expected` (expected return value).
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChallengeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChallenge} className="gradient-primary font-semibold">
              Publish Challenge (48-Hour Window)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
