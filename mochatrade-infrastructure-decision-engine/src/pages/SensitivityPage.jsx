/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SensitivityAnalysis } from '../components/sensitivity/SensitivityAnalysis.jsx';
import { useStrategy } from '../context/StrategyContext.jsx';
import { ROUTES } from '../utils/constants.js';
import {
  ChevronRight,
  ArrowLeft,
  SlidersHorizontal,
  FileText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export function SensitivityPage() {
  const { component: componentParam } = useParams();
  const navigate = useNavigate();
  const { components, setSelectedComponentId } = useStrategy();

  // Find component by param (case-insensitive id or name)
  const activeComponent =
    components.find(
      (c) =>
        c.id === componentParam ||
        c.id.toLowerCase() === (componentParam || '').toLowerCase()
    ) || components[0];

  useEffect(() => {
    if (activeComponent) {
      setSelectedComponentId(activeComponent.id);
    }
  }, [activeComponent, setSelectedComponentId]);

  return (
    <div className="space-y-6">
      {/* Executive Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 flex-wrap">
          <Link
            to={ROUTES.DECISIONS}
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Decision Ledger</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-300 font-semibold">
            {activeComponent?.displayName || activeComponent?.name || 'Component'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sensitivity & Tipping Point Analysis</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={ROUTES.DECISIONS}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Decisions</span>
          </Link>
          <Link
            to={ROUTES.SCORING}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Scoring Matrix</span>
          </Link>
        </div>
      </div>

      {/* Main Sensitivity Analysis View */}
      <SensitivityAnalysis componentId={activeComponent?.id} />
    </div>
  );
}
