/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStrategy } from '../../context/StrategyContext.jsx';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import { DecisionTransitionBar } from '../charts/DecisionTransitionBar.jsx';
import { SensitivityMetricsChart } from '../charts/SensitivityMetricsChart.jsx';
import { MostSensitiveFactorsTable } from './MostSensitiveFactorsTable.jsx';
import { VariableVariationMatrix } from './VariableVariationMatrix.jsx';
import {
  calculateWeightSensitivitySweep,
  calculateDecisionTransitionBands,
  analyzeMostSensitiveFactors,
  simulateCustomPerturbation,
} from '../../engine/sensitivityEngine.js';
import { DECISIONS } from '../../engine/decisionEngine.js';
import { ROUTES } from '../../utils/constants.js';
import {
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  TrendingUp,
  Scale,
  Zap,
  CheckCircle2,
  Info,
} from 'lucide-react';

export function SensitivityAnalysis({ componentId }) {
  const navigate = useNavigate();
  const {
    components,
    criteria,
    normalizedWeights,
    evaluations,
    selectedComponentId,
    setSelectedComponentId,
  } = useStrategy();

  // Active component ID resolution
  const activeCompId = componentId || selectedComponentId || (components[0]?.id ?? 'wallet');
  const currentComponent =
    components.find((c) => c.id === activeCompId || c.id.toLowerCase() === activeCompId.toLowerCase()) ||
    components[0];

  const currentEvaluation = evaluations[currentComponent?.id];

  // Active criterion being inspected in detail
  const [selectedCriterionId, setSelectedCriterionId] = useState('time_to_market');

  // Live simulation sandbox states
  const [sandboxWeight, setSandboxWeight] = useState(
    normalizedWeights[selectedCriterionId] ?? 13
  );
  const [sandboxScore, setSandboxScore] = useState(
    currentComponent?.scores?.[selectedCriterionId] ?? 5
  );

  // Switch component handler
  const handleSelectComponent = (id) => {
    setSelectedComponentId(id);
    navigate(`/decisions/${id}/sensitivity`);
    const comp = components.find((c) => c.id === id);
    if (comp) {
      setSandboxScore(comp.scores?.[selectedCriterionId] ?? 5);
    }
  };

  // Switch criterion handler
  const handleSelectCriterion = (critId) => {
    setSelectedCriterionId(critId);
    setSandboxWeight(normalizedWeights[critId] ?? 10);
    setSandboxScore(currentComponent?.scores?.[critId] ?? 5);
  };

  // 1. Calculate Most Sensitive Factors for the active component
  const sensitiveFactors = useMemo(() => {
    if (!currentComponent || !criteria || !normalizedWeights) return [];
    return analyzeMostSensitiveFactors(currentComponent, criteria, normalizedWeights);
  }, [currentComponent, criteria, normalizedWeights]);

  // 2. Calculate Transition Bands for the selected criterion
  const transitionBands = useMemo(() => {
    if (!currentComponent || !criteria || !normalizedWeights) {
      return { bands: [], transitions: [] };
    }
    return calculateDecisionTransitionBands(
      currentComponent,
      criteria,
      normalizedWeights,
      selectedCriterionId
    );
  }, [currentComponent, criteria, normalizedWeights, selectedCriterionId]);

  // 3. Calculate Weight Sensitivity Sweep for the selected criterion (0% to 50% in steps of 5%)
  const sweepData = useMemo(() => {
    if (!currentComponent || !criteria || !normalizedWeights) return [];
    return calculateWeightSensitivitySweep(
      currentComponent,
      criteria,
      normalizedWeights,
      selectedCriterionId,
      [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    );
  }, [currentComponent, criteria, normalizedWeights, selectedCriterionId]);

  // 4. Live Custom Perturbation Simulation result
  const simulatedEvaluation = useMemo(() => {
    if (!currentComponent || !criteria || !normalizedWeights) return null;
    return simulateCustomPerturbation(
      currentComponent,
      criteria,
      normalizedWeights,
      {
        weights: { [selectedCriterionId]: sandboxWeight },
        scores: { [selectedCriterionId]: sandboxScore },
      }
    );
  }, [currentComponent, criteria, normalizedWeights, selectedCriterionId, sandboxWeight, sandboxScore]);

  if (!currentComponent || !currentEvaluation || !simulatedEvaluation) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono">
        Loading sensitivity engine calculations...
      </div>
    );
  }

  const selectedCritObj = criteria.find((c) => c.id === selectedCriterionId) || criteria[0];
  const isFlipped = simulatedEvaluation.decision !== currentEvaluation.decision;
  const currentCriterionWeight = normalizedWeights[selectedCriterionId] ?? 10;
  const currentCriterionScore = currentComponent.scores?.[selectedCriterionId] ?? 5;

  const nearestTransition = transitionBands.transitions[0];

  // Quick preset scenario runners
  const applyPresetScenario = (critId, targetWeight) => {
    setSelectedCriterionId(critId);
    setSandboxWeight(targetWeight);
    setSandboxScore(currentComponent.scores?.[critId] ?? 5);
  };

  const resetToBaseline = () => {
    setSandboxWeight(normalizedWeights[selectedCriterionId] ?? 10);
    setSandboxScore(currentComponent.scores?.[selectedCriterionId] ?? 5);
  };

  return (
    <div className="space-y-8">
      {/* 1. Component Switcher Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2">
            Target Component:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {components.map((comp) => {
            const ev = evaluations[comp.id];
            const isSelected = comp.id === currentComponent.id;

            return (
              <button
                key={comp.id}
                onClick={() => handleSelectComponent(comp.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-md ring-1 ring-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{comp.displayName || comp.name}</span>
                {ev && <DecisionBadge decision={ev.decision} size="sm" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Executive Component Posture Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-slate-950 text-slate-400 border border-slate-800">
                {currentComponent.category}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Deterministic Sensitivity Model
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {currentComponent.displayName || currentComponent.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentComponent.description}
            </p>
          </div>

          {/* Current Evaluation Scorecard */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                Current Recommendation
              </span>
              <DecisionBadge decision={currentEvaluation.decision} size="lg" />
            </div>

            <div className="border-l border-slate-800 pl-4 space-y-1 font-mono text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Decision Stability:</span>
                <span className="text-amber-400 font-bold">{currentEvaluation.confidence}%</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Strategic Imp:</span>
                <span className="text-indigo-400 font-bold">{currentEvaluation.strategicImportance}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Build Attract:</span>
                <span className="text-emerald-400 font-bold">{currentEvaluation.buildAttractiveness}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Partner Attract:</span>
                <span className="text-sky-400 font-bold">{currentEvaluation.partnerAttractiveness}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section: "Most Decision-Sensitive Factors" */}
      <MostSensitiveFactorsTable
        factors={sensitiveFactors}
        currentDecision={currentEvaluation.decision}
        selectedCriterionId={selectedCriterionId}
        onSelectCriterion={(critId) => handleSelectCriterion(critId)}
      />

      {/* 4. Section: "WHAT WOULD CHANGE THE DECISION?" - Visualizations */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>What Would Change The Decision?</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspecting variable variation for{' '}
              <span className="text-white font-semibold">{selectedCritObj?.name}</span>
            </p>
          </div>

          {/* Quick Criterion Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-mono">Select Criterion:</label>
            <select
              value={selectedCriterionId}
              onChange={(e) => handleSelectCriterion(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {criteria.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Current: {normalizedWeights[c.id] ?? 10}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Executive Preset Variations requested in prompt */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Preset Boardroom Scenarios:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyPresetScenario('strategic_moat', 35)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                selectedCriterionId === 'strategic_moat' && sandboxWeight === 35
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              Strategic Moat weight: 10% → 35%
            </button>
            <button
              onClick={() => applyPresetScenario('time_to_market', 30)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                selectedCriterionId === 'time_to_market' && sandboxWeight === 30
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              Time to Market: 10% → 30%
            </button>
            <button
              onClick={() => applyPresetScenario('control', 25)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                selectedCriterionId === 'control' && sandboxWeight === 25
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              Control: 10% → 25%
            </button>
            <button
              onClick={() => applyPresetScenario('compliance_complexity', 30)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                selectedCriterionId === 'compliance_complexity' && sandboxWeight === 30
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              Regulatory Shift: 10% → 30%
            </button>
            <button
              onClick={resetToBaseline}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Visual 1: The Requested Tiered Step Visualization (BUILD ─── HYBRID ─── PARTNER) */}
        <DecisionTransitionBar
          criterionName={selectedCritObj?.name || 'Selected Criterion'}
          currentWeight={currentCriterionWeight}
          currentDecision={currentEvaluation.decision}
          bands={transitionBands.bands}
          transitions={transitionBands.transitions}
        />

        {/* Visual 2: Recharts Parametric Sensitivity Trajectory Curves */}
        <SensitivityMetricsChart
          sweepData={sweepData}
          criterionName={selectedCritObj?.name || 'Selected Criterion'}
          currentWeight={currentCriterionWeight}
          currentDecision={currentEvaluation.decision}
          thresholdWeight={nearestTransition?.thresholdWeight ?? null}
        />
      </div>

      {/* 5. Section: Step-by-Step Recalculation Ledger (Variable Variation Matrix) */}
      <VariableVariationMatrix
        criterionName={selectedCritObj?.name || 'Criterion'}
        currentWeight={currentCriterionWeight}
        currentDecision={currentEvaluation.decision}
        sweepResults={sweepData}
        onSelectWeight={(w) => setSandboxWeight(w)}
      />

      {/* 6. Live Interactive Parameter Perturbation Sandbox */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Interactive Variable Sandbox
            </h3>
          </div>
          <button
            onClick={resetToBaseline}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Sliders</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Slider 1: Weight */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Strategic Weight of {selectedCritObj?.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Baseline: {currentCriterionWeight}%
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-amber-400 text-sm">
                  {sandboxWeight}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={sandboxWeight}
                onChange={(e) => setSandboxWeight(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0% (Neglect)</span>
                <span>15% (Typical)</span>
                <span>30% (High Priority)</span>
                <span>50% (Extreme Weight)</span>
              </div>
            </div>

            {/* Slider 2: Score */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Component Score on {selectedCritObj?.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Baseline: {currentCriterionScore} / 10
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-emerald-400 text-sm">
                  {sandboxScore} / 10
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={sandboxScore}
                onChange={(e) => setSandboxScore(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1 (Commodity / High Friction)</span>
                <span>5 (Moderate)</span>
                <span>10 (Paramount Differentiator)</span>
              </div>
            </div>
          </div>

          {/* Real-time Projected Outcome Card */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-bold">
                Projected Decision Posture
              </span>

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <DecisionBadge decision={simulatedEvaluation.decision} size="lg" />
                  {isFlipped ? (
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1 bg-rose-950/50 px-2.5 py-1 rounded border border-rose-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      FLIP TRIGGERED
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">
                      (Steady with current decision)
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Strategic Imp:</span>
                  <span className="text-indigo-400 font-bold">
                    {simulatedEvaluation.strategicImportance}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Build Attract:</span>
                  <span className="text-emerald-400 font-bold">
                    {simulatedEvaluation.buildAttractiveness}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/80">
                  <span className="text-slate-400">Partner Attract:</span>
                  <span className="text-sky-400 font-bold">
                    {simulatedEvaluation.partnerAttractiveness}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/80 border-t border-slate-800">
                  <span className="text-slate-400">Decision Stability:</span>
                  <span className="text-amber-400 font-bold">
                    {simulatedEvaluation.confidence}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              {isFlipped ? (
                <span className="text-amber-300 font-medium">
                  {currentEvaluation.decision} transitions to{' '}
                  <span className="font-bold underline">{simulatedEvaluation.decision}</span>{' '}
                  because altered weights tilt the capital allocation and dominance margins past the decision threshold.
                </span>
              ) : (
                <span>
                  The decision remains stable at {currentEvaluation.decision} under this variance.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
