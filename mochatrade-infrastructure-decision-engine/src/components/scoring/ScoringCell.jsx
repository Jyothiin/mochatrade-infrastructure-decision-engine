/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Minus, Plus, Info, Sliders, ChevronDown } from 'lucide-react';
import { CRITERIA_DIRECTIONS } from '../../data/criteria.js';

export function getScoreDescriptor(score) {
  if (score <= 2) {
    return {
      text: 'Very Low',
      short: 'V.Low',
      bgClass: 'bg-slate-800/80 border-slate-700 text-slate-300',
      barColor: 'bg-slate-500',
    };
  }
  if (score <= 4) {
    return {
      text: 'Low',
      short: 'Low',
      bgClass: 'bg-sky-950/70 border-sky-800/70 text-sky-300',
      barColor: 'bg-sky-500',
    };
  }
  if (score <= 6) {
    return {
      text: 'Moderate',
      short: 'Mod',
      bgClass: 'bg-amber-950/60 border-amber-800/60 text-amber-300',
      barColor: 'bg-amber-500',
    };
  }
  if (score <= 8) {
    return {
      text: 'High',
      short: 'High',
      bgClass: 'bg-emerald-950/70 border-emerald-700/70 text-emerald-300',
      barColor: 'bg-emerald-500',
    };
  }
  return {
    text: 'Very High',
    short: 'V.High',
    bgClass: 'bg-emerald-900/80 border-emerald-500 text-emerald-100 font-bold',
    barColor: 'bg-emerald-400',
  };
}

export function ScoringCell({
  componentId,
  componentName,
  criterion,
  score = 5,
  onScoreChange,
  viewMode = 'compact', // 'compact' | 'slider' | 'stepper'
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isEditingPopover, setIsEditingPopover] = useState(false);
  const cellRef = useRef(null);

  const descriptor = getScoreDescriptor(score);
  const isBuildFavored = criterion.direction === CRITERIA_DIRECTIONS.FAVORS_BUILD;

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (score < 10) onScoreChange(componentId, criterion.id, score + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (score > 1) onScoreChange(componentId, criterion.id, score - 1);
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    onScoreChange(componentId, criterion.id, val);
  };

  const handleDirectInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onScoreChange(componentId, criterion.id, Math.max(1, Math.min(10, val)));
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (cellRef.current && !cellRef.current.contains(e.target)) {
        setIsEditingPopover(false);
      }
    }
    if (isEditingPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingPopover]);

  return (
    <td
      ref={cellRef}
      className={`p-2 border-l border-slate-800/70 text-center relative transition-colors ${
        isEditingPopover ? 'bg-slate-800/40 ring-1 ring-emerald-500/50' : 'hover:bg-slate-800/20'
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex flex-col items-center justify-center gap-1 min-w-[100px]">
        {/* View Mode 1: Slider View */}
        {viewMode === 'slider' ? (
          <div className="w-full px-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${descriptor.bgClass}`}>
                {score}
              </span>
              <span className="text-[10px] text-slate-400 font-sans truncate max-w-[55px]">
                {descriptor.text}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={score}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        ) : viewMode === 'stepper' ? (
          /* View Mode 2: Stepper View */
          <div className="flex items-center justify-center gap-1 w-full">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={score <= 1}
              className="p-1 rounded bg-slate-950 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Decrease score (-1)"
            >
              <Minus className="w-3 h-3" />
            </button>

            <div className="flex flex-col items-center">
              <input
                type="number"
                min="1"
                max="10"
                value={score}
                onChange={handleDirectInputChange}
                className="w-9 h-7 bg-slate-950 border border-slate-700 rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[9px] text-slate-400 truncate max-w-[45px] mt-0.5">
                {descriptor.short}
              </span>
            </div>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={score >= 10}
              className="p-1 rounded bg-slate-950 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Increase score (+1)"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          /* View Mode 3: Compact Default (Interactive Select + Mini Progress Bar + Quick Edit Popover) */
          <div className="flex flex-col items-center w-full gap-1">
            <div className="flex items-center gap-1">
              <select
                value={score}
                onChange={handleDirectInputChange}
                aria-label={`${componentName} ${criterion.name} score`}
                className={`border rounded px-1.5 py-0.5 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-center ${descriptor.bgClass}`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const desc = getScoreDescriptor(num);
                  return (
                    <option key={num} value={num} className="bg-slate-900 text-white">
                      {num} — {desc.text}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() => setIsEditingPopover((prev) => !prev)}
                title="Open slider & precision score editor"
                className="p-1 text-slate-500 hover:text-emerald-400 rounded hover:bg-slate-800 transition-colors"
              >
                <Sliders className="w-3 h-3" />
              </button>
            </div>

            {/* Score mini progress bar indicator */}
            <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${descriptor.barColor} transition-all duration-150`}
                style={{ width: `${(score / 10) * 100}%` }}
              />
            </div>

            <span className="text-[10px] text-slate-400">
              {descriptor.text}
            </span>
          </div>
        )}
      </div>

      {/* Expanded Slider & Precision Editor Popover */}
      {isEditingPopover && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-1 w-64 p-3 bg-slate-900 border border-emerald-500/50 rounded-lg shadow-xl text-left">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
            <span className="text-[11px] font-semibold text-slate-200 truncate">
              {criterion.name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${descriptor.bgClass}`}>
              {score} / 10
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Slider Adjust:</span>
                <span className="font-semibold text-white">{descriptor.text}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={score}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
                <span>1 (Min)</span>
                <span>5 (Mod)</span>
                <span>10 (Max)</span>
              </div>
            </div>

            {/* Quick score buttons (1-10) */}
            <div>
              <div className="text-[10px] text-slate-400 mb-1">Quick Select:</div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onScoreChange(componentId, criterion.id, num)}
                    className={`py-1 text-[11px] font-mono rounded border transition-colors ${
                      score === num
                        ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80 leading-relaxed">
              <strong className="text-slate-300 block mb-0.5">Scoring Guidance:</strong>
              {criterion.guidance || criterion.scoreMeaning}
            </div>

            <button
              type="button"
              onClick={() => setIsEditingPopover(false)}
              className="w-full py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-center"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {showTooltip && !isEditingPopover && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 w-64 p-2.5 bg-slate-950/95 border border-slate-700/80 rounded-lg shadow-xl text-left pointer-events-none backdrop-blur-xs"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-white mb-1">
            <span>{criterion.name}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${descriptor.bgClass}`}>
              {score} / 10
            </span>
          </div>

          <div className="text-[11px] text-amber-300 font-medium mb-1">
            Score: {score} = {descriptor.text}
          </div>

          <p className="text-[10px] text-slate-300 leading-normal mb-1.5">
            {criterion.scoreMeaning || criterion.description}
          </p>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Directional Bias:</span>
            <span className={isBuildFavored ? 'text-emerald-400 font-semibold' : 'text-sky-400 font-semibold'}>
              {isBuildFavored ? 'Favors BUILD' : 'Favors PARTNER'}
            </span>
          </div>

          <div className="text-[9px] text-slate-500 mt-1 italic">
            Changes recalculate recommendation, decision stability, and reasoning immediately.
          </div>
        </div>
      )}
    </td>
  );
}
