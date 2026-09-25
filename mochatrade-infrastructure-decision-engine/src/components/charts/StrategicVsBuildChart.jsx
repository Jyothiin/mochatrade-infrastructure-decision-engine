/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Label,
} from 'recharts';
import { DECISIONS } from '../../engine/decisionEngine.js';
import { Layers, ShieldCheck, Handshake, Info, ArrowUpRight } from 'lucide-react';

export function StrategicVsBuildChart({ components = [], evaluations = {}, onSelectComponent }) {
  const [metricMode, setMetricMode] = useState('build'); // 'build' (Strategic vs Build Attractiveness) or 'partner' (Strategic vs Partner)

  const chartData = components.map((comp) => {
    const ev = evaluations[comp.id] || {
      strategicImportance: 50,
      buildAttractiveness: 50,
      partnerAttractiveness: 50,
      decision: DECISIONS.HYBRID,
      confidence: 60,
    };
    return {
      id: comp.id,
      name: comp.displayName || comp.name,
      category: comp.category,
      x: metricMode === 'build' ? ev.buildAttractiveness : ev.partnerAttractiveness,
      y: ev.strategicImportance,
      z: ev.confidence,
      buildAttractiveness: ev.buildAttractiveness,
      partnerAttractiveness: ev.partnerAttractiveness,
      strategicImportance: ev.strategicImportance,
      confidence: ev.confidence,
      decision: ev.decision,
    };
  });

  const getDecisionColor = (decision) => {
    if (decision === DECISIONS.BUILD) return '#10b981'; // emerald-500
    if (decision === DECISIONS.PARTNER) return '#0ea5e9'; // sky-500
    return '#f59e0b'; // amber-500
  };

  const getDecisionBg = (decision) => {
    if (decision === DECISIONS.BUILD) return 'rgba(16, 185, 129, 0.15)';
    if (decision === DECISIONS.PARTNER) return 'rgba(14, 165, 233, 0.15)';
    return 'rgba(245, 158, 11, 0.15)';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    const color = getDecisionColor(item.decision);

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3.5 rounded-lg shadow-2xl text-xs max-w-xs z-50">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            {item.category}
          </span>
          <span
            className="px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase tracking-wider"
            style={{
              backgroundColor: getDecisionBg(item.decision),
              color: color,
              border: `1px solid ${color}40`,
            }}
          >
            {item.decision}
          </span>
        </div>

        <div className="text-sm font-bold text-white mb-2">{item.name}</div>

        <div className="space-y-1.5 p-2 bg-slate-950/70 rounded border border-slate-800 font-mono text-[11px]">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Strategic Importance:</span>
            <span className="font-semibold text-indigo-400">{item.strategicImportance} / 100</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Build Attractiveness:</span>
            <span className="font-semibold text-emerald-400">{item.buildAttractiveness} / 100</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Partner Attractiveness:</span>
            <span className="font-semibold text-sky-400">{item.partnerAttractiveness} / 100</span>
          </div>
          <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800">
            <span className="text-slate-400">Decision Stability:</span>
            <span className="font-semibold text-amber-400">{item.confidence}%</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2 font-medium">
          <span>Click node to view full reasoning & assumptions</span>
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-inner">
      {/* Chart Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Strategic Portfolio Positioning Matrix
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase">
              Executive View
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {metricMode === 'build'
              ? 'X-Axis: Build Attractiveness (Payoff vs Friction) · Y-Axis: Strategic Importance (Moat & Control)'
              : 'X-Axis: Partner Attractiveness (Turnkey Relief vs Lock-in) · Y-Axis: Strategic Importance (Moat & Control)'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setMetricMode('build')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer font-medium text-xs ${
                metricMode === 'build'
                  ? 'bg-slate-800 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strategic vs Build Attractiveness
            </button>
            <button
              onClick={() => setMetricMode('partner')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer font-medium text-xs ${
                metricMode === 'partner'
                  ? 'bg-slate-800 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strategic vs Partner Attractiveness
            </button>
          </div>
        </div>
      </div>

      {/* Quadrant Legend Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-[11px]">
        <div className="p-2 rounded bg-slate-950/60 border border-emerald-900/30 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-slate-200 block truncate">Top-Right: Core Moat</span>
            <span className="text-[10px] text-emerald-400 truncate block">High Imp + High Build → BUILD</span>
          </div>
        </div>

        <div className="p-2 rounded bg-slate-950/60 border border-amber-900/30 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-slate-200 block truncate">Top-Left: Strategic Bottleneck</span>
            <span className="text-[10px] text-amber-400 truncate block">High Imp + Low Build → HYBRID</span>
          </div>
        </div>

        <div className="p-2 rounded bg-slate-950/60 border border-sky-900/30 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-slate-200 block truncate">Bottom-Left: Utility Rails</span>
            <span className="text-[10px] text-sky-400 truncate block">Low Imp + Low Build → PARTNER</span>
          </div>
        </div>

        <div className="p-2 rounded bg-slate-950/60 border border-indigo-900/30 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-slate-200 block truncate">Bottom-Right: Opportunistic</span>
            <span className="text-[10px] text-indigo-300 truncate block">Low Imp + High Build → Discretionary</span>
          </div>
        </div>
      </div>

      {/* Main Scatter Chart */}
      <div className="w-full h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 35, bottom: 35, left: 15 }}>
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 100]}
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickCount={6}
            >
              <Label
                value={
                  metricMode === 'build'
                    ? 'Build Attractiveness Score (0 - 100) →'
                    : 'Partner Attractiveness Score (0 - 100) →'
                }
                offset={-20}
                position="insideBottom"
                fill="#94a3b8"
                fontSize={12}
                fontWeight={500}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 100]}
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickCount={6}
            >
              <Label
                value="↑ Strategic Importance (Moat, IP, SLAs)"
                angle={-90}
                position="insideLeft"
                fill="#94a3b8"
                fontSize={12}
                fontWeight={500}
                offset={5}
              />
            </YAxis>
            <ZAxis type="number" dataKey="z" range={[180, 420]} name="Decision Stability" />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#64748b' }} />

            {/* Threshold Quadrant Partition Lines */}
            <ReferenceLine
              x={55}
              stroke="#334155"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Build Attractiveness Threshold (55)',
                fill: '#64748b',
                fontSize: 10,
                position: 'top',
              }}
            />
            <ReferenceLine
              y={60}
              stroke="#334155"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Strategic Importance Threshold (60)',
                fill: '#64748b',
                fontSize: 10,
                position: 'right',
              }}
            />

            <Scatter
              name="Infrastructure Components"
              data={chartData}
              onClick={(node) => onSelectComponent && onSelectComponent(node.id)}
              cursor="pointer"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={getDecisionColor(entry.decision)}
                  stroke="#0f172a"
                  strokeWidth={2.5}
                  className="transition-transform duration-200 hover:scale-125 focus:outline-none"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Component quick jump row below chart */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Interactive scatter node size reflects decision stability index (55% – 96%).</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">Quick Inspect:</span>
          {chartData.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectComponent && onSelectComponent(item.id)}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getDecisionColor(item.decision) }}
              />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
