/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStrategy } from '../../context/StrategyContext.jsx';
import {
  PRESET_SCENARIOS,
  PLANNING_HORIZONS,
  RISK_APPETITES,
  DEFAULT_STRATEGY_PROFILE,
} from '../../data/scenarios.js';
import {
  Compass,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Building2,
  Target,
  Clock,
  ShieldAlert,
  Zap,
  Lock,
  DollarSign,
  FileCheck,
  Save,
} from 'lucide-react';

export function StrategySetup({ onContinueToCriteria }) {
  const navigate = useNavigate();
  const {
    activeScenario,
    strategyProfile = DEFAULT_STRATEGY_PROFILE,
    updateStrategyProfile,
    updateStrategicPriority,
    loadScenario,
    weights,
    normalizedWeights,
    triggerNormalizeWeights,
    resetToDefaults,
  } = useStrategy();

  const [activeTooltip, setActiveTooltip] = useState(null);
  const [saveToast, setSaveToast] = useState(false);

  // Compute raw sum of weights for validation
  const rawSum = Object.values(weights).reduce((sum, w) => sum + (Number(w) || 0), 0);
  const isNormalized = rawSum === 100;

  // Validation states
  const isCompanyNameEmpty = !strategyProfile.companyName || strategyProfile.companyName.trim() === '';
  const isObjectiveShort = strategyProfile.strategyObjective && strategyProfile.strategyObjective.length < 15;

  const handlePresetSelect = (scenarioId) => {
    loadScenario(scenarioId);
    showSavedNotification();
  };

  const handleProfileFieldChange = (field, value) => {
    updateStrategyProfile({ [field]: value });
    showSavedNotification();
  };

  const handlePrioritySliderChange = (priorityKey, value) => {
    updateStrategicPriority(priorityKey, Number(value));
    showSavedNotification();
  };

  const showSavedNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleContinue = () => {
    if (onContinueToCriteria) {
      onContinueToCriteria();
    } else {
      navigate('/scoring');
    }
  };

  // Preset objective suggestions for quick fill
  const quickObjectives = [
    {
      title: 'Institutional Exchange',
      text: 'Establish an institutional-grade crypto & equities trading exchange with deterministic microsecond matching and bank-grade regulatory compliance.',
    },
    {
      title: 'Fast-to-Market Fintech',
      text: 'Achieve rapid live transaction volume and user onboarding within 90 days by leveraging turnkey payment gateways and certified identity vendors.',
    },
    {
      title: 'Deep-Tech Moat',
      text: 'Maximize proprietary intellectual property, customized high-frequency order books, and internal balance ledgers for institutional valuation upside.',
    },
    {
      title: 'Lean Capital Efficiency',
      text: 'Preserve cash runway by offloading heavy fixed engineering capex to variable pay-as-you-grow SaaS rails.',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title & Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Compass className="w-3.5 h-3.5" />
              Strategic Posture & Governance
            </span>
            {saveToast && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 animate-fade-in font-mono">
                <CheckCircle2 className="w-3 h-3" /> Auto-saved to storage
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Strategy Configuration & Objectives
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Configure your enterprise strategic posture, business objectives, and governance priorities.
            These parameters dynamically calibrate decision weights across all infrastructure evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
            title="Reset strategy settings to MochaTrade factory defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Baseline
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm transition-all"
          >
            Continue to Criteria
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scenario Presets Bar */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Strategic Scenario Presets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an archetype to automatically configure strategic priorities and criteria weight distributions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Current Archetype:</span>
            <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {activeScenario.shortName || activeScenario.name}
            </span>
          </div>
        </div>

        {/* Preset Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {PRESET_SCENARIOS.map((scenario) => {
            const isSelected = activeScenario.id === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handlePresetSelect(scenario.id)}
                className={`relative px-3 py-2.5 rounded-lg text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-white ring-1 ring-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <div className="font-semibold text-xs leading-tight mb-1">
                  {scenario.shortName || scenario.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                  {scenario.focus?.split(';')[0] || scenario.description.slice(0, 45) + '...'}
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}

          {/* Custom Preset Button */}
          <button
            type="button"
            onClick={() => handlePresetSelect('custom')}
            className={`relative px-3 py-2.5 rounded-lg text-left transition-all border flex flex-col justify-between ${
              activeScenario.id === 'custom'
                ? 'bg-amber-950/40 border-amber-500/80 text-white ring-1 ring-amber-500/40 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <div className="font-semibold text-xs leading-tight mb-1 text-amber-300 flex items-center gap-1">
              Custom
              {activeScenario.id === 'custom' && <span className="text-[10px]">●</span>}
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
              User-tuned weights and bespoke priorities
            </div>
            {activeScenario.id === 'custom' && (
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Selected Preset Details Note */}
        {activeScenario.description && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-md">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-white">{activeScenario.name}: </span>
              <span className="text-slate-300">{activeScenario.description}</span>
              {activeScenario.focus && (
                <div className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
                  Guidance: {activeScenario.focus}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Main Form: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Organization Profile & Objectives (5 Cols) */}
        <section className="lg:col-span-5 space-y-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Organization & Planning Context
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              General enterprise identifiers and governance bounds.
            </p>
          </div>

          {/* Company / Team Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="company-name-input"
              className="text-xs font-semibold text-slate-200 flex items-center justify-between"
            >
              <span>Company / Team Name</span>
              <span className="text-[10px] text-slate-500 font-mono">Required</span>
            </label>
            <input
              id="company-name-input"
              type="text"
              value={strategyProfile.companyName || ''}
              onChange={(e) => handleProfileFieldChange('companyName', e.target.value)}
              placeholder="e.g. MochaTrade Financial Technologies"
              className={`w-full px-3 py-2 text-xs bg-slate-950 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                isCompanyNameEmpty
                  ? 'border-red-500/80 focus:ring-red-500'
                  : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
              }`}
            />
            {isCompanyNameEmpty && (
              <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3" /> Company or team name cannot be empty.
              </p>
            )}
          </div>

          {/* Planning Horizon */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Planning Horizon
              </label>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">
                {strategyProfile.planningHorizon || '18–24 Months'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PLANNING_HORIZONS.map((horizon) => {
                const isSelected = strategyProfile.planningHorizon === horizon;
                return (
                  <button
                    key={horizon}
                    type="button"
                    onClick={() => handleProfileFieldChange('planningHorizon', horizon)}
                    className={`px-2.5 py-1.5 text-xs rounded-md border font-medium transition-all text-center ${
                      isSelected
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {horizon}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              Determines acceptable R&D cycle length before transactional volume must begin.
            </p>
          </div>

          {/* Risk Appetite */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              Risk Appetite
            </label>
            <div className="space-y-2">
              {RISK_APPETITES.map((appetite) => {
                const isSelected = strategyProfile.riskAppetite === appetite.value;
                return (
                  <div
                    key={appetite.value}
                    onClick={() => handleProfileFieldChange('riskAppetite', appetite.value)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/80 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                        {appetite.value}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {appetite.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategy Objective */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="strategy-objective-input"
                className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
              >
                <Target className="w-3.5 h-3.5 text-slate-400" />
                Strategy Objective
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {strategyProfile.strategyObjective?.length || 0} characters
              </span>
            </div>
            <textarea
              id="strategy-objective-input"
              rows={3}
              value={strategyProfile.strategyObjective || ''}
              onChange={(e) => handleProfileFieldChange('strategyObjective', e.target.value)}
              placeholder="Describe the primary commercial and technological goal of this architecture iteration..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors leading-relaxed"
            />
            {isObjectiveShort && (
              <p className="text-[10px] text-amber-400/90 flex items-center gap-1">
                <Info className="w-3 h-3" /> A concise objective provides clearer context for stakeholders.
              </p>
            )}

            {/* Quick Fill Objectives */}
            <div className="pt-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Quick-Fill Examples:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickObjectives.map((obj) => (
                  <button
                    key={obj.title}
                    type="button"
                    onClick={() => handleProfileFieldChange('strategyObjective', obj.text)}
                    className="px-2 py-0.5 text-[10px] rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    {obj.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Strategic Priorities & Decision Levers (7 Cols) */}
        <section className="lg:col-span-7 space-y-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Strategic Priorities & Weights
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust key strategic trade-offs. Each priority slider directly tunes criteria weights in the decision engine.
              </p>
            </div>

            {/* Weights Balance Status Badge */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border ${
                  isNormalized
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {isNormalized ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Weights: 100% Balanced</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Raw Sum: {rawSum}%</span>
                  </>
                )}
              </div>
              {!isNormalized && (
                <button
                  type="button"
                  onClick={triggerNormalizeWeights}
                  className="px-2.5 py-1 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                  title="Scale weights proportionally to sum to 100%"
                >
                  Auto-Normalize
                </button>
              )}
            </div>
          </div>

          {/* 5 Primary Strategic Priority Controls */}
          <div className="space-y-4">
            {/* 1. Market Speed Priority */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Market Speed Priority</span>
                    <span className="text-[11px] text-slate-400 ml-2">(Time to Market)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {strategyProfile.marketSpeedPriority || 6}/10
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'speed' ? null : 'speed')}
                    className="text-slate-400 hover:text-slate-200"
                    title="Explain Market Speed Priority"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {activeTooltip === 'speed' && (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300 animate-fade-in">
                  <span className="font-semibold text-amber-300">Directional Impact: </span>
                  Higher priority favors <strong>PARTNER</strong> turnkey rails to achieve live transactions in weeks. Low priority allows multi-quarter custom in-house R&D.
                </div>
              )}

              <input
                type="range"
                min="1"
                max="10"
                value={strategyProfile.marketSpeedPriority || 6}
                onChange={(e) => handlePrioritySliderChange('marketSpeedPriority', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1: Multi-quarter R&D acceptable</span>
                <span className="text-slate-400 font-medium">
                  Linked Weight: {weights.time_to_market || 13}%
                </span>
                <span>10: Must launch in weeks</span>
              </div>
            </div>

            {/* 2. Strategic Moat Priority */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Strategic Moat Priority</span>
                    <span className="text-[11px] text-slate-400 ml-2">(Defensible Proprietary IP)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {strategyProfile.strategicMoatPriority || 8}/10
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'moat' ? null : 'moat')}
                    className="text-slate-400 hover:text-slate-200"
                    title="Explain Strategic Moat Priority"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {activeTooltip === 'moat' && (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300 animate-fade-in">
                  <span className="font-semibold text-emerald-300">Directional Impact: </span>
                  Higher priority strongly favors <strong>BUILD</strong>. Ensures critical algorithms, balance ledgers, and matching IP create enterprise valuation and cannot be revoked by a third party.
                </div>
              )}

              <input
                type="range"
                min="1"
                max="10"
                value={strategyProfile.strategicMoatPriority || 8}
                onChange={(e) => handlePrioritySliderChange('strategicMoatPriority', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1: Commodity plumbing</span>
                <span className="text-slate-400 font-medium">
                  Linked Weight: {weights.strategic_moat || 18}%
                </span>
                <span>10: Irreplaceable core IP</span>
              </div>
            </div>

            {/* 3. Control Priority */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-sky-500/20 text-sky-300 flex items-center justify-center text-xs font-bold">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Control Priority</span>
                    <span className="text-[11px] text-slate-400 ml-2">(SLA, Telemetry & Roadmap)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-sky-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {strategyProfile.controlPriority || 8}/10
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'control' ? null : 'control')}
                    className="text-slate-400 hover:text-slate-200"
                    title="Explain Control Priority"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {activeTooltip === 'control' && (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300 animate-fade-in">
                  <span className="font-semibold text-sky-300">Directional Impact: </span>
                  Higher priority favors <strong>BUILD</strong>. Demands 100% telemetry, bespoke latency SLAs, and zero reliance on external partner release velocity.
                </div>
              )}

              <input
                type="range"
                min="1"
                max="10"
                value={strategyProfile.controlPriority || 8}
                onChange={(e) => handlePrioritySliderChange('controlPriority', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1: Standard vendor SLA</span>
                <span className="text-slate-400 font-medium">
                  Linked Weight: {weights.control || 15}%
                </span>
                <span>10: 100% Internal sovereignty</span>
              </div>
            </div>

            {/* 4. Cost Sensitivity */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Cost Sensitivity</span>
                    <span className="text-[11px] text-slate-400 ml-2">(Capex vs Opex Preference)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {strategyProfile.costSensitivity || 5}/10
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'cost' ? null : 'cost')}
                    className="text-slate-400 hover:text-slate-200"
                    title="Explain Cost Sensitivity"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {activeTooltip === 'cost' && (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300 animate-fade-in">
                  <span className="font-semibold text-purple-300">Directional Impact: </span>
                  Higher score favors <strong>PARTNER</strong> via variable pay-per-transaction utility SaaS, avoiding millions in fixed developer salaries.
                </div>
              )}

              <input
                type="range"
                min="1"
                max="10"
                value={strategyProfile.costSensitivity || 5}
                onChange={(e) => handlePrioritySliderChange('costSensitivity', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1: High Capex tolerance</span>
                <span className="text-slate-400 font-medium">
                  Linked Weight: {weights.cost_efficiency || 10}%
                </span>
                <span>10: Maximize pay-as-you-go</span>
              </div>
            </div>

            {/* 5. Compliance Sensitivity */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs font-bold">
                    <FileCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Compliance Sensitivity</span>
                    <span className="text-[11px] text-slate-400 ml-2">(Statutory Licensing & Liability)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-rose-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {strategyProfile.complianceSensitivity || 7}/10
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'compliance' ? null : 'compliance')}
                    className="text-slate-400 hover:text-slate-200"
                    title="Explain Compliance Sensitivity"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {activeTooltip === 'compliance' && (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300 animate-fade-in">
                  <span className="font-semibold text-rose-300">Directional Impact: </span>
                  Higher sensitivity favors <strong>PARTNER or HYBRID</strong> to anchor regulatory licenses with certified partner banks, user agencies, and audit providers.
                </div>
              )}

              <input
                type="range"
                min="1"
                max="10"
                value={strategyProfile.complianceSensitivity || 7}
                onChange={(e) => handlePrioritySliderChange('complianceSensitivity', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1: Standard data policy</span>
                <span className="text-slate-400 font-medium">
                  Linked Weight: {weights.compliance_complexity || 10}%
                </span>
                <span>10: Institutional license scrutiny</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Navigation Action Banner */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              Strategy Setup Ready
            </div>
            <div className="text-[11px] text-slate-400">
              Company profile and priority weights have been synchronized to local storage and active decision calculations.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm transition-all"
        >
          Continue to Criteria
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
