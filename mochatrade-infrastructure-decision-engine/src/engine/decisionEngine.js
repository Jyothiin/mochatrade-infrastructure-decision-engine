/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { normalizeWeights, calculateWeightedScore } from './scoringEngine.js';
import { CRITERIA_DIRECTIONS } from '../data/criteria.js';

export const DECISIONS = {
  BUILD: 'BUILD',
  PARTNER: 'PARTNER',
  HYBRID: 'HYBRID',
};

/**
 * Mathematical decision thresholds for deterministic classification.
 * Clear boundaries ensure transparency and auditability.
 */
export const THRESHOLDS = {
  // Strategic importance cutoff boundaries (0-100 scale). 75 marks a genuinely core capability;
  STRATEGIC_HIGH: 75,
  STRATEGIC_LOW: 45,

  // Attractiveness cutoff boundaries (0-100 scale)
  ATTRACTIVENESS_HIGH: 60,
  ATTRACTIVENESS_LOW: 45,

  // Minimum delta required between Build and Partner attractiveness to establish clear dominance
  DOMINANCE_DELTA: 12,

  // Strategic moat boundary safeguards
  MOAT_BUILD_MIN: 6,
  MOAT_PARTNER_MAX: 4,
};

/**
 * Helper to safely extract criterion scores (1-10 scale, default 5)
 */
function getScore(scores, id) {
  const val = Number(scores?.[id]);
  return isNaN(val) ? 5 : Math.min(10, Math.max(1, val));
}

function getDirectionalScore(score, direction, target) {
  const normalizedScore = getScore({ value: score }, 'value');
  if (target === 'build') {
    return direction === CRITERIA_DIRECTIONS.FAVORS_BUILD ? normalizedScore : 11 - normalizedScore;
  }
  return direction === CRITERIA_DIRECTIONS.FAVORS_BUILD ? 11 - normalizedScore : normalizedScore;
}

function calculateDirectionalUtility(component, criteriaList, normalizedWeights, target) {
  const scores = component?.scores || component?.defaultScores || {};
  let weightedTotal = 0;
  let activeWeight = 0;

  criteriaList.forEach((criterion) => {
    const weight = Number(normalizedWeights[criterion.id] ?? 0);
    if (weight <= 0) return;

    weightedTotal += getDirectionalScore(scores[criterion.id], criterion.direction, target) * weight;
    activeWeight += weight;
  });

  return activeWeight > 0 ? (weightedTotal / (activeWeight * 10)) * 100 : 50;
}

/**
 * 1. Calculates Strategic Importance (0 to 100).
 * 
 * Concept:
 * Strategic importance quantifies how vital this infrastructure capability is
 * to the firm's long-term enterprise valuation, proprietary IP, and operational autonomy.
 * 
 * Formula:
 * Weighted average of criteria that favor building proprietary capability:
 * - Strategic Moat (IP retention & defensibility)
 * - Control (uptime SLAs, telemetry, roadmap ownership)
 * - Differentiation (visibility to clients & market advantage)
 * - Scalability (handling throughput bursts without external rate limits)
 * 
 * @param {Object} component - Infrastructure component
 * @param {Array<Object>} criteriaList - Criteria definitions
 * @param {Record<string, number>} normalizedWeights - Normalized weights summing to 100
 * @returns {number} Score from 0 to 100
 */
export function calculateStrategicImportance(component, criteriaList = [], normalizedWeights = {}) {
  const strategicCriteria = criteriaList.filter(
    (criterion) => criterion.direction === CRITERIA_DIRECTIONS.FAVORS_BUILD
  );
  const normalizedImportance = calculateDirectionalUtility(
    component,
    strategicCriteria,
    normalizedWeights,
    'build'
  );
  return Number(Math.min(100, Math.max(0, normalizedImportance)).toFixed(1));
}

/**
 * 2. Calculates Build Attractiveness (0 to 100).
 * 
 * Concept:
 * Measures the net advantage of building in-house. High strategic moat and control
 * push build attractiveness upward, while execution urgency (time to market pressure),
 * severe capex sensitivity, complex statutory compliance, and engineering talent scarcity
 * act as dampeners (build friction).
 * 
 * Formula:
 * BuildAttractiveness = (BuildUpside * 0.70) + ((100 - BuildFriction) * 0.30)
 * 
 * @param {Object} component - Infrastructure component
 * @param {Array<Object>} criteriaList - Criteria definitions
 * @param {Record<string, number>} normalizedWeights - Normalized weights summing to 100
 * @returns {number} Score from 0 to 100
 */
export function calculateBuildAttractiveness(component, criteriaList = [], normalizedWeights = {}) {
  const buildUtility = calculateDirectionalUtility(component, criteriaList, normalizedWeights, 'build');
  return Number(Math.min(100, Math.max(0, buildUtility)).toFixed(1));
}

/**
 * 3. Calculates Partner Attractiveness (0 to 100).
 * 
 * Concept:
 * Measures the net advantage of consuming this capability from third-party vendors,
 * banks, or infrastructure SaaS providers. Rapid time to market, variable utility costs,
 * pre-certified regulatory licenses, and offloaded 24/7 maintenance boost partner attractiveness.
 * However, high requirements for proprietary moat, SLA control, or distinct UI penalize partnering.
 * 
 * Formula:
 * PartnerAttractiveness = (TurnkeyBenefit * 0.70) + ((100 - PartnerPenalty) * 0.30)
 * 
 * @param {Object} component - Infrastructure component
 * @param {Array<Object>} criteriaList - Criteria definitions
 * @param {Record<string, number>} normalizedWeights - Normalized weights summing to 100
 * @returns {number} Score from 0 to 100
 */
export function calculatePartnerAttractiveness(component, criteriaList = [], normalizedWeights = {}) {
  const partnerUtility = calculateDirectionalUtility(component, criteriaList, normalizedWeights, 'partner');
  return Number(Math.min(100, Math.max(0, partnerUtility)).toFixed(1));
}

/**
 * Evaluates the deterministic decision based on multidimensional analysis.
 * 
 * Conceptual Model:
 * 1. HIGH Strategic Importance + HIGH Build Attractiveness (Build clearly dominates Partner)
 *    -> BUILD
 * 2. LOW Strategic Importance + HIGH Partner Attractiveness (Partner clearly dominates Build)
 *    -> PARTNER
 * 3. HIGH Strategic Importance + HIGH Partner Attractiveness
 *    -> HYBRID (Strategically critical, but external rail/license dependencies dictate a hybrid split)
 * 4. Intermediate / Balanced cases
 *    -> HYBRID (Staged evolution or dual-sourcing strategy)
 */
function classifyDecision(strategicImportance, buildAttractiveness, partnerAttractiveness, moatScore) {
  const buildDelta = buildAttractiveness - partnerAttractiveness;

  // Rule 1: High Strategic Importance + High Build Attractiveness
  if (
    strategicImportance >= THRESHOLDS.STRATEGIC_HIGH &&
    buildAttractiveness >= THRESHOLDS.ATTRACTIVENESS_HIGH &&
    buildDelta >= THRESHOLDS.DOMINANCE_DELTA &&
    moatScore >= THRESHOLDS.MOAT_BUILD_MIN
  ) {
    return DECISIONS.BUILD;
  }

  // Rule 2: Low Strategic Importance + High Partner Attractiveness
  if (
    (strategicImportance <= THRESHOLDS.STRATEGIC_LOW || moatScore <= THRESHOLDS.MOAT_PARTNER_MAX) &&
    partnerAttractiveness >= THRESHOLDS.ATTRACTIVENESS_HIGH &&
    buildDelta <= -THRESHOLDS.DOMINANCE_DELTA
  ) {
    return DECISIONS.PARTNER;
  }

  // Rule 3: High Strategic Importance + High Partner Attractiveness (e.g. KYC or Banking Rails)
  if (
    strategicImportance >= THRESHOLDS.STRATEGIC_HIGH &&
    partnerAttractiveness >= THRESHOLDS.ATTRACTIVENESS_HIGH
  ) {
    return DECISIONS.HYBRID;
  }

  // Rule 4: Intermediate / Balanced cases
  return DECISIONS.HYBRID;
}

/**
 * Calculates a deterministic decision-stability score (0-100) indicating how robust the outcome is within the rule set.
 * This is a heuristic stability index, not a probability or statistical confidence interval.
 */
function calculateDecisionStability(decision, strategicImportance, buildAttractiveness, partnerAttractiveness, complianceScore, ttmScore) {
  const absoluteDelta = Math.abs(buildAttractiveness - partnerAttractiveness);
  let confidence = 60;

  if (decision === DECISIONS.BUILD) {
    // Build stability rises with dominance margin and high strategic importance
    confidence = 58 + (absoluteDelta * 1.1) + ((strategicImportance - 50) * 0.3);
  } else if (decision === DECISIONS.PARTNER) {
    // Partner stability rises with dominance margin and low strategic friction
    confidence = 60 + (absoluteDelta * 1.05) + ((100 - strategicImportance) * 0.25);
  } else {
    // Hybrid stability reflects strategic/external dependency balance when there is genuine synergy (high strategic need + high external regulatory/speed requirements)
    const hybridSynergy = (strategicImportance > 50 && (complianceScore >= 7 || ttmScore >= 7)) ? 18 : 8;
    confidence = 64 + hybridSynergy - Math.min(12, absoluteDelta * 0.35);
  }

  return Math.min(96, Math.max(55, Math.round(confidence)));
}

/**
 * Generates structured, traceable reasoning statements from the component metrics.
 */
function generateStructuredReasoning(component, decision, metrics) {
  const reasonsFor = [];
  const reasonsAgainst = [];

  if (decision === DECISIONS.BUILD) {
    reasonsFor.push(
      `High Strategic Moat (${metrics.strategic_moat}/10) ensures proprietary IP retention and defensible enterprise valuation.`,
      `Strict Control requirement (${metrics.control}/10) demands owning SLA uptime, telemetry, and unconstrained feature iterations.`,
      `Core Differentiation (${metrics.differentiation}/10) directly impacts trading experience and competitive market posture.`
    );
    if (metrics.scalability >= 7) {
      reasonsFor.push(`Ultra-high throughput demand (${metrics.scalability}/10) cannot tolerate third-party API rate limits or latency spikes.`);
    }

    reasonsAgainst.push(
      `Incurs substantial upfront engineering capital expenditure and ongoing core systems maintenance overhead.`,
      `Longer development and security hardening lifecycle compared to turnkey commercial APIs.`,
      `Full internal operational liability for 24/7 on-call duty, fault tolerance, and disaster recovery.`
    );
  } else if (decision === DECISIONS.PARTNER) {
    reasonsFor.push(
      `Commoditized utility infrastructure with low strategic moat (${metrics.strategic_moat}/10) and minimal user-facing differentiation (${metrics.differentiation}/10).`,
      `Heavy regulatory and compliance complexity (${metrics.compliance_complexity}/10) is already licensed, audited, and maintained by specialized partners.`,
      `Urgent Time to Market (${metrics.time_to_market}/10) favors a shorter modeled delivery path than an in-house implementation.`
    );
    if (metrics.cost_efficiency >= 7) {
      reasonsFor.push(`Converts modeled fixed development effort into predictable, volume-based partner operating expense.`);
    }

    reasonsAgainst.push(
      `Vendor dependency and exposure to partner downtime, API deprecations, or contract fee renegotiations.`,
      `The product roadmap is constrained by third-party vendor feature delivery cycles.`
    );
  } else {
    // HYBRID
    reasonsFor.push(
      `Strategic capability partition: Own proprietary business logic, client UI, and risk scoring while delegating commoditized plumbing.`,
      `Balances high demand for control/differentiation with the need to offload extreme regulatory licensing and clearing rail maintenance.`,
      `Enables multi-vendor failover: In-house abstraction layer routes dynamically between partner providers without altering client apps.`
    );
    if (metrics.compliance_complexity >= 7) {
      reasonsFor.push(`Insulates MochaTrade from statutory licensing audits by anchoring settlement in partner rails while keeping authoritative state in-house.`);
    }

    reasonsAgainst.push(
      `Dual architectural maintenance: Must maintain both the internal service layer and external partner webhook/API integration adapters.`,
      `Continuous reconciliation requirement: Requires real-time automated reconciliation to ensure internal state and external partner records never drift.`
    );
  }

  return { reasonsFor, reasonsAgainst };
}

/**
 * 4. Calculates Complete Component Analysis (Pure Function).
 * 
 * Produces the required structure:
 * {
 *   decision,
 *   confidence,
 *   strategicImportance,
 *   buildAttractiveness,
 *   partnerAttractiveness,
 *   weightedScore,
 *   keyDrivers,
 *   reasonsFor,
 *   reasonsAgainst,
 *   risks,
 *   assumptions
 * }
 * 
 * @param {Object} component - Infrastructure component
 * @param {Array<Object>} criteriaList - Criteria definitions
 * @param {Record<string, number>} weights - Weight map
 * @returns {Object} Deterministic decision analysis
 */
export function calculateComponentAnalysis(component, criteriaList = [], weights = {}) {
  const normWeights = normalizeWeights(weights);
  const scores = component?.scores || component?.defaultScores || {};

  // Compute weighted score & breakdown
  const weightedScoreResult = calculateWeightedScore(component, criteriaList, normWeights);
  const weightedScore = weightedScoreResult.weightedScore;

  // Extract metrics map for transparent tracking
  const metrics = {
    strategic_moat: getScore(scores, 'strategic_moat'),
    control: getScore(scores, 'control'),
    differentiation: getScore(scores, 'differentiation'),
    time_to_market: getScore(scores, 'time_to_market'),
    cost_efficiency: getScore(scores, 'cost_efficiency'),
    compliance_complexity: getScore(scores, 'compliance_complexity'),
    scalability: getScore(scores, 'scalability'),
    engineering_complexity: getScore(scores, 'engineering_complexity'),
  };

  // 1. Calculate Core Evaluation Dimensions
  const strategicImportance = calculateStrategicImportance(component, criteriaList, normWeights);
  const buildAttractiveness = calculateBuildAttractiveness(component, criteriaList, normWeights);
  const partnerAttractiveness = calculatePartnerAttractiveness(component, criteriaList, normWeights);

  // 2. Deterministic Decision Classification
  const decision = classifyDecision(
    strategicImportance,
    buildAttractiveness,
    partnerAttractiveness,
    metrics.strategic_moat
  );

  // 3. Deterministic Decision Stability Calculation
  const confidence = calculateDecisionStability(
    decision,
    strategicImportance,
    buildAttractiveness,
    partnerAttractiveness,
    metrics.compliance_complexity,
    metrics.time_to_market
  );

  // 4. Calculate Key Drivers (Sorted by impact contribution)
  const keyDrivers = weightedScoreResult.breakdown
    .map((item) => ({
      criterionId: item.criterionId,
      name: item.name,
      category: item.category,
      direction: item.direction,
      rawScore: item.rawScore,
      weight: item.weight,
      weightedValue: item.weightedValue,
      impact: item.weightedValue,
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 4);

  // 5. Reasons For and Reasons Against
  const { reasonsFor, reasonsAgainst } = generateStructuredReasoning(component, decision, metrics);

  // 6. Risks
  const risks = [
    ...(component?.risks || component?.defaultRisks || []),
  ];
  if (metrics.compliance_complexity >= 8 && decision !== DECISIONS.PARTNER) {
    risks.push('Regulatory inspection exposure: Internal logic may trigger statutory source code audits or mandated SOC2/PCI compliance.');
  }
  if (metrics.time_to_market >= 8 && decision === DECISIONS.BUILD) {
    risks.push('Timeline compression hazard: Building under severe time-to-market pressure risks technical debt and incomplete regression testing.');
  }

  // 7. Assumptions (Explicitly tagged)
  const assumptions = [
    ...(component?.assumptions || component?.defaultAssumptions || [
      'Illustrative scenario: Baseline capital allocation aligns with selected strategic horizon.',
      'Editable assumption: Standard vendor SLA and API availability hold true.',
    ]),
  ];

  return {
    componentId: component?.id,
    componentName: component?.displayName || component?.name,
    decision,
    confidence,
    decisionStability: confidence,
    strategicImportance,
    buildAttractiveness,
    partnerAttractiveness,
    weightedScore,
    keyDrivers,
    reasonsFor,
    reasonsAgainst,
    risks,
    assumptions,
    // Supplemental data for UI consumption & backward compatibility
    metrics,
    weights: normWeights,
    hybridModel: component?.hybridModel || {
      externalPartnerCapability: 'Commercial vendor API and managed infrastructure.',
      internalOwnedCapability: 'Proprietary business logic and client interaction tier.',
    },
  };
}

/**
 * Backward compatibility alias for calculateComponentAnalysis
 */
export const evaluateDecision = calculateComponentAnalysis;

/**
 * 5. Calculates All Components Analysis.
 * 
 * Evaluates a list of infrastructure components against criteria and weights.
 * Returns a dictionary keyed by component ID.
 * 
 * @param {Array<Object>} components - List of components
 * @param {Array<Object>} criteriaList - List of criteria
 * @param {Record<string, number>} weights - Criterion weights
 * @returns {Record<string, Object>} Map of component ID to decision analysis
 */
export function calculateAllComponents(components = [], criteriaList = [], weights = {}) {
  const normWeights = normalizeWeights(weights);
  const results = {};

  components.forEach((comp) => {
    if (comp?.id) {
      results[comp.id] = calculateComponentAnalysis(comp, criteriaList, normWeights);
    }
  });

  return results;
}
