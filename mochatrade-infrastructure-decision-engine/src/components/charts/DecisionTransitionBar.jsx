/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import { DECISIONS } from '../../engine/decisionEngine.js';
import { ArrowRight, MapPin, AlertCircle } from 'lucide-react';

/**
 * Visualizes the decision transition bands across weight spectrum (0% to 50%)
 * in the requested tiered step format:
 * 
 * BUILD
 * ───────────────
 *              HYBRID
 *                   ─────────
 *                          PARTNER
 */
export function DecisionTransitionBar({
  criterionName,
  currentWeight,
  currentDecision,
  bands = [],
  transitions = [],
}) {
  const minW = 0;
  const maxW = 50;
  const range = maxW - minW;

  const getLeftPct = (w) => `${((Math.max(minW, Math.min(maxW, w)) - minW) / range) * 100}%`;
  const getWidthPct = (startW, endW) => {
    const s = Math.max(minW, Math.min(maxW, startW));
    const e = Math.max(minW, Math.min(maxW, endW));
    return `${Math.max(2, ((e - s + 1) / range) * 100)}%`;
  };

  const getTierTheme = (dec) => {
    if (dec === DECISIONS.BUILD) {
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/40',
        bar: 'bg-emerald-500',
        glow: 'shadow-emerald-950/40',
        label: 'BUILD ZONE',
      };
    }
    if (dec === DECISIONS.PARTNER) {
      return {
        text: 'text-sky-400',
        bg: 'bg-sky-500/20',
        border: 'border-sky-500/40',
        bar: 'bg-sky-500',
        glow: 'shadow-sky-950/40',
        label: 'PARTNER ZONE',
      };
    }
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/40',
      bar: 'bg-amber-500',
      glow: 'shadow-amber-950/40',
      label: 'HYBRID ZONE',
    };
  };

  // Distinct decisions ordered logically for executive reading
  const orderedDecisions = [DECISIONS.BUILD, DECISIONS.HYBRID, DECISIONS.PARTNER];

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
            Decision Transition Spectrum
          </span>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{criterionName} Weight Range (0% → 50%)</span>
          </h4>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Current Weight:</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-amber-400">
            {currentWeight}%
          </span>
          <span className="text-slate-600">·</span>
          <DecisionBadge decision={currentDecision} size="sm" />
        </div>
      </div>

      {/* Tiered Step Visualization */}
      <div className="space-y-3 pt-2">
        {orderedDecisions.map((tierDec) => {
          const tierBands = bands.filter((b) => b.decision === tierDec);
          const theme = getTierTheme(tierDec);
          const isActiveTier = currentDecision === tierDec;

          return (
            <div
              key={tierDec}
              className={`p-3 rounded-lg border transition-all ${
                isActiveTier
                  ? `${theme.bg} ${theme.border} ring-1 ring-white/10`
                  : 'bg-slate-900/40 border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold text-xs ${theme.text}`}>
                    {tierDec}
                  </span>
                  {isActiveTier && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white font-semibold">
                      Current Posture
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  {tierBands.length > 0 ? (
                    tierBands.map((b, idx) => (
                      <span key={idx}>
                        {idx > 0 && ', '}
                        {b.startWeight}% – {b.endWeight}%
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">Not triggered in 0–50% range</span>
                  )}
                </div>
              </div>

              {/* Progress track representing 0% to 50% */}
              <div className="relative h-4 bg-slate-900 rounded overflow-visible border border-slate-800/60">
                {tierBands.map((b, idx) => {
                  const left = getLeftPct(b.startWeight);
                  const width = getWidthPct(b.startWeight, b.endWeight);
                  return (
                    <div
                      key={idx}
                      className={`absolute top-0 bottom-0 rounded-sm ${theme.bar} shadow-sm transition-all`}
                      style={{ left, width }}
                      title={`${tierDec}: ${b.startWeight}% to ${b.endWeight}%`}
                    >
                      <div className="w-full h-full opacity-80 bg-linear-to-r from-white/20 to-transparent" />
                    </div>
                  );
                })}

                {/* Current Weight Marker */}
                {isActiveTier && (
                  <div
                    className="absolute -top-1 bottom-0 z-20 flex flex-col items-center pointer-events-none"
                    style={{ left: getLeftPct(currentWeight) }}
                  >
                    <div className="w-2.5 h-6 bg-amber-400 rounded-sm shadow-md border border-slate-950 -translate-x-1/2" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale Axis */}
      <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1 pt-1 border-t border-slate-800/80">
        <span>0% (Neglect)</span>
        <span>10%</span>
        <span>20% (Balanced)</span>
        <span>30%</span>
        <span>40% (Dominant)</span>
        <span>50% (Max Allocation)</span>
      </div>

      {/* Identified Tipping Threshold Summary */}
      {transitions.length > 0 ? (
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Calculated Decision Transition Points:
          </span>
          <div className="space-y-1.5">
            {transitions.map((t, idx) => {
              const sign = t.deltaFromCurrent > 0 ? '+' : '';
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-slate-950/70 border border-slate-800/60 rounded text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">At</span>
                    <span className="font-bold text-amber-400">{t.thresholdWeight}%</span>
                    <span className="text-slate-400">weight:</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className={t.fromDecision === DECISIONS.BUILD ? 'text-emerald-400' : t.fromDecision === DECISIONS.PARTNER ? 'text-sky-400' : 'text-amber-400'}>
                        {t.fromDecision}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className={t.toDecision === DECISIONS.BUILD ? 'text-emerald-400' : t.toDecision === DECISIONS.PARTNER ? 'text-sky-400' : 'text-amber-400'}>
                        {t.toDecision}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Delta required:{' '}
                    <span className="font-bold text-slate-200">
                      {sign}{t.deltaFromCurrent}%
                    </span>{' '}
                    from current ({t.currentWeight}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Decision is highly robust against weight changes on {criterionName}. The recommendation remains {currentDecision} across the entire 0%–50% span.
          </span>
        </div>
      )}
    </div>
  );
}
