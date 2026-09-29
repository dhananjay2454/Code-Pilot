import { TestCase, TestResult, RunResults } from '@/types/arena';

// Deep equality helper for arrays, objects, and primitives
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  // Array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Object comparison
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

export function formatValue(val: any): string {
  if (val === undefined) return 'undefined';
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

/**
 * Runs user code against test cases in an isolated evaluation context.
 */
export async function executeCode(
  userCode: string,
  functionName: string,
  testCases: TestCase[],
  onlyVisible: boolean = false
): Promise<RunResults> {
  const filteredCases = onlyVisible ? testCases.filter(t => !t.isHidden) : testCases;
  const results: TestResult[] = [];
  let totalDuration = 0;
  let allPassed = true;

  try {
    // Construct execution scope
    // We execute the user code and then extract the target function
    const wrappedCode = `
      "use strict";
      ${userCode};
      if (typeof ${functionName} !== 'function') {
        throw new Error("Function '${functionName}' is not defined. Please implement '${functionName}'.");
      }
      return ${functionName};
    `;

    const userFunc = new Function(wrappedCode)();

    for (let i = 0; i < filteredCases.length; i++) {
      const tc = filteredCases[i];
      const inputCopy = JSON.parse(JSON.stringify(tc.input));
      const start = performance.now();

      let actual: any;
      let error: string | undefined;
      let passed = false;

      try {
        actual = userFunc(...inputCopy);
        passed = deepEqual(actual, tc.expected);
      } catch (err: any) {
        error = err?.message || String(err);
        passed = false;
      }

      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      totalDuration += durationMs;

      if (!passed) {
        allPassed = false;
      }

      results.push({
        testIndex: i,
        passed,
        inputStr: tc.input.map(arg => formatValue(arg)).join(', '),
        expectedStr: formatValue(tc.expected),
        actualStr: error ? 'Error' : formatValue(actual),
        error,
        durationMs,
        isHidden: tc.isHidden,
      });
    }

    const passedTests = results.filter(r => r.passed).length;

    return {
      allPassed,
      passedTests,
      totalTests: results.length,
      runtimeMs: Math.round(totalDuration * 100) / 100,
      results,
    };
  } catch (globalErr: any) {
    return {
      allPassed: false,
      passedTests: 0,
      totalTests: filteredCases.length,
      runtimeMs: 0,
      results: filteredCases.map((tc, idx) => ({
        testIndex: idx,
        passed: false,
        inputStr: tc.input.map(arg => formatValue(arg)).join(', '),
        expectedStr: formatValue(tc.expected),
        actualStr: 'Error',
        error: globalErr?.message || String(globalErr),
        durationMs: 0,
        isHidden: tc.isHidden,
      })),
      error: globalErr?.message || 'Syntax error or undefined function in user code.',
    };
  }
}
