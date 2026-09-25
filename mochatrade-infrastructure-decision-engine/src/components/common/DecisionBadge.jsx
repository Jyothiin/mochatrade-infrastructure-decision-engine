/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, ShieldCheck, Handshake } from 'lucide-react';
import { DECISIONS } from '../../engine/decisionEngine.js';

export function DecisionBadge({ decision, size = 'md', showDescription = false }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  if (decision === DECISIONS.BUILD) {
    return (
      <div className="inline-flex flex-col">
        <span
          className={`inline-flex items-center gap-1.5 font-semibold tracking-wider uppercase ${
            isSm
              ? 'text-xs px-2 py-0.5 border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 rounded'
              : isLg
              ? 'text-sm px-3.5 py-1.5 border border-emerald-500/50 bg-emerald-950/80 text-emerald-200 rounded-md shadow-sm shadow-emerald-900/30'
              : 'text-xs px-2.5 py-1 border border-emerald-500/40 bg-emerald-950/70 text-emerald-300 rounded'
          }`}
        >
          <ShieldCheck className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          BUILD
        </span>
        {showDescription && (
          <span className="text-[11px] text-slate-400 mt-1">Develop internally; proprietary moat</span>
        )}
      </div>
    );
  }

  if (decision === DECISIONS.PARTNER) {
    return (
      <div className="inline-flex flex-col">
        <span
          className={`inline-flex items-center gap-1.5 font-semibold tracking-wider uppercase ${
            isSm
              ? 'text-xs px-2 py-0.5 border border-sky-500/40 bg-sky-950/60 text-sky-300 rounded'
              : isLg
              ? 'text-sm px-3.5 py-1.5 border border-sky-500/50 bg-sky-950/80 text-sky-200 rounded-md shadow-sm shadow-sky-900/30'
              : 'text-xs px-2.5 py-1 border border-sky-500/40 bg-sky-950/70 text-sky-300 rounded'
          }`}
        >
          <Handshake className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          PARTNER
        </span>
        {showDescription && (
          <span className="text-[11px] text-slate-400 mt-1">Procure commercial API & licensed rails</span>
        )}
      </div>
    );
  }

  // Default: HYBRID
  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center gap-1.5 font-semibold tracking-wider uppercase ${
          isSm
            ? 'text-xs px-2 py-0.5 border border-amber-500/40 bg-amber-950/60 text-amber-300 rounded'
            : isLg
            ? 'text-sm px-3.5 py-1.5 border border-amber-500/50 bg-amber-950/80 text-amber-200 rounded-md shadow-sm shadow-amber-900/30'
            : 'text-xs px-2.5 py-1 border border-amber-500/40 bg-amber-950/70 text-amber-300 rounded'
        }`}
      >
        <Layers className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        HYBRID
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-400 mt-1">Own logic & UX, delegate commodity plumbing</span>
      )}
    </div>
  );
}
