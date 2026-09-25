/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ROUTES = {
  HOME: '/',
  STRATEGY: '/strategy',
  CRITERIA: '/strategy/criteria',
  SCORING: '/scoring',
  DECISIONS: '/decisions',
  SCENARIOS: '/scenarios',
  SENSITIVITY: '/decisions/:component/sensitivity',
  getSensitivityRoute: (id) => `/decisions/${id || 'wallet'}/sensitivity`,
  ROADMAP: '/roadmap',
  HISTORY: '/history',
  REPORT: '/report',
};

export const NAVIGATION_ITEMS = [
  { path: ROUTES.HOME, label: 'Dashboard', icon: 'LayoutDashboard', description: 'Overview & strategic portfolio metrics' },
  { path: ROUTES.STRATEGY, label: 'Strategy & Weights', icon: 'Sliders', description: 'Evaluation criteria & directional weights' },
  { path: ROUTES.SCORING, label: 'Scoring Matrix', icon: 'Table', description: 'Component scores & parameter adjustments' },
  { path: ROUTES.DECISIONS, label: 'Decision Ledger', icon: 'ShieldCheck', description: 'Build vs Partner vs Hybrid recommendations' },
    { path: ROUTES.SCENARIOS, label: 'Scenario Comparison', icon: 'GitCompareArrows', description: 'Compare independent strategic postures' },
  { path: ROUTES.ROADMAP, label: 'Roadmap', icon: 'Milestone', description: 'Phased implementation & capability partition' },
  { path: ROUTES.HISTORY, label: 'Version History', icon: 'History', description: 'Audit trail & scenario snapshot comparisons' },
  { path: ROUTES.REPORT, label: 'Decision Report', icon: 'FileText', description: 'Executive brief & printable board memo' },
];
