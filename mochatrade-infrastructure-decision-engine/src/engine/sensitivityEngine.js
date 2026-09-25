/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { evaluateDecision, DECISIONS } from './decisionEngine.js';
import { normalizeWeights } from './scoringEngine.js';

/**
 * Creates a normalized weight distribution where targetCriterionId is set to targetWeight,
 * and the remaining (100 - targetWeight)% is distributed proportionally among all other criteria.
 * 
 * @param {Record<string, number>} baseWeights - Current normalized weights (sum to 100)
 * @param {string} targetCriterionId - Criterion ID being isolated
 * @param {number} targetWeight - Desired percentage weight (0 to 100)
 * @returns {Record<string, number>} Proportional weights summing to 100
 */
export function getWeightsWithIsolatedTarget(baseWeights, targetCriterionId, targetWeight) {
  const clampedTarget = Math.max(0, Math.min(100, Number(targetWeight) || 0));
  const otherKeys = Object.keys(baseWeights).filter((k) => k !== targetCriterionId);
  const otherSum = otherKeys.reduce((acc, k) => acc + (Number(baseWeights[k]) || 0), 0);
  const remainingWeight = Math.max(0, 100 - clampedTarget);

  const result = { [targetCriterionId]: clampedTarget };

  if (otherKeys.length === 0) {
    return result;
  }

  if (otherSum <= 0) {
    const evenShare = remainingWeight / otherKeys.length;
    otherKeys.forEach((k) => {
      result[k] = evenShare;
    });
  } else {
    otherKeys.forEach((k) => {
      const share = ((Number(baseWeights[k]) || 0) / otherSum) * remainingWeight;
      result[k] = Number(share.toFixed(2));
    });
  }

  return normalizeWeights(result);
}

/**
 * Calculates deterministic weight sensitivity sweep across specified percentage steps.
 * Recalculates the full decision engine analysis for every step.
 * 
 * @param {Object} component - Infrastructure component
 * @param {Array<Object>} criteriaList - Criteria list
 * @param {Record<string, number>} currentWeights - Base weights
 * @param {string} criterionId - Criterion to vary
 * @param {Array<number>} testWeights - Array of weights to test (e.g. [10, 15, 20, 25, 30, 35])
 * @returns {Array<Object>} Array of evaluation results per step
 */
export function calculateWeightSensitivitySweep(
  component,
  criteriaList,
  currentWeights,
  criterionId,
  testWeights = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
) {
  const normWeights = normalizeWeights(currentWeights);
  const baseEvaluation = evaluateDecision(component, criteriaList, normWeights);
  const currentWeight = normWeights[criterionId] ?? 10;
  const currentDecision = baseEvaluation.decision;

  return testWeights.map((w) => {
    const isolatedWeights = getWeightsWithIsolatedTarget(normWeights, criterionId, w);
    const evalResult = evaluateDecision(component, criteriaList, isolatedWeights);

    return {
      weight: w,
      decision: evalResult.decision,
      strategicImportance: evalResult.strategicImportance,
      buildAttractiveness: evalResult.buildAttractiveness,
      partnerAttractiveness: evalResult.partnerAttractiveness,
      confidence: evalResult.confidence,
      weightedScore: evalResult.weightedScore,
      isCurrent: Math.abs(w - currentWeight) <= 2.5,
      isFlip: evalResult.decision !== currentDecision,
      fromDecision: currentDecision,
    };
  });
}

/**
 * Sweeps weight from 0% to 50% with 1% granularity to discover continuous decision bands
 * and exact threshold transitions.
 * 
 * Example output:
 * bands: [
 *   { decision: 'BUILD', startWeight: 0, endWeight: 24, span: 25 },
 *   { decision: 'HYBRID', startWeight: 25, endWeight: 38, span: 14 },
 *   { decision: 'PARTNER', startWeight: 39, endWeight: 50, span: 12 },
 * ]
 * 
 * transitions: [
 *   { fromDecision: 'BUILD', toDecision: 'HYBRID', thresholdWeight: 25, deltaFromCurrent: +7 },
 *   { fromDecision: 'HYBRID', toDecision: 'PARTNER', thresholdWeight: 39, deltaFromCurrent: +21 },
 * ]
 */
export function calculateDecisionTransitionBands(component, criteriaList, currentWeights, criterionId) {
  const normWeights = normalizeWeights(currentWeights);
  const currentWeight = Math.round(normWeights[criterionId] ?? 10);
  const baseEvaluation = evaluateDecision(component, criteriaList, normWeights);
  const currentDecision = baseEvaluation.decision;

  const points = [];
  for (let w = 0; w <= 50; w += 1) {
    const isolatedWeights = getWeightsWithIsolatedTarget(normWeights, criterionId, w);
    const ev = evaluateDecision(component, criteriaList, isolatedWeights);
    points.push({ weight: w, decision: ev.decision });
  }

  // Aggregate contiguous bands
  const bands = [];
  let currentBand = null;

  points.forEach((pt) => {
    if (!currentBand) {
      currentBand = {
        decision: pt.decision,
        startWeight: pt.weight,
        endWeight: pt.weight,
      };
    } else if (currentBand.decision === pt.decision) {
      currentBand.endWeight = pt.weight;
    } else {
      currentBand.span = currentBand.endWeight - currentBand.startWeight + 1;
      bands.push(currentBand);
      currentBand = {
        decision: pt.decision,
        startWeight: pt.weight,
        endWeight: pt.weight,
      };
    }
  });

  if (currentBand) {
    currentBand.span = currentBand.endWeight - currentBand.startWeight + 1;
    bands.push(currentBand);
  }

  // Identify transition points
  const transitions = [];
  for (let i = 0; i < bands.length - 1; i++) {
    const fromBand = bands[i];
    const toBand = bands[i + 1];
    const thresholdWeight = toBand.startWeight;
    const delta = thresholdWeight - currentWeight;

    transitions.push({
      fromDecision: fromBand.decision,
      toDecision: toBand.decision,
      thresholdWeight,
      currentWeight,
      deltaFromCurrent: delta,
      direction: delta > 0 ? 'INCREASE' : 'DECREASE',
    });
  }

  return {
    criterionId,
    currentWeight,
    currentDecision,
    bands,
    transitions,
    hasTransitions: transitions.length > 0,
  };
}

/**
 * Calculates score sensitivity sweep for a criterion (scores 1 through 10).
 * Recalculates decision for every score step.
 */
export function calculateScoreSensitivitySweep(component, criteriaList, currentWeights, criterionId) {
  const normWeights = normalizeWeights(currentWeights);
  const baseEvaluation = evaluateDecision(component, criteriaList, normWeights);
  const currentScore = component.scores?.[criterionId] ?? 5;
  const currentDecision = baseEvaluation.decision;

  const testScores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return testScores.map((score) => {
    const modifiedComponent = {
      ...component,
      scores: {
        ...(component.scores || {}),
        [criterionId]: score,
      },
    };
    const evalResult = evaluateDecision(modifiedComponent, criteriaList, normWeights);

    return {
      score,
      decision: evalResult.decision,
      strategicImportance: evalResult.strategicImportance,
      buildAttractiveness: evalResult.buildAttractiveness,
      partnerAttractiveness: evalResult.partnerAttractiveness,
      confidence: evalResult.confidence,
      isCurrent: score === currentScore,
      isFlip: evalResult.decision !== currentDecision,
      fromDecision: currentDecision,
    };
  });
}

/**
 * Analyzes the most decision-sensitive factors across all criteria for a component.
 * 
 * Answers:
 * 1. Which criteria are closest to a decision tipping point?
 * 2. What is the current weight and threshold?
 * 3. What is the resulting decision change?
 * 4. Why does it flip?
 * 
 * @param {Object} component - Infrastructure component
 * @param {Array<Object>} criteriaList - List of criteria
 * @param {Record<string, number>} currentWeights - Active weights
 * @returns {Array<Object>} Ranked list of sensitive factors (most sensitive first)
 */
export function analyzeMostSensitiveFactors(component, criteriaList, currentWeights) {
  const normWeights = normalizeWeights(currentWeights);
  const baseEvaluation = evaluateDecision(component, criteriaList, normWeights);
  const currentDecision = baseEvaluation.decision;

  const factors = [];

  criteriaList.forEach((criterion) => {
    const currentWeight = normWeights[criterion.id] ?? 10;
    const currentScore = component.scores?.[criterion.id] ?? 5;

    // 1. Check weight transitions
    const bandAnalysis = calculateDecisionTransitionBands(
      component,
      criteriaList,
      normWeights,
      criterion.id
    );

    let nearestWeightTransition = null;
    let minWeightDelta = 999;

    bandAnalysis.transitions.forEach((trans) => {
      const absDelta = Math.abs(trans.deltaFromCurrent);
      if (absDelta < minWeightDelta) {
        minWeightDelta = absDelta;
        nearestWeightTransition = trans;
      }
    });

    // 2. Check score transitions
    let nearestScoreTransition = null;
    let minScoreDelta = 999;
    const testScores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    for (const testS of testScores) {
      if (testS === currentScore) continue;
      const modifiedComp = {
        ...component,
        scores: { ...(component.scores || {}), [criterion.id]: testS },
      };
      const sim = evaluateDecision(modifiedComp, criteriaList, normWeights);

      if (sim.decision !== currentDecision) {
        const absDelta = Math.abs(testS - currentScore);
        if (absDelta < minScoreDelta) {
          minScoreDelta = absDelta;
          nearestScoreTransition = {
            fromDecision: currentDecision,
            toDecision: sim.decision,
            currentScore,
            thresholdScore: testS,
            delta: testS - currentScore,
            simulatedMetrics: {
              strategicImportance: sim.strategicImportance,
              buildAttractiveness: sim.buildAttractiveness,
              partnerAttractiveness: sim.partnerAttractiveness,
            },
          };
        }
      }
    }

    // If either weight or score can flip this decision, add to candidate factors
    if (nearestWeightTransition || nearestScoreTransition) {
      // Determine overall sensitivity score (lower delta = more sensitive)
      const weightScoreNormalized = nearestWeightTransition ? minWeightDelta : 999;
      const scoreScoreNormalized = nearestScoreTransition ? minScoreDelta * 5 : 999;
      const compositeRankScore = Math.min(weightScoreNormalized, scoreScoreNormalized);

      let primaryTriggerType = 'WEIGHT';
      let resultingDecisionChange = '';
      let thresholdDisplay = '';
      let currentValDisplay = '';
      let explanation = '';

      if (nearestWeightTransition && (!nearestScoreTransition || weightScoreNormalized <= scoreScoreNormalized)) {
        primaryTriggerType = 'WEIGHT';
        resultingDecisionChange = `${nearestWeightTransition.fromDecision} → ${nearestWeightTransition.toDecision}`;
        thresholdDisplay = `${nearestWeightTransition.thresholdWeight}%`;
        currentValDisplay = `${currentWeight}%`;
        const sign = nearestWeightTransition.deltaFromCurrent > 0 ? '+' : '';
        explanation = `Weight shift of ${sign}${nearestWeightTransition.deltaFromCurrent}% (${currentWeight}% → ${nearestWeightTransition.thresholdWeight}%) triggers a transition from ${nearestWeightTransition.fromDecision} to ${nearestWeightTransition.toDecision}.`;
      } else if (nearestScoreTransition) {
        primaryTriggerType = 'SCORE';
        resultingDecisionChange = `${nearestScoreTransition.fromDecision} → ${nearestScoreTransition.toDecision}`;
        thresholdDisplay = `${nearestScoreTransition.thresholdScore}/10`;
        currentValDisplay = `${currentScore}/10`;
        const sign = nearestScoreTransition.delta > 0 ? '+' : '';
        explanation = `Score re-assessment of ${sign}${nearestScoreTransition.delta} pts (${currentScore}/10 → ${nearestScoreTransition.thresholdScore}/10) alters attractiveness parity, triggering ${nearestScoreTransition.fromDecision} → ${nearestScoreTransition.toDecision}.`;
      }

      factors.push({
        criterionId: criterion.id,
        criterionName: criterion.name,
        category: criterion.category,
        direction: criterion.direction,
        currentWeight,
        currentScore,
        currentValDisplay,
        thresholdDisplay,
        thresholdWeight: nearestWeightTransition ? nearestWeightTransition.thresholdWeight : null,
        thresholdScore: nearestScoreTransition ? nearestScoreTransition.thresholdScore : null,
        weightDelta: nearestWeightTransition ? nearestWeightTransition.deltaFromCurrent : null,
        scoreDelta: nearestScoreTransition ? nearestScoreTransition.delta : null,
        resultingDecisionChange,
        fromDecision: currentDecision,
        toDecision: nearestWeightTransition ? nearestWeightTransition.toDecision : nearestScoreTransition?.toDecision,
        explanation,
        compositeRankScore,
        primaryTriggerType,
        weightTransition: nearestWeightTransition,
        scoreTransition: nearestScoreTransition,
        bands: bandAnalysis.bands,
      });
    }
  });

  // Sort by composite rank score (most sensitive first)
  factors.sort((a, b) => a.compositeRankScore - b.compositeRankScore);

  return factors;
}

/**
 * Calculates tipping points for a component (backward-compatible function for StrategyContext).
 */
export function analyzeTippingPoints(component, criteriaList, currentWeights) {
  const normWeights = normalizeWeights(currentWeights);
  const baseEvaluation = evaluateDecision(component, criteriaList, normWeights);
  const currentDecision = baseEvaluation.decision;

  const sensitiveFactors = analyzeMostSensitiveFactors(component, criteriaList, normWeights);

  const tippingPoints = sensitiveFactors.map((sf, idx) => ({
    criterionId: sf.criterionId,
    criterionName: sf.criterionName,
    direction: sf.direction,
    sensitivityRank: idx + 1,
    weightFlip: sf.weightTransition
      ? {
          criterionId: sf.criterionId,
          criterionName: sf.criterionName,
          currentWeight: sf.currentWeight,
          flippedWeight: sf.weightTransition.thresholdWeight,
          weightDelta: sf.weightTransition.deltaFromCurrent,
          fromDecision: sf.weightTransition.fromDecision,
          toDecision: sf.weightTransition.toDecision,
          type: 'WEIGHT_TRIGGER',
        }
      : null,
    scoreFlip: sf.scoreTransition
      ? {
          criterionId: sf.criterionId,
          criterionName: sf.criterionName,
          currentScore: sf.currentScore,
          flippedScore: sf.scoreTransition.thresholdScore,
          scoreDelta: sf.scoreTransition.delta,
          fromDecision: sf.scoreTransition.fromDecision,
          toDecision: sf.scoreTransition.toDecision,
          type: 'SCORE_TRIGGER',
        }
      : null,
  }));

  const isHighlyStable = tippingPoints.length === 0 || tippingPoints[0].sensitivityRank > 25;

  return {
    componentId: component.id,
    currentDecision,
    tippingPoints,
    sensitiveFactors,
    isHighlyStable,
  };
}

/**
 * Runs a custom live sensitivity simulation when a user moves a slider in the UI.
 */
export function simulateCustomPerturbation(component, criteriaList, currentWeights, updates) {
  const normWeights = normalizeWeights(currentWeights);
  let updatedWeights = normWeights;

  if (updates.weights) {
    const [targetCrit, targetWeight] = Object.entries(updates.weights)[0] || [];
    if (targetCrit) {
      updatedWeights = getWeightsWithIsolatedTarget(normWeights, targetCrit, targetWeight);
    }
  }

  const updatedScores = updates.scores
    ? { ...(component.scores || {}), ...updates.scores }
    : component.scores;

  const modifiedComponent = {
    ...component,
    scores: updatedScores,
  };

  return evaluateDecision(modifiedComponent, criteriaList, updatedWeights);
}
