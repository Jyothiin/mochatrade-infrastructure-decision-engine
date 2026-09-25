/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useStrategy } from '../context/StrategyContext.jsx';

/**
 * Custom hook to access calculated strategy evaluations and component summaries
 */
export function useDecisionData() {
  const strategy = useStrategy();
  
  const components = strategy.components || [];
  const evaluations = strategy.evaluations || {};

  const totalCount = components.length;
  let buildCount = 0;
  let partnerCount = 0;
  let hybridCount = 0;
  let totalConfidence = 0;

  components.forEach((c) => {
    const ev = evaluations[c.id];
    if (ev) {
      if (ev.decision === 'BUILD') buildCount++;
      else if (ev.decision === 'PARTNER') partnerCount++;
      else hybridCount++;
      totalConfidence += ev.confidence || 0;
    }
  });

  const avgConfidence = totalCount > 0 ? Math.round(totalConfidence / totalCount) : 0;

  return {
    ...strategy,
    stats: {
      totalCount,
      buildCount,
      partnerCount,
      hybridCount,
      avgConfidence,
    },
  };
}
