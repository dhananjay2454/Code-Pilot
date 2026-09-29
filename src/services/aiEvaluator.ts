import { supabase } from '@/integrations/supabase/client';

export interface Evaluation {
  codeUnderstanding: {
    score: number;
    problemStatement: { correct: boolean; feedback: string };
    inputOutput: { correct: boolean; feedback: string };
    algorithmPurpose: { correct: boolean; feedback: string };
  };
  complexityAnalysis: {
    score: number;
    timeComplexity: { correct: boolean; expected: string; feedback: string };
    spaceComplexity: { correct: boolean; expected: string; feedback: string };
    hint: string | null;
  };
  edgeCaseDetection: {
    score: number;
    identified: string[];
    missed: string[];
    feedback: string;
  };
  socraticQuestions: string[];
  optimizationChallenge: {
    challenge: string;
    hint: string;
  };
  overallScore: number;
  confidenceBreakdown: {
    understanding: number;
    complexityAccuracy: number;
    edgeCaseAwareness: number;
    overall: number;
  };
  feedback: string;
}

export interface AnalysisInput {
  problemStatement: string;
  inputOutput: string;
  algorithmPurpose: string;
  timeComplexity: string;
  spaceComplexity: string;
  edgeCases: string;
}

export type AiProvider = 'auto' | 'groq' | 'gemini' | 'supabase' | 'offline';

export interface AiConfig {
  provider: AiProvider;
  groqApiKey: string;
  groqModel: string;
  geminiApiKey: string;
  geminiModel: string;
  autoFallback: boolean;
}

const STORAGE_KEY = 'codespark_ai_config';

export function getStoredAiConfig(): AiConfig {
  const envGroqKey = import.meta.env.VITE_GROQ_API_KEY || '';
  const envGeminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  const defaults: AiConfig = {
    provider: (envGroqKey ? 'groq' : envGeminiKey ? 'gemini' : 'auto'),
    groqApiKey: envGroqKey,
    groqModel: 'llama-3.3-70b-versatile',
    geminiApiKey: envGeminiKey,
    geminiModel: 'gemini-2.0-flash',
    autoFallback: true,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      groqApiKey: parsed.groqApiKey || envGroqKey,
      geminiApiKey: parsed.geminiApiKey || envGeminiKey,
    };
  } catch {
    return defaults;
  }
}

export function saveAiConfig(config: Partial<AiConfig>): AiConfig {
  const current = getStoredAiConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save AI config to localStorage', err);
  }
  return updated;
}

const SYSTEM_PROMPT = `You are an expert computer science tutor specializing in reverse engineering code understanding. Your role is to evaluate a student's analysis of a given code snippet/algorithm.

You will receive:
1. A code snippet
2. The student's analysis containing:
   - Problem statement
   - Input and output
   - Algorithm purpose
   - Time complexity
   - Space complexity
   - Edge cases

Return ONLY JSON in this exact structure:

{
  "codeUnderstanding": {
    "score": <0-100>,
    "problemStatement": { "correct": <boolean>, "feedback": "<string>" },
    "inputOutput": { "correct": <boolean>, "feedback": "<string>" },
    "algorithmPurpose": { "correct": <boolean>, "feedback": "<string>" }
  },
  "complexityAnalysis": {
    "score": <0-100>,
    "timeComplexity": { "correct": <boolean>, "expected": "<string>", "feedback": "<string>" },
    "spaceComplexity": { "correct": <boolean>, "expected": "<string>", "feedback": "<string>" },
    "hint": "<string if wrong, null if correct>"
  },
  "edgeCaseDetection": {
    "score": <0-100>,
    "identified": ["<list>"],
    "missed": ["<list>"],
    "feedback": "<string>"
  },
  "socraticQuestions": ["<question1>", "<question2>"],
  "optimizationChallenge": {
    "challenge": "<string>",
    "hint": "<string>"
  },
  "overallScore": <0-100>,
  "confidenceBreakdown": {
    "understanding": <0-100>,
    "complexityAccuracy": <0-100>,
    "edgeCaseAwareness": <0-100>,
    "overall": <0-100>
  },
  "feedback": "<2-3 sentences>"
}

Rules:
- Be supportive but rigorous
- Never reveal full solutions
- Give hints only
- Always ask 2 Socratic questions
- Score fairly
- Return ONLY valid raw JSON with no markdown wrapping.`;

function formatUserMessage(code: string, analysis: AnalysisInput): string {
  return `## Code to Analyze
${code}

## Student Analysis
Problem Statement: ${analysis.problemStatement || 'Not provided'}
Input/Output: ${analysis.inputOutput || 'Not provided'}
Algorithm Purpose: ${analysis.algorithmPurpose || 'Not provided'}
Time Complexity: ${analysis.timeComplexity || 'Not provided'}
Space Complexity: ${analysis.spaceComplexity || 'Not provided'}
Edge Cases: ${analysis.edgeCases || 'Not provided'}`;
}

function parseJsonSafely(raw: string): Evaluation {
  let cleaned = raw.trim();
  // Strip markdown code block markers if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON format returned by AI model.');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Ensure default structure if any fields are missing
  return {
    codeUnderstanding: {
      score: parsed.codeUnderstanding?.score ?? 75,
      problemStatement: {
        correct: parsed.codeUnderstanding?.problemStatement?.correct ?? true,
        feedback: parsed.codeUnderstanding?.problemStatement?.feedback || 'Accurate problem identification.',
      },
      inputOutput: {
        correct: parsed.codeUnderstanding?.inputOutput?.correct ?? true,
        feedback: parsed.codeUnderstanding?.inputOutput?.feedback || 'Input and output types clearly understood.',
      },
      algorithmPurpose: {
        correct: parsed.codeUnderstanding?.algorithmPurpose?.correct ?? true,
        feedback: parsed.codeUnderstanding?.algorithmPurpose?.feedback || 'Core purpose identified.',
      },
    },
    complexityAnalysis: {
      score: parsed.complexityAnalysis?.score ?? 70,
      timeComplexity: {
        correct: parsed.complexityAnalysis?.timeComplexity?.correct ?? true,
        expected: parsed.complexityAnalysis?.timeComplexity?.expected || 'O(n)',
        feedback: parsed.complexityAnalysis?.timeComplexity?.feedback || 'Good analysis of operations.',
      },
      spaceComplexity: {
        correct: parsed.complexityAnalysis?.spaceComplexity?.correct ?? true,
        expected: parsed.complexityAnalysis?.spaceComplexity?.expected || 'O(1)',
        feedback: parsed.complexityAnalysis?.spaceComplexity?.feedback || 'Good analysis of auxiliary space.',
      },
      hint: parsed.complexityAnalysis?.hint ?? null,
    },
    edgeCaseDetection: {
      score: parsed.edgeCaseDetection?.score ?? 70,
      identified: Array.isArray(parsed.edgeCaseDetection?.identified) ? parsed.edgeCaseDetection.identified : [],
      missed: Array.isArray(parsed.edgeCaseDetection?.missed) ? parsed.edgeCaseDetection.missed : [],
      feedback: parsed.edgeCaseDetection?.feedback || 'Consider corner cases such as empty or negative inputs.',
    },
    socraticQuestions: Array.isArray(parsed.socraticQuestions) && parsed.socraticQuestions.length > 0
      ? parsed.socraticQuestions
      : [
          'What happens if the input size exceeds memory bounds?',
          'Can this algorithm be modified to be stable and in-place?',
        ],
    optimizationChallenge: {
      challenge: parsed.optimizationChallenge?.challenge || 'Can you optimize the space complexity further?',
      hint: parsed.optimizationChallenge?.hint || 'Consider in-place pointer manipulation or hashing.',
    },
    overallScore: parsed.overallScore ?? 75,
    confidenceBreakdown: {
      understanding: parsed.confidenceBreakdown?.understanding ?? 75,
      complexityAccuracy: parsed.confidenceBreakdown?.complexityAccuracy ?? 70,
      edgeCaseAwareness: parsed.confidenceBreakdown?.edgeCaseAwareness ?? 70,
      overall: parsed.confidenceBreakdown?.overall ?? 75,
    },
    feedback: parsed.feedback || 'Good overall understanding of the algorithm structure and tradeoffs.',
  };
}

// 1. Direct Groq API call
export async function evaluateWithGroq(
  code: string,
  analysis: AnalysisInput,
  apiKey: string,
  model = 'llama-3.3-70b-versatile'
): Promise<Evaluation> {
  if (!apiKey?.trim()) {
    throw new Error('Groq API Key is missing. Please enter your Groq API key in AI Settings.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: formatUserMessage(code, analysis) },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedMsg = errText;
    try {
      const errJson = JSON.parse(errText);
      parsedMsg = errJson.error?.message || errText;
    } catch {}
    throw new Error(`Groq API error (${response.status}): ${parsedMsg}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq API returned an empty response.');
  }

  return parseJsonSafely(content);
}

// 2. Direct Google Gemini API call
export async function evaluateWithGemini(
  code: string,
  analysis: AnalysisInput,
  apiKey: string,
  model = 'gemini-2.0-flash'
): Promise<Evaluation> {
  if (!apiKey?.trim()) {
    throw new Error('Gemini API Key is missing. Please enter your Gemini API key in AI Settings.');
  }

  const targetModel = model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\n${formatUserMessage(code, analysis)}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedMsg = errText;
    try {
      const errJson = JSON.parse(errText);
      parsedMsg = errJson.error?.message || errText;
    } catch {}
    throw new Error(`Gemini API error (${response.status}): ${parsedMsg}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned an empty response.');
  }

  return parseJsonSafely(text);
}

// 3. Supabase Edge Function call
export async function evaluateWithSupabase(code: string, analysis: AnalysisInput): Promise<Evaluation> {
  const { data, error } = await supabase.functions.invoke('reverse-engineer', {
    body: { code, analysis },
  });

  if (error) {
    throw error;
  }
  if (data?.error) {
    throw new Error(data.error);
  }

  return data as Evaluation;
}

// 4. Smart Offline / Heuristic Mock Evaluator
// Analyzes code structure, syntax, and user answers to generate instant, realistic, educational feedback
export async function evaluateWithOfflineMock(code: string, analysis: AnalysisInput): Promise<Evaluation> {
  // Add a natural realistic delay for interactive feel
  await new Promise((r) => setTimeout(r, 800));

  const lowerCode = code.toLowerCase();
  const lowerProblem = (analysis.problemStatement || '').toLowerCase();
  const lowerAlgo = (analysis.algorithmPurpose || '').toLowerCase();
  const lowerTime = (analysis.timeComplexity || '').toLowerCase().replace(/\s+/g, '');
  const lowerSpace = (analysis.spaceComplexity || '').toLowerCase().replace(/\s+/g, '');
  const lowerEdge = (analysis.edgeCases || '').toLowerCase();

  // Pattern detection
  const isTwoSum = lowerCode.includes('twosum') || (lowerCode.includes('target') && (lowerCode.includes('complement') || lowerCode.includes('map')));
  const isBinarySearch = lowerCode.includes('binarysearch') || (lowerCode.includes('mid') && lowerCode.includes('low') && lowerCode.includes('high'));
  const isMergeSort = lowerCode.includes('mergesort') || (lowerCode.includes('slice') && lowerCode.includes('merge('));
  const isQuickSort = lowerCode.includes('quicksort') || lowerCode.includes('partition');
  const isLinkedList = lowerCode.includes('.next') || lowerCode.includes('head') || lowerCode.includes('listnode');
  const isRecursion = lowerCode.includes('return') && /\b[a-zA-Z0-9_]+\s*\(.*?\b[a-zA-Z0-9_]+\s*\(/.test(code);

  let expectedTime = 'O(n)';
  let expectedSpace = 'O(1)';
  let detectedName = 'Algorithm';
  let commonEdgeCases = ['Empty input / array', 'Single element', 'Duplicates'];
  let optimizationText = 'Can this algorithm be made in-place or parallelized?';
  let optimizationHint = 'Analyze if additional data structures can be eliminated with two pointers.';

  if (isTwoSum) {
    detectedName = 'Two Sum (Hash Map approach)';
    expectedTime = 'O(n)';
    expectedSpace = 'O(n)';
    commonEdgeCases = ['Empty array', 'No two numbers sum to target', 'Array with duplicate elements', 'Negative numbers', 'Target is 0'];
    optimizationText = 'If the input array were already sorted, how would you solve it with O(1) extra space?';
    optimizationHint = 'Two pointer technique moving inward from the left and right boundaries.';
  } else if (isBinarySearch) {
    detectedName = 'Binary Search';
    expectedTime = 'O(log n)';
    expectedSpace = 'O(1)';
    commonEdgeCases = ['Target not in array', 'Target at boundaries (first or last)', 'Array with duplicate targets', 'Single element array', 'Empty array'];
    optimizationText = 'How do you prevent integer overflow when calculating mid = (low + high) / 2?';
    optimizationHint = 'Use low + Math.floor((high - low) / 2) instead.';
  } else if (isMergeSort) {
    detectedName = 'Merge Sort';
    expectedTime = 'O(n log n)';
    expectedSpace = 'O(n)';
    commonEdgeCases = ['Already sorted array', 'Reverse sorted array', 'Array with all identical elements', 'Empty or single item array'];
    optimizationText = 'How could you avoid allocating new sub-arrays on each recursive split?';
    optimizationHint = 'Pass index bounds (start, end) and reuse a single auxiliary buffer array.';
  } else if (isQuickSort) {
    detectedName = 'Quick Sort';
    expectedTime = 'O(n log n)';
    expectedSpace = 'O(log n)';
    commonEdgeCases = ['All identical elements', 'Already sorted array (worst-case O(n²))', 'Single element array'];
    optimizationText = 'How do you guard against the O(n²) worst-case on already sorted inputs?';
    optimizationHint = 'Choose a randomized pivot or median-of-three pivot selection.';
  } else if (isLinkedList) {
    detectedName = 'Linked List Operation';
    expectedTime = 'O(n)';
    expectedSpace = 'O(1)';
    commonEdgeCases = ['Null / empty list head', 'Single node list', 'Cycle in list', 'Even vs odd length'];
    optimizationText = 'Can you perform this operation in a single traversal pass?';
    optimizationHint = 'Fast & slow pointer (Floyd cycle detection) or sentinel dummy head nodes.';
  } else {
    // Generic fallback estimation
    const hasNestedLoops = /for\s*\(.*for\s*\(|while\s*\(.*while\s*\(|for\s*\(.*while\s*\(/.test(code);
    if (hasNestedLoops) {
      expectedTime = 'O(n²)';
      expectedSpace = 'O(1)';
    } else if (isRecursion) {
      expectedTime = 'O(n log n)';
      expectedSpace = 'O(n)';
    } else {
      expectedTime = 'O(n)';
      expectedSpace = 'O(1)';
    }
  }

  // Evaluate problem statement
  const hasProbContent = analysis.problemStatement.trim().length > 8;
  const probMatches = lowerProblem.includes('find') || lowerProblem.includes('search') || lowerProblem.includes('sort') || lowerProblem.includes('sum') || lowerProblem.includes('target') || lowerProblem.includes('array');
  const problemCorrect = hasProbContent && (probMatches || !isTwoSum);

  // Evaluate Input / Output
  const hasIOContent = analysis.inputOutput.trim().length > 6;
  const ioCorrect = hasIOContent && (analysis.inputOutput.includes('array') || analysis.inputOutput.includes('number') || analysis.inputOutput.includes('index') || analysis.inputOutput.includes('int') || analysis.inputOutput.includes('boolean') || analysis.inputOutput.includes('target'));

  // Evaluate Purpose
  const hasPurposeContent = analysis.algorithmPurpose.trim().length > 8;
  const purposeCorrect = hasPurposeContent;

  // Evaluate Complexity
  const normalize = (s: string) => s.replace(/[\s\(\)\^]/g, '').toLowerCase();
  const timeCorrect = normalize(lowerTime).includes(normalize(expectedTime)) || (expectedTime.includes('log') && lowerTime.includes('log'));
  const spaceCorrect = normalize(lowerSpace).includes(normalize(expectedSpace));

  // Evaluate Edge Cases
  const identified: string[] = [];
  const missed: string[] = [];

  commonEdgeCases.forEach((ec) => {
    const keyw = ec.toLowerCase().split(' ')[0];
    if (lowerEdge.includes(keyw) || (ec.includes('empty') && lowerEdge.includes('empty')) || (ec.includes('duplicate') && lowerEdge.includes('duplicate')) || (ec.includes('negative') && lowerEdge.includes('negative')) || (ec.includes('single') && lowerEdge.includes('single'))) {
      identified.push(ec);
    } else {
      missed.push(ec);
    }
  });

  const understandingScore = Math.round(
    (problemCorrect ? 40 : 15) + (ioCorrect ? 30 : 10) + (purposeCorrect ? 30 : 10)
  );

  const complexityScore = Math.round(
    (timeCorrect ? 50 : 20) + (spaceCorrect ? 50 : 20)
  );

  const edgeScore = Math.max(30, Math.min(100, Math.round((identified.length / Math.max(1, commonEdgeCases.length)) * 100)));
  const overallScore = Math.round(understandingScore * 0.4 + complexityScore * 0.35 + edgeScore * 0.25);

  return {
    codeUnderstanding: {
      score: understandingScore,
      problemStatement: {
        correct: problemCorrect,
        feedback: problemCorrect
          ? `Great breakdown! You accurately captured the intent of ${detectedName}.`
          : `Your problem statement was partially clear, but note that this code is an implementation of ${detectedName}.`,
      },
      inputOutput: {
        correct: ioCorrect,
        feedback: ioCorrect
          ? 'Input arguments and expected return types correctly identified.'
          : 'Make sure to explicitly specify the types and structures for both arguments and the return value.',
      },
      algorithmPurpose: {
        correct: purposeCorrect,
        feedback: purposeCorrect
          ? 'Clear articulation of the methodology and data structures employed.'
          : 'Explain the core algorithmic pattern (e.g. hash table lookup, divide-and-conquer, or two pointers).',
      },
    },
    complexityAnalysis: {
      score: complexityScore,
      timeComplexity: {
        correct: timeCorrect,
        expected: expectedTime,
        feedback: timeCorrect
          ? `Correct! The time complexity is indeed ${expectedTime}.`
          : `Expected ${expectedTime}. Consider how many times the loop iterates relative to input size n.`,
      },
      spaceComplexity: {
        correct: spaceCorrect,
        expected: expectedSpace,
        feedback: spaceCorrect
          ? `Spot on! The auxiliary space complexity is ${expectedSpace}.`
          : `Expected ${expectedSpace}. Check how much additional memory is allocated besides input arguments.`,
      },
      hint: !timeCorrect || !spaceCorrect
        ? `Review operation counts: Each lookup or recursive branch contributes to the overall complexity asymptotic curve.`
        : null,
    },
    edgeCaseDetection: {
      score: edgeScore,
      identified: identified.length > 0 ? identified : ['Standard non-empty input'],
      missed: missed.slice(0, 3),
      feedback: identified.length >= 2
        ? 'Well done! You identified several critical boundary conditions.'
        : 'Don’t forget extreme corner cases such as zero/null inputs, duplicates, or boundary values.',
    },
    socraticQuestions: [
      `If the input size grows by a factor of 1000, which part of this code would become the primary bottleneck?`,
      `How would you test this function against concurrent modifications or unexpected data types?`,
    ],
    optimizationChallenge: {
      challenge: optimizationText,
      hint: optimizationHint,
    },
    overallScore,
    confidenceBreakdown: {
      understanding: understandingScore,
      complexityAccuracy: complexityScore,
      edgeCaseAwareness: edgeScore,
      overall: overallScore,
    },
    feedback: `Strong analytical effort! You have a solid grasp of ${detectedName}. Review the missed edge cases and socratic questions to deepen your mastery.`,
  };
}

// 5. Unified Orchestrator
export async function evaluateCodeAnalysis(
  code: string,
  analysis: AnalysisInput,
  customConfig?: Partial<AiConfig>
): Promise<{ evaluation: Evaluation; source: 'groq' | 'gemini' | 'supabase' | 'offline'; errorWarning?: string }> {
  const config = { ...getStoredAiConfig(), ...(customConfig || {}) };

  // If user explicitly chose Offline / Smart Mock mode
  if (config.provider === 'offline') {
    const evaluation = await evaluateWithOfflineMock(code, analysis);
    return { evaluation, source: 'offline' };
  }

  // If user selected Groq specifically
  if (config.provider === 'groq') {
    if (config.groqApiKey) {
      try {
        const evaluation = await evaluateWithGroq(code, analysis, config.groqApiKey, config.groqModel);
        return { evaluation, source: 'groq' };
      } catch (err: any) {
        if (config.autoFallback) {
          console.warn('Groq failed, falling back to offline evaluator:', err);
          const evaluation = await evaluateWithOfflineMock(code, analysis);
          return { evaluation, source: 'offline', errorWarning: `Groq error (${err.message}). Evaluated using Smart Offline Mode.` };
        }
        throw err;
      }
    } else if (config.autoFallback) {
      const evaluation = await evaluateWithOfflineMock(code, analysis);
      return { evaluation, source: 'offline', errorWarning: 'No Groq API key set. Evaluated using Smart Offline Mode.' };
    } else {
      throw new Error('Groq API Key is not set. Please configure it in AI Settings.');
    }
  }

  // If user selected Gemini specifically
  if (config.provider === 'gemini') {
    if (config.geminiApiKey) {
      try {
        const evaluation = await evaluateWithGemini(code, analysis, config.geminiApiKey, config.geminiModel);
        return { evaluation, source: 'gemini' };
      } catch (err: any) {
        if (config.autoFallback) {
          console.warn('Gemini failed, falling back to offline evaluator:', err);
          const evaluation = await evaluateWithOfflineMock(code, analysis);
          return { evaluation, source: 'offline', errorWarning: `Gemini error (${err.message}). Evaluated using Smart Offline Mode.` };
        }
        throw err;
      }
    } else if (config.autoFallback) {
      const evaluation = await evaluateWithOfflineMock(code, analysis);
      return { evaluation, source: 'offline', errorWarning: 'No Gemini API key set. Evaluated using Smart Offline Mode.' };
    } else {
      throw new Error('Gemini API Key is not set. Please configure it in AI Settings.');
    }
  }

  // If user selected Supabase specifically
  if (config.provider === 'supabase') {
    try {
      const evaluation = await evaluateWithSupabase(code, analysis);
      return { evaluation, source: 'supabase' };
    } catch (err: any) {
      if (config.autoFallback) {
        console.warn('Supabase edge function failed, falling back to offline evaluator:', err);
        const evaluation = await evaluateWithOfflineMock(code, analysis);
        return {
          evaluation,
          source: 'offline',
          errorWarning: `Supabase backend error (${err.message || 'AI evaluation failed'}). Evaluated using Smart Offline Mode.`,
        };
      }
      throw err;
    }
  }

  // Default: 'auto'
  // 1. Try Groq if key exists
  if (config.groqApiKey) {
    try {
      const evaluation = await evaluateWithGroq(code, analysis, config.groqApiKey, config.groqModel);
      return { evaluation, source: 'groq' };
    } catch (e) {
      console.warn('Auto mode: Groq failed, attempting next provider...', e);
    }
  }

  // 2. Try Gemini if key exists
  if (config.geminiApiKey) {
    try {
      const evaluation = await evaluateWithGemini(code, analysis, config.geminiApiKey, config.geminiModel);
      return { evaluation, source: 'gemini' };
    } catch (e) {
      console.warn('Auto mode: Gemini failed, attempting next provider...', e);
    }
  }

  // 3. Try Supabase backend
  try {
    const evaluation = await evaluateWithSupabase(code, analysis);
    return { evaluation, source: 'supabase' };
  } catch (supabaseErr: any) {
    console.warn('Auto mode: Supabase backend unavailable, falling back to smart offline mode...', supabaseErr);
    // 4. Fallback to smart offline mock evaluator
    const evaluation = await evaluateWithOfflineMock(code, analysis);
    return {
      evaluation,
      source: 'offline',
      errorWarning: 'Supabase backend service returned an error. Evaluated with Smart Offline Mode.',
    };
  }
}
