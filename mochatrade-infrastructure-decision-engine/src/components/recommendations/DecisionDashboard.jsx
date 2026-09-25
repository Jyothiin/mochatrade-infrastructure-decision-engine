/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStrategy } from '../../context/StrategyContext.jsx';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import { DecisionCard } from './DecisionCard.jsx';
import { DecisionReasoningModal } from './DecisionReasoningModal.jsx';
import { StrategicVsBuildChart } from '../charts/StrategicVsBuildChart.jsx';
import { DECISIONS } from '../../engine/decisionEngine.js';
import { ROUTES } from '../../utils/constants.js';
import {
  FileText,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Search,
  ArrowUpDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Handshake,
  Milestone,
  RefreshCw,
  ExternalLink,
  Sliders,
} from 'lucide-react';

export function DecisionDashboard() {
  const navigate = useNavigate();
  const {
    activeScenario,
    components = [],
    evaluations = {},
    reasoningMap = {},
    setSelectedComponentId,
    lastUpdated,
  } = useStrategy();

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'BUILD' | 'PARTNER' | 'HYBRID'
  const [sortField, setSortField] = useState('strategicImportance'); // 'strategicImportance' | 'buildAttractiveness' | 'partnerAttractiveness' | 'confidence' | 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [searchQuery, setSearchQuery] = useState('');
  const [modalComponentId, setModalComponentId] = useState(null);

  // Calculate live summary metrics directly from decision engine evaluations
  const totalCount = components.length;
  let buildCount = 0;
  let partnerCount = 0;
  let hybridCount = 0;
  let totalConfidence = 0;

  components.forEach((c) => {
    const ev = evaluations[c.id];
    if (ev) {
      if (ev.decision === DECISIONS.BUILD) buildCount++;
      else if (ev.decision === DECISIONS.PARTNER) partnerCount++;
      else if (ev.decision === DECISIONS.HYBRID) hybridCount++;
      totalConfidence += ev.confidence || 0;
    }
  });

  const avgConfidence = totalCount > 0 ? Math.round(totalConfidence / totalCount) : 0;
  const buildPct = totalCount > 0 ? Math.round((buildCount / totalCount) * 100) : 0;
  const partnerPct = totalCount > 0 ? Math.round((partnerCount / totalCount) * 100) : 0;
  const hybridPct = totalCount > 0 ? Math.round((hybridCount / totalCount) * 100) : 0;

  // Filter & Sort components dynamically
  const filteredAndSortedComponents = useMemo(() => {
    return components
      .filter((c) => {
        const ev = evaluations[c.id];
        if (!ev) return false;

        // 1. Filter by decision stance
        if (activeFilter !== 'ALL' && ev.decision !== activeFilter) {
          return false;
        }

        // 2. Filter by search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = (c.displayName || c.name || '').toLowerCase().includes(q);
          const catMatch = (c.category || '').toLowerCase().includes(q);
          const descMatch = (c.description || '').toLowerCase().includes(q);
          return nameMatch || catMatch || descMatch;
        }

        return true;
      })
      .sort((a, b) => {
        const evA = evaluations[a.id] || {};
        const evB = evaluations[b.id] || {};

        let valA, valB;
        if (sortField === 'name') {
          valA = (a.displayName || a.name || '').toLowerCase();
          valB = (b.displayName || b.name || '').toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (sortField === 'buildAttractiveness') {
          valA = evA.buildAttractiveness ?? 0;
          valB = evB.buildAttractiveness ?? 0;
        } else if (sortField === 'partnerAttractiveness') {
          valA = evA.partnerAttractiveness ?? 0;
          valB = evB.partnerAttractiveness ?? 0;
        } else if (sortField === 'confidence') {
          valA = evA.confidence ?? 0;
          valB = evB.confidence ?? 0;
        } else {
          // Default: strategicImportance
          valA = evA.strategicImportance ?? 0;
          valB = evB.strategicImportance ?? 0;
        }

        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [components, evaluations, activeFilter, searchQuery, sortField, sortOrder]);

  const handleOpenReasoning = (id) => {
    setModalComponentId(id);
  };

  const handleTestSensitivity = (id) => {
    setSelectedComponentId(id);
    navigate(`/decisions/${id}/sensitivity`);
  };

  return (
    <div className="space-y-8">
      {/* 1. Executive Strategic Context Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/30">
                EXECUTIVE DECISION LEDGER
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300 font-medium">Scenario: {activeScenario?.name || 'Baseline Strategy'}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Live Engine Synced
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Infrastructure Build vs Partner Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Deterministic capital allocation and architecture posture for MochaTrade. Recommendations are computed directly from active weighted criteria and component attribute scores without hard-coded fallbacks.
            </p>
          </div>

          {/* Quick Nav Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
            <button
              onClick={() => navigate(ROUTES.SCORING)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Tune component scores in the spreadsheet matrix"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Edit Scoring Matrix</span>
            </button>
            <button
              onClick={() => navigate(ROUTES.ROADMAP)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-950/40"
            >
              <span>Phased Roadmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Summary Metrics (Executive KPI Row) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80 relative z-10">
          {/* Metric 1: Total Components */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl shadow-inner">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">Total Components</span>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{totalCount}</span>
              <span className="text-xs text-slate-400">Core Services</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 font-mono">
              Avg Stability: <span className="text-amber-400 font-semibold">{avgConfidence}%</span>
            </div>
          </div>

          {/* Metric 2: BUILD */}
          <div className="p-4 bg-slate-950/80 border border-emerald-950/60 rounded-xl shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                BUILD
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">{buildCount}</span>
              <span className="text-xs text-emerald-400/80 font-mono">({buildPct}%)</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              Proprietary IP & Competitive Moat
            </div>
          </div>

          {/* Metric 3: PARTNER */}
          <div className="p-4 bg-slate-950/80 border border-sky-950/60 rounded-xl shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                PARTNER
              </span>
              <Handshake className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-sky-400 font-mono">{partnerCount}</span>
              <span className="text-xs text-sky-400/80 font-mono">({partnerPct}%)</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              Turnkey SaaS & Regulated Rails
            </div>
          </div>

          {/* Metric 4: HYBRID */}
          <div className="p-4 bg-slate-950/80 border border-amber-950/60 rounded-xl shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                HYBRID
              </span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400 font-mono">{hybridCount}</span>
              <span className="text-xs text-amber-400/80 font-mono">({hybridPct}%)</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              Proprietary Layer + Third-Party Rails
            </div>
          </div>
        </div>

        {/* Portfolio Stance Visual Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>Portfolio Architecture Allocation</span>
            <span className="font-mono">
              Build: {buildCount} · Partner: {partnerCount} · Hybrid: {hybridCount}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 flex overflow-hidden border border-slate-800">
            {buildPct > 0 && (
              <div
                style={{ width: `${buildPct}%` }}
                className="bg-emerald-500 h-full transition-all duration-300"
                title={`Build: ${buildPct}%`}
              />
            )}
            {hybridPct > 0 && (
              <div
                style={{ width: `${hybridPct}%` }}
                className="bg-amber-500 h-full transition-all duration-300"
                title={`Hybrid: ${hybridPct}%`}
              />
            )}
            {partnerPct > 0 && (
              <div
                style={{ width: `${partnerPct}%` }}
                className="bg-sky-500 h-full transition-all duration-300"
                title={`Partner: ${partnerPct}%`}
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. Visual Comparison Chart: Strategic Importance vs Build Attractiveness (Recharts) */}
      <div>
        <StrategicVsBuildChart
          components={components}
          evaluations={evaluations}
          onSelectComponent={handleOpenReasoning}
        />
      </div>

      {/* 4. Filtering, Sorting, and Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
        {/* Left: Stance Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Filter:
          </span>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveFilter(DECISIONS.BUILD)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === DECISIONS.BUILD
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Build ({buildCount})
          </button>
          <button
            onClick={() => setActiveFilter(DECISIONS.PARTNER)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === DECISIONS.PARTNER
                ? 'bg-sky-950 text-sky-300 border border-sky-500/50 shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-sky-300 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Partner ({partnerCount})
          </button>
          <button
            onClick={() => setActiveFilter(DECISIONS.HYBRID)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === DECISIONS.HYBRID
                ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Hybrid ({hybridCount})
          </button>
        </div>

        {/* Right: Search & Sorting Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500 w-full sm:w-48 placeholder:text-slate-600"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 text-[11px]">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-2"
            >
              <option value="strategicImportance" className="bg-slate-900 text-white">
                Strategic Importance
              </option>
              <option value="buildAttractiveness" className="bg-slate-900 text-white">
                Build Attractiveness
              </option>
              <option value="partnerAttractiveness" className="bg-slate-900 text-white">
                Partner Attractiveness
              </option>
              <option value="confidence" className="bg-slate-900 text-white">
                Decision Stability
              </option>
              <option value="name" className="bg-slate-900 text-white">
                Component Name
              </option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Toggle sort direction"
            >
              {sortOrder === 'desc' ? 'High' : 'Low'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Component Decision Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredAndSortedComponents.length}</strong> of{' '}
            <strong className="text-white">{totalCount}</strong> evaluated infrastructure capabilities
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            Engine recalculation latency: &lt; 2ms (In-Memory)
          </span>
        </div>

        {filteredAndSortedComponents.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
            <p className="text-sm text-slate-400 mb-3">No infrastructure components match the selected filter.</p>
            <button
              onClick={() => {
                setActiveFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedComponents.map((component) => {
              const ev = evaluations[component.id];
              const reasoning = reasoningMap[component.id];

              return (
                <DecisionCard
                  key={component.id}
                  component={component}
                  evaluation={ev}
                  reasoning={reasoning}
                  onViewReasoning={handleOpenReasoning}
                  onTestSensitivity={handleTestSensitivity}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Full Decision Reasoning Drilldown Modal */}
      {modalComponentId && (
        <DecisionReasoningModal
          componentId={modalComponentId}
          onClose={() => setModalComponentId(null)}
        />
      )}
    </div>
  );
}
