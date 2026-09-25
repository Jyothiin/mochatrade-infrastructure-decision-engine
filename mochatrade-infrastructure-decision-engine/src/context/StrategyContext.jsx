/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { DEFAULT_CRITERIA } from '../data/criteria.js';
import { INITIAL_COMPONENTS } from '../data/components.js';
import { PRESET_SCENARIOS, DEFAULT_STRATEGY_PROFILE } from '../data/scenarios.js';
import { normalizeWeights, calculateWeightedScore, calculateComponentScores } from '../engine/scoringEngine.js';
import { evaluateDecision, calculateAllComponents, calculateComponentAnalysis, DECISIONS, THRESHOLDS } from '../engine/decisionEngine.js';
import { generateDecisionReasoning } from '../engine/reasoningEngine.js';
import { generatePhasedRoadmap } from '../engine/roadmapEngine.js';
import { analyzeTippingPoints } from '../engine/sensitivityEngine.js';

const LOCAL_STORAGE_KEY = 'mochatrade_infra_engine_state_v2';
const HISTORY_STORAGE_KEY = 'mochatrade_infra_engine_history_v2';

const StrategyContext = createContext(null);

export function StrategyProvider({ children }) {
  // 1. Initial baseline setup
  const defaultScenario = PRESET_SCENARIOS[0];

  const [activeScenario, setActiveScenario] = useState(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_scenario`);
      return saved ? JSON.parse(saved) : defaultScenario;
    } catch {
      return defaultScenario;
    }
  });

  const [criteria, setCriteria] = useState(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_criteria`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c) => ({
            ...c,
            enabled: c.enabled !== false,
            isCustom: Boolean(c.isCustom),
          }));
        }
      }
      return DEFAULT_CRITERIA;
    } catch {
      return DEFAULT_CRITERIA;
    }
  });

  const [weights, setWeights] = useState(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_weights`);
      return saved ? JSON.parse(saved) : defaultScenario.weights;
    } catch {
      return defaultScenario.weights;
    }
  });

  const [components, setComponents] = useState(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_components`);
      return saved ? JSON.parse(saved) : INITIAL_COMPONENTS;
    } catch {
      return INITIAL_COMPONENTS;
    }
  });

  const [strategyProfile, setStrategyProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile`);
      return saved ? JSON.parse(saved) : DEFAULT_STRATEGY_PROFILE;
    } catch {
      return DEFAULT_STRATEGY_PROFILE;
    }
  });

  const [decisionHistory, setDecisionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedComponentId, setSelectedComponentId] = useState('trading_engine');
  const [lastUpdated, setLastUpdated] = useState(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_last_updated`);
      return saved || new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_scenario`, JSON.stringify(activeScenario));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_criteria`, JSON.stringify(criteria));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_weights`, JSON.stringify(weights));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_components`, JSON.stringify(components));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(strategyProfile));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_last_updated`, lastUpdated);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [activeScenario, criteria, weights, components, strategyProfile, lastUpdated]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(decisionHistory));
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }
  }, [decisionHistory]);

  // Derived Normalized Weights (only active/enabled criteria contribute weight)
  const normalizedWeights = useMemo(() => {
    const activeWeights = {};
    criteria.forEach((c) => {
      const isEnabled = c.enabled !== false;
      activeWeights[c.id] = isEnabled ? Math.max(0, Number(weights[c.id]) || 0) : 0;
    });
    return normalizeWeights(activeWeights);
  }, [criteria, weights]);

  // Derived Evaluations for all components
  const evaluations = useMemo(() => {
    return calculateAllComponents(components, criteria, normalizedWeights);
  }, [components, criteria, normalizedWeights]);

  // Derived Reasoning for all components
  const reasoningMap = useMemo(() => {
    const results = {};
    components.forEach((comp) => {
      const evalResult = evaluations[comp.id];
      if (evalResult) {
        results[comp.id] = generateDecisionReasoning(comp, evalResult, criteria);
      }
    });
    return results;
  }, [components, evaluations, criteria]);

  // Derived Phased Roadmap
  const roadmapModel = useMemo(() => {
    const componentsWithEvaluations = components.map((comp) => ({
      component: comp,
      evaluation: evaluations[comp.id],
    })).filter((item) => !!item.evaluation);
    return generatePhasedRoadmap(componentsWithEvaluations);
  }, [components, evaluations]);
  const phasedRoadmap = roadmapModel.phases;

  // Derived Tipping Points / Sensitivity
  const sensitivityMap = useMemo(() => {
    const results = {};
    components.forEach((comp) => {
      results[comp.id] = analyzeTippingPoints(comp, criteria, normalizedWeights);
    });
    return results;
  }, [components, criteria, normalizedWeights]);

  // Handler: Update specific weight
  const updateWeight = (criterionId, newWeight) => {
    setWeights((prev) => ({
      ...prev,
      [criterionId]: Math.max(0, Math.min(100, Number(newWeight) || 0)),
    }));
  };

  // Handler: Auto-normalize weights so sum is exactly 100 among active/enabled criteria
  const triggerNormalizeWeights = () => {
    const activeWeights = {};
    criteria.forEach((c) => {
      if (c.enabled !== false) {
        activeWeights[c.id] = Math.max(0, Number(weights[c.id]) || 0);
      }
    });
    const normalizedActive = normalizeWeights(activeWeights);
    setWeights((prev) => {
      const nextWeights = { ...prev };
      criteria.forEach((c) => {
        if (c.enabled !== false) {
          nextWeights[c.id] = normalizedActive[c.id] ?? 0;
        }
      });
      return nextWeights;
    });
  };

  // Handler: Update component score
  const updateScore = (componentId, criterionId, rawScore) => {
    const val = Math.max(1, Math.min(10, Math.round(Number(rawScore) || 1)));
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === componentId) {
          return {
            ...c,
            scores: {
              ...(c.scores || {}),
              [criterionId]: val,
            },
          };
        }
        return c;
      })
    );
    setLastUpdated(new Date().toISOString());
  };

  // Handler: Reset demo scores specifically back to INITIAL_COMPONENTS defaults
  const resetDemoScores = () => {
    setComponents((prev) =>
      prev.map((c) => {
        const initial = INITIAL_COMPONENTS.find((item) => item.id === c.id);
        if (initial) {
          return {
            ...c,
            scores: { ...(initial.defaultScores || initial.scores) },
          };
        }
        return c;
      })
    );
    setLastUpdated(new Date().toISOString());
  };

  // Handler: Add new infrastructure component
  const addComponent = (newComp) => {
    const id = newComp.id || `component_${Date.now()}`;
    const initialScores = {};
    criteria.forEach((crit) => {
      initialScores[crit.id] = 5;
    });

    const defaultScoresObj = { ...initialScores, ...(newComp.defaultScores || newComp.scores || {}) };
    const defaultAssumptionsList = newComp.defaultAssumptions?.length
      ? newComp.defaultAssumptions
      : newComp.assumptions?.length
      ? newComp.assumptions
      : [
          'Illustrative scenario: Evaluated against current architecture standards.',
          'Editable assumption: Standard API availability applies.',
        ];
    const defaultRisksList = newComp.defaultRisks?.length
      ? newComp.defaultRisks
      : newComp.risks?.length
      ? newComp.risks
      : [
          'Operational dependency and engineering integration complexity.',
        ];

    const fullComponent = {
      id,
      name: newComp.name || 'New Infrastructure Component',
      displayName: newComp.displayName || newComp.name || 'New Infrastructure Component',
      category: newComp.category || 'General Infrastructure',
      description: newComp.description || 'Custom financial infrastructure capability',
      architecturalScope: newComp.architecturalScope || 'Owned service layer or third-party vendor bridge.',
      defaultScores: defaultScoresObj,
      scores: defaultScoresObj,
      defaultAssumptions: defaultAssumptionsList,
      assumptions: defaultAssumptionsList,
      defaultRisks: defaultRisksList,
      risks: defaultRisksList,
      hybridModel: newComp.hybridModel || {
        externalPartnerCapability: 'Commercial vendor API and managed infrastructure.',
        internalOwnedCapability: 'Proprietary business logic and client interaction tier.',
      },
    };

    setComponents((prev) => [...prev, fullComponent]);
    setSelectedComponentId(id);
  };

  // Handler: Update component
  const updateComponent = (componentId, updates) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, ...updates } : c))
    );
  };

  // Handler: Remove component
  const deleteComponent = (componentId) => {
    setComponents((prev) => prev.filter((c) => c.id !== componentId));
    if (selectedComponentId === componentId) {
      const remaining = components.filter((c) => c.id !== componentId);
      if (remaining.length > 0) {
        setSelectedComponentId(remaining[0].id);
      }
    }
  };

  // Handler: Add new criterion
  const addCriterion = (newCrit) => {
    const id = newCrit.id || `crit_${Date.now()}`;
    const initialWeight = Math.max(0, Math.min(100, Number(newCrit.defaultWeight ?? newCrit.weight ?? 10)));
    const fullCrit = {
      id,
      name: newCrit.name || 'New Strategic Criterion',
      description: newCrit.description || 'Custom evaluation metric.',
      defaultWeight: initialWeight,
      weight: initialWeight,
      category: newCrit.category || 'Strategic Advantage',
      direction: newCrit.direction || 'FAVORS_BUILD',
      directionDescription:
        newCrit.directionDescription ||
        (newCrit.direction === 'FAVORS_BUILD'
          ? 'High score favors BUILD'
          : newCrit.direction === 'FAVORS_PARTNER'
          ? 'High score favors PARTNER'
          : 'High score favors HYBRID / PARTNER'),
      scoreMeaning: newCrit.scoreMeaning || '1 = Minimal impact; 5 = Moderate factor; 10 = Critical deciding factor.',
      guidance: newCrit.guidance || '1-3: Low impact; 4-7: Moderate factor; 8-10: Critical deciding factor.',
      enabled: true,
      isCustom: true,
    };

    setCriteria((prev) => [...prev, fullCrit]);
    setWeights((prev) => ({ ...prev, [id]: initialWeight }));
    return fullCrit;
  };

  // Handler: Toggle criterion active / enabled state
  const toggleCriterion = (criterionId, explicitVal) => {
    setCriteria((prev) =>
      prev.map((c) => {
        if (c.id === criterionId) {
          const nextVal = explicitVal !== undefined ? explicitVal : !c.enabled;
          return { ...c, enabled: nextVal };
        }
        return c;
      })
    );
  };

  // Handler: Update criterion metadata
  const updateCriterion = (criterionId, updates) => {
    setCriteria((prev) =>
      prev.map((c) => {
        if (c.id === criterionId) {
          return { ...c, ...updates };
        }
        return c;
      })
    );
    if (updates.weight !== undefined) {
      updateWeight(criterionId, updates.weight);
    }
  };

  // Handler: Delete criterion
  const deleteCriterion = (criterionId) => {
    setCriteria((prev) => prev.filter((c) => c.id !== criterionId));
    setWeights((prev) => {
      const copy = { ...prev };
      delete copy[criterionId];
      return copy;
    });
  };

  // Handler: Reset criteria and weights specifically to default standard
  const resetCriteriaDefaults = () => {
    setCriteria(DEFAULT_CRITERIA);
    setWeights(defaultScenario.weights);
    setActiveScenario(defaultScenario);
  };

  // Handler: Update strategy profile fields
  const updateStrategyProfile = (updates) => {
    setStrategyProfile((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Handler: Update high-level strategic priority and linked criterion weight
  const updateStrategicPriority = (priorityKey, value) => {
    const val = Math.max(1, Math.min(10, Number(value) || 1));
    
    // Update profile state
    setStrategyProfile((prev) => ({
      ...prev,
      [priorityKey]: val,
    }));

    // Map priority setting directly to corresponding criterion weight
    const priorityToCriterionMap = {
      strategicMoatPriority: 'strategic_moat',
      controlPriority: 'control',
      marketSpeedPriority: 'time_to_market',
      costSensitivity: 'cost_efficiency',
      complianceSensitivity: 'compliance_complexity',
    };

    const targetCriterionId = priorityToCriterionMap[priorityKey];
    if (targetCriterionId) {
      // Map 1-10 priority scale to 5-30% weight range
      const calculatedWeight = Math.round(5 + ((val - 1) / 9) * 25);
      setWeights((prev) => ({
        ...prev,
        [targetCriterionId]: calculatedWeight,
      }));
    }

    // Flag active scenario as Custom
    setActiveScenario((prev) => {
      if (prev.id === 'custom') return prev;
      return {
        id: 'custom',
        name: 'Custom Configuration',
        shortName: 'Custom',
        label: 'Custom strategy parameters',
        badge: 'Custom user configuration',
        isCustom: true,
        isIllustrative: true,
      };
    });
  };

  // Handler: Load Preset Scenario
  const loadScenario = (scenarioId) => {
    if (scenarioId === 'custom') {
      setActiveScenario({
        id: 'custom',
        name: 'Custom Configuration',
        shortName: 'Custom',
        label: 'Custom strategy parameters',
        badge: 'Custom user configuration',
        isCustom: true,
        isIllustrative: true,
      });
      return;
    }

    const found = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (found) {
      setActiveScenario(found);
      setWeights(found.weights);
      if (found.profile) {
        setStrategyProfile((prev) => ({
          ...prev,
          ...found.profile,
          companyName: prev.companyName || found.profile.companyName || DEFAULT_STRATEGY_PROFILE.companyName,
        }));
      }
    }
  };

  // Handler: Save Snapshot to History
  const saveDecisionSnapshot = (name, notes = '') => {
    const timestamp = new Date().toISOString();
    const version = decisionHistory.length + 1;
    const snapshot = {
      id: `snapshot_${Date.now()}`,
      version,
      name: name || `${activeScenario.name} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      timestamp,
      notes,
      scenario: activeScenario,
      scenarioName: activeScenario.name,
      criteria,
      criteriaWeights: normalizedWeights,
      weights: normalizedWeights,
      components,
      evaluations,
    };

    setDecisionHistory((prev) => [snapshot, ...prev]);
    return snapshot;
  };

  // Handler: Restore snapshot
  const restoreSnapshot = (snapshotId) => {
    const snapshot = decisionHistory.find((s) => s.id === snapshotId);
    if (snapshot) {
      setActiveScenario(snapshot.scenario);
      setCriteria(snapshot.criteria);
      setWeights(snapshot.weights);
      setComponents(snapshot.components);
    }
  };

  // Handler: Delete snapshot
  const deleteDecisionSnapshot = (snapshotId) => {
    setDecisionHistory((prev) => prev.filter((s) => s.id !== snapshotId));
  };

  // Handler: Reset to factory defaults
  const resetToDefaults = () => {
    setActiveScenario(defaultScenario);
    setStrategyProfile(DEFAULT_STRATEGY_PROFILE);
    setCriteria(DEFAULT_CRITERIA);
    setWeights(defaultScenario.weights);
    setComponents(INITIAL_COMPONENTS);
  };

  const loadDemo = () => {
    setActiveScenario(defaultScenario);
    setStrategyProfile(DEFAULT_STRATEGY_PROFILE);
    setCriteria(DEFAULT_CRITERIA);
    setWeights(defaultScenario.weights);
    setComponents(INITIAL_COMPONENTS);
    setSelectedComponentId('trading_engine');
    setLastUpdated(new Date().toISOString());
  };

  // Handler: Export JSON
  const exportJSON = () => {
    const payload = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      activeScenario,
      strategyProfile,
      criteria,
      weights: normalizedWeights,
      components,
      evaluations,
      history: decisionHistory,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mochatrade_strategy_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handler: Import JSON
  const importJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.criteria && parsed.weights && parsed.components) {
        if (parsed.activeScenario) setActiveScenario(parsed.activeScenario);
        if (parsed.strategyProfile) setStrategyProfile(parsed.strategyProfile);
        setCriteria(parsed.criteria);
        setWeights(parsed.weights);
        setComponents(parsed.components);
        if (parsed.history && Array.isArray(parsed.history)) {
          setDecisionHistory(parsed.history);
        }
        return { success: true };
      }
      return { success: false, error: 'Invalid JSON schema: missing criteria, weights, or components.' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const value = {
    activeScenario,
    setActiveScenario,
    strategyProfile,
    setStrategyProfile,
    updateStrategyProfile,
    updateStrategicPriority,
    criteria,
    weights,
    normalizedWeights,
    components,
    evaluations,
    reasoningMap,
    phasedRoadmap,
    roadmapDependencies: roadmapModel.dependencyGraph,
    roadmapAssumptions: roadmapModel.assumptions,
    sensitivityMap,
    decisionHistory,
    activeTab,
    setActiveTab,
    selectedComponentId,
    setSelectedComponentId,
    lastUpdated,
    // Actions
    updateWeight,
    triggerNormalizeWeights,
    toggleCriterion,
    resetCriteriaDefaults,
    updateScore,
    resetDemoScores,
    addComponent,
    updateComponent,
    deleteComponent,
    addCriterion,
    updateCriterion,
    deleteCriterion,
    loadScenario,
    saveDecisionSnapshot,
    restoreSnapshot,
    deleteDecisionSnapshot,
    resetToDefaults,
    loadDemo,
    exportJSON,
    importJSON,
  };

  return <StrategyContext.Provider value={value}>{children}</StrategyContext.Provider>;
}

export function useStrategy() {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error('useStrategy must be used within a StrategyProvider');
  }
  return context;
}
