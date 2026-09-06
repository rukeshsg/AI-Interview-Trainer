import { Evaluation } from '../types';

export interface CategoryAverages {
  technicalAccuracy: number;
  relevance: number;
  clarity: number;
  completeness: number;
  communication: number;
}

export function calculateCategoryAverages(evaluations: Evaluation[]): CategoryAverages {
  if (evaluations.length === 0) {
    return { technicalAccuracy: 0, relevance: 0, clarity: 0, completeness: 0, communication: 0 };
  }

  const sum = evaluations.reduce(
    (acc, ev) => ({
      technicalAccuracy: acc.technicalAccuracy + ev.technicalAccuracy,
      relevance: acc.relevance + ev.relevance,
      clarity: acc.clarity + ev.clarity,
      completeness: acc.completeness + ev.completeness,
      communication: acc.communication + ev.communication,
    }),
    { technicalAccuracy: 0, relevance: 0, clarity: 0, completeness: 0, communication: 0 }
  );

  const n = evaluations.length;
  return {
    technicalAccuracy: round(sum.technicalAccuracy / n),
    relevance: round(sum.relevance / n),
    clarity: round(sum.clarity / n),
    completeness: round(sum.completeness / n),
    communication: round(sum.communication / n),
  };
}

export function calculateOverallScore(evaluations: Evaluation[]): number {
  if (evaluations.length === 0) return 0;
  const avg = evaluations.reduce((acc, ev) => acc + ev.overallScore, 0) / evaluations.length;
  return round(avg);
}

export function getHighestScore(evaluations: Evaluation[]): number {
  if (evaluations.length === 0) return 0;
  return Math.max(...evaluations.map((ev) => ev.overallScore));
}

export function getLowestScore(evaluations: Evaluation[]): number {
  if (evaluations.length === 0) return 0;
  return Math.min(...evaluations.map((ev) => ev.overallScore));
}

function round(value: number, decimals = 1): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
