/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Initial four infrastructure components:
 * 1. Wallet (Wallet & Ledger System)
 * 2. UPI / Banking Rails
 * 3. KYC / AML (KYC / AML & Identity Verification)
 * 4. Trading Engine (Trading & Matching Engine)
 *
 * Each component contains:
 * - id
 * - name
 * - description
 * - category
 * - defaultScores (and scores alias for evaluation engines)
 * - defaultAssumptions (and assumptions alias for interactive modal editing)
 * - defaultRisks (and risks alias)
 * - architecturalScope
 * - hybridModel (externalPartnerCapability vs internalOwnedCapability partition)
 *
 * IMPORTANT NOTE:
 * All assumptions are explicitly tagged with "Illustrative scenario" or "Editable assumption".
 * They do NOT represent verified company facts.
 */
export const INITIAL_COMPONENTS = [
  {
    id: 'wallet',
    name: 'Wallet',
    displayName: 'Wallet & Ledger System',
    category: 'Core Account & Balance Management',
    description: 'Double-entry multi-currency balance ledger, reserve accounting, user transaction histories, and internal liquidity netting.',
    architecturalScope: 'Internal state machine tracking customer funds, lockouts, held balances, margin balances, and withdrawal limits.',
    defaultScores: {
      strategic_moat: 7,
      control: 8,
      differentiation: 6,
      time_to_market: 6,
      cost_efficiency: 5,
      compliance_complexity: 6,
      scalability: 8,
      engineering_complexity: 6,
    },
    scores: {
      strategic_moat: 7,
      control: 8,
      differentiation: 6,
      time_to_market: 6,
      cost_efficiency: 5,
      compliance_complexity: 6,
      scalability: 8,
      engineering_complexity: 6,
    },
    defaultAssumptions: [
      'Illustrative scenario: Proprietary ledger enables zero-latency balance checks for high-frequency order placement.',
      'Editable assumption: Regulated fiat custody can be held at partner escrow banks while internal ledger remains authoritative for trading.',
      'Editable assumption: Audit logs require immutable cryptographic hashing for regulatory financial compliance.',
    ],
    assumptions: [
      'Illustrative scenario: Proprietary ledger enables zero-latency balance checks for high-frequency order placement.',
      'Editable assumption: Regulated fiat custody can be held at partner escrow banks while internal ledger remains authoritative for trading.',
      'Editable assumption: Audit logs require immutable cryptographic hashing for regulatory financial compliance.',
    ],
    defaultRisks: [
      'Ledger race conditions during high-concurrency order cancellation and re-quote events.',
      'Reconciliation drift between internal trading balance and external partner bank settlement.',
    ],
    risks: [
      'Ledger race conditions during high-concurrency order cancellation and re-quote events.',
      'Reconciliation drift between internal trading balance and external partner bank settlement.',
    ],
    hybridModel: {
      externalPartnerCapability: 'Regulated fiat escrow accounts, bank nodal accounts, physical custody, and statutory fund protection schemes.',
      internalOwnedCapability: 'Real-time double-entry in-memory ledger, instant balance reservations, transaction sequence validation, and margin logic.',
    },
  },
  {
    id: 'banking_rails',
    name: 'UPI / Banking Rails',
    displayName: 'UPI / Banking Rails',
    category: 'Payment Ingress & Egress',
    description: 'Direct connections to central bank clearing, NPCI UPI switchboards, NEFT/RTGS/IMPS settlement pipes, and virtual accounts.',
    architecturalScope: 'Bank webhook listeners, payout automation, virtual account generation, and nodal bank reconciliation pipelines.',
    defaultScores: {
      strategic_moat: 2,
      control: 3,
      differentiation: 2,
      time_to_market: 9,
      cost_efficiency: 9,
      compliance_complexity: 9,
      scalability: 7,
      engineering_complexity: 8,
    },
    scores: {
      strategic_moat: 2,
      control: 3,
      differentiation: 2,
      time_to_market: 9,
      cost_efficiency: 9,
      compliance_complexity: 9,
      scalability: 7,
      engineering_complexity: 8,
    },
    defaultAssumptions: [
      'Illustrative scenario: Obtaining a direct sponsor bank license or direct NPCI membership requires 12-18 months and severe statutory capital.',
      'Editable assumption: Multiple payment gateway aggregators (e.g. Cashfree, Razorpay) provide redundant failover APIs out-of-the-box.',
      'Editable assumption: Payments are commoditized utility infrastructure where reliability exceeds proprietary novelty.',
    ],
    assumptions: [
      'Illustrative scenario: Obtaining a direct sponsor bank license or direct NPCI membership requires 12-18 months and severe statutory capital.',
      'Editable assumption: Multiple payment gateway aggregators (e.g. Cashfree, Razorpay) provide redundant failover APIs out-of-the-box.',
      'Editable assumption: Payments are commoditized utility infrastructure where reliability exceeds proprietary novelty.',
    ],
    defaultRisks: [
      'Aggregator downtime or bank switch latency spikes during peak market volatility.',
      'Transaction processing fee escalation if order volume scales without negotiated volume tiers.',
    ],
    risks: [
      'Aggregator downtime or bank switch latency spikes during peak market volatility.',
      'Transaction processing fee escalation if order volume scales without negotiated volume tiers.',
    ],
    hybridModel: {
      externalPartnerCapability: 'Sponsor bank clearance, UPI handles, NPCI switch access, and regulatory settlement accounts.',
      internalOwnedCapability: 'Smart routing router to switch dynamically between multiple payment gateway vendors based on live success rates.',
    },
  },
  {
    id: 'kyc_aml',
    name: 'KYC / AML',
    displayName: 'KYC / AML & Identity Verification',
    category: 'Compliance & Identity Assurance',
    description: 'User onboarding verification, government ID OCR, face match liveness, AML sanctions screening, PEP checks, and fraud scoring.',
    architecturalScope: 'Ingestion pipeline for identity documents, video KYC recording, adverse media watchlist screening, and transaction monitoring rules.',
    defaultScores: {
      strategic_moat: 4,
      control: 7,
      differentiation: 5,
      time_to_market: 8,
      cost_efficiency: 7,
      compliance_complexity: 9,
      scalability: 6,
      engineering_complexity: 7,
    },
    scores: {
      strategic_moat: 4,
      control: 7,
      differentiation: 5,
      time_to_market: 8,
      cost_efficiency: 7,
      compliance_complexity: 9,
      scalability: 6,
      engineering_complexity: 7,
    },
    defaultAssumptions: [
      'Illustrative scenario: Government databases (DigiLocker, Aadhaar, PAN) cannot be queried without licensed KYC user agencies (KUA/ASA).',
      'Editable assumption: Proprietary risk scoring & friction-free onboarding UI is a key conversion differentiator for traders.',
      'Editable assumption: Regulatory reporting requirements change quarterly, necessitating agile vendor compliance updates.',
    ],
    assumptions: [
      'Illustrative scenario: Government databases (DigiLocker, Aadhaar, PAN) cannot be queried without licensed KYC user agencies (KUA/ASA).',
      'Editable assumption: Proprietary risk scoring & friction-free onboarding UI is a key conversion differentiator for traders.',
      'Editable assumption: Regulatory reporting requirements change quarterly, necessitating agile vendor compliance updates.',
    ],
    defaultRisks: [
      'Vendor data leakage or SLA degradation during peak daytime marketing onboarding spikes.',
      'Regulatory audit fines if vendor fails statutory PEP/sanction list updates.',
    ],
    risks: [
      'Vendor data leakage or SLA degradation during peak daytime marketing onboarding spikes.',
      'Regulatory audit fines if vendor fails statutory PEP/sanction list updates.',
    ],
    hybridModel: {
      externalPartnerCapability: 'Licensed database verification hooks (DigiLocker, PAN, CKYC, sanctions lists) and optical character recognition models.',
      internalOwnedCapability: 'Custom frictionless onboarding workflow UI, proprietary fraud risk scoring, user trust tiers, and unified compliance dashboard.',
    },
  },
  {
    id: 'trading_engine',
    name: 'Trading Engine',
    displayName: 'Trading & Matching Engine',
    category: 'Core Trading Infrastructure',
    description: 'Central limit order book (CLOB), deterministic price-time priority matching, sub-millisecond execution, market data dissemination.',
    architecturalScope: 'In-memory order book, sequence sequencer, risk checks, matching algorithm, order state management, and real-time WebSocket feeds.',
    defaultScores: {
      strategic_moat: 10,
      control: 10,
      differentiation: 9,
      time_to_market: 4,
      cost_efficiency: 3,
      compliance_complexity: 6,
      scalability: 10,
      engineering_complexity: 9,
    },
    scores: {
      strategic_moat: 10,
      control: 10,
      differentiation: 9,
      time_to_market: 4,
      cost_efficiency: 3,
      compliance_complexity: 6,
      scalability: 10,
      engineering_complexity: 9,
    },
    defaultAssumptions: [
      'Illustrative scenario: Ultra-low latency matching is the fundamental valuation driver and core moat of the MochaTrade exchange.',
      'Editable assumption: Third-party SaaS white-label matching engines impose prohibitive per-trade volume taxes and lack microsecond predictability.',
      'Editable assumption: Proprietary matching allows specialized institutional order types (icebergs, trailing stops, TWAP) that competitors cannot offer.',
    ],
    assumptions: [
      'Illustrative scenario: Ultra-low latency matching is the fundamental valuation driver and core moat of the MochaTrade exchange.',
      'Editable assumption: Third-party SaaS white-label matching engines impose prohibitive per-trade volume taxes and lack microsecond predictability.',
      'Editable assumption: Proprietary matching allows specialized institutional order types (icebergs, trailing stops, TWAP) that competitors cannot offer.',
    ],
    defaultRisks: [
      'Long development timeline (6-9 months) before reaching full institutional production hardening.',
      'Critical concurrency bugs or memory corruption could lead to erroneous trade executions if not exhaustively fuzz-tested.',
    ],
    risks: [
      'Long development timeline (6-9 months) before reaching full institutional production hardening.',
      'Critical concurrency bugs or memory corruption could lead to erroneous trade executions if not exhaustively fuzz-tested.',
    ],
    hybridModel: {
      externalPartnerCapability: 'Disaster recovery cloud data centers, secondary regulatory audit reporting archival, and benchmark latency testing harness.',
      internalOwnedCapability: 'Core in-memory matching algorithm, lockless ring buffers, risk-gate check pipeline, order state manager, and FIX protocol gateway.',
    },
  },
];
