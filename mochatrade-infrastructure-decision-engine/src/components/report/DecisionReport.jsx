import React, { useState } from 'react';
import { useStrategy } from '../../context/StrategyContext.jsx';
import { DecisionBadge } from '../common/DecisionBadge.jsx';
import { DECISIONS } from '../../engine/decisionEngine.js';
import { Download, FileText, Printer, Check, Sparkles } from 'lucide-react';

const nameFor = (component) => component.displayName || component.name;
const listFor = (value) => Array.isArray(value) ? value : value ? [value] : [];

function ReportSection({ number, title, children }) {
  return <section className="space-y-3 break-inside-avoid"><h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-800">{number}. {title}</h2>{children}</section>;
}

export function DecisionReport() {
  const {
    activeScenario,
    strategyProfile,
    criteria,
    normalizedWeights,
    components,
    evaluations,
    reasoningMap,
    sensitivityMap,
    phasedRoadmap,
    roadmapDependencies = [],
    roadmapAssumptions = [],
    decisionHistory = [],
    saveDecisionSnapshot,
    exportJSON,
  } = useStrategy();
  const [generated, setGenerated] = useState(false);

  const counts = components.reduce((result, component) => {
    const decision = evaluations[component.id]?.decision;
    if (decision === DECISIONS.BUILD) result.build += 1;
    if (decision === DECISIONS.PARTNER) result.partner += 1;
    if (decision === DECISIONS.HYBRID) result.hybrid += 1;
    return result;
  }, { build: 0, partner: 0, hybrid: 0 });

  const handleGenerateReport = () => {
    saveDecisionSnapshot(`Report: ${activeScenario?.name || 'Current Strategy'}`, 'Generated from the current decision model for review.');
    setGenerated(true);
    setTimeout(() => setGenerated(false), 2500);
  };

  return <div className="max-w-5xl mx-auto space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg no-print"><div><div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-400 mb-1"><FileText className="w-3.5 h-3.5" />Board-ready decision record</div><h1 className="text-base font-bold text-white">Decision report</h1><p className="text-xs text-slate-400 mt-1">A defensible record of the current model inputs, outputs, risks, and execution implications.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={handleGenerateReport} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded"><Sparkles className="w-3.5 h-3.5" />{generated ? 'Version saved' : 'Generate report'}</button><button type="button" onClick={exportJSON} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 rounded"><Download className="w-3.5 h-3.5" />Export JSON</button><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded"><Printer className="w-3.5 h-3.5" />Print</button></div></div>

    <main className="bg-slate-950 text-slate-100 p-6 sm:p-10 border border-slate-800 rounded-lg shadow-2xl print:bg-white print:text-black print:border-0 print:shadow-none print:p-0 space-y-9">
      <header className="border-b border-slate-800 print:border-neutral-300 pb-6"><div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"><div><div className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-2">MochaTrade Infrastructure Decision Engine</div><h1 className="text-2xl font-bold tracking-tight text-white print:text-black">Infrastructure Capability Decision Report</h1><p className="text-xs text-amber-400 mt-2 print:text-neutral-600">Illustrative scenario — recommendations depend on the assumptions entered into the model.</p></div><div className="text-right text-xs font-mono text-slate-400 print:text-neutral-600"><div>{new Date().toLocaleDateString()}</div><div>{activeScenario?.name}</div><div>{activeScenario?.horizon || strategyProfile?.planningHorizon}</div></div></div></header>

      <ReportSection number="1" title="Executive Summary"><p className="text-xs leading-relaxed text-slate-300 print:text-neutral-800">The current model evaluates {components.length} infrastructure capabilities under the {activeScenario?.name || 'active'} strategy. The resulting portfolio contains {counts.build} BUILD, {counts.hybrid} HYBRID, and {counts.partner} PARTNER recommendations. These outputs are decision support for architecture, operations, product, finance, and compliance review.</p><div className="grid grid-cols-3 gap-3">{[['BUILD', counts.build, 'text-emerald-300'], ['HYBRID', counts.hybrid, 'text-amber-300'], ['PARTNER', counts.partner, 'text-sky-300']].map(([label, count, color]) => <div key={label} className="p-3 bg-slate-900 border border-slate-800 rounded print:bg-neutral-50 print:border-neutral-300"><div className={`text-[10px] font-mono ${color}`}>{label}</div><div className="text-2xl font-bold text-white print:text-black mt-1">{count}</div></div>)}</div></ReportSection>

      <ReportSection number="2" title="Strategy Context"><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"><div className="p-3 bg-slate-900/70 border border-slate-800 rounded print:bg-neutral-50 print:border-neutral-300"><div className="text-slate-500 mb-1">Objective</div><p className="text-slate-200 print:text-neutral-800">{strategyProfile?.strategyObjective || activeScenario?.profile?.strategyObjective || 'Not specified in the current model.'}</p></div><div className="p-3 bg-slate-900/70 border border-slate-800 rounded print:bg-neutral-50 print:border-neutral-300"><div className="text-slate-500 mb-1">Operating context</div><p className="text-slate-200 print:text-neutral-800">Scenario: {activeScenario?.name}. Horizon: {activeScenario?.horizon || strategyProfile?.planningHorizon || 'Not specified'}. Risk appetite: {strategyProfile?.riskAppetite || activeScenario?.profile?.riskAppetite || 'Not specified'}.</p></div></div></ReportSection>

      <ReportSection number="3" title="Criteria and Weights"><div className="overflow-x-auto"><table className="w-full text-xs border border-slate-800 print:border-neutral-300"><thead className="bg-slate-900 print:bg-neutral-100"><tr><th className="p-2 text-left">Criterion</th><th className="p-2 text-left">Direction</th><th className="p-2 text-right">Weight</th></tr></thead><tbody className="divide-y divide-slate-800 print:divide-neutral-200">{criteria.map((criterion) => <tr key={criterion.id}><td className="p-2 font-semibold">{criterion.name}</td><td className="p-2 text-slate-400 print:text-neutral-600">{criterion.directionDescription}</td><td className="p-2 text-right font-mono">{normalizedWeights[criterion.id] || 0}%</td></tr>)}</tbody></table></div></ReportSection>

      <ReportSection number="4" title="Infrastructure Scoring Matrix"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-xs border border-slate-800 print:border-neutral-300"><thead className="bg-slate-900 print:bg-neutral-100"><tr><th className="p-2 text-left">Component</th>{criteria.map((criterion) => <th key={criterion.id} className="p-2 text-center">{criterion.name}</th>)}</tr></thead><tbody className="divide-y divide-slate-800 print:divide-neutral-200">{components.map((component) => <tr key={component.id}><td className="p-2 font-semibold">{nameFor(component)}</td>{criteria.map((criterion) => <td key={criterion.id} className="p-2 text-center font-mono">{component.scores?.[criterion.id] ?? component.defaultScores?.[criterion.id] ?? '-'}</td>)}</tr>)}</tbody></table></div></ReportSection>

      <ReportSection number="5" title="Component Recommendations"><div className="overflow-x-auto"><table className="w-full text-xs border border-slate-800 print:border-neutral-300"><thead className="bg-slate-900 print:bg-neutral-100"><tr><th className="p-2 text-left">Component</th><th className="p-2 text-center">Decision</th><th className="p-2 text-right">Strategic importance</th><th className="p-2 text-right">Build</th><th className="p-2 text-right">Partner</th><th className="p-2 text-right">Decision Stability</th></tr></thead><tbody className="divide-y divide-slate-800 print:divide-neutral-200">{components.map((component) => { const evaluation = evaluations[component.id]; return <tr key={component.id}><td className="p-2 font-semibold">{nameFor(component)}</td><td className="p-2 text-center"><DecisionBadge decision={evaluation?.decision || 'HYBRID'} size="sm" /></td><td className="p-2 text-right font-mono">{evaluation?.strategicImportance}</td><td className="p-2 text-right font-mono text-emerald-400">{evaluation?.buildAttractiveness}</td><td className="p-2 text-right font-mono text-sky-400">{evaluation?.partnerAttractiveness}</td><td className="p-2 text-right font-mono">{evaluation?.confidence}%</td></tr>; })}</tbody></table></div></ReportSection>

      <ReportSection number="6" title="Decision Reasoning"><div className="space-y-3">{components.map((component) => { const reasoning = reasoningMap[component.id]; const evaluation = evaluations[component.id]; if (!reasoning || !evaluation) return null; return <div key={component.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded print:bg-neutral-50 print:border-neutral-300"><div className="flex items-center justify-between gap-3"><h3 className="text-xs font-bold">{nameFor(component)}</h3><DecisionBadge decision={evaluation.decision} size="sm" /></div><p className="text-xs text-slate-300 print:text-neutral-800 mt-2">{reasoning.decisionExplanation || reasoning.reasonsFor?.[0]}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-[11px]"><div><span className="text-emerald-400">Supports: </span><span className="text-slate-400 print:text-neutral-600">{reasoning.reasonsFor?.slice(0, 2).join(' ')}</span></div><div><span className="text-amber-400">Trade-offs: </span><span className="text-slate-400 print:text-neutral-600">{reasoning.reasonsAgainst?.slice(0, 2).join(' ')}</span></div></div></div>; })}</div></ReportSection>

      <ReportSection number="7" title="Key Risks"><ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">{components.flatMap((component) => listFor(component.risks || component.defaultRisks).map((risk) => ({ name: nameFor(component), risk }))).map((item, index) => <li key={`${item.name}-${index}`} className="p-2 bg-rose-950/20 border border-rose-900/30 rounded text-slate-300 print:bg-neutral-50 print:border-neutral-300 print:text-neutral-800"><strong>{item.name}: </strong>{item.risk}</li>)}</ul></ReportSection>

      <ReportSection number="8" title="Assumptions"><ul className="space-y-1 text-xs text-slate-300 print:text-neutral-800">{components.flatMap((component) => listFor(component.assumptions || component.defaultAssumptions).map((assumption) => <li key={`${component.id}-${assumption}`}>• {assumption}</li>))}</ul></ReportSection>

      <ReportSection number="9" title="Sensitivity Analysis"><div className="space-y-2">{components.map((component) => { const sensitivity = sensitivityMap[component.id]; const tippingPoints = sensitivity?.tippingPoints?.slice(0, 2) || []; return <div key={component.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded print:bg-neutral-50 print:border-neutral-300"><h3 className="text-xs font-semibold">{nameFor(component)}</h3>{tippingPoints.length ? <ul className="mt-1 text-[11px] text-slate-400 print:text-neutral-600">{tippingPoints.map((point) => <li key={point.criterionId || point.criterionName}>• {point.criterionName}: sensitivity rank {point.sensitivityRank || 'n/a'}</li>)}</ul> : <p className="text-[11px] text-slate-500 mt-1">No calculated tipping points in the current model.</p>}</div>; })}</div></ReportSection>

      <ReportSection number="10" title="Roadmap"><div className="space-y-2">{phasedRoadmap.map((phase) => <div key={phase.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded print:bg-neutral-50 print:border-neutral-300"><div className="flex justify-between text-xs font-bold"><span>{phase.title}: {phase.label}</span><span className="font-mono text-emerald-400">{phase.timeframe}</span></div>{phase.items.map((item) => <div key={item.componentId} className="mt-1 text-[11px] text-slate-400 print:text-neutral-600"><strong>{item.componentName} [{item.decision}]: </strong>{item.objective || item.objectives}</div>)}</div>)}{roadmapDependencies.length > 0 && <p className="text-[11px] text-slate-500">Dependency sequence: {roadmapDependencies.map((stage) => stage.label).join(' → ')}</p>}{roadmapAssumptions.length > 0 && <ul className="text-[11px] text-slate-500 print:text-neutral-600">{roadmapAssumptions.map((assumption) => <li key={assumption}>• {assumption}</li>)}</ul>}</div></ReportSection>

      <ReportSection number="11" title="Decision History">{decisionHistory.length === 0 ? <p className="text-xs text-slate-500">No saved decision versions yet.</p> : <div className="overflow-x-auto"><table className="w-full text-xs border border-slate-800 print:border-neutral-300"><thead className="bg-slate-900 print:bg-neutral-100"><tr><th className="p-2 text-left">Version</th><th className="p-2 text-left">Timestamp</th><th className="p-2 text-left">Scenario</th><th className="p-2 text-right">Recommendations</th></tr></thead><tbody className="divide-y divide-slate-800 print:divide-neutral-200">{decisionHistory.map((snapshot, index) => <tr key={snapshot.id}><td className="p-2 font-semibold">Version {snapshot.version || index + 1}</td><td className="p-2 font-mono">{new Date(snapshot.timestamp).toLocaleString()}</td><td className="p-2">{snapshot.scenarioName || snapshot.scenario?.name}</td><td className="p-2 text-right">{Object.keys(snapshot.evaluations || {}).length}</td></tr>)}</tbody></table></div>}</ReportSection>

      <ReportSection number="12" title="Final Summary"><p className="text-xs leading-relaxed text-slate-300 print:text-neutral-800">The current recommendation is {counts.build} BUILD, {counts.hybrid} HYBRID, and {counts.partner} PARTNER across the evaluated capabilities. This report preserves the model inputs and outputs needed for an ops team to review, challenge, approve, and revisit the call. It remains a planning recommendation and must be validated by the relevant engineering, compliance, finance, product, and operations teams.</p><div className="mt-3 p-3 border border-amber-500/30 bg-amber-950/20 rounded text-xs text-amber-200 print:bg-neutral-50 print:text-neutral-800 print:border-neutral-300">Illustrative scenario — recommendations depend on the assumptions entered into the model.</div></ReportSection>
    </main>
  </div>;
}