/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StrategyProvider } from './context/StrategyContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';

import { DashboardPage } from './pages/DashboardPage.jsx';
import { StrategyPage } from './pages/StrategyPage.jsx';
import { ScoringPage } from './pages/ScoringPage.jsx';
import { DecisionsPage } from './pages/DecisionsPage.jsx';
import { ScenariosPage } from './pages/ScenariosPage.jsx';
import { SensitivityPage } from './pages/SensitivityPage.jsx';
import { RoadmapPage } from './pages/RoadmapPage.jsx';
import { HistoryPage } from './pages/HistoryPage.jsx';
import { ReportPage } from './pages/ReportPage.jsx';

export default function App() {
  return (
    <StrategyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="strategy" element={<StrategyPage />} />
            <Route path="strategy/criteria" element={<StrategyPage defaultTab="criteria" />} />
            <Route path="scoring" element={<ScoringPage />} />
            <Route path="decisions" element={<DecisionsPage />} />
                        <Route path="scenarios" element={<ScenariosPage />} />
            <Route path="decisions/:component/sensitivity" element={<SensitivityPage />} />
            <Route path="decisions/sensitivity" element={<Navigate to="/decisions/wallet/sensitivity" replace />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StrategyProvider>
  );
}
