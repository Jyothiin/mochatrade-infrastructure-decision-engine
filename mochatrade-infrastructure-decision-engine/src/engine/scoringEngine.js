/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CRITERIA_DIRECTIONS } from '../data/criteria.js';

/**
 * Normalizes criterion weights to ensure the sum equals exactly 100%.
 * 
 * Rules:
 * - If input is null, undefined, or empty, returns an empty object.
 * - Non-numeric or negative values are clamped to 0.
 * - If total sum is 0, distributes 100% equally among all criteria.
 * - Handles rounding remainders deterministically on the last criterion.
 * 
 * @param {Record<string, number>} weights - Criterion ID to weight mapping
 * @returns {Record<string, number>} Normalized weights summing to 100
 */
export function normalizeWeights(weights) {
  if (!weights || typeof weights !== 'object') {
    return {};
  }

  const entries = Object.entries(weights);
  if (entries.length === 0) {
    return {};
  }

  const validEntries = entries.map(([key, val]) => [key, Math.max(0, Number(val) || 0)]);
  const total = validEntries.reduce((sum, [, w]) => sum + w, 0);

  if (total <= 0) {
    const baseShare = Math.floor(100 / validEntries.length);
    let remainder = 100 - baseShare * validEntries.length;
    const normalized = {};
    validEntries.forEach(([key]) => {
      normalized[key] = baseShare + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    });
    return normalized;
  }

  const normalized = {};
  let accumulated = 0;
  validEntries.forEach(([key, value], idx) => {
    if (idx === validEntries.length - 1) {
      normalized[key] = Math.max(0, 100 - accumulated);
    } else {
      const share = Math.round((value / total) * 100);
      normalized[key] = share;
      accumulated += share;
    }
  });

  return normalized;
}

/**
 * Calculates raw weighted score and detailed criterion breakdown for a component.
 * 
 * Formula:
 * Weighted Value = (Raw Score / 10) * Weight
 * Overall Weighted Score (0 to 100) = (Sum of Weighted Values / Total Active Weight) * 100
 * 
 * @param {Object} component - Infrastructure component with scores object
 * @param {Array<Object>} criteriaList - Array of criteria objects
 * @param {Record<string, number>} weights - Criterion weights
 * @returns {Object} Contains overall weighted score (0-100), score out of 10, and criterion breakdown
 */
export function calculateWeightedScore(component, criteriaList = [], weights = {}) {
  const normalizedWeights = normalizeWeights(weights);
  const scores = component?.scores || component?.defaultScores || {};

  let totalWeightedScore = 0;
  let totalActiveWeight = 0;
  const breakdown = [];

  criteriaList.forEach((criterion) => {
    const rawScore = Math.min(10, Math.max(1, Number(scores[criterion.id] ?? 5)));
    const weight = Number(normalizedWeights[criterion.id] ?? 0);
    const weightedValue = (rawScore / 10) * weight; // 0 to weight

    totalWeightedScore += weightedValue;
    totalActiveWeight += weight;

    breakdown.push({
      criterionId: criterion.id,
      name: criterion.name,
      category: criterion.category,
      direction: criterion.direction,
      rawScore,
      weight,
      weightedValue: Number(weightedValue.toFixed(2)),
      contributionPct: weight > 0 ? Number(((weightedValue / weight) * 100).toFixed(1)) : 0,
    });
  });

  const overallScore100 = totalActiveWeight > 0
    ? Number(((totalWeightedScore / totalActiveWeight) * 100).toFixed(1))
    : 50;

  const weightedScoreOutOf10 = Number((overallScore100 / 10).toFixed(1));

  return {
    componentId: component?.id,
    componentName: component?.displayName || component?.name,
    weightedScore: overallScore100,
    weightedScoreOutOf10,
    totalActiveWeight,
    breakdown,
    weights: normalizedWeights,
  };
}

/**
 * Backward compatibility alias for calculateWeightedScore
 */
export function calculateComponentScores(component, criteriaList, weights) {
  const result = calculateWeightedScore(component, criteriaList, weights);
  return {
    componentId: result.componentId,
    componentName: result.componentName,
    overallScore100: result.weightedScore,
    criterionBreakdown: result.breakdown,
    weights: result.weights,
  };
}
