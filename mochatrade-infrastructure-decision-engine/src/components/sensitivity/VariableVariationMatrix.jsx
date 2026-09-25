/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

/**
 * Displays the dynamic step-by-step recalculations across weight variations
 * (e.g. 10% → 15% → 20% → 25% → 30% → 35%).
 */
export function VariableVariationMatrix({
  criterionName = 'Strategic Criterion',
  currentWeight = 15,
  currentDecision = 'BUILD',
  sweepResults = [],
  onSelectWeight,
}) {
  if (!sweepResults || sweepResults.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
            Step-by-Step Recalculation Ledger
          </span>
          <h4 className="text-sm font-bold text-white">
            {criterionName} Sensitivity Sweep (Recalculated at Every Step)
          </h4>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Baseline Weight: <span className="text-amber-400 font-bold">{currentWeight}%</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-950/60">
              <th className="py-2.5 px-3">Weight Step</th>
              <th className="py-2.5 px-3">Calculated Decision</th>
              <th className="py-2.5 px-3">Strategic Imp.</th>
              <th className="py-2.5 px-3">Build Attract.</th>
              <th className="py-2.5 px-3">Partner Attract.</th>
              <th className="py-2.5 px-3">Decision Stability</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {sweepResults.map((step) => {
              const isCurrent = step.isCurrent;
              const isFlip = step.isFlip;

              return (
                <tr
                  key={step.weight}
                  onClick={() => onSelectWeight && onSelectWeight(step.weight)}
                  className={`transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-950/30 hover:bg-amber-950/40 ring-1 ring-amber-500/20'
                      : isFlip
                      ? 'bg-rose-950/15 hover:bg-rose-950/25'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Weight Step */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className={isCurrent ? 'text-amber-400' : 'text-white'}>
                        {step.weight}%
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
                          Current
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Calculated Decision */}
                  <td className="py-2.5 px-3">
                    <DecisionBadge decision={step.decision} size="sm" />
                  </td>

                  {/* Strategic Imp */}
                  <td className="py-2.5 px-3 text-indigo-300">
                    {step.strategicImportance}
                  </td>

                  {/* Build Attract */}
                  <td className="py-2.5 px-3 text-emerald-300">
                    {step.buildAttractiveness}
                  </td>

                  {/* Partner Attract */}
                  <td className="py-2.5 px-3 text-sky-300">
                    {step.partnerAttractiveness}
                  </td>

                  {/* Decision Stability */}
                  <td className="py-2.5 px-3 text-amber-300">
                    {step.confidence}%
                  </td>

                  {/* Status Indicator */}
                  <td className="py-2.5 px-3 font-sans">
                    {isFlip ? (
                      <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/30">
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        Tipping Triggered
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500/70" />
                        Steady
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2">
        <span>Click any row to simulate that weight in the live sandbox.</span>
        <span className="text-rose-400">Rows highlighted in red denote decision transitions.</span>
      </div>
    </div>
  );
}
