/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import { DECISIONS, THRESHOLDS } from '../../engine/decisionEngine.js';

export function SensitivityMetricsChart({
  sweepData = [],
  criterionName = 'Criterion',
  currentWeight = 15,
  currentDecision = DECISIONS.BUILD,
  thresholdWeight = null,
}) {
  if (!sweepData || sweepData.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-2 min-w-48">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-mono">
          <span className="text-slate-400">{criterionName} Weight:</span>
          <span className="font-bold text-white text-sm">{label}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Projected Decision:</span>
          <DecisionBadge decision={data.decision} size="sm" />
        </div>

        <div className="space-y-1 font-mono pt-1 text-[11px]">
          <div className="flex justify-between text-indigo-400">
            <span>Strategic Imp:</span>
            <span className="font-bold">{data.strategicImportance}/100</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span>Build Attract:</span>
            <span className="font-bold">{data.buildAttractiveness}/100</span>
          </div>
          <div className="flex justify-between text-sky-400">
            <span>Partner Attract:</span>
            <span className="font-bold">{data.partnerAttractiveness}/100</span>
          </div>
          <div className="flex justify-between text-amber-400 border-t border-slate-800/80 pt-1">
            <span>Decision Stability:</span>
            <span className="font-bold">{data.confidence}%</span>
          </div>
        </div>

        {data.isCurrent && (
          <div className="text-[10px] font-mono text-amber-400 bg-amber-950/40 p-1 rounded text-center border border-amber-500/20">
            ★ Current Model Weight ({currentWeight}%)
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
            Parametric Sensitivity Response
          </span>
          <h4 className="text-sm font-bold text-white">
            Multidimensional Trajectories Across Weight Variations
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-300">Strategic Imp.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Build Attract.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-slate-300">Partner Attract.</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sweepData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="weight"
              unit="%"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              label={{
                value: `${criterionName} Weight (%)`,
                position: 'insideBottom',
                offset: -12,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              label={{
                value: 'Score (0–100)',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Threshold boundary reference line */}
            <ReferenceLine
              y={60}
              stroke="#475569"
              strokeDasharray="4 4"
              label={{ value: 'Dominance (60)', fill: '#64748b', fontSize: 10, position: 'right' }}
            />

            {/* Current Weight Vertical Reference Line */}
            <ReferenceLine
              x={currentWeight}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: `Current (${currentWeight}%)`,
                fill: '#f59e0b',
                fontSize: 10,
                position: 'top',
              }}
            />

            {/* Decision Threshold Vertical Reference Line (if any) */}
            {thresholdWeight !== null && thresholdWeight !== currentWeight && (
              <ReferenceLine
                x={thresholdWeight}
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 2"
                label={{
                  value: `Threshold (${thresholdWeight}%)`,
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="strategicImportance"
              name="Strategic Importance"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#6366f1' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="buildAttractiveness"
              name="Build Attractiveness"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="partnerAttractiveness"
              name="Partner Attractiveness"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0ea5e9' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
        <span>Dynamic engine simulation: Every data point is independently evaluated by the decision matrix.</span>
        <span className="text-amber-400">Gold line = Active Model Weight</span>
      </div>
    </div>
  );
}
