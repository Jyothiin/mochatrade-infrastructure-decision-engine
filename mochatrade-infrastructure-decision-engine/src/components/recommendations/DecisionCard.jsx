/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import { DECISIONS, THRESHOLDS } from '../../engine/decisionEngine.js';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Flame,
  Scale,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants.js';

export function DecisionCard({
  component,
  evaluation,
  reasoning,
  onViewReasoning,
  onTestSensitivity,
}) {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!component || !evaluation || !reasoning) return null;

  const { decision, strategicImportance, buildAttractiveness, partnerAttractiveness, confidence } = evaluation;
  const { keyDrivers = [], reasonsFor = [], reasonsAgainst = [], risks = [], assumptions = [], hybridModel } = reasoning;

  // Stance styling helpers
  const getDecisionGlow = (dec) => {
    if (dec === DECISIONS.BUILD) return 'hover:border-emerald-500/50 shadow-emerald-950/20';
    if (dec === DECISIONS.PARTNER) return 'hover:border-sky-500/50 shadow-sky-950/20';
    return 'hover:border-amber-500/50 shadow-amber-950/20';
  };

  const getDecisionBadgeTheme = (dec) => {
    if (dec === DECISIONS.BUILD) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (dec === DECISIONS.PARTNER) return { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' };
    return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  };

  const badgeTheme = getDecisionBadgeTheme(decision);

  return (
    <div
      className={`bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl transition-all duration-200 flex flex-col justify-between ${getDecisionGlow(
        decision
      )}`}
    >
      {/* 1. Header Row */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-slate-950 text-slate-400 border border-slate-800">
                {component.category}
              </span>
              <span className="text-slate-600 text-xs" aria-hidden="true">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                ID: {component.id}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              {component.displayName || component.name}
            </h3>
          </div>

          <div className="shrink-0 text-right">
            <DecisionBadge decision={decision} size="md" />
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Decision Stability: <span className="font-semibold text-amber-400">{confidence}%</span>
            </div>
          </div>
        </div>

        {/* Short Architectural Scope */}
        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          {component.description}
        </p>

        {/* 2. Professional Visual Metric Gauges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg mb-5">
          {/* Strategic Importance */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Strategic Imp.</span>
              <span className="font-mono font-bold text-indigo-400 tabular-nums">
                {strategicImportance}
              </span>
            </div>
            <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, strategicImportance))}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 font-mono block">
              {strategicImportance >= THRESHOLDS.STRATEGIC_HIGH ? 'Core Moat' : strategicImportance >= THRESHOLDS.STRATEGIC_LOW ? 'Moderate' : 'Commodity'}
            </span>
          </div>

          {/* Build Attractiveness */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Build Attract.</span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                {buildAttractiveness}
              </span>
            </div>
            <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, buildAttractiveness))}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 font-mono block">
              {buildAttractiveness >= 60 ? 'Favorable' : buildAttractiveness >= 45 ? 'Balanced' : 'High Friction'}
            </span>
          </div>

          {/* Partner Attractiveness */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Partner Attract.</span>
              <span className="font-mono font-bold text-sky-400 tabular-nums">
                {partnerAttractiveness}
              </span>
            </div>
            <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, partnerAttractiveness))}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 font-mono block">
              {partnerAttractiveness >= 60 ? 'Turnkey Superior' : partnerAttractiveness >= 45 ? 'Viable Rails' : 'Disadvantaged'}
            </span>
          </div>

          {/* Decision Stability */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Decision Stability</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {confidence}%
              </span>
            </div>
            <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 font-mono block">
              {confidence >= 80 ? 'High Stability' : confidence >= 65 ? 'Stable' : 'Tipping Zone'}
            </span>
          </div>
        </div>

        {/* Dynamic Model Explanation Sentence */}
        {reasoning.decisionExplanation && (
          <div className="mb-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
              Decision Explanation
            </span>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              "{reasoning.decisionExplanation}"
            </p>
          </div>
        )}

        {/* 3. Primary Decision Drivers */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              Top Decision Drivers
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Weighted Contribution</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(reasoning.topThreeCriteria || keyDrivers).slice(0, 2).map((driver) => (
              <div
                key={driver.criterionId}
                className="p-2 bg-slate-950/60 border border-slate-800 rounded-md text-xs flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-slate-200 font-medium block truncate text-[11px]">
                    {driver.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Score: {driver.score ?? driver.rawScore}/10 · Wt: {driver.weight}%
                  </span>
                </div>
                <div className="shrink-0 text-right font-mono">
                  <span className="text-emerald-400 font-bold text-xs">
                    {driver.formattedContribution ?? `+${driver.impact ?? '0.00'}`}
                  </span>
                  <span className="text-[9px] text-slate-400 block">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Reasons Supporting Decision */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Reasons Supporting Decision
          </span>
          <div className="space-y-1.5">
            {reasonsFor.slice(0, 2).map((reason, idx) => (
              <div
                key={idx}
                className="text-xs text-slate-300 bg-emerald-950/15 border border-emerald-900/30 p-2.5 rounded flex items-start gap-2 leading-relaxed"
              >
                <span className="text-emerald-400 font-bold select-none">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Reasons Against / Trade-offs */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Reasons Against & Trade-offs
          </span>
          <div className="space-y-1.5">
            {reasonsAgainst.slice(0, 2).map((reason, idx) => (
              <div
                key={idx}
                className="text-xs text-slate-300 bg-amber-950/15 border border-amber-900/30 p-2.5 rounded flex items-start gap-2 leading-relaxed"
              >
                <span className="text-amber-400 font-bold select-none">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Risks & Assumptions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Key Risk */}
          <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Strategic Risk
            </span>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
              {risks[0] || 'Operational dependency and statutory governance scrutiny.'}
            </p>
          </div>

          {/* Key Assumption */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              Key Assumption
            </span>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
              {assumptions[0] || 'Market standards and vendor API SLA terms remain stable.'}
            </p>
          </div>
        </div>

        {/* Hybrid Architecture Breakdown (if HYBRID) */}
        {decision === DECISIONS.HYBRID && hybridModel && (
          <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-lg mb-5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Recommended Hybrid Architecture Partition</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-900/80 border border-emerald-900/30">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                  Internal (MochaTrade)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {hybridModel.internalOwnedCapability}
                </p>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-sky-900/30">
                <span className="text-[10px] font-bold text-sky-400 uppercase block mb-1">
                  External (Partner Rails)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {hybridModel.externalPartnerCapability}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Card Footer & Action Buttons */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            to={ROUTES.SCORING}
            className="text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-800"
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            <span>Edit Scores</span>
          </Link>
          <Link
            to={`/decisions/${component.id}/sensitivity`}
            className="text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-950/30 border border-amber-500/20 transition-colors py-1 px-2.5 rounded hover:bg-amber-950/50 flex items-center gap-1.5 cursor-pointer"
            title="Analyze what would change this decision"
          >
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span>Sensitivity Analysis</span>
          </Link>
        </div>

        {/* Primary Prompt Action: "View Full Reasoning" button */}
        <button
          onClick={() => onViewReasoning(component.id)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 hover:text-emerald-300 border border-slate-700 hover:border-slate-600 rounded-lg shadow-sm transition-all duration-150 cursor-pointer group"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          <span>View Full Reasoning</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
