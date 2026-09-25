/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StrategySetup } from '../components/strategy/StrategySetup.jsx';
import { CriteriaManager } from '../components/strategy/CriteriaManager.jsx';
import { Compass, Sliders, ArrowRight } from 'lucide-react';

export function StrategyPage({ defaultTab }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isCriteriaPath = location.pathname.includes('/criteria') || defaultTab === 'criteria';
  const activeSubTab = isCriteriaPath ? 'criteria' : 'setup';

  const handleTabSelect = (tab) => {
    if (tab === 'criteria') {
      navigate('/strategy/criteria');
    } else {
      navigate('/strategy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Strategy Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start">
          <button
            type="button"
            onClick={() => handleTabSelect('setup')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'setup'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Strategy Setup & Objectives</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect('criteria')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'criteria'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Criteria Weights Breakdown</span>
          </button>
        </div>

        {activeSubTab === 'criteria' && (
          <button
            type="button"
            onClick={() => navigate('/scoring')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            Continue to Scoring Matrix
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tab Panels */}
      {activeSubTab === 'setup' ? (
        <StrategySetup onContinueToCriteria={() => handleTabSelect('criteria')} />
      ) : (
        <div className="space-y-6">
          <CriteriaManager />
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-white">
                Criteria Allocation Calibrated
              </div>
              <div className="text-[11px] text-slate-400">
                Ready to review component-by-component infrastructure ratings in the Scoring Matrix.
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/scoring')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Continue to Scoring Matrix
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
