/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStrategy } from '../../context/StrategyContext.jsx';
import { PRESET_SCENARIOS } from '../../data/scenarios.js';
import {
  Menu,
  ChevronDown,
  Check,
  Camera,
  Download,
} from 'lucide-react';
import { ROUTES } from '../../utils/constants.js';

export function TopHeader({ onOpenSidebar }) {
  const location = useLocation();
  const {
    activeScenario,
    loadScenario,
    saveDecisionSnapshot,
    exportJSON,
  } = useStrategy();

  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const getPageTitle = (path) => {
    switch (path) {
      case ROUTES.STRATEGY:
        return 'Strategy & Directional Weights';
      case ROUTES.SCORING:
        return 'Infrastructure Scoring Matrix';
      case ROUTES.DECISIONS:
        return 'Decision Ledger & Portfolio Analysis';
      case ROUTES.ROADMAP:
        return 'Phased Execution Roadmap';
      case ROUTES.HISTORY:
        return 'Audit History & Snapshots';
      case ROUTES.REPORT:
        return 'Executive Memo & Board Presentation';
      case ROUTES.SCENARIOS:
        return 'Strategic Scenario Comparison';
      case ROUTES.HOME:
      default:
        return 'Executive Dashboard';
    }
  };

  const handleTakeSnapshot = () => {
    saveDecisionSnapshot();
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between no-print">
      {/* Left: Mobile hamburger & Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 text-slate-400 hover:text-white rounded lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            {getPageTitle(location.pathname)}
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-600" aria-hidden="true">|</span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-amber-400/90">
            Illustrative scenario / Editable assumption
          </span>
        </div>
      </div>

      {/* Right: Strategy Preset Selector & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Preset scenario dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsScenarioOpen(!isScenarioOpen)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors cursor-pointer"
          >
            <span className="text-slate-500 font-normal">Scenario:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[120px] sm:max-w-[150px]">
              {activeScenario?.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isScenarioOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-md shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Strategy Presets
              </div>
              {PRESET_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => {
                    loadScenario(scenario.id);
                    setIsScenarioOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                    activeScenario?.id === scenario.id
                      ? 'text-emerald-400 font-medium bg-emerald-950/20'
                      : 'text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-medium text-slate-200">{scenario.name}</div>
                    <div className="text-[10px] text-slate-500">{scenario.horizon}</div>
                  </div>
                  {activeScenario?.id === scenario.id && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Snapshot quick action */}
        <button
          onClick={handleTakeSnapshot}
          title="Save audit snapshot of current weights and scores"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors cursor-pointer"
        >
          {snapshotSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Captured</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Snapshot</span>
            </>
          )}
        </button>

        {/* Export JSON */}
        <button
          onClick={exportJSON}
          title="Export strategy model as JSON"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
}
