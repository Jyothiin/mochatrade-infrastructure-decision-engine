/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
} from 'recharts';
import { DECISIONS } from '../../engine/decisionEngine.js';

export function DecisionMatrixScatter({ components, evaluations, onSelectComponent }) {
  const data = components.map((comp) => {
    const ev = evaluations[comp.id] || {
      strategicImportance: 50,
      partnerAttractiveness: 50,
      decision: DECISIONS.HYBRID,
      confidence: 50,
    };
    return {
      id: comp.id,
      name: comp.name,
      x: ev.partnerAttractiveness,
      y: ev.strategicImportance,
      z: ev.confidence,
      decision: ev.decision,
      buildAttractiveness: ev.buildAttractiveness,
    };
  });

  const getColor = (decision) => {
    if (decision === DECISIONS.BUILD) return '#10b981'; // emerald-500
    if (decision === DECISIONS.PARTNER) return '#0ea5e9'; // sky-500
    return '#f59e0b'; // amber-500
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs">
          <div className="font-semibold text-white mb-1">{item.name}</div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] uppercase"
              style={{
                backgroundColor: getColor(item.decision) + '22',
                color: getColor(item.decision),
                border: `1px solid ${getColor(item.decision)}55`,
              }}
            >
              {item.decision}
            </span>
            <span className="text-slate-400">Decision Stability: {item.z}%</span>
          </div>
          <div className="space-y-0.5 font-mono text-[11px] text-slate-300">
            <div>Strategic Importance: {item.y}/100</div>
            <div>Build Attractiveness: {item.buildAttractiveness}/100</div>
            <div>Partner Attractiveness: {item.x}/100</div>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">Click dot to inspect reasoning</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 10 }}>
          <XAxis
            type="number"
            dataKey="x"
            name="Partner Attractiveness"
            domain={[0, 100]}
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            label={{
              value: 'Partner Attractiveness (Speed, Cost & Compliance Relief) →',
              position: 'insideBottom',
              offset: -15,
              fill: '#94a3b8',
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Strategic Importance"
            domain={[0, 100]}
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            label={{
              value: '↑ Strategic Importance (Moat & Control)',
              angle: -90,
              position: 'insideLeft',
              fill: '#94a3b8',
              fontSize: 11,
              offset: 5,
            }}
          />
          <ZAxis type="number" dataKey="z" range={[120, 260]} />
          <Tooltip content={<CustomTooltip />} />

          {/* Reference divider lines for quadrant awareness */}
          <ReferenceLine y={60} stroke="#334155" strokeDasharray="3 3" />
          <ReferenceLine x={55} stroke="#334155" strokeDasharray="3 3" />

          <Scatter
            data={data}
            onClick={(node) => onSelectComponent && onSelectComponent(node.id)}
            cursor="pointer"
          >
            {data.map((entry) => (
              <Cell
                key={entry.id}
                fill={getColor(entry.decision)}
                stroke="#0f172a"
                strokeWidth={2}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
