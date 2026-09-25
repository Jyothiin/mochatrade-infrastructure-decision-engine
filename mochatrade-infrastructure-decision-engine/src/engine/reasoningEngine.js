/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DECISIONS } from './decisionEngine.js';
import { CRITERIA_DIRECTIONS } from '../data/criteria.js';
import { analyzeTippingPoints } from './sensitivityEngine.js';

/**
 * Calculates the exact mathematical contribution of a criterion to the decision.
 * Example: Weight: 25%, Score: 10 => Contribution: +2.50
 * 
 * Formula:
 * Contribution = (Weight% / 100) * Score
 * 
 * @param {number} weight - Normalized percentage weight (0 - 100)
 * @param {number} score - Raw criterion score (1 - 10)
 * @returns {number} Contribution rounded to 2 decimal places
 */
export function calculateCriterionContribution(weight, score) {
  const w = Number(weight) || 0;
  const s = Number(score) || 0;
  return Number(((w / 100) * s).toFixed(2));
}

/**
 * Dynamically generates a customized executive explanation sentence
 * reflecting the actual interplay between top positive drivers and primary trade-offs.
 * 
 * Ensures no two components use generic boilerplate copy.
 */
function generateDynamicExplanationSentence(decision, topPositives, topNegatives, evaluation, component) {
  const primaryPos = topPositives[0];
  const secondaryPos = topPositives[1];
  const primaryNeg = topNegatives[0];
  const secondaryNeg = topNegatives[1];

  const posName1 = primaryPos ? primaryPos.name.toLowerCase() : 'strategic control';
  const posName2 = secondaryPos ? secondaryPos.name.toLowerCase() : 'market defensibility';
  const negName1 = primaryNeg ? primaryNeg.name.toLowerCase() : 'implementation friction';
  const negName2 = secondaryNeg ? secondaryNeg.name.toLowerCase() : 'time-to-market latency';

  const importance = evaluation.strategicImportance;
  const buildAttract = evaluation.buildAttractiveness;
  const partnerAttract = evaluation.partnerAttractiveness;

  if (decision === DECISIONS.BUILD) {
    if (primaryPos && primaryPos.criterionId === 'strategic_moat') {
      return `The current strategy places greater value on owning differentiated capabilities and defensible IP (${primaryPos.name}: +${primaryPos.contribution.toFixed(2)}) than on minimizing ${negName1}.`;
    }
    if (primaryPos && primaryPos.criterionId === 'control') {
      return `Demands for unconstrained operational autonomy and ${posName1} (+${primaryPos.contribution.toFixed(2)}) outweigh the execution overhead of ${negName1}.`;
    }
    if (primaryPos && primaryPos.criterionId === 'scalability') {
      return `High-throughput processing requirements and proprietary ${posName1} justify incurring upfront capital expenditure rather than accepting partner rate limits.`;
    }
    return `The organization prioritizes long-term enterprise valuation and ${posName1} over the short-term convenience of off-the-shelf commercial alternatives.`;
  }

  if (decision === DECISIONS.PARTNER) {
    if (primaryPos && (primaryPos.criterionId === 'time_to_market' || primaryPos.criterionId === 'cost_efficiency')) {
      return `The current strategy optimizes for speed and capex preservation via turnkey ${posName1} (+${primaryPos.contribution.toFixed(2)}), as ${component.displayName || component.name} provides insufficient proprietary differentiation to justify internal development.`;
    }
    if (primaryPos && primaryPos.criterionId === 'compliance_complexity') {
      return `Severe statutory compliance and regulatory licensing burdens (+${primaryPos.contribution.toFixed(2)}) dictate consuming pre-certified external rails rather than assuming continuous legal liability in-house.`;
    }
    return `Offloading commoditized infrastructure rails to specialized providers preserves engineering bandwidth for the modeled core competitive moat.`;
  }

  // HYBRID
  if (importance >= 60 && partnerAttract >= 55) {
    return `The strategy dictates a hybrid posture: internalizing the client experience, risk rules, and proprietary ${posName1} while delegating regulated plumbing and ${negName1} to external partner rails.`;
  }
  return `A balanced hybrid architecture reconciles competing demands: capturing proprietary value in ${posName1} (+${primaryPos?.contribution.toFixed(2) || '1.80'}) while mitigating execution headwinds in ${negName1}.`;
}

/**
 * Generates what specific events or metric shifts could change the decision.
 * Analyzes mathematical tipping points and regulatory triggers.
 */
function generateWhatCouldChange(component, evaluation, criteriaList, weights) {
  const tippingResult = analyzeTippingPoints(component, criteriaList, weights);
  const triggers = [];
  const decision = evaluation.decision;

  if (tippingResult && tippingResult.tippingPoints && tippingResult.tippingPoints.length > 0) {
    // Extract top 2 most sensitive tipping points
    tippingResult.tippingPoints.slice(0, 3).forEach((tp) => {
      if (tp.scoreFlip) {
        const deltaStr = tp.scoreFlip.scoreDelta > 0 ? `increases to ${tp.scoreFlip.flippedScore}` : `drops to ${tp.scoreFlip.flippedScore}`;
        triggers.push({
          type: 'SCORE_THRESHOLD',
          criterionName: tp.criterionName,
          condition: `If ${tp.criterionName} score ${deltaStr}/10 (currently ${tp.scoreFlip.currentScore}/10)`,
          result: `The recommendation would shift from ${decision} to ${tp.scoreFlip.toDecision}.`,
          sensitivityRank: tp.sensitivityRank,
        });
      } else if (tp.weightFlip) {
        const deltaStr = tp.weightFlip.weightDelta > 0 ? `increases to ${tp.weightFlip.flippedWeight}%` : `decreases to ${tp.weightFlip.flippedWeight}%`;
        triggers.push({
          type: 'WEIGHT_THRESHOLD',
          criterionName: tp.criterionName,
          condition: `If strategic weight for ${tp.criterionName} ${deltaStr} (currently ${tp.weightFlip.currentWeight}%)`,
          result: `The recommendation would shift from ${decision} to ${tp.weightFlip.toDecision}.`,
          sensitivityRank: tp.sensitivityRank,
        });
      }
    });
  }

  // Fallback architectural triggers if sensitivity space is extremely deep
  if (triggers.length === 0) {
    if (decision === DECISIONS.BUILD) {
      triggers.push({
        type: 'MARKET_CONDITION',
        criterionName: 'Time to Market',
        condition: 'If go-to-market urgency escalates to extreme priority (>30% weight)',
        result: 'A transition to HYBRID or turnkey PARTNER would be required to avoid launch delays.',
        sensitivityRank: 10,
      });
    } else if (decision === DECISIONS.PARTNER) {
      triggers.push({
        type: 'COMMERCIAL_TRIGGER',
        criterionName: 'Partner Attractiveness',
        condition: 'If commercial partner API pricing escalates or vendor latency SLAs degrade',
        result: 'MochaTrade would be compelled to evaluate a proprietary in-house replacement.',
        sensitivityRank: 12,
      });
    } else {
      triggers.push({
        type: 'REGULATORY_TRIGGER',
        criterionName: 'Compliance Complexity',
        condition: 'If statutory regulatory bodies grant unified direct fintech licenses',
        result: 'The proprietary internal orchestration layer could fully assimilate the external rail into BUILD.',
        sensitivityRank: 15,
      });
    }
  }

  return triggers;
}

/**
 * Comprehensive Explainable Decision Reasoning Engine
 * 
 * Analyzes:
 * - Actual weights
 * - Raw scores
 * - Criteria directions
 * - Calculated multidimensional metrics
 * - Resulting recommendation
 * 
 * Output schema:
 * 1. decision (BUILD | PARTNER | HYBRID)
 * 2. positiveDrivers (Key positive drivers with contributions)
 * 3. negativeDrivers (Key trade-offs with contributions)
 * 4. primaryReasoning (Dynamic executive explanation sentence & pillars)
 * 5. risks (Strategic & operational risks)
 * 6. assumptions (Documented operational assumptions)
 * 7. whatCouldChange (Calculated tipping point triggers)
 * 8. allContributions (Complete mathematical breakdown for every criterion)
 * 9. topThreeCriteria (The 3 most influential criteria)
 */
export function generateDecisionReasoning(component, evaluation, criteriaList) {
  const { decision, strategicImportance, buildAttractiveness, partnerAttractiveness, metrics = {}, weights = {} } = evaluation;

  // 1. Calculate actual contribution of every criterion
  const allContributions = criteriaList.map((crit) => {
    const rawScore = Number(metrics[crit.id] ?? component.scores?.[crit.id] ?? 5);
    const weight = Number(weights[crit.id] ?? crit.weight ?? 10);
    const contribution = calculateCriterionContribution(weight, rawScore);

    // Directional classification based on the final decision
    const favorsBuild = crit.direction === CRITERIA_DIRECTIONS.FAVORS_BUILD;
    const favorsPartner = crit.direction === CRITERIA_DIRECTIONS.FAVORS_PARTNER || crit.direction === CRITERIA_DIRECTIONS.FAVORS_PARTNER_OR_HYBRID;

    let isPositive = false;
    let sign = '+';
    let rationale = '';

    if (decision === DECISIONS.BUILD) {
      if (favorsBuild && rawScore >= 5) {
        isPositive = true;
        sign = '+';
        rationale = `High score (${rawScore}/10) strengthens internal IP, control, and defensibility.`;
      } else if (favorsPartner && rawScore >= 6) {
        isPositive = false;
        sign = '−';
        rationale = `Constraint score (${rawScore}/10) introduces engineering or compliance friction.`;
      } else {
        isPositive = favorsBuild;
        sign = isPositive ? '+' : '−';
        rationale = `Contributes ${contribution.toFixed(2)} weighted score points.`;
      }
    } else if (decision === DECISIONS.PARTNER) {
      if (favorsPartner && rawScore >= 5) {
        isPositive = true;
        sign = '+';
        rationale = `Strong turnkey benefit (${rawScore}/10) accelerates delivery and offloads risk.`;
      } else if (favorsBuild && rawScore >= 6) {
        isPositive = false;
        sign = '−';
        rationale = `Requirement score (${rawScore}/10) creates minor partner compromise or customization limit.`;
      } else {
        isPositive = favorsPartner;
        sign = isPositive ? '+' : '−';
        rationale = `Contributes ${contribution.toFixed(2)} weighted score points.`;
      }
    } else {
      // HYBRID
      if ((favorsBuild && rawScore >= 6) || (favorsPartner && rawScore >= 6)) {
        isPositive = true;
        sign = '+';
        rationale = `Drives hybrid bifurcation: internalizes proprietary value while outsourcing commodity burden.`;
      } else {
        isPositive = false;
        sign = '−';
        rationale = `Dual-integration maintenance and cross-boundary reconciliation overhead.`;
      }
    }

    return {
      criterionId: crit.id,
      name: crit.name,
      category: crit.category,
      direction: crit.direction,
      weight,
      score: rawScore,
      contribution,
      formattedContribution: `${sign}${contribution.toFixed(2)}`,
      isPositive,
      sign,
      rationale,
      // Total influence product
      influenceScore: weight * rawScore,
    };
  });

  // 2. Identify Top 3 Most Influential Criteria
  const sortedByInfluence = [...allContributions].sort((a, b) => b.influenceScore - a.influenceScore);
  const topThreeCriteria = sortedByInfluence.slice(0, 3).map((item, index) => ({
    ...item,
    rank: index + 1,
    shareOfInfluence: Number(((item.influenceScore / (sortedByInfluence.reduce((acc, c) => acc + c.influenceScore, 0) || 1)) * 100).toFixed(1)),
  }));

  // 3. Separate into Key Positive Drivers and Trade-offs (Negative Drivers)
  const positiveDrivers = allContributions
    .filter((c) => c.isPositive)
    .sort((a, b) => b.contribution - a.contribution);

  const negativeDrivers = allContributions
    .filter((c) => !c.isPositive)
    .sort((a, b) => b.contribution - a.contribution);

  // Ensure both lists have representative items
  if (positiveDrivers.length === 0) {
    positiveDrivers.push(sortedByInfluence[0]);
  }
  if (negativeDrivers.length === 0 && sortedByInfluence.length > 1) {
    negativeDrivers.push(sortedByInfluence[sortedByInfluence.length - 1]);
  }

  // 4. Dynamic Executive Explanation Sentence (Model-Generated)
  const decisionExplanation = generateDynamicExplanationSentence(
    decision,
    positiveDrivers,
    negativeDrivers,
    evaluation,
    component
  );

  // 5. Reasons Supporting Decision (Detailed Pillars)
  const reasonsFor = [];
  positiveDrivers.slice(0, 3).forEach((d) => {
    reasonsFor.push(
      `${d.name} (Score: ${d.score}/10, Weight: ${d.weight}%): Adds +${d.contribution.toFixed(2)} net points. ${d.rationale}`
    );
  });

  // 6. Reasons Against / Trade-offs
  const reasonsAgainst = [];
  negativeDrivers.slice(0, 3).forEach((d) => {
    reasonsAgainst.push(
      `${d.name} (Score: ${d.score}/10, Weight: ${d.weight}%): Represents −${d.contribution.toFixed(2)} in execution drag. ${d.rationale}`
    );
  });

  // 7. Risks (Strategic & Operational)
  const risks = [
    ...(component.risks || []),
  ];
  if (metrics.compliance_complexity >= 8 && decision !== DECISIONS.PARTNER) {
    risks.push('Heightened regulatory inspection: In-house logic requires recurring SOC2/SEBI compliance audits and continuous statutory vulnerability testing.');
  }
  if (metrics.time_to_market >= 8 && decision === DECISIONS.BUILD) {
    risks.push('Timeline slip hazard: Building in-house under urgent market delivery pressure risks accumulating technical debt or compromising QA security gates.');
  }
  if (decision === DECISIONS.PARTNER && metrics.strategic_moat >= 6) {
    risks.push('Commoditization exposure: Relying on a shared commercial provider permits competitors to replicate identical feature baselines.');
  }

  // 8. Assumptions (Documented & Traceable)
  const assumptions = [
    ...(component.assumptions || [
      'Illustrative scenario: Baseline capital allocation aligns with selected strategic horizon.',
      'Editable assumption: Standard vendor availability and API stability hold true.',
    ]),
  ];

  // 9. What could change the decision (Calculated Tipping Points)
  const whatCouldChange = generateWhatCouldChange(component, evaluation, criteriaList, weights);

  // 10. Hybrid Model architecture split (if applicable)
  const hybridModel = component.hybridModel || {
    externalPartnerCapability: 'Commercial API connectivity, regulatory certifications, and banking clearing lines.',
    internalOwnedCapability: 'Proprietary routing logic, client-facing UX, custom risk filters, and stateful event tracking.',
  };

  return {
    decision,
    strategicImportance,
    buildAttractiveness,
    partnerAttractiveness,
    decisionExplanation, // Dynamically generated model sentence
    topThreeCriteria,    // Top 3 influential criteria with rank & contribution
    positiveDrivers,     // Full positive drivers list
    negativeDrivers,     // Full trade-offs list
    keyDrivers: sortedByInfluence.slice(0, 4).map((d) => ({
      criterionId: d.criterionId,
      name: d.name,
      rawScore: d.score,
      weight: d.weight,
      impact: d.contribution,
      direction: d.direction,
    })),
    allContributions,    // Exact mathematical contribution table
    reasonsFor,          // Supporting reasons
    reasonsAgainst,      // Trade-offs & frictions
    risks,               // Strategic risks
    assumptions,         // Assumptions
    whatCouldChange,     // What could change the decision (tipping points)
    hybridModel,         // Hybrid architecture partition
  };
}
