export interface TestCase {
  id?: string;
  input: any[];
  expected: any;
  label?: string;
  isHidden?: boolean;
}

export interface ChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  points: number;
  description: string;
  examples: ChallengeExample[];
  constraints: string[];
  starterCode: string;
  functionName: string;
  testCases: TestCase[];
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  active: boolean;
}

export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  code: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded';
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  timeComplexity?: string;
  spaceComplexity?: string;
  explanation?: string;
  pointsEarned: number;
  submittedAt: string;
  upvotes: number;
  upvotedBy?: string[];
}

export interface LeaderboardUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  rank: number;
  solvedCount: number;
  streak: number;
  badge: 'Grandmaster' | 'Master' | 'Diamond' | 'Gold' | 'Silver' | 'Bronze';
  isTeacher?: boolean;
}

export interface TestResult {
  testIndex: number;
  passed: boolean;
  inputStr: string;
  expectedStr: string;
  actualStr: string;
  error?: string;
  durationMs: number;
  isHidden?: boolean;
}

export interface RunResults {
  allPassed: boolean;
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  results: TestResult[];
  error?: string;
}
