/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Sliders,
  Table,
  ShieldCheck,
  Milestone,
  History,
  FileText,
  X,
  Layers,
  TrendingUp,
  GitCompareArrows,
} from 'lucide-react';
import { ROUTES } from '../../utils/constants.js';
import { useStrategy } from '../../context/StrategyContext.jsx';

const NAV_ITEMS = [
  { path: ROUTES.HOME, label: 'Dashboard', icon: LayoutDashboard, badge: null, end: true },
  { path: ROUTES.STRATEGY, label: 'Strategy Setup', icon: Compass, badge: null, end: true },
  { path: ROUTES.CRITERIA, label: 'Criteria & Weights', icon: Sliders, badge: '8 Active' },
  { path: ROUTES.SCORING, label: 'Scoring Matrix', icon: Table, badge: null },
  { path: ROUTES.DECISIONS, label: 'Decision Ledger', icon: ShieldCheck, badge: null },
  { path: ROUTES.SCENARIOS, label: 'Scenario Comparison', icon: GitCompareArrows, badge: '6 Postures' },
  { path: '/decisions/wallet/sensitivity', label: 'Sensitivity Analysis', icon: TrendingUp, badge: 'What-If' },
  { path: ROUTES.ROADMAP, label: 'Execution Roadmap', icon: Milestone, badge: '4 Phases' },
  { path: ROUTES.HISTORY, label: 'Audit History', icon: History, badge: null },
  { path: ROUTES.REPORT, label: 'Executive Memo', icon: FileText, badge: 'PDF' },
];

export function Sidebar({ isOpen, onClose }) {
  const { activeScenario } = useStrategy();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        <div>
          {/* Brand header */}
          <div className="h-14 px-5 border-b border-slate-800 flex items-center justify-between">
            <NavLink
              to={ROUTES.HOME}
              onClick={onClose}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/60 transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-white block leading-tight">
                  MochaTrade
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block leading-none">
                  Decision Engine
                </span>
              </div>
            </NavLink>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded lg:hidden cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Scenario Indicator Card */}
          <div className="p-3 mx-3 my-3 bg-slate-900/70 border border-slate-800/80 rounded-md">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              <span>Active Posture</span>
              <span className="text-emerald-400 font-mono font-medium">Deterministic</span>
            </div>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {activeScenario?.name || 'Baseline Strategy'}
            </div>
            <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
              Illustrative scenario
            </div>
          </div>

          {/* Navigation links */}
          <nav className="px-3 py-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Planning Workflows
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  end={Boolean(item.end)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0 transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/90">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-mono text-slate-300">Deterministic Engine Active</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">
            {activeScenario?.label || 'Illustrative scenario'}
          </div>
        </div>
      </aside>
    </>
  );
}
