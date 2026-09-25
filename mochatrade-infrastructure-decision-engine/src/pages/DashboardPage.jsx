/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useStrategy } from '../context/StrategyContext.jsx';
import { DecisionBadge } from '../components/common/DecisionBadge.jsx';
import {
  ShieldCheck,
  Handshake,
  Layers,
  ArrowRight,
  Sliders,
  Table,
  Milestone,
  History,
  FileText,
  TrendingUp,
  Activity,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '../utils/constants.js';

export function DashboardPage() {
  const { components, evaluations, activeScenario, loadDemo } = useStrategy();

  const totalComponents = components.length;
  let buildCount = 0;
  let partnerCount = 0;
  let hybridCount = 0;
  let totalConfidence = 0;

  components.forEach((c) => {
    const ev = evaluations[c.id];
    if (ev) {
      if (ev.decision === 'BUILD') buildCount++;
      else if (ev.decision === 'PARTNER') partnerCount++;
      else hybridCount++;
      totalConfidence += ev.confidence || 0;
    }
  });

  const avgConfidence = totalComponents > 0 ? Math.round(totalConfidence / totalComponents) : 0;

  return (
    <div className="space-y-8">
      {/* Page Title & Context Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span>MochaTrade Strategy Cockpit</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400">Illustrative scenario / Editable assumption</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Infrastructure Decision Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Deterministic, weighted multi-criteria architecture evaluation for fintech core systems. 
            Currently active: <strong className="text-slate-200">{activeScenario?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadDemo}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 rounded-md transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load MochaTrade Demo</span>
          </button>
          <Link
            to={ROUTES.DECISIONS}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm"
          >
            <span>View Decision Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Round 1 strategy anchor */}
      <section className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-400">Round 1 strategy anchor</div>
            <p className="text-xs text-slate-300 mt-1">The Balanced scenario is the Round 1 baseline; changing weights or scores intentionally moves the recommendation away from it.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-mono">
            <span className="px-2 py-1 rounded border border-emerald-500/30 bg-emerald-950/40 text-emerald-300">BUILD · Trading</span>
            <span className="px-2 py-1 rounded border border-amber-500/30 bg-amber-950/30 text-amber-300">HYBRID · Wallet</span>
            <span className="px-2 py-1 rounded border border-sky-500/30 bg-sky-950/30 text-sky-300">PARTNER · KYC</span>
            <span className="px-2 py-1 rounded border border-sky-500/30 bg-sky-950/30 text-sky-300">PARTNER · UPI</span>
          </div>
        </div>
      </section>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Components
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalComponents}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-slate-400" />
            <span>Active capabilities</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-emerald-950/60 rounded-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1">
            Build (In-House)
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{buildCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Core differentiation</div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-amber-950/60 rounded-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-1">
            Hybrid Orchestration
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{hybridCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Split internal/partner</div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-sky-950/60 rounded-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 mb-1">
            Partner (Turnkey)
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">{partnerCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Licensed rails & switches</div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg col-span-2 sm:col-span-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Avg Decision Stability
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{avgConfidence}%</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Mathematical stability</span>
          </div>
        </div>
      </div>

      {/* Interactive Infrastructure Evaluation Preview */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Component Decision Status Overview
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic outcomes generated by scoring against directional strategic criteria.
            </p>
          </div>
          <Link
            to={ROUTES.SCORING}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Scoring Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {components.map((comp) => {
            const ev = evaluations[comp.id];
            return (
              <div
                key={comp.id}
                className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-lg flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    {comp.category}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mb-1.5">{comp.displayName || comp.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <DecisionBadge decision={ev?.decision || 'HYBRID'} size="sm" />
                  <span className="text-xs font-mono text-slate-400">
                    {ev?.confidence}% stability
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Engine Architecture Navigation Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Workflows & Decision Engines
          </h2>
          <span className="text-[11px] font-mono text-slate-500">Phase 1 Foundation Ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <Link
            to={ROUTES.STRATEGY}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded bg-slate-800 text-slate-300 group-hover:text-emerald-400 group-hover:bg-emerald-950/40 transition-colors">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                1. Strategy & Weights
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configure 8 strategic criteria with directional weights (Build-favoring vs Partner-favoring).
            </p>
          </Link>

          <Link
            to={ROUTES.SCORING}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded bg-slate-800 text-slate-300 group-hover:text-emerald-400 group-hover:bg-emerald-950/40 transition-colors">
                <Table className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                2. Scoring Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adjust parameters (1-10) with real-time recalculation of strategic importance and attractiveness.
            </p>
          </Link>

          <Link
            to={ROUTES.DECISIONS}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded bg-slate-800 text-slate-300 group-hover:text-emerald-400 group-hover:bg-emerald-950/40 transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                3. Decision Ledger
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect transparent mathematical reasons, key drivers, trade-offs, and sensitivity tipping points.
            </p>
          </Link>

          <Link
            to={ROUTES.ROADMAP}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded bg-slate-800 text-slate-300 group-hover:text-emerald-400 group-hover:bg-emerald-950/40 transition-colors">
                <Milestone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                4. Execution Roadmap
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore 4-phase rollout with strict partition between external partner and internal owned capability.
            </p>
          </Link>

          <Link
            to={ROUTES.HISTORY}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded bg-slate-800 text-slate-300 group-hover:text-emerald-400 group-hover:bg-emerald-950/40 transition-colors">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                5. Audit History
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare strategic snapshots, trace meeting deliberations, and review differential outcome logs.
            </p>
          </Link>

          <Link
            to={ROUTES.REPORT}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded bg-slate-800 text-slate-300 group-hover:text-emerald-400 group-hover:bg-emerald-950/40 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                6. Executive Memo
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Board-ready decision memo with printable executive summaries, risk registers, and sign-offs.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
