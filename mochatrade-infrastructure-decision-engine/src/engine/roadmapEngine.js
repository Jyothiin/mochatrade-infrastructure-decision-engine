/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DECISIONS } from './decisionEngine.js';

export const ROADMAP_PHASES = [
  { id: 'phase_1', title: 'Phase 1', timeframe: '0–3 Months', label: 'Foundation & Prototyping' },
  { id: 'phase_2', title: 'Phase 2', timeframe: '3–6 Months', label: 'Hardening & Sandbox Integration' },
  { id: 'phase_3', title: 'Phase 3', timeframe: '6–12 Months', label: 'Production Pilot & Scale' },
  { id: 'phase_4', title: 'Phase 4', timeframe: '12+ Months', label: 'Institutional Maturity & Moat Defense' },
];

export const DEFAULT_ROADMAP_OPTIONS = {
  includePartnerPhases: 2,
  dependencyMode: 'decision-aware',
};

/**
 * Generates an actionable phased roadmap based on evaluated component decisions.
 */
export function generatePhasedRoadmap(componentsWithEvaluations, options = {}) {
  const config = { ...DEFAULT_ROADMAP_OPTIONS, ...options };
  const phases = ROADMAP_PHASES.map((phase) => {
    const items = componentsWithEvaluations.map(({ component, evaluation }) => {
      const decision = evaluation.decision;
      const componentId = component.id;

      return buildRoadmapItem(
        phase.id,
        componentId,
        component.displayName || component.name,
        decision,
        component.hybridModel,
        config,
        componentsWithEvaluations
      );
    }).filter(Boolean);

    return {
      ...phase,
      items,
    };
  });

  const allItems = phases.flatMap((phase) => phase.items);
  return {
    phases,
    dependencyGraph: buildDependencyGraph(allItems),
    assumptions: [
      'Planning recommendation derived from the current decision model and component evaluations.',
      'Phase timing assumes required engineering, procurement, legal, and compliance capacity is available.',
      'Partner availability, API stability, and regulatory approvals must be validated by the relevant teams.',
    ],
  };
}

function buildRoadmapItem(phaseId, componentId, componentName, decision, hybridModel, config, componentsWithEvaluations) {
  // Customized plan by component and decision
  if (decision === DECISIONS.BUILD) {
    return enrichRoadmapItem(getBuildPlan(phaseId, componentId, componentName), phaseId, componentId, decision, config, componentsWithEvaluations);
  } else if (decision === DECISIONS.HYBRID) {
    return enrichRoadmapItem(getHybridPlan(phaseId, componentId, componentName, hybridModel), phaseId, componentId, decision, config, componentsWithEvaluations);
  } else {
    if (Number(config.includePartnerPhases) < Number(phaseId.replace('phase_', ''))) return null;
    return enrichRoadmapItem(getPartnerPlan(phaseId, componentId, componentName), phaseId, componentId, decision, config, componentsWithEvaluations);
  }
}

function enrichRoadmapItem(item, phaseId, componentId, decision, config, componentsWithEvaluations) {
  if (!item) return null;
  const dependencies = config.dependencyMode === 'decision-aware'
    ? [...new Set([...(item.dependencies || []), ...getDecisionDependencies(phaseId, componentId, decision, componentsWithEvaluations)])]
    : item.dependencies || [];
  return {
    ...item,
    phaseId,
    decision,
    objective: item.objective || item.objectives,
    risk: item.risk || item.risks,
    successCriteria: item.successCriteria,
    dependencies,
    track: decision === DECISIONS.HYBRID ? {
      partner: item.externalPartnerCapability,
      internal: item.internalOwnedCapability,
    } : null,
  };
}

function getDecisionDependencies(phaseId, componentId, decision, componentsWithEvaluations) {
  const phaseNumber = Number(phaseId.replace('phase_', ''));
  const dependencies = [];
  const partnerComponents = componentsWithEvaluations
    .filter(({ evaluation }) => evaluation.decision === DECISIONS.PARTNER)
    .map(({ component }) => component.displayName || component.name);
  const ownedComponents = componentsWithEvaluations
    .filter(({ component, evaluation }) => evaluation.decision !== DECISIONS.PARTNER && component.id !== componentId)
    .map(({ component }) => component.displayName || component.name);

  if (phaseNumber > 1 && partnerComponents.length > 0 && decision !== DECISIONS.PARTNER) {
    dependencies.push(`Partner integration readiness: ${partnerComponents.join(', ')}`);
  }
  if (phaseNumber > 2 && decision === DECISIONS.BUILD && ownedComponents.length > 0) {
    dependencies.push(`Owned capability interfaces: ${ownedComponents.slice(0, 2).join(', ')}`);
  }
  if (phaseNumber > 1 && decision === DECISIONS.HYBRID) {
    dependencies.push('Partner adapter and internal orchestration contract');
  }
  return dependencies;
}

function buildDependencyGraph(items) {
  const graph = [];
  const phaseOneItems = items.filter((item) => item.phaseId === 'phase_1');
  const phaseTwoItems = items.filter((item) => item.phaseId === 'phase_2');
  const phaseThreeItems = items.filter((item) => item.phaseId === 'phase_3');
  if (phaseOneItems.length > 0) graph.push({ label: 'Foundation & partner readiness', items: phaseOneItems.map((item) => item.componentName) });
  if (phaseTwoItems.length > 0) graph.push({ label: 'Integration & orchestration', items: phaseTwoItems.map((item) => item.componentName) });
  if (phaseThreeItems.length > 0) graph.push({ label: 'Core capability & production', items: phaseThreeItems.map((item) => item.componentName) });
  if (items.some((item) => item.phaseId === 'phase_4')) graph.push({ label: 'Optimization & institutional maturity', items: items.filter((item) => item.phaseId === 'phase_4').map((item) => item.componentName) });
  return graph;
}

function getBuildPlan(phaseId, componentId, componentName) {
  const map = {
    trading_engine: {
      phase_1: {
        objectives: 'Specify lockless in-memory order book architecture and core sequence matching math.',
        milestones: [
          'Design ring buffer order sequence queue with deterministic price-time priority',
          'Benchmark microsecond tick-to-trade latency in simulated stress harness',
          'Formalize FIX protocol API schema and snapshot reconciliation endpoints',
        ],
        dependencies: ['Dedicated Core Systems / C++ or Rust Engineers', 'High-speed kernel bypass test server'],
        risks: 'Memory allocation bottlenecks or race conditions under order cancellation spikes.',
        successCriteria: 'Order ingestion throughput > 50,000 orders/sec with < 500μs p99 latency in sandbox.',
      },
      phase_2: {
        objectives: 'Integrate pre-trade risk checks and real-time ledger settlement hooks.',
        milestones: [
          'Wire pre-trade margin check filter with sub-millisecond account state lookup',
          'Implement WebSocket order book broadcast gateway with differential delta streaming',
          'Deploy chaos monkey test suite for unexpected node crash recovery',
        ],
        dependencies: ['Internal Wallet / Ledger integration APIs', 'Infra multi-AZ low-jitter network'],
        risks: 'State synchronization desync between matching engine and accounting ledger.',
        successCriteria: 'Zero unsequenced trades over 100M continuous simulated test orders.',
      },
      phase_3: {
        objectives: 'Launch closed beta trading with select institutional market makers and liquidity providers.',
        milestones: [
          'Connect primary institutional market maker via collocated FIX gateway',
          'Conduct comprehensive penetration test and memory leak profiling',
          'Implement automatic circuit breaker halts during severe market volatility spikes',
        ],
        dependencies: ['Licensed regulatory audit clearance', 'Institutional liquidity contracts'],
        risks: 'Disparate order arrival jitter causing unfair matching complaints.',
        successCriteria: '99.999% uptime during 60-day live pilot with institutional market makers.',
      },
      phase_4: {
        objectives: 'Deploy advanced institutional order types (TWAP, Icebergs) and sub-100μs FPGA/Kernel bypass.',
        milestones: [
          'Roll out algorithmic order slicing and dark liquidity crossing network',
          'Implement multi-asset matching (derivatives, spot, perpetual futures)',
          'Establish cross-region disaster recovery hot-failover with zero data loss',
        ],
        dependencies: ['Institutional client volume growth', 'Tier-1 colocation data center access'],
        risks: 'Complexity overhead of multi-asset margin offsetting.',
        successCriteria: 'Market share growth and proven sustained 100k+ TPS capability.',
      },
    },
    wallet: {
      phase_1: {
        objectives: 'Architect double-entry in-memory ledger schema and stateful transaction journal.',
        milestones: [
          'Define immutable append-only ledger transaction journal with cryptographic checksums',
          'Implement zero-latency held balance reservation and release primitives',
          'Create multi-currency decimal precision math library with overflow protection',
        ],
        dependencies: ['Senior backend financial systems architect', 'Database performance testing cluster'],
        risks: 'Concurrency deadlocks when multiple orders lock user balance simultaneously.',
        successCriteria: 'Zero floating-point rounding errors and 100% balance journal integrity.',
      },
      phase_2: {
        objectives: 'Build automated bank settlement reconciliation engine and cold/hot wallet splits.',
        milestones: [
          'Build end-of-day bank statement parsing and automated variance detection engine',
          'Implement tiered withdrawal limits and multi-signature approval workflows',
          'Establish continuous real-time ledger balance integrity invariants daemon',
        ],
        dependencies: ['Banking partner webhook interfaces', 'Secure HSM / KMS key vault'],
        risks: 'Bank statement format divergence causing delayed reconciliation.',
        successCriteria: 'Daily settlement variance automated detection within < 3 minutes of statement ingestion.',
      },
      phase_3: {
        objectives: 'Deploy institutional custody isolation and sub-account multi-tenant structures.',
        milestones: [
          'Introduce omnibus client account isolation and segregated institutional vaults',
          'Obtain SOC 1 Type II audit validation for ledger operations',
          'Integrate live margin interest accrual and automated liquidation routines',
        ],
        dependencies: ['External audit team appointment', 'Legal regulatory ledger validation'],
        risks: 'Regulatory scrutiny regarding omnibus funds segregation compliance.',
        successCriteria: 'Unqualified clean SOC 1 audit report with zero reconciliatory discrepancies.',
      },
      phase_4: {
        objectives: 'Scale to multi-region distributed active-active ledger with global netting.',
        milestones: [
          'Implement distributed Raft consensus across three geographical data zones',
          'Launch cross-border multi-currency instant FX clearing and netting',
          'Provide programmatic institutional ledger reporting API for prime brokers',
        ],
        dependencies: ['Multi-region network infrastructure', 'International FX provider partnerships'],
        risks: 'Network partition latency during cross-region consensus voting.',
        successCriteria: 'Sub-50ms cross-region fund settlement with automatic partition recovery.',
      },
    },
  };

  const defaultItem = {
    phase_1: {
      objectives: `Establish architectural blueprints and core internal development for ${componentName}.`,
      milestones: ['Design core system interfaces', 'Setup automated CI/CD pipeline', 'Implement MVP core service'],
      dependencies: ['Dedicated engineering team'],
      risks: 'Underestimated domain complexity or scope creep.',
      successCriteria: 'Passing functional unit test suite with 90%+ branch coverage.',
    },
    phase_2: {
      objectives: `Integration testing and performance hardening for ${componentName}.`,
      milestones: ['Perform load testing', 'Implement audit logging', 'Connect internal service dependencies'],
      dependencies: ['Test harness environment'],
      risks: 'Performance bottlenecks under peak concurrency.',
      successCriteria: 'SLA verification in staging environment.',
    },
    phase_3: {
      objectives: `Production deployment and operational runbook execution for ${componentName}.`,
      milestones: ['Deploy to staging and canary production', 'Train ops & on-call teams', 'Execute penetration test'],
      dependencies: ['Infra security sign-off'],
      risks: 'Production deployment configuration errors.',
      successCriteria: 'Zero high-severity vulnerabilities and 99.9% uptime in pilot.',
    },
    phase_4: {
      objectives: `Advanced feature iteration and long-term moat optimization for ${componentName}.`,
      milestones: ['Implement advanced optimizations', 'Conduct yearly disaster recovery drill', 'Refactor technical debt'],
      dependencies: ['Production feedback loop'],
      risks: 'Evolving regulatory requirements requiring schema refactors.',
      successCriteria: 'Demonstrated reduction in unit operating costs and performance leadership.',
    },
  };

  const selected = map[componentId]?.[phaseId] || defaultItem[phaseId];
  return {
    componentId,
    componentName,
    decision: DECISIONS.BUILD,
    ...selected,
  };
}

function getHybridPlan(phaseId, componentId, componentName, hybridModel) {
  const external = hybridModel?.externalPartnerCapability || 'Third-party API & certified compliance infrastructure';
  const internal = hybridModel?.internalOwnedCapability || 'Proprietary user experience, routing rules, and risk orchestration';

  const map = {
    kyc_aml: {
      phase_1: {
        objectives: 'Select licensed identity verification providers while drafting internal risk scoring engine.',
        externalPartnerCapability: 'RFP and sandbox API evaluation of DigiLocker/Pan/Govt KYC vendors (e.g. HyperVerge, Karza).',
        internalOwnedCapability: 'Design bespoke high-conversion onboarding UX flow and client-side document capture SDK.',
        milestones: ['Finalize vendor SLA contracts', 'Implement custom frontend ID camera capture with client-side OCR check'],
        dependencies: ['Legal vendor procurement', 'UI/UX design team'],
        risks: 'Vendor API downtime during user onboarding onboarding campaigns.',
        successCriteria: 'Client onboarding completion rate > 85% with latency < 45 seconds.',
      },
      phase_2: {
        objectives: 'Deploy unified multi-vendor KYC routing switch with proprietary fraud risk tiering.',
        externalPartnerCapability: 'Live webhook integration with primary and fallback identity verification vendors.',
        internalOwnedCapability: 'Real-time algorithmic risk scoring (device fingerprinting, IP velocity, PEP watchlist cross-ref).',
        milestones: ['Integrate automated vendor fallback routing', 'Implement back-office compliance investigator dashboard'],
        dependencies: ['Compliance officer onboarding', 'Vendor sandbox verification'],
        risks: 'False positive flag escalation overwhelming manual compliance review queue.',
        successCriteria: 'Automated instant approval rate > 75% for low-risk retail traders.',
      },
      phase_3: {
        objectives: 'Institutional client onboarding (KYB/UBO) and ongoing AML transaction monitoring.',
        externalPartnerCapability: 'Global PEP & adverse media screening feeds (Refinitiv, Dow Jones, ComplyAdvantage).',
        internalOwnedCapability: 'Custom institutional entity structure parser and real-time transaction velocity rules.',
        milestones: ['Launch corporate KYB workflow', 'Deploy automated SAR (Suspicious Activity Report) generator'],
        dependencies: ['Institutional sales team pipeline', 'Legal AML compliance officer'],
        risks: 'Regulatory definition updates requiring dynamic AML parameter tuning.',
        successCriteria: '100% adherence to statutory filing timelines with zero missed sanctions matches.',
      },
      phase_4: {
        objectives: 'Self-improving AI fraud detection and biometric zero-knowledge credential storage.',
        externalPartnerCapability: 'Government digital locker credential tokenization services.',
        internalOwnedCapability: 'Continuous behavioural biometrics and risk-adaptive re-verification triggers.',
        milestones: ['Implement risk-based stepped auth during high-value withdrawals', 'Automate annual periodic KYC re-checks'],
        dependencies: ['Historical fraud analytics dataset'],
        risks: 'User friction during stepped verification.',
        successCriteria: 'Fraud loss rate reduced to < 0.005% of gross platform volume.',
      },
    },
    wallet: {
      phase_1: {
        objectives: 'Form escrow partnership with tier-1 nodal bank while developing internal core ledger.',
        externalPartnerCapability: 'Regulated partner bank nodal/escrow account opening and API sandbox access.',
        internalOwnedCapability: 'Double-entry in-memory balance ledger and microsecond reservation locks.',
        milestones: ['Nodal bank legal agreement signed', 'Core ledger data models implemented'],
        dependencies: ['Bank partnership director', 'Distributed database cluster'],
        risks: 'Protracted bank legal negotiations.',
        successCriteria: 'End-to-end sandbox deposit reflection in internal ledger within < 2 seconds.',
      },
      phase_2: {
        objectives: 'Launch automated bank-to-ledger continuous reconciliation daemon.',
        externalPartnerCapability: 'Automated bank end-of-day MT940 / CAMT.053 statement SFTP transmission.',
        internalOwnedCapability: 'Variance matching algorithm with automated alerting and balance freezing flags.',
        milestones: ['Deploy automated statement parser', 'Build multi-sig cold storage transfer portal'],
        dependencies: ['Bank SFTP endpoints live'],
        risks: 'Bank unannounced schema updates on statement feeds.',
        successCriteria: 'Reconciliation turnaround under 5 minutes with zero unexplained variances.',
      },
      phase_3: {
        objectives: 'Integrate multi-bank escrow redundancy to prevent single point of bank failure.',
        externalPartnerCapability: 'Secondary sponsor bank nodal account and clearance pipeline.',
        internalOwnedCapability: 'Dynamic liquidity rebalancing bot between primary and secondary partner banks.',
        milestones: ['Contract secondary sponsor bank', 'Automate bank-to-bank treasury transfer orders'],
        dependencies: ['Treasury capital buffer'],
        risks: 'Inter-bank settlement delays during market closure hours.',
        successCriteria: 'Zero platform downtime even during complete single-bank outage.',
      },
      phase_4: {
        objectives: 'Institutional segregated sub-accounts and automated regulatory audit attestation.',
        externalPartnerCapability: 'Statutory custody trustee partner verification.',
        internalOwnedCapability: 'Real-time cryptographic proof-of-reserves public attestation dashboard.',
        milestones: ['Deploy Merkle-tree proof of solvency', 'Open API for external auditor inspection'],
        dependencies: ['Independent accounting firm'],
        risks: 'Auditor verification methodological discrepancies.',
        successCriteria: 'Monthly verified cryptographic proof-of-reserves published publicly.',
      },
    },
  };

  const defaultHybrid = {
    phase_1: {
      objectives: `Establish hybrid architecture for ${componentName}: procure partner APIs and scaffold internal orchestration.`,
      externalPartnerCapability: external,
      internalOwnedCapability: internal,
      milestones: ['Evaluate commercial vendors', 'Build internal routing adapter'],
      dependencies: ['Vendor procurement and API credentials'],
      risks: 'Vendor API rate limits and integration friction.',
      successCriteria: 'Successful end-to-end integration test in sandbox environment.',
    },
    phase_2: {
      objectives: `Deploy production failover and custom internal risk rules for ${componentName}.`,
      externalPartnerCapability: 'Vendor SLA monitoring and live transaction processing.',
      internalOwnedCapability: 'Custom business logic, validation rules, and caching layer.',
      milestones: ['Implement fallback vendor connection', 'Deploy operational telemetry'],
      dependencies: ['Secondary vendor backup'],
      risks: 'Data format discrepancies between vendors.',
      successCriteria: 'Seamless failover with zero transactional loss.',
    },
    phase_3: {
      objectives: `Optimize hybrid economics and expand proprietary feature layer for ${componentName}.`,
      externalPartnerCapability: 'Negotiated high-volume tiered pricing with vendors.',
      internalOwnedCapability: 'Proprietary user segmentation and intelligent routing optimizations.',
      milestones: ['Volume pricing threshold activation', 'Advanced analytics integration'],
      dependencies: ['Volume milestones reached'],
      risks: 'Contract minimums if projected volume fluctuates.',
      successCriteria: '20%+ reduction in blended third-party cost per transaction.',
    },
    phase_4: {
      objectives: `Institutional audit certification and automated partner governance for ${componentName}.`,
      externalPartnerCapability: 'Vendor annual security audit compliance reports.',
      internalOwnedCapability: 'Complete automated vendor health scoring and SLA enforcement daemon.',
      milestones: ['Automated penalty deduction on vendor SLA breach', 'Executive audit sign-off'],
      dependencies: ['Vendor contractual penalty clauses'],
      risks: 'Vendor relationship friction during penalty claims.',
      successCriteria: 'Uninterrupted 99.99% blended availability.',
    },
  };

  const selected = map[componentId]?.[phaseId] || defaultHybrid[phaseId];
  return {
    componentId,
    componentName,
    decision: DECISIONS.HYBRID,
    externalPartnerCapability: selected.externalPartnerCapability || external,
    internalOwnedCapability: selected.internalOwnedCapability || internal,
    objectives: selected.objectives,
    milestones: selected.milestones,
    dependencies: selected.dependencies,
    risks: selected.risks,
    successCriteria: selected.successCriteria,
  };
}

function getPartnerPlan(phaseId, componentId, componentName) {
  const map = {
    banking_rails: {
      phase_1: {
        objectives: 'Conduct RFP across top banking aggregators (Razorpay, Cashfree, PayU) and integrate sandboxes.',
        milestones: [
          'Benchmark UPI intent vs collect flow conversion rates in staging',
          'Implement secure webhook receiver with HMAC signature verification and idempotency keys',
          'Deploy virtual account dynamic generation service for instant trader bank deposits',
        ],
        dependencies: ['Aggregator sandbox API keys', 'Corporate banking resolution'],
        risks: 'Aggregator API downtime or webhook delivery delays during peak trading hours.',
        successCriteria: 'Sandbox end-to-end deposit simulation turnaround time < 5 seconds.',
      },
      phase_2: {
        objectives: 'Launch live payment ingress with multi-gateway failover router.',
        milestones: [
          'Integrate secondary payment gateway for instant automatic failover if primary aggregator failure rate > 3%',
          'Implement auto-refund workflow for stuck pending bank transactions',
          'Deploy automated payout API for instant trader withdrawal approvals',
        ],
        dependencies: ['Escrow fund float deposit with sponsor banks'],
        risks: 'Bank holiday processing delays for legacy NEFT/RTGS settlement.',
        successCriteria: 'UPI deposit success rate >= 93% across all supported consumer banking apps.',
      },
      phase_3: {
        objectives: 'Direct sponsor bank host-to-host (H2H) pipe integration to eliminate intermediary fees.',
        milestones: [
          'Initiate direct bank leased line connectivity for high-volume settlements',
          'Negotiate volume discount pricing (< 0.1% processing fee tier)',
          'Implement real-time corporate treasury cash management dashboard',
        ],
        dependencies: ['Reaching $10M+ monthly platform processing volume', 'Sponsor bank risk committee approval'],
        risks: 'Rigid enterprise banking integration schedules.',
        successCriteria: '40% reduction in blended payment gateway processing fees.',
      },
      phase_4: {
        objectives: 'Central bank direct settlement membership and cross-border instant remittance.',
        milestones: [
          'Evaluate feasibility of direct clearing house / central bank connection',
          'Integrate instant cross-border stablecoin / foreign exchange banking corridors',
          'Automated AI routing maximizing transaction margin and bank liquidity uptime',
        ],
        dependencies: ['Regulatory institutional remittance license'],
        risks: 'International capital control regulatory shifts.',
        successCriteria: 'Continuous 99.99% payment infrastructure availability.',
      },
    },
  };

  const defaultPartner = {
    phase_1: {
      objectives: `Vendor RFP, SLA due diligence, and sandbox integration for ${componentName}.`,
      milestones: ['Evaluate top 3 market vendors', 'Review security certifications (SOC 2, ISO 27001)', 'Complete API sandbox proof-of-concept'],
      dependencies: ['Vendor credentials and API contracts'],
      risks: 'Vendor lock-in or proprietary data formats.',
      successCriteria: 'Vendor selection approved by CTO and CFO.',
    },
    phase_2: {
      objectives: `Live production pilot and fallback operational runbooks for ${componentName}.`,
      milestones: ['Deploy production webhook listeners', 'Implement automated circuit breaker for outages', 'Establish vendor escalation Slack channel'],
      dependencies: ['Production API credentials'],
      risks: 'Vendor rate limiting or unexpected error codes.',
      successCriteria: 'Live production transactions executing with 99.9% vendor uptime.',
    },
    phase_3: {
      objectives: `Volume fee renegotiation and secondary backup vendor setup for ${componentName}.`,
      milestones: ['Analyze monthly API call volume and renegotiate unit costs', 'Benchmark secondary vendor in warm standby'],
      dependencies: ['Transaction volume scale'],
      risks: 'Vendor contract minimums.',
      successCriteria: '15%+ reduction in third-party service fees.',
    },
    phase_4: {
      objectives: `Long-term vendor governance and SLA audit reconciliation for ${componentName}.`,
      milestones: ['Automate vendor SLA credit claims', 'Annual security reassessment drill'],
      dependencies: ['Legal contract terms'],
      risks: 'Vendor acquisition or strategic pivot by vendor.',
      successCriteria: 'Zero business disruption and guaranteed SLA enforcement.',
    },
  };

  const selected = map[componentId]?.[phaseId] || defaultPartner[phaseId];
  return {
    componentId,
    componentName,
    decision: DECISIONS.PARTNER,
    ...selected,
  };
}
