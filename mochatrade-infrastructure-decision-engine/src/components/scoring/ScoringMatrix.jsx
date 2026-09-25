/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useStrategy } from '../../context/StrategyContext.jsx';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import { DecisionReasoningModal } from '../recommendations/DecisionReasoningModal.jsx';
import { CRITERIA_DIRECTIONS } from '../../data/criteria.js';
import { ScoringCell } from './ScoringCell.jsx';
import { ScoringSideSummary } from './ScoringSideSummary.jsx';
import {
  SlidersHorizontal,
  Plus,
  RotateCcw,
  FileText,
  Sliders,
  Check,
  Info,
  HelpCircle,
  Hash,
  MoveHorizontal,
  ChevronRight,
  TrendingUp,
  Shield,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants.js';

export function ScoringMatrix() {
  const {
    components,
    criteria,
    normalizedWeights,
    evaluations,
    updateScore,
    resetDemoScores,
    addComponent,
    deleteComponent,
    selectedComponentId,
    setSelectedComponentId,
    setActiveTab,
  } = useStrategy();

  const [modalComponentId, setModalComponentId] = useState(null);
  const [viewMode, setViewMode] = useState('compact'); // 'compact' | 'slider' | 'stepper'
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentCategory, setNewComponentCategory] = useState('Core Trading Infrastructure');
  const [newComponentDescription, setNewComponentDescription] = useState('');
  const [notification, setNotification] = useState(null);

  // Filter only enabled criteria for matrix columns
  const enabledCriteria = useMemo(() => {
    return criteria.filter((c) => c.enabled !== false);
  }, [criteria]);

  const handleCreateComponent = (e) => {
    e.preventDefault();
    if (!newComponentName.trim()) return;

    addComponent({
      name: newComponentName.trim(),
      category: newComponentCategory,
      description:
        newComponentDescription.trim() ||
        'Custom financial infrastructure capability evaluated for build vs buy vs hybrid.',
    });

    setNewComponentName('');
    setNewComponentDescription('');
    setShowAddComponent(false);
    triggerToast('New infrastructure component added and scored.');
  };

  const triggerToast = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const handleResetScoresWithNotification = () => {
    resetDemoScores();
    triggerToast('Demo baseline scores restored for all components.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500/80 text-emerald-200 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2" role="status" aria-live="polite">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header & Matrix Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Infrastructure Scoring Matrix
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-semibold">
              Live Recalculation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic 1–10 scoring across all enabled criteria. Adjusting any cell immediately
            recomputes weighted scores, attractiveness metrics, decision stability, and reasoning.
          </p>
        </div>

        {/* Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded border border-slate-800 text-xs">
            <span className="text-slate-500 px-2 text-[11px]">Cell Mode:</span>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                viewMode === 'compact'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Compact select with progress indicator and popup slider"
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setViewMode('slider')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                viewMode === 'slider'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Direct inline sliders in every cell"
            >
              Sliders
            </button>
            <button
              type="button"
              onClick={() => setViewMode('stepper')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                viewMode === 'stepper'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Direct numeric input with +/- steppers"
            >
              Numeric ±
            </button>
          </div>

          {/* Reset Demo Scores */}
          <button
            type="button"
            onClick={handleResetScoresWithNotification}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors"
            title="Reset demo components back to initial default scores"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          {/* Adjust Criteria Link */}
          <Link
            to={ROUTES.CRITERIA}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
            <span>Criteria Weights</span>
          </Link>

          {/* Add Component */}
          <button
            type="button"
            onClick={() => setShowAddComponent((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Component</span>
          </button>
        </div>
      </div>

      {/* Add Component Collapsible Drawer */}
      {showAddComponent && (
        <div className="p-4 bg-slate-900 border border-emerald-500/40 rounded-lg shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Infrastructure Component</span>
            </h3>
            <button
              onClick={() => setShowAddComponent(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateComponent} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Component Name</label>
              <input
                type="text"
                required
                value={newComponentName}
                onChange={(e) => setNewComponentName(e.target.value)}
                placeholder="e.g. Smart Order Router, FIX Gateway"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category</label>
              <select
                value={newComponentCategory}
                onChange={(e) => setNewComponentCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Core Trading Infrastructure">Core Trading Infrastructure</option>
                <option value="Payment Ingress & Egress">Payment Ingress & Egress</option>
                <option value="Compliance & Identity Assurance">Compliance & Identity Assurance</option>
                <option value="Core Account & Balance Management">Core Account & Balance Management</option>
                <option value="Market Data & Telemetry">Market Data & Telemetry</option>
                <option value="Custody & Key Management">Custody & Key Management</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Scope / Description</label>
              <input
                type="text"
                value={newComponentDescription}
                onChange={(e) => setNewComponentDescription(e.target.value)}
                placeholder="Brief architectural scope and objectives"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-3 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddComponent(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded"
              >
                Create & Score
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Layout: Matrix Table (Left/Center) + Live Summary Side Panel (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Table Container (spans 3 columns on xl screens) */}
        <div className="xl:col-span-3 space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm overflow-hidden">
            {/* Horizontal Scroll Wrapper */}
            <div className="overflow-x-auto max-h-[720px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                {/* Sticky Header */}
                <thead className="sticky top-0 z-30 bg-slate-950 shadow-md">
                  <tr className="border-b border-slate-800 text-slate-300">
                    {/* Sticky Component Column Header */}
                    <th className="p-3 font-bold uppercase tracking-wider text-[11px] min-w-[220px] max-w-[260px] sticky left-0 bg-slate-950 z-40 border-r border-slate-800">
                      <div className="flex items-center justify-between">
                        <span>Infrastructure Component</span>
                        <MoveHorizontal className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                    </th>

                    {/* Enabled Criteria Columns */}
                    {enabledCriteria.map((crit) => {
                      const weight = normalizedWeights[crit.id] ?? 0;
                      const isBuildFavored =
                        crit.direction === CRITERIA_DIRECTIONS.FAVORS_BUILD;
                      return (
                        <th
                          key={crit.id}
                          className="p-2.5 font-medium min-w-[130px] max-w-[160px] text-center border-l border-slate-800/80 bg-slate-950"
                          title={`${crit.description}\n\nDirection: ${crit.directionDescription}\nWeight: ${weight}%`}
                        >
                          <div className="truncate font-semibold text-slate-200">
                            {crit.name}
                          </div>
                          <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            <span className="font-mono text-emerald-400 font-bold text-[11px]">
                              {weight}%
                            </span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                                isBuildFavored
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                                  : 'bg-sky-950/80 text-sky-300 border border-sky-700/50'
                              }`}
                            >
                              {isBuildFavored ? '↑ Build' : '↑ Partner'}
                            </span>
                          </div>
                        </th>
                      );
                    })}

                    {/* Calculated Output Columns (Recalculate Immediately) */}
                    <th className="p-2.5 font-bold uppercase tracking-wider text-[10px] text-center border-l border-slate-800 min-w-[125px] bg-slate-950 text-slate-200">
                      Recommendation
                    </th>
                    <th className="p-2.5 font-bold uppercase tracking-wider text-[10px] text-center border-l border-slate-800 min-w-[95px] bg-slate-950 text-slate-200">
                      Weighted Score
                    </th>
                    <th className="p-2.5 font-bold uppercase tracking-wider text-[10px] text-center border-l border-slate-800 min-w-[90px] bg-slate-950 text-slate-200">
                      Importance
                    </th>
                    <th className="p-2.5 font-bold uppercase tracking-wider text-[10px] text-center border-l border-slate-800 min-w-[90px] bg-slate-950 text-slate-200">
                      Decision Stability
                    </th>
                    <th className="p-2.5 font-bold uppercase tracking-wider text-[10px] text-right border-l border-slate-800 min-w-[80px] bg-slate-950 text-slate-200 pr-3">
                      Reasoning
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-800/80">
                  {components.map((comp) => {
                    const ev = evaluations[comp.id];
                    const isSelected = selectedComponentId === comp.id;

                    return (
                      <tr
                        key={comp.id}
                        onClick={() => setSelectedComponentId(comp.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/50 ring-1 ring-inset ring-emerald-500/40'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        {/* Sticky Left Column: Component Name & Category */}
                        <td
                          className={`p-3 sticky left-0 z-20 border-r border-slate-800/80 transition-colors ${
                            isSelected
                              ? 'bg-slate-900 border-l-4 border-l-emerald-500'
                              : 'bg-slate-950/95 hover:bg-slate-900/95'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="font-bold text-white text-xs">
                                {comp.displayName || comp.name}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-[210px]">
                                {comp.category}
                              </div>
                            </div>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                            )}
                          </div>
                        </td>

                        {/* Interactive Criteria Cells */}
                        {enabledCriteria.map((crit) => {
                          const currentScore = comp.scores?.[crit.id] ?? 5;
                          return (
                            <ScoringCell
                              key={crit.id}
                              componentId={comp.id}
                              componentName={comp.displayName || comp.name}
                              criterion={crit}
                              score={currentScore}
                              onScoreChange={updateScore}
                              viewMode={viewMode}
                            />
                          );
                        })}

                        {/* 1. Recalculated Recommendation */}
                        <td className="p-2.5 text-center border-l border-slate-800">
                          {ev ? (
                            <DecisionBadge decision={ev.decision} size="sm" />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>

                        {/* 2. Recalculated Weighted Score (1-10) */}
                        <td className="p-2.5 text-center border-l border-slate-800 font-mono">
                          {ev ? (
                            <span className="font-bold text-white text-xs">
                              {ev.weightedScore}
                              <span className="text-slate-500 text-[10px] font-normal"> / 10</span>
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* 3. Recalculated Strategic Importance */}
                        <td className="p-2.5 text-center border-l border-slate-800 font-mono">
                          {ev ? (
                            <div className="flex flex-col items-center">
                              <span className="text-emerald-400 font-semibold text-xs">
                                {ev.strategicImportance}%
                              </span>
                              <div className="w-10 h-1 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${ev.strategicImportance}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* 4. Recalculated Decision Stability */}
                        <td className="p-2.5 text-center border-l border-slate-800 font-mono">
                          {ev ? (
                            <span className="text-slate-300 font-medium text-xs">
                              {ev.confidence}%
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* 5. Reasoning Inspection Trigger */}
                        <td className="p-2.5 text-right border-l border-slate-800 pr-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalComponentId(comp.id);
                            }}
                            title="Inspect mathematical trace and structured reasoning"
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Table Footer Legend */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-slate-300">Score Scale:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>1–2 = Very Low</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>3–4 = Low</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>5–6 = Moderate</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>7–8 = High</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-300" />
                  <span>9–10 = Very High</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-emerald-400/90 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Deterministic: Instant recalculation without page reload</span>
              </div>
            </div>
          </div>

          {/* Quick Context Tips Card */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Interactive Spreadsheet Guide:</span>{' '}
              Click any cell to edit via dropdown or slider. Hover over any cell to review criterion guidance
              and directional impact. Select any row to view its live decision drivers in the side panel.
            </div>
          </div>
        </div>

        {/* Side Summary Panel (spans 1 column on xl screens) */}
        <div className="xl:col-span-1">
          <ScoringSideSummary onInspectComponent={(id) => setModalComponentId(id)} />
        </div>
      </div>

      {/* Decision Reasoning Modal */}
      {modalComponentId && (
        <DecisionReasoningModal
          componentId={modalComponentId}
          onClose={() => setModalComponentId(null)}
        />
      )}
    </div>
  );
}
