/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStrategy } from '../../context/StrategyContext.jsx';
import { CRITERIA_DIRECTIONS, CRITERIA_CATEGORIES } from '../../data/criteria.js';
import {
  Sliders,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Edit2,
  HelpCircle,
  Search,
  Check,
  X,
  Scale,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

export function CriteriaManager() {
  const {
    criteria,
    weights,
    normalizedWeights,
    updateWeight,
    triggerNormalizeWeights,
    toggleCriterion,
    addCriterion,
    updateCriterion,
    deleteCriterion,
    resetCriteriaDefaults,
  } = useStrategy();

  const navigate = useNavigate();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // New criterion form state
  const [newCrit, setNewCrit] = useState({
    name: '',
    description: '',
    category: CRITERIA_CATEGORIES.STRATEGIC,
    direction: CRITERIA_DIRECTIONS.FAVORS_BUILD,
    weight: 12,
    guidance: '',
    scoreMeaning: '',
  });

  // Calculate Raw Weight Sum across all enabled criteria
  const enabledCriteria = useMemo(() => {
    return criteria.filter((c) => c.enabled !== false);
  }, [criteria]);

  const rawSum = useMemo(() => {
    return enabledCriteria.reduce((sum, c) => sum + (Number(weights[c.id]) || 0), 0);
  }, [enabledCriteria, weights]);

  const isBalanced = rawSum === 100;

  // Filtered criteria list for the table
  const filteredCriteria = useMemo(() => {
    return criteria.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [criteria, searchQuery, selectedCategory]);

  // Aggregate Directional Weight Distribution for Side Panel
  const directionalSummary = useMemo(() => {
    let buildWeight = 0;
    let partnerWeight = 0;
    let hybridWeight = 0;

    criteria.forEach((c) => {
      if (c.enabled === false) return;
      const w = normalizedWeights[c.id] || 0;
      if (c.direction === CRITERIA_DIRECTIONS.FAVORS_BUILD) {
        buildWeight += w;
      } else if (c.direction === CRITERIA_DIRECTIONS.FAVORS_PARTNER) {
        partnerWeight += w;
      } else {
        hybridWeight += w;
      }
    });

    return {
      buildWeight,
      partnerWeight,
      hybridWeight,
    };
  }, [criteria, normalizedWeights]);

  // Quick Preset Handlers
  const handleApplyPreset = (presetType) => {
    if (presetType === 'equal') {
      const activeList = criteria.filter((c) => c.enabled !== false);
      if (activeList.length === 0) return;
      const share = Math.floor(100 / activeList.length);
      activeList.forEach((c) => updateWeight(c.id, share));
      triggerNormalizeWeights();
    } else if (presetType === 'moat') {
      updateWeight('strategic_moat', 28);
      updateWeight('control', 22);
      updateWeight('differentiation', 18);
      updateWeight('scalability', 12);
      updateWeight('time_to_market', 5);
      updateWeight('cost_efficiency', 5);
      updateWeight('compliance_complexity', 5);
      updateWeight('engineering_complexity', 5);
      triggerNormalizeWeights();
    } else if (presetType === 'speed') {
      updateWeight('time_to_market', 30);
      updateWeight('cost_efficiency', 22);
      updateWeight('compliance_complexity', 15);
      updateWeight('engineering_complexity', 13);
      updateWeight('strategic_moat', 5);
      updateWeight('control', 5);
      updateWeight('differentiation', 5);
      updateWeight('scalability', 5);
      triggerNormalizeWeights();
    } else if (presetType === 'compliance') {
      updateWeight('compliance_complexity', 30);
      updateWeight('control', 20);
      updateWeight('engineering_complexity', 15);
      updateWeight('cost_efficiency', 10);
      updateWeight('strategic_moat', 10);
      updateWeight('time_to_market', 5);
      updateWeight('differentiation', 5);
      updateWeight('scalability', 5);
      triggerNormalizeWeights();
    }
  };

  // Safe weight updater with clamping (0 to 100)
  const handleWeightChange = (criterionId, rawValue) => {
    if (rawValue === '') {
      updateWeight(criterionId, 0);
      return;
    }
    const num = Number(rawValue);
    if (isNaN(num)) return;
    const clamped = Math.max(0, Math.min(100, Math.round(num)));
    updateWeight(criterionId, clamped);
  };

  // Create Custom Criterion Submit
  const handleAddCriterionSubmit = (e) => {
    e.preventDefault();
    if (!newCrit.name.trim()) return;

    addCriterion({
      name: newCrit.name.trim(),
      description:
        newCrit.description.trim() ||
        'Custom strategic criterion evaluated for financial infrastructure decisions.',
      category: newCrit.category,
      direction: newCrit.direction,
      weight: Math.max(0, Math.min(100, Number(newCrit.weight) || 10)),
      guidance:
        newCrit.guidance.trim() ||
        '1-3: Low strategic impact; 4-7: Moderate factor; 8-10: Critical deciding factor.',
      scoreMeaning:
        newCrit.scoreMeaning.trim() ||
        '1 = Commodity plumbing easily bought; 5 = Moderate IP retention; 10 = Critical deciding factor.',
    });

    setNewCrit({
      name: '',
      description: '',
      category: CRITERIA_CATEGORIES.STRATEGIC,
      direction: CRITERIA_DIRECTIONS.FAVORS_BUILD,
      weight: 12,
      guidance: '',
      scoreMeaning: '',
    });
    setShowAddModal(false);
  };

  // Edit Criterion Submit
  const handleEditCriterionSubmit = (e) => {
    e.preventDefault();
    if (!editingCriterion || !editingCriterion.name.trim()) return;

    updateCriterion(editingCriterion.id, {
      name: editingCriterion.name.trim(),
      description: editingCriterion.description.trim(),
      category: editingCriterion.category,
      direction: editingCriterion.direction,
      guidance: editingCriterion.guidance,
      scoreMeaning: editingCriterion.scoreMeaning,
      directionDescription:
        editingCriterion.direction === CRITERIA_DIRECTIONS.FAVORS_BUILD
          ? 'High score favors BUILD'
          : editingCriterion.direction === CRITERIA_DIRECTIONS.FAVORS_PARTNER
          ? 'High score favors PARTNER'
          : 'High score favors HYBRID / PARTNER',
    });

    setEditingCriterion(null);
  };

  // Direction Badge Helper
  const renderDirectionBadge = (direction) => {
    switch (direction) {
      case CRITERIA_DIRECTIONS.FAVORS_BUILD:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            <span>Favors BUILD</span>
          </span>
        );
      case CRITERIA_DIRECTIONS.FAVORS_PARTNER:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-950/80 text-sky-300 border border-sky-500/30">
            <ArrowDownRight className="w-3 h-3 text-sky-400" />
            <span>Favors PARTNER</span>
          </span>
        );
      case CRITERIA_DIRECTIONS.FAVORS_PARTNER_OR_HYBRID:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
            <Layers className="w-3 h-3 text-amber-400" />
            <span>Favors HYBRID / PARTNER</span>
          </span>
        );
    }
  };

  // Category Badge Helper
  const renderCategoryBadge = (category) => {
    const colorMap = {
      [CRITERIA_CATEGORIES.STRATEGIC]: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/30',
      [CRITERIA_CATEGORIES.EXECUTION]: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
      [CRITERIA_CATEGORIES.FINANCIAL]: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30',
      [CRITERIA_CATEGORIES.RISK]: 'bg-rose-950/70 text-rose-300 border-rose-500/30',
      [CRITERIA_CATEGORIES.TECHNICAL]: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/30',
    };

    const cls = colorMap[category] || 'bg-slate-800 text-slate-300 border-slate-700';

    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${cls}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Strategic Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight">
              Criteria & Weight Management
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 rounded-full">
              {enabledCriteria.length} Active of {criteria.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Define organizational priorities, mathematical weights, and architectural directional bias. Changes persist automatically and dynamically recalculate all scoring models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Criterion</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Reset to default 8 criteria and baseline weights"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Total Weight Allocation Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">
              Total Raw Weight Allocation:
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`font-mono text-lg font-extrabold ${
                  isBalanced ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {rawSum}%
              </span>
              <span className="text-[11px] text-slate-500 font-medium">/ 100% target</span>
            </div>

            {isBalanced ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                Balanced (100%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                {rawSum > 100 ? `Overallocated by +${rawSum - 100}%` : `Underallocated by -${100 - rawSum}%`}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('equal')}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded transition-colors cursor-pointer"
            >
              Equal Split
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('moat')}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded transition-colors cursor-pointer"
            >
              Moat-First
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('speed')}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded transition-colors cursor-pointer"
            >
              Speed-to-Market
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('compliance')}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 rounded transition-colors cursor-pointer"
            >
              Compliance-First
            </button>
            {!isBalanced && (
              <button
                type="button"
                onClick={triggerNormalizeWeights}
                className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Normalize Weights</span>
              </button>
            )}
          </div>
        </div>

        {/* Informative Warning Note when raw sum != 100 */}
        {!isBalanced && (
          <div className="flex items-center justify-between gap-3 p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Warning:</strong> Raw weights total <strong>{rawSum}%</strong> (target is exactly 100%). The decision engine automatically normalizes these relative ratios proportionally, but you can click <strong>Normalize Weights</strong> to align the table inputs.
              </span>
            </div>
            <button
              type="button"
              onClick={triggerNormalizeWeights}
              className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-amber-200 bg-amber-900/60 hover:bg-amber-800 border border-amber-500/40 rounded transition-colors cursor-pointer"
            >
              Normalize to 100%
            </button>
          </div>
        )}

        {/* Visual Multi-Segment Proportional Progress Bar */}
        <div className="w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden flex">
          {criteria.map((c, i) => {
            if (c.enabled === false) return null;
            const normW = normalizedWeights[c.id] ?? 0;
            if (normW <= 0) return null;

            const segmentColors = [
              'bg-emerald-500',
              'bg-indigo-500',
              'bg-purple-500',
              'bg-sky-500',
              'bg-teal-500',
              'bg-amber-500',
              'bg-rose-500',
              'bg-orange-500',
              'bg-cyan-500',
              'bg-blue-500',
            ];
            const color = segmentColors[i % segmentColors.length];

            return (
              <div
                key={c.id}
                className={`${color} h-full transition-all`}
                style={{ width: `${normW}%` }}
                title={`${c.name}: ${normW}% (raw: ${weights[c.id] || 0}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Content Layout: Table (left) + Educational Side Panel (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Criteria Table (lg:col-span-8 or 9) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Table Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 border border-slate-800 rounded-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search criteria or description..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
                }`}
              >
                All ({criteria.length})
              </button>
              {Object.values(CRITERIA_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
                  }`}
                >
                  {cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-44">Criterion</th>
                    <th className="py-3 px-4 min-w-[200px]">Description</th>
                    <th className="py-3 px-3 w-36">Category</th>
                    <th className="py-3 px-3 w-36">Direction</th>
                    <th className="py-3 px-4 w-44">Weight</th>
                    <th className="py-3 px-3 w-24 text-center">Enabled</th>
                    <th className="py-3 px-3 w-20 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {filteredCriteria.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        No criteria found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCriteria.map((crit) => {
                      const isEnabled = crit.enabled !== false;
                      const rawW = weights[crit.id] ?? 0;
                      const normW = normalizedWeights[crit.id] ?? 0;

                      return (
                        <tr
                          key={crit.id}
                          className={`transition-colors ${
                            isEnabled ? 'hover:bg-slate-800/40 bg-slate-900/40' : 'bg-slate-950/60 opacity-65'
                          }`}
                        >
                          {/* Column 1: Criterion */}
                          <td className="py-3.5 px-4 font-semibold text-white align-top">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{crit.name}</span>
                                {crit.isCustom && (
                                  <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/40 rounded text-[9px] font-bold uppercase tracking-wider">
                                    Custom
                                  </span>
                                )}
                              </div>
                              {crit.scoreMeaning && (
                                <span className="text-[10px] text-slate-400 line-clamp-1 font-normal" title={crit.scoreMeaning}>
                                  {crit.scoreMeaning}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Column 2: Description */}
                          <td className="py-3.5 px-4 text-slate-300 align-top leading-relaxed">
                            <p className="text-xs text-slate-300 line-clamp-2" title={crit.description}>
                              {crit.description}
                            </p>
                            {crit.guidance && (
                              <div className="mt-1 text-[10px] text-slate-400">
                                <span className="font-semibold text-slate-400">Guide: </span>
                                {crit.guidance}
                              </div>
                            )}
                          </td>

                          {/* Column 3: Category */}
                          <td className="py-3.5 px-3 align-top whitespace-nowrap">
                            {renderCategoryBadge(crit.category)}
                          </td>

                          {/* Column 4: Direction */}
                          <td className="py-3.5 px-3 align-top whitespace-nowrap">
                            {renderDirectionBadge(crit.direction)}
                          </td>

                          {/* Column 5: Weight */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div className="relative w-20">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    disabled={!isEnabled}
                                    value={rawW}
                                    onChange={(e) => handleWeightChange(crit.id, e.target.value)}
                                    className={`w-full bg-slate-950 border rounded px-2 py-1 text-xs font-mono font-bold text-white focus:outline-none transition-colors ${
                                      rawW < 0 || rawW > 100
                                        ? 'border-rose-500'
                                        : isEnabled
                                        ? 'border-slate-700 focus:border-emerald-500'
                                        : 'border-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                                    %
                                  </span>
                                </div>

                                <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                                  (norm:{' '}
                                  <strong className={isEnabled ? 'text-emerald-400' : 'text-slate-600'}>
                                    {normW}%
                                  </strong>
                                  )
                                </span>
                              </div>

                              {/* Interactive Mini Range Slider */}
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="range"
                                  min="0"
                                  max="50"
                                  step="1"
                                  disabled={!isEnabled}
                                  value={rawW}
                                  onChange={(e) => updateWeight(crit.id, Number(e.target.value))}
                                  className={`w-full h-1.5 rounded-lg bg-slate-800 accent-emerald-500 transition-all ${
                                    isEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                                  }`}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Column 6: Enabled Toggle */}
                          <td className="py-3.5 px-3 align-top text-center">
                            <button
                              type="button"
                              onClick={() => toggleCriterion(crit.id)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                              }`}
                              role="switch"
                              aria-checked={isEnabled}
                              title={isEnabled ? 'Click to disable' : 'Click to enable'}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                  isEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className="block text-[10px] text-slate-400 mt-1 font-medium">
                              {isEnabled ? 'Active' : 'Disabled'}
                            </span>
                          </td>

                          {/* Column 7: Actions */}
                          <td className="py-3.5 px-3 align-top text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingCriterion({ ...crit })}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Edit criterion metadata"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(crit.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title={crit.isCustom ? 'Delete custom criterion' : 'Delete criterion'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Explanatory Side Panel "How weights affect decisions" (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>Executive Framework Guide</span>
              </div>
              <h2 className="text-base font-extrabold text-white mt-1 tracking-tight">
                How Weights Affect Decisions
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Strategic decision models convert qualitative enterprise trade-offs into deterministic infrastructure mandates.
              </p>
            </div>

            {/* Core Principle Callout */}
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Info className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Strategic Priorities ≠ Objective Truth</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                A high score on a criterion reflects what the <em>technology</em> is; the criterion weight reflects what <em>your company values</em>.
              </p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                For example, an order matching engine inherently requires low latency. But allocating <strong>25% weight</strong> to Strategic Moat vs <strong>5% weight</strong> to Time-to-Market is an executive governance choice, not a technical absolute.
              </p>
            </div>

            {/* Live Directional Bias Meter */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Active Strategic Bias</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {directionalSummary.buildWeight >= directionalSummary.partnerWeight
                    ? `Build Lean (+${directionalSummary.buildWeight - directionalSummary.partnerWeight}%)`
                    : `Partner Lean (+${directionalSummary.partnerWeight - directionalSummary.buildWeight}%)`}
                </span>
              </div>

              {/* Multi-tier bar */}
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${directionalSummary.buildWeight}%` }}
                  className="bg-emerald-500 transition-all"
                  title={`Build Favoring: ${directionalSummary.buildWeight}%`}
                />
                <div
                  style={{ width: `${directionalSummary.hybridWeight}%` }}
                  className="bg-amber-500 transition-all"
                  title={`Hybrid / Offload: ${directionalSummary.hybridWeight}%`}
                />
                <div
                  style={{ width: `${directionalSummary.partnerWeight}%` }}
                  className="bg-sky-500 transition-all"
                  title={`Partner Favoring: ${directionalSummary.partnerWeight}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Build ({directionalSummary.buildWeight}%)
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Hybrid ({directionalSummary.hybridWeight}%)
                </span>
                <span className="flex items-center gap-1 text-sky-300">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Partner ({directionalSummary.partnerWeight}%)
                </span>
              </div>
            </div>

            {/* Mechanics Breakdown Accordion/Cards */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Directional Bias Rules</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong>Moat & Control</strong> push recommendations toward in-house engineering. <strong>Time to Market & Cost Efficiency</strong> push toward third-party SaaS and turnkey vendor rails.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hybrid Decision Gate</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When a component exhibits both high strategic value AND high compliance/engineering complexity, the engine recommends <strong>HYBRID</strong>: internal owned client layer with external regulated vendor infrastructure.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Mathematical Normalization</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Weights are always normalized: <code className="text-slate-300">w_i / ∑w</code>. If total raw allocation is 120%, each criterion receives its proportional share so calculations are mathematically balanced.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Criterion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Add Custom Evaluation Criterion</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCriterionSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Criterion Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCrit.name}
                  onChange={(e) => setNewCrit({ ...newCrit, name: e.target.value })}
                  placeholder="e.g. Geographic Sovereignty / Data Residency"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newCrit.category}
                    onChange={(e) => setNewCrit({ ...newCrit, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {Object.values(CRITERIA_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Initial Weight (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newCrit.weight}
                    onChange={(e) => setNewCrit({ ...newCrit, weight: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Strategic Architectural Direction
                </label>
                <select
                  value={newCrit.direction}
                  onChange={(e) => setNewCrit({ ...newCrit, direction: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={CRITERIA_DIRECTIONS.FAVORS_BUILD}>
                    Favors BUILD (Higher score increases build advantage)
                  </option>
                  <option value={CRITERIA_DIRECTIONS.FAVORS_PARTNER}>
                    Favors PARTNER (Higher score favors third-party turnkey vendor)
                  </option>
                  <option value={CRITERIA_DIRECTIONS.FAVORS_PARTNER_OR_HYBRID}>
                    Favors HYBRID / PARTNER (Higher score favors offloading or splitting)
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description & Strategic Rationale
                </label>
                <textarea
                  rows="2"
                  value={newCrit.description}
                  onChange={(e) => setNewCrit({ ...newCrit, description: e.target.value })}
                  placeholder="Explain why this metric matters to capital allocation and operational autonomy..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  1-10 Scoring Scale Guidance (Optional)
                </label>
                <input
                  type="text"
                  value={newCrit.guidance}
                  onChange={(e) => setNewCrit({ ...newCrit, guidance: e.target.value })}
                  placeholder="e.g. 1-3: Standard SLA; 8-10: Strict zero-trust sovereign requirements"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Create Criterion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Criterion Metadata Modal */}
      {editingCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Edit Criterion: {editingCriterion.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCriterion(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditCriterionSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Criterion Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCriterion.name}
                  onChange={(e) => setEditingCriterion({ ...editingCriterion, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={editingCriterion.category}
                    onChange={(e) => setEditingCriterion({ ...editingCriterion, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {Object.values(CRITERIA_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Direction
                  </label>
                  <select
                    value={editingCriterion.direction}
                    onChange={(e) => setEditingCriterion({ ...editingCriterion, direction: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={CRITERIA_DIRECTIONS.FAVORS_BUILD}>Favors BUILD</option>
                    <option value={CRITERIA_DIRECTIONS.FAVORS_PARTNER}>Favors PARTNER</option>
                    <option value={CRITERIA_DIRECTIONS.FAVORS_PARTNER_OR_HYBRID}>
                      Favors HYBRID / PARTNER
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description & Strategic Rationale
                </label>
                <textarea
                  rows="2"
                  value={editingCriterion.description}
                  onChange={(e) => setEditingCriterion({ ...editingCriterion, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  1-10 Operational Guidance
                </label>
                <input
                  type="text"
                  value={editingCriterion.guidance || ''}
                  onChange={(e) => setEditingCriterion({ ...editingCriterion, guidance: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCriterion(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Criterion Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Delete Criterion?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove this criterion? It will be removed from all architectural scoring models and existing evaluations will be re-weighted immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCriterion(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Defaults Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Reset to Baseline Defaults?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will reset the criteria list to the 8 standard criteria and restore default balanced weights (summing to 100%). Any custom criteria will be removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetCriteriaDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
