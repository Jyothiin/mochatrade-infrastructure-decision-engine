/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStrategy } from '../../context/StrategyContext.jsx';
import { PRESET_SCENARIOS } from '../../data/scenarios.js';
import { Camera, Download, RotateCcw, ChevronDown, Check } from 'lucide-react';

export function Header() {
  const {
    activeScenario,
    loadScenario,
    activeTab,
    setActiveTab,
    saveDecisionSnapshot,
    resetToDefaults,
    exportJSON,
  } = useStrategy();

  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'matrix', label: 'Scoring Matrix' },
    { id: 'criteria', label: 'Criteria & Weights' },
    { id: 'sensitivity', label: 'Sensitivity Analysis' },
    { id: 'roadmap', label: 'Phased Roadmap' },
    { id: 'scenarios', label: 'Scenario Comparison' },
    { id: 'history', label: 'Audit History' },
    { id: 'report', label: 'Decision Report' },
  ];

  const handleTakeSnapshot = () => {
    saveDecisionSnapshot();
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-base font-bold tracking-tight text-white hover:text-slate-200 transition-colors whitespace-nowrap cursor-pointer text-left"
            >
              MochaTrade Engine
            </button>
            <span className="hidden sm:inline-block text-xs text-slate-500" aria-hidden="true">/</span>
            <div className="relative">
              <button
                onClick={() => setIsScenarioOpen(!isScenarioOpen)}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span className="truncate max-w-[200px]">{activeScenario.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isScenarioOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-md shadow-xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                    Switch Strategy Preset
                  </div>
                  {PRESET_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => {
                        loadScenario(scenario.id);
                        setIsScenarioOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        activeScenario.id === scenario.id ? 'text-emerald-400 font-medium' : 'text-slate-300'
                      }`}
                    >
                      <span className="truncate pr-2">{scenario.name}</span>
                      {activeScenario.id === scenario.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === item.id
                    ? 'text-white border-b-2 border-emerald-500 font-semibold'
                    : 'hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTakeSnapshot}
              title="Save current state snapshot to history"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors whitespace-nowrap cursor-pointer"
            >
              {snapshotSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Saved</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span>Snapshot</span>
                </>
              )}
            </button>

            <button
              onClick={exportJSON}
              title="Export complete strategy model to JSON"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Mobile horizontal navigation bar */}
        <div className="lg:hidden flex items-center gap-4 overflow-x-auto py-2 text-xs border-t border-slate-900 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-1 py-0.5 transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'text-emerald-400 font-semibold border-b border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
