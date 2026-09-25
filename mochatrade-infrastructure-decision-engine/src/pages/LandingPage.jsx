/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStrategy } from '../context/StrategyContext.jsx';
import { DecisionBadge } from '../components/common/DecisionBadge.jsx';
import {
  ShieldCheck,
  Handshake,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  FileCheck2,
  GitBranch,
  Sparkles,
} from 'lucide-react';

export function LandingPage({ onEnterStudio }) {
  const { components, evaluations, activeScenario, loadDemo } = useStrategy();

  return (
    <div className="space-y-16 py-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-800">
          <span>Enterprise Strategy Platform</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-400">Illustrative scenario / Editable assumption</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Turn financial infrastructure strategy into{' '}
          <span className="text-emerald-400">transparent, defensible</span> decisions.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Evaluate which core financial capabilities you should <strong className="text-white font-semibold">BUILD</strong> in-house for long-term moat, <strong className="text-white font-semibold">PARTNER</strong> with licensed rails to accelerate velocity, or <strong className="text-white font-semibold">HYBRIDIZE</strong> to own the trader experience while delegating statutory compliance.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onEnterStudio}
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter Decision Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              loadDemo();
              onEnterStudio();
            }}
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 rounded-md transition-colors cursor-pointer shadow-sm"
          >
            Load MochaTrade Demo
          </button>
        </div>
      </section>

      {/* 3 Strategic Postures */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/80 border border-emerald-950/60 rounded-lg space-y-3">
          <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">BUILD Internally</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Reserved for core competitive differentiation, microsecond latency advantages, and proprietary intellectual property that drives company enterprise valuation.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-slate-800">
            e.g. Ultra-low Latency Matching Engine
          </div>
        </div>

        <div className="p-6 bg-slate-900/80 border border-amber-950/60 rounded-lg space-y-3">
          <div className="w-9 h-9 rounded bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">HYBRID Orchestration</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Own the bespoke trader onboarding UI, smart fraud risk scoring, and internal ledger while consuming licensed database APIs and external escrow accounts.
          </p>
          <div className="text-[11px] font-mono text-amber-400 pt-2 border-t border-slate-800">
            e.g. KYC / AML & Double-Entry Ledger
          </div>
        </div>

        <div className="p-6 bg-slate-900/80 border border-sky-950/60 rounded-lg space-y-3">
          <div className="w-9 h-9 rounded bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Handshake className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">PARTNER Externally</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Outsource commoditized statutory rails, central clearing switches, and banking sponsor connections to certified commercial payment aggregators.
          </p>
          <div className="text-[11px] font-mono text-sky-400 pt-2 border-t border-slate-800">
            e.g. UPI & Central Bank Clearing Rails
          </div>
        </div>
      </section>

      {/* Interactive Quick Preview of Demo Scenario */}
      <section className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>LIVE MODEL SNAPSHOT</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-mono">Illustrative baseline</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              MochaTrade Illustrative Infrastructure Evaluation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic calculations based on balanced fintech criteria weights. Adjust scores or weights in the studio to see live flips.
            </p>
          </div>

          <button
            onClick={onEnterStudio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-slate-950 border border-slate-800 rounded transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Open Decision Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {components.map((comp) => {
            const ev = evaluations[comp.id];
            return (
              <div
                key={comp.id}
                className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
                    {comp.category}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{comp.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <DecisionBadge decision={ev?.decision || 'HYBRID'} size="sm" />
                  <span className="text-xs font-mono text-slate-400">
                    {ev?.confidence}% stability
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Decision Workflow Steps */}
      <section className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 text-center">
          Transparent Architecture Decision Workflow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded space-y-1.5">
            <span className="text-emerald-400 font-mono font-bold">Step 01</span>
            <h3 className="font-bold text-white">Define Criteria Weights</h3>
            <p className="text-slate-400 leading-relaxed">
              Balance Strategic Moat, Control, and Scalability against Time to Market and Regulatory Burden.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded space-y-1.5">
            <span className="text-emerald-400 font-mono font-bold">Step 02</span>
            <h3 className="font-bold text-white">Score Components</h3>
            <p className="text-slate-400 leading-relaxed">
              Rate internal requirements on a 1-10 scale. Engine computes Strategic Importance and Attractiveness.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded space-y-1.5">
            <span className="text-emerald-400 font-mono font-bold">Step 03</span>
            <h3 className="font-bold text-white">Inspect Drivers & Math</h3>
            <p className="text-slate-400 leading-relaxed">
              Trace every BUILD, PARTNER, or HYBRID recommendation to its top drivers and operational risks.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded space-y-1.5">
            <span className="text-emerald-400 font-mono font-bold">Step 04</span>
            <h3 className="font-bold text-white">Generate Phased Roadmap</h3>
            <p className="text-slate-400 leading-relaxed">
              Export 0-3m, 3-6m, 6-12m, and 12+m milestones with explicit external vs owned capability boundaries.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
