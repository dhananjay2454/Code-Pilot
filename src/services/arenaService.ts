import { Challenge, Submission, LeaderboardUser } from '@/types/arena';

const STORAGE_KEYS = {
  CHALLENGES: 'codepilot_arena_challenges',
  SUBMISSIONS: 'codepilot_arena_submissions',
  LEADERBOARD: 'codepilot_arena_leaderboard',
  ADMINS: 'codepilot_arena_admins',
  BLOCKED: 'codepilot_arena_blocked',
  TEACHER_CODE: 'codepilot_arena_teacher_code',
};

export const DEFAULT_TEACHER_CODE = 'TEACHER2026';

/** Permanent owner — cannot be removed or blocked by anyone */
export const SUPER_ADMIN_EMAIL = 'gauravmen2007@gmail.com';

export const arenaService = {
  // ─── Challenges ────────────────────────────────────────────────────────────
  getChallenges(): Challenge[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  },

  getActiveChallenge(): Challenge | null {
    const challenges = this.getChallenges();
    const now = new Date();
    const active = challenges.find(c => c.active && new Date(c.expiresAt) > now);
    return active || challenges[0] || null;
  },

  getChallengeById(id: string): Challenge | null {
    return this.getChallenges().find(c => c.id === id) || null;
  },

  createChallenge(challengeData: Omit<Challenge, 'id' | 'createdAt' | 'active'>): Challenge {
    const challenges = this.getChallenges();
    const newChallenge: Challenge = {
      ...challengeData,
      id: `challenge-${Date.now()}`,
      createdAt: new Date().toISOString(),
      active: true,
    };
    const updated = [newChallenge, ...challenges.map(c => ({ ...c, active: false }))];
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
    return newChallenge;
  },

  deleteChallenge(id: string): void {
    const challenges = this.getChallenges().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
  },

  // ─── Submissions ────────────────────────────────────────────────────────────
  getSubmissions(challengeId?: string): Submission[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    let list: Submission[] = [];
    try { list = raw ? JSON.parse(raw) : []; } catch { list = []; }
    return challengeId ? list.filter(s => s.challengeId === challengeId) : list;
  },

  addSubmission(sub: Omit<Submission, 'id' | 'submittedAt' | 'upvotes' | 'upvotedBy'>): Submission {
    const submissions = this.getSubmissions();
    const newSub: Submission = {
      ...sub,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
    };
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([newSub, ...submissions]));
    if (newSub.status === 'Accepted' && newSub.pointsEarned > 0) {
      this.updateUserPoints(newSub.userId, newSub.userName, newSub.userAvatar, newSub.pointsEarned);
    }
    return newSub;
  },

  /** Admin can delete any student submission */
  deleteSubmission(subId: string): void {
    const submissions = this.getSubmissions().filter(s => s.id !== subId);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  },

  toggleUpvoteSubmission(subId: string, currentUserId: string): Submission | null {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex(s => s.id === subId);
    if (index === -1) return null;
    const sub = submissions[index];
    const upvotedBy = sub.upvotedBy || [];
    const hasUpvoted = upvotedBy.includes(currentUserId);
    if (hasUpvoted) {
      sub.upvotes = Math.max(0, sub.upvotes - 1);
      sub.upvotedBy = upvotedBy.filter(id => id !== currentUserId);
    } else {
      sub.upvotes += 1;
      sub.upvotedBy = [...upvotedBy, currentUserId];
    }
    submissions[index] = sub;
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    return sub;
  },

  // ─── Leaderboard ───────────────────────────────────────────────────────────
  getLeaderboard(): LeaderboardUser[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    let list: LeaderboardUser[] = [];
    try { list = raw ? JSON.parse(raw) : []; } catch { list = []; }
    return list.sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));
  },

  updateUserPoints(userId: string, userName: string, avatarUrl: string | undefined, pointsToAdd: number): void {
    const leaderboard = this.getLeaderboard();
    const existingIndex = leaderboard.findIndex(u => u.userId === userId);
    if (existingIndex !== -1) {
      const u = leaderboard[existingIndex];
      u.points += pointsToAdd;
      u.solvedCount += 1;
      u.streak = (u.streak || 0) + 1;
      u.badge = this.calculateBadge(u.points);
      leaderboard[existingIndex] = u;
    } else {
      leaderboard.push({
        userId,
        userName: userName || 'Anonymous Student',
        userAvatar: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName || userId)}`,
        points: pointsToAdd,
        rank: leaderboard.length + 1,
        solvedCount: 1,
        streak: 1,
        badge: this.calculateBadge(pointsToAdd),
      });
    }
    const updated = leaderboard.sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
  },

  /** Remove a student from the leaderboard (admin action) */
  removeFromLeaderboard(userId: string): void {
    const updated = this.getLeaderboard()
      .filter(u => u.userId !== userId)
      .map((u, i) => ({ ...u, rank: i + 1 }));
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
  },

  calculateBadge(points: number): LeaderboardUser['badge'] {
    if (points >= 500) return 'Grandmaster';
    if (points >= 350) return 'Master';
    if (points >= 250) return 'Diamond';
    if (points >= 150) return 'Gold';
    if (points >= 80) return 'Silver';
    return 'Bronze';
  },

  // ─── Blocked Students ──────────────────────────────────────────────────────
  getBlockedUsers(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKED);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  },

  /**
   * Block a student by their email or userId.
   * Blocked students cannot submit solutions.
   * Super-admin and other admins cannot be blocked.
   */
  blockUser(emailOrId: string): boolean {
    const normalized = emailOrId.trim().toLowerCase();
    // Cannot block the owner or other admins
    if (normalized === SUPER_ADMIN_EMAIL.toLowerCase()) return false;
    if (this.isUserAdmin(normalized)) return false;

    const blocked = this.getBlockedUsers();
    if (blocked.includes(normalized)) return false; // already blocked
    blocked.push(normalized);
    localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(blocked));
    return true;
  },

  /** Unblock a previously blocked student */
  unblockUser(emailOrId: string): void {
    const normalized = emailOrId.trim().toLowerCase();
    const blocked = this.getBlockedUsers().filter(b => b !== normalized);
    localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(blocked));
  },

  isUserBlocked(emailOrId?: string | null): boolean {
    if (!emailOrId) return false;
    return this.getBlockedUsers().includes(emailOrId.trim().toLowerCase());
  },

  // ─── Admin / Teacher Management ────────────────────────────────────────────
  getAdmins(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMINS);
    if (!raw) return [SUPER_ADMIN_EMAIL.toLowerCase()];
    try {
      const list: string[] = JSON.parse(raw);
      // Always ensure the super-admin is present
      if (!list.includes(SUPER_ADMIN_EMAIL.toLowerCase())) {
        list.unshift(SUPER_ADMIN_EMAIL.toLowerCase());
        localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
      }
      return list;
    } catch {
      return [SUPER_ADMIN_EMAIL.toLowerCase()];
    }
  },

  isSuperAdmin(emailOrId?: string | null): boolean {
    if (!emailOrId) return false;
    return emailOrId.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  },

  promoteToAdmin(emailOrId: string): boolean {
    const admins = this.getAdmins();
    const normalized = emailOrId.trim().toLowerCase();
    // Unblock the user if they were blocked when being promoted to admin
    this.unblockUser(normalized);
    if (!admins.includes(normalized)) {
      admins.push(normalized);
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
      return true;
    }
    return false;
  },

  /**
   * Remove a teacher/admin. The permanent super-admin cannot be removed.
   */
  removeAdmin(emailOrId: string): boolean {
    const normalized = emailOrId.trim().toLowerCase();
    if (normalized === SUPER_ADMIN_EMAIL.toLowerCase()) return false; // immovable
    const admins = this.getAdmins().filter(a => a !== normalized);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
    return true;
  },

  getTeacherPasscode(): string {
    return localStorage.getItem(STORAGE_KEYS.TEACHER_CODE) || DEFAULT_TEACHER_CODE;
  },

  setTeacherPasscode(code: string): void {
    localStorage.setItem(STORAGE_KEYS.TEACHER_CODE, code.trim());
  },

  redeemTeacherPasscode(code: string, userIdentifier: string): boolean {
    const valid = this.getTeacherPasscode();
    if (code.trim() === valid) {
      this.promoteToAdmin(userIdentifier);
      return true;
    }
    return false;
  },

  isUserAdmin(userEmail?: string | null, userId?: string | null): boolean {
    if (!userEmail && !userId) return false;
    // Super-admin is always an admin regardless of storage
    if (userEmail && this.isSuperAdmin(userEmail)) return true;
    if (userId && this.isSuperAdmin(userId)) return true;
    const admins = this.getAdmins();
    if (userEmail && admins.includes(userEmail.toLowerCase())) return true;
    if (userId && admins.includes(userId.toLowerCase())) return true;
    return false;
  },
};
