import { calculateCategoryAverages, calculateOverallScore, getHighestScore, getLowestScore } from '../src/utils/scoreCalculator';
import type { Evaluation } from '../src/types';

function makeEval(overrides: Partial<Omit<Evaluation, 'id' | 'questionId' | 'sessionId'>> = {}): Evaluation {
  return {
    id: 'test-id',
    questionId: 'q1',
    sessionId: 's1',
    technicalAccuracy: 8,
    relevance: 7,
    clarity: 9,
    completeness: 6,
    communication: 8,
    overallScore: 7.5,
    strengths: [],
    improvements: [],
    suggestions: [],
    modelAnswer: '',
    ...overrides,
  };
}

describe('scoreCalculator', () => {
  describe('calculateCategoryAverages', () => {
    it('returns zeros for empty array', () => {
      const result = calculateCategoryAverages([]);
      expect(result.technicalAccuracy).toBe(0);
      expect(result.communication).toBe(0);
    });

    it('averages correctly for single evaluation', () => {
      const ev = makeEval({ technicalAccuracy: 8, relevance: 6 });
      const result = calculateCategoryAverages([ev]);
      expect(result.technicalAccuracy).toBe(8);
      expect(result.relevance).toBe(6);
    });

    it('averages correctly for multiple evaluations', () => {
      const evs = [makeEval({ technicalAccuracy: 8 }), makeEval({ technicalAccuracy: 6 })];
      const result = calculateCategoryAverages(evs);
      expect(result.technicalAccuracy).toBe(7);
    });
  });

  describe('calculateOverallScore', () => {
    it('returns 0 for empty array', () => {
      expect(calculateOverallScore([])).toBe(0);
    });

    it('returns correct average', () => {
      const evs = [makeEval({ overallScore: 8 }), makeEval({ overallScore: 6 })];
      expect(calculateOverallScore(evs)).toBe(7);
    });

    it('handles perfect scores', () => {
      const evs = [makeEval({ overallScore: 10 }), makeEval({ overallScore: 10 })];
      expect(calculateOverallScore(evs)).toBe(10);
    });
  });

  describe('getHighestScore / getLowestScore', () => {
    it('returns correct min and max', () => {
      const evs = [makeEval({ overallScore: 3 }), makeEval({ overallScore: 9 }), makeEval({ overallScore: 6 })];
      expect(getHighestScore(evs)).toBe(9);
      expect(getLowestScore(evs)).toBe(3);
    });

    it('returns 0 for empty', () => {
      expect(getHighestScore([])).toBe(0);
      expect(getLowestScore([])).toBe(0);
    });
  });
});
