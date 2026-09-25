/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStrategy } from '../../context/StrategyContext.jsx';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import {
  Compass,
  Scale,
  Clock,
  RotateCcw,
  ShieldCheck,
  Handshake,
  Layers,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Info,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants.js';

export function ScoringSideSummary({ onInspectComponent }) {
  const {
    activeScenario,
    strategyProfile,
    criteria,
    weights,
    normalizedWeights,
    components,
    evaluations,
    lastUpdated,
    selectedComponentId,
    setSelectedComponentId,
    triggerNormalizeWeights,
    resetDemoScores,
  } = useStrategy();

  const [confirmReset, setConfirmReset] = useState(false);

  // Total weight of active criteria
  const activeCriteria = criteria.filter((c) => c.enabled !== false);
  const rawActiveWeightSum = activeCriteria.reduce(
    (sum, c) => sum + (Number(weights[c.id]) || 0),
    0
  );
  const isWeightBalanced = Math.abs(rawActiveWeightSum - 100) < 0.01;

  // Format last updated time
  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'Just now';
    }
  };

  // Portfolio decision stats
  const decisionCounts = {
    BUILD: 0,
    PARTNER: 0,
    HYBRID: 0,
  };
  components.forEach((c) => {
    const ev = evaluations[c.id];
    if (ev?.decision && decisionCounts[ev.decision] !== undefined) {
      decisionCounts[ev.decision] += 1;
    }
  });

  // Selected component evaluation
  const activeComponent =
    components.find((c) => c.id === selectedComponentId) || components[0];
  const activeEv = activeComponent ? evaluations[activeComponent.id] : null;

  const handleResetScores = () => {
    resetDemoScores();
    setConfirmReset(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Strategy & Engine Status Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Current Strategy
            </span>
          </div>
          <Link
            to={ROUTES.STRATEGY}
            className="text-[11px] text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
          >
            <span>Edit</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="mt-3 space-y-2.5">
          <div>
            <div className="text-sm font-semibold text-white">
              {activeScenario?.name || 'Balanced Strategic Trade-off'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
              {strategyProfile?.strategyObjective ||
                activeScenario?.label ||
                'Equally weighted criteria balancing proprietary capability defense against execution velocity.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <div className="bg-slate-950 p-2 rounded border border-slate-800/70">
              <span className="text-slate-500 block text-[10px]">Horizon</span>
              <span className="text-slate-200 font-medium">
                {strategyProfile?.planningHorizon || '12-24 Months'}
              </span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800/70">
              <span className="text-slate-500 block text-[10px]">Risk Profile</span>
              <span className="text-slate-200 font-medium">
                {strategyProfile?.riskAppetite || 'Moderate'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Total Weight & Last Updated Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 shadow-sm space-y-3">
        {/* Total Weight Metric */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Scale className="w-3.5 h-3.5 text-sky-400" />
              <span>Total Weight</span>
            </span>
            <span
              className={`font-mono font-bold text-xs ${
                isWeightBalanced ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {rawActiveWeightSum}%
            </span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isWeightBalanced ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, rawActiveWeightSum)}%` }}
            />
          </div>

          {!isWeightBalanced ? (
            <div className="mt-2 p-2 bg-amber-950/40 border border-amber-800/50 rounded flex items-center justify-between text-[11px]">
              <span className="text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Sum is not 100%</span>
              </span>
              <button
                type="button"
                onClick={triggerNormalizeWeights}
                className="px-2 py-0.5 text-[10px] font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded transition-colors"
              >
                Normalize
              </button>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Normalized</span>
              </span>
              <span>{activeCriteria.length} Criteria Active</span>
            </div>
          )}
        </div>

        {/* Last Updated Timestamp with live pulse */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Updated</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-200 text-xs font-semibold">
              {formatTime(lastUpdated)}
            </span>
          </div>
        </div>

        {/* Reset Demo Scores Button */}
        <div className="pt-2 border-t border-slate-800/80">
          {confirmReset ? (
            <div className="p-2.5 bg-slate-950 border border-rose-500/40 rounded space-y-2">
              <p className="text-[11px] text-slate-300">
                Reset all 4 components to demo baseline scores?
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetScores}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded transition-colors"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Demo Scores</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Portfolio Distribution Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
          <span>Portfolio Stance</span>
          <span className="font-mono text-slate-400 font-normal">
            {components.length} Components
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30">
            <div className="text-[10px] text-emerald-400 font-semibold uppercase">Build</div>
            <div className="text-lg font-mono font-bold text-emerald-200">
              {decisionCounts.BUILD}
            </div>
          </div>
          <div className="p-2 rounded bg-sky-950/40 border border-sky-500/30">
            <div className="text-[10px] text-sky-400 font-semibold uppercase">Partner</div>
            <div className="text-lg font-mono font-bold text-sky-200">
              {decisionCounts.PARTNER}
            </div>
          </div>
          <div className="p-2 rounded bg-purple-950/40 border border-purple-500/30">
            <div className="text-[10px] text-purple-400 font-semibold uppercase">Hybrid</div>
            <div className="text-lg font-mono font-bold text-purple-200">
              {decisionCounts.HYBRID}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Component Live Reasoning Card */}
      {activeComponent && activeEv && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                Live Row Inspector
              </span>
              <h3 className="text-sm font-bold text-white">
                {activeComponent.displayName || activeComponent.name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {activeComponent.category}
              </p>
            </div>
            <DecisionBadge decision={activeEv.decision} size="sm" />
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Weighted Score</span>
              <span className="text-slate-100 font-mono font-bold text-xs">
                {activeEv.weightedScore} / 10
              </span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Decision Stability</span>
              <span className="text-emerald-400 font-mono font-bold text-xs">
                {activeEv.confidence}%
              </span>
            </div>
          </div>

          {/* Strategic Importance & Attractiveness duel bars */}
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>Strategic Importance</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {activeEv.strategicImportance}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-200"
                  style={{ width: `${activeEv.strategicImportance}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>Build vs Partner</span>
                <span className="font-mono text-slate-300">
                  <span className="text-emerald-400">{activeEv.buildAttractiveness}%</span> vs{' '}
                  <span className="text-sky-400">{activeEv.partnerAttractiveness}%</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full flex overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-200"
                  style={{
                    width: `${
                      (activeEv.buildAttractiveness /
                        (activeEv.buildAttractiveness + activeEv.partnerAttractiveness || 1)) *
                      100
                    }%`,
                  }}
                />
                <div
                  className="h-full bg-sky-500 transition-all duration-200"
                  style={{
                    width: `${
                      (activeEv.partnerAttractiveness /
                        (activeEv.buildAttractiveness + activeEv.partnerAttractiveness || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Top Key Drivers */}
          {activeEv.keyDrivers && activeEv.keyDrivers.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Top Decision Drivers
              </div>
              <div className="space-y-1">
                {activeEv.keyDrivers.slice(0, 3).map((driver) => (
                  <div
                    key={driver.criterionId}
                    className="flex items-center justify-between text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800/80"
                  >
                    <span className="text-slate-300 truncate max-w-[140px]">
                      {driver.name}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-400">{driver.rawScore}/10</span>
                      <span className="text-emerald-400 font-semibold text-[10px]">
                        +{driver.weightedValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Reasoning Snippet */}
          {activeEv.reasonsFor && activeEv.reasonsFor.length > 0 && (
            <div className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 leading-relaxed">
              <strong className="text-emerald-400 block text-[10px] uppercase mb-0.5">
                Primary Justification:
              </strong>
              {activeEv.reasonsFor[0]}
            </div>
          )}

          <button
            type="button"
            onClick={() => onInspectComponent(activeComponent.id)}
            className="w-full py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Full Trace & Assumptions</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
