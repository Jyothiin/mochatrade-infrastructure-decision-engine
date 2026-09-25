/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStrategy } from '../../context/StrategyContext.jsx';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import {
  X,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  SlidersHorizontal,
  Table,
  Scale,
  Sparkles,
  Info,
  TrendingUp,
  Zap,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DECISIONS } from '../../engine/decisionEngine.js';
import { ROUTES } from '../../utils/constants.js';
import { explainDecisionWithAI } from '../../services/aiExplanation.js';

export function DecisionReasoningModal({ componentId, onClose }) {
  const navigate = useNavigate();
  const {
    components,
    criteria,
    evaluations,
    reasoningMap,
    updateComponent,
    setSelectedComponentId,
  } = useStrategy();

  const [newAssumptionText, setNewAssumptionText] = useState('');
  const [showAddAssumption, setShowAddAssumption] = useState(false);
  const [showAllContributions, setShowAllContributions] = useState(true);
  const [aiState, setAiState] = useState({ status: 'idle', text: '', reason: '' });

  const component = components.find((c) => c.id === componentId);
  const evaluation = evaluations[componentId];
  const reasoning = reasoningMap[componentId];

  if (!component || !evaluation || !reasoning) return null;

  const { decision, strategicImportance, buildAttractiveness, partnerAttractiveness, confidence } = evaluation;
  const {
    decisionExplanation,
    topThreeCriteria = [],
    positiveDrivers = [],
    negativeDrivers = [],
    allContributions = [],
    reasonsFor = [],
    reasonsAgainst = [],
    risks = [],
    assumptions = [],
    whatCouldChange = [],
    hybridModel,
  } = reasoning;

  // Stance header label: "WHY BUILD?", "WHY PARTNER?", "WHY HYBRID?"
  const getDecisionHeaderTitle = () => {
    if (decision === DECISIONS.BUILD) return 'WHY BUILD?';
    if (decision === DECISIONS.PARTNER) return 'WHY PARTNER?';
    return 'WHY HYBRID?';
  };

  const getDecisionTheme = () => {
    if (decision === DECISIONS.BUILD) {
      return {
        badgeBg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
        accentText: 'text-emerald-400',
        glow: 'shadow-emerald-950/40',
      };
    }
    if (decision === DECISIONS.PARTNER) {
      return {
        badgeBg: 'bg-sky-500/10 border-sky-500/40 text-sky-300',
        accentText: 'text-sky-400',
        glow: 'shadow-sky-950/40',
      };
    }
    return {
      badgeBg: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
      accentText: 'text-amber-400',
      glow: 'shadow-amber-950/40',
    };
  };

  const theme = getDecisionTheme();

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleExplainWithAI = async () => {
    setAiState({ status: 'loading', text: '', reason: '' });
    const result = await explainDecisionWithAI({
      component: component.displayName || component.name,
      criteria,
      weights: evaluation.weights,
      scores: evaluation.metrics,
      strategicImportance,
      buildAttractiveness,
      partnerAttractiveness,
      recommendation: decision,
      keyDrivers: reasoning.keyDrivers,
      risks,
      assumptions,
    });
    setAiState(result.available
      ? { status: 'ready', text: result.text, reason: '' }
      : { status: 'unavailable', text: '', reason: result.reason });
  };

  const handleAddAssumption = (e) => {
    e.preventDefault();
    if (!newAssumptionText.trim()) return;
    const updated = [
      ...(component.assumptions || []),
      `Documented assumption: ${newAssumptionText.trim()}`,
    ];
    updateComponent(component.id, { assumptions: updated });
    setNewAssumptionText('');
    setShowAddAssumption(false);
  };

  const handleRemoveAssumption = (index) => {
    const updated = [...(component.assumptions || [])];
    updated.splice(index, 1);
    updateComponent(component.id, { assumptions: updated });
  };

  const handleJumpToScoring = () => {
    setSelectedComponentId(component.id);
    navigate(ROUTES.SCORING);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto" role="presentation">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="decision-reasoning-title" tabIndex="-1">
        {/* 1. Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/70 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span id="decision-reasoning-title">{getDecisionHeaderTitle()}</span>
              </span>
              <DecisionBadge decision={decision} size="sm" />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                {component.displayName || component.name}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-[11px] font-mono text-slate-400">{component.category}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-[11px] font-mono text-amber-400">
                Decision Stability: <strong>{confidence}%</strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200 text-xs">
          <section className="p-4 bg-slate-950/80 border border-slate-700 rounded-xl" aria-live="polite">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-300">Optional review aid</div>
                <h3 className="text-sm font-bold text-white mt-1">Explain This Decision</h3>
                <p className="text-[11px] text-slate-400 mt-1">The deterministic engine remains the source of truth. AI only explains the supplied model inputs.</p>
              </div>
              <button
                type="button"
                onClick={handleExplainWithAI}
                disabled={aiState.status === 'loading'}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-600 disabled:opacity-50 rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiState.status === 'loading' ? 'Generating explanation...' : 'Explain This Decision'}
              </button>
            </div>
            {aiState.status === 'unavailable' && (
              <div className="mt-3 p-3 text-[11px] text-amber-300 bg-amber-950/30 border border-amber-500/20 rounded">
                {aiState.reason}
              </div>
            )}
            {aiState.status === 'ready' && (
              <div className="mt-4 p-3 bg-sky-950/20 border border-sky-500/20 rounded">
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-300 mb-2">AI-generated explanation based on the current decision model.</div>
                <div className="whitespace-pre-wrap text-xs leading-relaxed text-slate-200">{aiState.text}</div>
              </div>
            )}
          </section>
          {/* Dimension Metric Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span>Strategic Importance</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">{strategicImportance}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${strategicImportance}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">Moat & Autonomy</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span>Build Attractiveness</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{buildAttractiveness}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${buildAttractiveness}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">Proprietary Payoff</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span>Partner Attractiveness</span>
                <span className="font-mono font-bold text-sky-400 text-sm">{partnerAttractiveness}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${partnerAttractiveness}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">Turnkey Relief</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span>Decision Stability</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{confidence}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${confidence}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">Stability Margin</span>
            </div>
          </div>

          {/* 3. Decision Explanation Hero (Dynamic Model-Generated Sentence) */}
          <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 rounded-xl relative shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                DYNAMIC DECISION EXPLANATION
              </span>
              <span className="text-[11px] text-slate-400">
                (Model-Generated Rationale)
              </span>
            </div>
            <blockquote className="text-sm sm:text-base font-medium text-slate-100 italic leading-relaxed border-l-3 border-emerald-500 pl-3">
              "{decisionExplanation}"
            </blockquote>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Calculated deterministically from the mathematical interaction of active criteria weights, directional biases, and component scores.
            </p>
          </div>

          {/* 4. Highlight: The 3 Most Influential Criteria */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>3 Most Influential Criteria</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Ranked by Strategic Leverage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topThreeCriteria.map((crit, idx) => (
                <div
                  key={crit.criterionId}
                  className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      Rank #{crit.rank || idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {crit.formattedContribution}
                    </span>
                  </div>

                  <h5 className="font-bold text-white text-xs mb-1 truncate">{crit.name}</h5>

                  <div className="space-y-1 font-mono text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Weight:</span>
                      <span className="text-slate-200 font-semibold">{crit.weight}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <span className="text-slate-200 font-semibold">{crit.score} / 10</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/80">
                      <span>Contribution:</span>
                      <span className="text-emerald-400 font-bold">{crit.formattedContribution} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Positive Drivers vs Trade-offs (Two-Column Comparison) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Positive Drivers */}
            <div className="p-4 bg-slate-950/70 border border-emerald-950/50 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-900/30 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    +
                  </span>
                  Positive Drivers
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {positiveDrivers.length} Supporting
                </span>
              </div>

              <div className="space-y-2">
                {positiveDrivers.map((driver) => (
                  <div
                    key={driver.criterionId}
                    className="p-2.5 bg-slate-900/80 border border-emerald-900/30 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-400 text-sm select-none">+</span>
                        <span className="font-semibold text-slate-200 text-xs truncate">
                          {driver.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block pl-3.5">
                        Score: {driver.score}/10 · Weight: {driver.weight}%
                      </span>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <span className="text-emerald-400 font-bold text-xs">
                        +{driver.contribution.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-400 block">contribution</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Trade-offs / Negative Drivers */}
            <div className="p-4 bg-slate-950/70 border border-amber-950/50 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    −
                  </span>
                  Trade-offs & Constraints
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {negativeDrivers.length} Frictions
                </span>
              </div>

              <div className="space-y-2">
                {negativeDrivers.map((driver) => (
                  <div
                    key={driver.criterionId}
                    className="p-2.5 bg-slate-900/80 border border-amber-900/30 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-400 text-sm select-none">−</span>
                        <span className="font-semibold text-slate-200 text-xs truncate">
                          {driver.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block pl-3.5">
                        Score: {driver.score}/10 · Weight: {driver.weight}%
                      </span>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <span className="text-amber-400 font-bold text-xs">
                        −{driver.contribution.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-400 block">drag pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Complete Mathematical Contribution Table */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-slate-400" />
                  <span>Transparent Criterion Contribution Ledger</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Formula: Contribution = (Weight% / 100) × Raw Score
                </p>
              </div>
              <button
                onClick={() => setShowAllContributions(!showAllContributions)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                {showAllContributions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showAllContributions && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                      <th className="py-2.5 px-3">Criterion</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Direction</th>
                      <th className="py-2.5 px-3 text-right">Weight</th>
                      <th className="py-2.5 px-3 text-right">Score</th>
                      <th className="py-2.5 px-3 text-right font-bold text-white">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {allContributions.map((item) => (
                      <tr key={item.criterionId} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400">
                          {item.category}
                        </td>
                        <td className="py-2.5 px-3 text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              item.direction.includes('BUILD')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            }`}
                          >
                            {item.direction.replace('FAVORS_', '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {item.weight}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300 font-bold">
                          {item.score} / 10
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          <span
                            className={
                              item.isPositive ? 'text-emerald-400' : 'text-amber-400'
                            }
                          >
                            {item.formattedContribution}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 7. What Could Change the Decision (Tipping Points & Triggers) */}
          <div className="p-4 bg-slate-950/80 border border-amber-900/40 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                What Could Change the Decision?
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Sensitivity Tipping Points</span>
            </div>

            <div className="space-y-2">
              {whatCouldChange.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="text-slate-200 font-medium block">
                      {item.condition}
                    </span>
                    <span className="text-amber-400/90 font-mono text-[11px] block">
                      → {item.result}
                    </span>
                  </div>
                  <button
                    onClick={handleJumpToScoring}
                    className="self-start sm:self-auto px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer shrink-0"
                  >
                    Test in Matrix
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Strategic Risks */}
          <div className="p-4 bg-slate-950/70 border border-rose-950/40 rounded-xl space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Strategic & Governance Risks
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {risks.map((risk, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-rose-950/20 border border-rose-900/30 rounded text-xs text-slate-300 leading-relaxed"
                >
                  {risk}
                </div>
              ))}
            </div>
          </div>

          {/* 9. Documented Assumptions (Editable) */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  Documented Assumptions
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  (Editable Architecture Assumptions)
                </span>
              </div>
              <button
                onClick={() => setShowAddAssumption(!showAddAssumption)}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Assumption</span>
              </button>
            </div>

            {showAddAssumption && (
              <form onSubmit={handleAddAssumption} className="flex gap-2">
                <input
                  type="text"
                  value={newAssumptionText}
                  onChange={(e) => setNewAssumptionText(e.target.value)}
                  placeholder="Enter strategic or technical assumption..."
                  className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Save
                </button>
              </form>
            )}

            <div className="space-y-1.5">
              {assumptions.map((assump, idx) => (
                <div
                  key={idx}
                  className="group p-2 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-300"
                >
                  <span className="pr-2">{assump}</span>
                  <button
                    onClick={() => handleRemoveAssumption(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
                    title="Remove assumption"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 10. Hybrid Model Architecture (if HYBRID) */}
          {decision === DECISIONS.HYBRID && hybridModel && (
            <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Recommended Hybrid Architecture Partition
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/90 border border-emerald-900/40 rounded-lg">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    INTERNAL / PROPRIETARY CAPABILITY
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {hybridModel.internalOwnedCapability}
                  </p>
                </div>
                <div className="p-3 bg-slate-900/90 border border-sky-900/40 rounded-lg">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
                    EXTERNAL / PARTNER RAILS
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {hybridModel.externalPartnerCapability}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Modal Sticky Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleJumpToScoring}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Tune Scores</span>
            </button>
            <button
              onClick={() => {
                onClose();
                navigate(`/decisions/${componentId}/sensitivity`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Sensitivity Analysis</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Drilldown
          </button>
        </div>
      </div>
    </div>
  );
}
