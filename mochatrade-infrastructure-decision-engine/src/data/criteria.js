/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Directional impact on architecture choice:
 * - FAVORS_BUILD: High score increases build attractiveness and strategic importance
 * - FAVORS_PARTNER: High score increases partner attractiveness and lowers build urgency
 * - FAVORS_PARTNER_OR_HYBRID: High score favors commercial vendor offloading or partitioned hybrid capability
 */
export const CRITERIA_DIRECTIONS = {
  FAVORS_BUILD: 'FAVORS_BUILD',
  FAVORS_PARTNER: 'FAVORS_PARTNER',
  FAVORS_PARTNER_OR_HYBRID: 'FAVORS_PARTNER_OR_HYBRID',
};

export const CRITERIA_CATEGORIES = {
  STRATEGIC: 'Strategic Advantage',
  EXECUTION: 'Execution & Speed',
  FINANCIAL: 'Cost & Economics',
  RISK: 'Risk & Governance',
  TECHNICAL: 'Technical Scale',
};

/**
 * Eight strategic evaluation criteria defined with:
 * - id: unique identifier used in scoring maps
 * - name: formal evaluation title
 * - description: strategic definition
 * - defaultWeight: baseline weight percentage (sums to 100 across defaults)
 * - weight: alias for backward-compatible consumption
 * - category: grouping domain
 * - direction: architectural bias
 * - directionDescription: human-readable directional indicator
 * - scoreMeaning: 1-10 semantic scale description
 * - guidance: detailed operational guidance for scoring
 */
export const DEFAULT_CRITERIA = [
  {
    id: 'strategic_moat',
    name: 'Strategic Moat',
    description: 'Degree to which proprietary ownership creates long-term competitive defense, client retention, or enterprise valuation upside.',
    defaultWeight: 18,
    weight: 18,
    category: CRITERIA_CATEGORIES.STRATEGIC,
    direction: CRITERIA_DIRECTIONS.FAVORS_BUILD,
    directionDescription: 'High score strongly favors BUILD',
    scoreMeaning: '1 = Commodity plumbing easily bought; 5 = Moderate IP retention; 10 = Fundamental core defensibility and irreplaceable IP.',
    guidance: '1-3: Commodity capability easily bought; 4-7: Moderate retention value; 8-10: Fundamental core defensibility and unique IP.',
    enabled: true,
    isCustom: false,
  },
  {
    id: 'control',
    name: 'Control',
    description: 'Need for custom uptime SLAs, roadmap independence, tailored incident response, and unconstrained feature iterations.',
    defaultWeight: 15,
    weight: 15,
    category: CRITERIA_CATEGORIES.STRATEGIC,
    direction: CRITERIA_DIRECTIONS.FAVORS_BUILD,
    directionDescription: 'High score strongly favors BUILD',
    scoreMeaning: '1 = Standard third-party SLA is adequate; 5 = Need priority ticketing and custom webhooks; 10 = Zero external dependency, 100% telemetry control.',
    guidance: '1-3: Standard third-party SLA is adequate; 4-7: Custom webhook & priority support required; 8-10: Bespoke latency and 100% telemetry control required.',
    enabled: true,
    isCustom: false,
  },
  {
    id: 'differentiation',
    name: 'Differentiation',
    description: 'Visibility and perceived distinction of this capability in the eyes of end-traders, institutional clients, or partners.',
    defaultWeight: 14,
    weight: 14,
    category: CRITERIA_CATEGORIES.STRATEGIC,
    direction: CRITERIA_DIRECTIONS.FAVORS_BUILD,
    directionDescription: 'High score favors BUILD',
    scoreMeaning: '1 = Completely invisible utility; 5 = User-perceived workflow feature; 10 = Front-and-center unique selling proposition.',
    guidance: '1-3: Invisible utility plumbing; 4-7: User-perceived performance feature; 8-10: Front-and-center unique selling proposition.',
    enabled: true,
    isCustom: false,
  },
  {
    id: 'time_to_market',
    name: 'Time to Market',
    description: 'Urgency of delivering this capability to market to capture trading volume, market share, or critical launch windows.',
    defaultWeight: 13,
    weight: 13,
    category: CRITERIA_CATEGORIES.EXECUTION,
    direction: CRITERIA_DIRECTIONS.FAVORS_PARTNER,
    directionDescription: 'High score favors PARTNER',
    scoreMeaning: '1 = Multi-quarter R&D timeline acceptable; 5 = Moderate launch urgency (3-6m); 10 = Must have live transactions in weeks.',
    guidance: '1-3: Multi-quarter R&D timeline acceptable; 4-7: 3 to 6-month launch target; 8-10: Need live transactional capability in weeks.',
    enabled: true,
    isCustom: false,
  },
  {
    id: 'cost_efficiency',
    name: 'Cost Efficiency',
    description: 'Preference for variable utility-based SaaS pricing over heavy fixed engineering capital expenditure and ongoing maintenance teams.',
    defaultWeight: 10,
    weight: 10,
    category: CRITERIA_CATEGORIES.FINANCIAL,
    direction: CRITERIA_DIRECTIONS.FAVORS_PARTNER,
    directionDescription: 'High score favors PARTNER',
    scoreMeaning: '1 = High willingness to invest large engineering capex; 5 = Balanced capex/opex posture; 10 = Must minimize fixed costs via pay-as-you-go partner rails.',
    guidance: '1-3: High willingness to invest large engineering capex; 4-7: Balanced capex/opex posture; 8-10: Must preserve capital via pay-as-you-go partner rails.',
    enabled: true,
    isCustom: false,
  },
  {
    id: 'compliance_complexity',
    name: 'Compliance / Regulatory Complexity',
    description: 'Severity of regulatory licenses, audit scrutiny, statutory reporting, and liability mandates (e.g. RBI/SEBI/FINRA/AML).',
    defaultWeight: 10,
    weight: 10,
    category: CRITERIA_CATEGORIES.RISK,
    direction: CRITERIA_DIRECTIONS.FAVORS_PARTNER_OR_HYBRID,
    directionDescription: 'High score favors PARTNER or HYBRID',
    scoreMeaning: '1 = Minimal regulatory friction; 5 = Standard data compliance; 10 = Heavy institutional licensing, capital reserves, and criminal liability exposure.',
    guidance: '1-3: Minimal regulatory friction; 4-7: Standard data compliance and reporting; 8-10: Heavy institutional licensing and ongoing liability scrutiny.',
    enabled: true,
    isCustom: false,
  },
  {
    id: 'scalability',
    name: 'Scalability',
    description: 'Requirement to handle massive concurrent order bursts, sub-millisecond execution, and high transactional throughput without third-party rate limits.',
    defaultWeight: 10,
    weight: 10,
    category: CRITERIA_CATEGORIES.TECHNICAL,
    direction: CRITERIA_DIRECTIONS.FAVORS_BUILD,
    directionDescription: 'High score favors BUILD',
    scoreMeaning: '1 = Standard API rate limits (~100 req/sec) sufficient; 5 = 1k-5k TPS peak bursts; 10 = 100k+ TPS, ultra-low latency, custom memory architecture.',
    guidance: '1-3: Standard API rate limits (~100 req/sec) sufficient; 4-7: 1k-5k TPS peak bursts; 8-10: 100k+ TPS, ultra-low latency, custom memory architecture.',
    enabled: true,
    isCustom: false,
  },
  {
    id: 'engineering_complexity',
    name: 'Engineering Complexity',
    description: 'Rarity of specialized engineering talent, distributed consensus problems, 24/7 on-call duty, and maintenance overhead.',
    defaultWeight: 10,
    weight: 10,
    category: CRITERIA_CATEGORIES.EXECUTION,
    direction: CRITERIA_DIRECTIONS.FAVORS_PARTNER_OR_HYBRID,
    directionDescription: 'High score favors PARTNER or HYBRID',
    scoreMeaning: '1 = Standard CRUD/REST patterns; 5 = Moderate distributed system with standard queues; 10 = Rare kernel/FPGA/crypto systems engineering with continuous patching.',
    guidance: '1-3: Standard CRUD/REST patterns; 4-7: Distributed database & queue coordination; 8-10: Rare kernel/FPGA/crypto systems engineering with continuous patching.',
    enabled: true,
    isCustom: false,
  },
];
