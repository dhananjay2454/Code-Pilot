import { describe, it, expect } from 'vitest';
import { evaluateWithOfflineMock, evaluateCodeAnalysis } from '../services/aiEvaluator';

describe('aiEvaluator service', () => {
  it('correctly evaluates Two Sum algorithm using smart offline evaluator', async () => {
    const code = `function twoSum(nums, target) {
      const map = {};
      for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map[complement] !== undefined) return [map[complement], i];
        map[nums[i]] = i;
      }
      return [];
    }`;

    const analysis = {
      problemStatement: 'Find two indices in array that add up to target',
      inputOutput: 'Input: nums array and target number, Output: array of two indices',
      algorithmPurpose: 'Use hash map for O(1) complement lookup in one pass',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      edgeCases: 'empty array, duplicate numbers, negative values',
    };

    const result = await evaluateWithOfflineMock(code, analysis);

    expect(result).toBeDefined();
    expect(result.overallScore).toBeGreaterThanOrEqual(60);
    expect(result.codeUnderstanding.problemStatement.correct).toBe(true);
    expect(result.complexityAnalysis.timeComplexity.correct).toBe(true);
    expect(result.complexityAnalysis.spaceComplexity.correct).toBe(true);
    expect(result.socraticQuestions.length).toBeGreaterThan(0);
    expect(result.optimizationChallenge.challenge).toBeDefined();
  });

  it('orchestrator safely falls back to offline mode when no API keys are present', async () => {
    const result = await evaluateCodeAnalysis(
      'function binarySearch(arr, target) { return -1; }',
      {
        problemStatement: 'Search for target in sorted array',
        inputOutput: 'Array, target -> index',
        algorithmPurpose: 'Divide and conquer',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        edgeCases: 'empty array, not found',
      },
      { provider: 'offline' }
    );

    expect(result.source).toBe('offline');
    expect(result.evaluation.overallScore).toBeGreaterThan(0);
  });
});
