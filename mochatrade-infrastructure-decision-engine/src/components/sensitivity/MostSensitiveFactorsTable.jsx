/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import { ArrowRight, AlertTriangle, ShieldCheck, Zap, Sliders, ChevronRight } from 'lucide-react';

export function MostSensitiveFactorsTable({
  factors = [],
  currentDecision,
  onSelectCriterion,
  selectedCriterionId,
}) {
  if (!factors || factors.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400 space-y-2">
        <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
        <h4 className="text-sm font-semibold text-white">Exceptionally High Decision Stability</h4>
        <p className="max-w-md mx-auto text-slate-400">
          This component's recommendation of <span className="font-bold text-white">{currentDecision}</span> is mathematically robust. No single weight perturbation within realistic ranges (0% to 50%) flips the stance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Most Decision-Sensitive Factors
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Ranked by proximity to tipping point. These are the criteria where the smallest weight shift or score change alters the recommendation.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded bg-amber-950/40 text-amber-400 border border-amber-500/20 text-xs font-mono font-semibold self-start sm:self-auto">
          {factors.length} Decision Trigger(s) Detected
        </span>
      </div>

      {/* Factors Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-950/60">
              <th className="py-2.5 px-3">Rank / Criterion</th>
              <th className="py-2.5 px-3">Current Value</th>
              <th className="py-2.5 px-3">Decision Threshold</th>
              <th className="py-2.5 px-3">Resulting Change</th>
              <th className="py-2.5 px-3">Delta Required</th>
              <th className="py-2.5 px-3 min-w-64">Strategic Causal Explanation</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {factors.map((factor, idx) => {
              const isSelected = factor.criterionId === selectedCriterionId;
              const isRankOne = idx === 0;

              return (
                <tr
                  key={factor.criterionId}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-amber-950/20 hover:bg-amber-950/30'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* 1. Criterion */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                          isRankOne
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-white block">
                          {factor.criterionName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {factor.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 2. Current Weight / Value */}
                  <td className="py-3 px-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold">
                      {factor.currentValDisplay}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {factor.primaryTriggerType === 'WEIGHT' ? 'Weight' : 'Score'}
                    </span>
                  </td>

                  {/* 3. Threshold */}
                  <td className="py-3 px-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/30 text-amber-400 font-bold">
                      {factor.thresholdDisplay}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      Tipping boundary
                    </span>
                  </td>

                  {/* 4. Resulting Decision Change */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <DecisionBadge decision={factor.fromDecision} size="sm" />
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <DecisionBadge decision={factor.toDecision} size="sm" />
                    </div>
                  </td>

                  {/* Delta Required */}
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`font-bold ${
                        Math.abs(factor.weightDelta ?? factor.scoreDelta ?? 99) <= 5
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {(factor.weightDelta ?? factor.scoreDelta ?? 0) > 0 ? '+' : ''}
                      {factor.weightDelta !== null ? `${factor.weightDelta}%` : `${factor.scoreDelta} pts`}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {Math.abs(factor.weightDelta ?? factor.scoreDelta ?? 99) <= 5
                        ? 'High sensitivity'
                        : 'Moderate barrier'}
                    </span>
                  </td>

                  {/* Strategic Explanation */}
                  <td className="py-3 px-3 text-xs text-slate-300 leading-relaxed">
                    {factor.explanation}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectCriterion && onSelectCriterion(factor.criterionId)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      <span>{isSelected ? 'Active' : 'Analyze'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Strategic Insight Takeaway */}
      <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-2.5 text-xs text-slate-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Strategy Governance Guideline: </span>
          Factors with small threshold deltas ({'≤'}5%) indicate that committee disagreements on criterion weights directly alter capital allocation decisions. Ensure executive alignment on these specific parameters during board reviews.
        </div>
      </div>
    </div>
  );
}
