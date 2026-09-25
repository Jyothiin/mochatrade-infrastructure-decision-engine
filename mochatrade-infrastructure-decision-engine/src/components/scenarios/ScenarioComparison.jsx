import React, { useMemo, useState } from 'react';
import { useStrategy } from '../../context/StrategyContext.jsx';
import { PRESET_SCENARIOS } from '../../data/scenarios.js';
import { evaluateDecision } from '../../engine/decisionEngine.js';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import { ArrowRight, GitCompareArrows, SlidersHorizontal } from 'lucide-react';

const DECISION_STYLES = {
  BUILD: 'text-emerald-300 bg-emerald-950/50 border-emerald-500/30',
  PARTNER: 'text-sky-300 bg-sky-950/50 border-sky-500/30',
  HYBRID: 'text-amber-300 bg-amber-950/50 border-amber-500/30',
};
const SHORT_NAMES = { wallet: 'Wallet', banking_rails: 'UPI', kyc_aml: 'KYC/AML', trading_engine: 'Trading Engine' };
const labelFor = (scenario) => scenario.shortName || scenario.name;
const weightsFor = (scenario, activeScenario) => scenario.id === 'custom' ? activeScenario.weights : scenario.weights;
const nameFor = (component) => SHORT_NAMES[component.id] || component.displayName || component.name;

export function ScenarioComparison() {
  const { components = [], criteria = [], activeScenario, weights = {} } = useStrategy();
  const customScenario = activeScenario?.id === 'custom'
    ? activeScenario
    : { id: 'custom', name: 'Custom', shortName: 'Custom', weights };
  const scenarios = [...PRESET_SCENARIOS, customScenario];
  const [firstId, setFirstId] = useState('moat_first');
  const [secondId, setSecondId] = useState('speed_to_market');

  const evaluated = useMemo(() => scenarios.map((scenario) => ({
    scenario,
    decisions: components.reduce((result, component) => {
      result[component.id] = evaluateDecision(component, criteria, weightsFor(scenario, activeScenario));
      return result;
    }, {}),
  })), [scenarios, components, criteria, activeScenario]);
  const byId = Object.fromEntries(evaluated.map((item) => [item.scenario.id, item]));
  const first = byId[firstId] || evaluated[0];
  const second = byId[secondId] || evaluated[1] || evaluated[0];

  const changes = useMemo(() => {
    if (!first || !second) return [];
    const firstWeights = weightsFor(first.scenario, activeScenario);
    const secondWeights = weightsFor(second.scenario, activeScenario);
    return components.map((component) => {
      const before = first.decisions[component.id];
      const after = second.decisions[component.id];
      const weightChanges = criteria.map((criterion) => ({ criterion, before: Number(firstWeights?.[criterion.id] || 0), after: Number(secondWeights?.[criterion.id] || 0) }))
        .filter((item) => item.before !== item.after)
        .sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before));
      return { component, before, after, weightChanges };
    }).filter((item) => item.before?.decision !== item.after?.decision);
  }, [first, second, components, criteria, activeScenario]);

  if (!first || !second) return null;
  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div><div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-400 mb-2"><GitCompareArrows className="w-3.5 h-3.5" />Strategy laboratory</div><h1 className="text-2xl font-bold tracking-tight text-white">Scenario comparison</h1><p className="text-sm text-slate-400 mt-1 max-w-3xl">Each posture is evaluated independently against the live component scores. Change a score or criterion and every scenario recalculates.</p></div>
        <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-mono"><SlidersHorizontal className="w-3.5 h-3.5" />Illustrative scenarios / editable assumptions</div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{scenarios.map((scenario) => { const evaluation = byId[scenario.id]; const builds = Object.values(evaluation.decisions).filter((item) => item.decision === 'BUILD').length; const partners = Object.values(evaluation.decisions).filter((item) => item.decision === 'PARTNER').length; return <div key={scenario.id} className={`p-4 border rounded-lg ${scenario.id === activeScenario?.id ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/70'}`}><div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-white">{labelFor(scenario)}</h2><p className="text-[11px] text-slate-500 mt-1">{scenario.horizon || 'Custom horizon'}</p></div><span className="text-[10px] font-mono text-slate-400">{builds}B · {partners}P</span></div><p className="text-xs text-slate-400 leading-relaxed mt-3 line-clamp-2">{scenario.description || 'User-defined strategic posture.'}</p></div>; })}</div>

      <section className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden"><div className="p-4 border-b border-slate-800"><h2 className="text-sm font-bold text-white">Independent recommendation matrix</h2><p className="text-xs text-slate-500 mt-1">Metrics are shown beneath each recommendation so the decision remains auditable.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]"><tr><th className="p-3 min-w-[180px]">Component</th>{evaluated.map(({ scenario }) => <th key={scenario.id} className="p-3 border-l border-slate-800 min-w-[150px]">{labelFor(scenario)}</th>)}</tr></thead><tbody className="divide-y divide-slate-800/80">{components.map((component) => <tr key={component.id} className="hover:bg-slate-800/20"><td className="p-3"><div className="font-semibold text-white">{nameFor(component)}</div><div className="text-[10px] text-slate-500 mt-1">{component.category}</div></td>{evaluated.map(({ scenario, decisions }) => { const item = decisions[component.id]; return <td key={scenario.id} className="p-3 border-l border-slate-800 align-top"><div className={`inline-flex px-2 py-1 border rounded text-[10px] font-bold tracking-wider ${DECISION_STYLES[item.decision]}`}>{item.decision}</div><div className="grid grid-cols-3 gap-1 mt-3 text-[10px] font-mono"><span className="text-indigo-300">SI {item.strategicImportance}</span><span className="text-emerald-300">B {item.buildAttractiveness}</span><span className="text-sky-300">P {item.partnerAttractiveness}</span></div></td>; })}</tr>)}</tbody></table></div></section>

      <section className="bg-slate-900/80 border border-slate-800 rounded-lg p-5"><div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5"><div><h2 className="text-sm font-bold text-white">Compare two scenarios</h2><p className="text-xs text-slate-500 mt-1">Select any pair to explain recommendation changes from the underlying weights.</p></div><div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"><select value={first.scenario.id} onChange={(event) => setFirstId(event.target.value)} className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200">{scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{labelFor(scenario)}</option>)}</select><ArrowRight className="hidden sm:block w-4 h-4 text-slate-500" /><select value={second.scenario.id} onChange={(event) => setSecondId(event.target.value)} className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200">{scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{labelFor(scenario)}</option>)}</select></div></div>{changes.length === 0 ? <div className="p-4 border border-emerald-500/20 bg-emerald-950/20 rounded text-xs text-emerald-300">No recommendations changed between these scenarios. The underlying metrics may still have moved.</div> : <div className="space-y-3">{changes.map(({ component, before, after, weightChanges }) => { const primary = weightChanges[0]; return <div key={component.id} className="p-4 border border-slate-800 bg-slate-950/50 rounded"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><h3 className="text-sm font-bold text-white">{nameFor(component)}</h3><div className="flex items-center gap-2"><DecisionBadge decision={before.decision} size="sm" /><ArrowRight className="w-3.5 h-3.5 text-slate-600" /><DecisionBadge decision={after.decision} size="sm" /></div></div><div className="mt-3 text-xs text-slate-300"><span className="text-slate-500">Primary reason: </span>{primary ? `${primary.criterion.name} weight changed from ${primary.before.toFixed(0)}% to ${primary.after.toFixed(0)}%.` : 'The weighted balance crossed a classification threshold.'}</div><div className="mt-2 text-[11px] text-slate-500 font-mono">{labelFor(first.scenario)}: {before.decision} · {labelFor(second.scenario)}: {after.decision}</div></div>; })}</div>}</section>
    </div>
  );
}