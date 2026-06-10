import { create } from 'zustand';
import { scenarios } from '../data/scenarios';
import { Engine } from '../orbital/OrbitalEngine';

// Initialize engine with first scenario
Engine.loadScenario(scenarios[0]);
const initialState = Engine.computeState(-72, null);

export const useStore = create((set, get) => ({
  // ═══ SCENARIO ═══
  scenario: scenarios[0],
  allScenarios: scenarios,
  setScenario: (scenario) => {
    Engine.loadScenario(scenario);
    const engineState = Engine.computeState(-72, null);
    set({ scenario, timeOffset: -72, selectedStrategy: null, orbState: 'IDLE', engineState });
  },

  // ═══ TIMELINE ═══
  timeOffset: -72,
  setTimeOffset: (timeOffset) => {
    set({ timeOffset });
    const state = get();
    const engineState = Engine.computeState(timeOffset, state.selectedStrategy);
    set({ engineState });
  },

  // ═══ STRATEGY ═══
  selectedStrategy: null,
  setSelectedStrategy: (selectedStrategy) => {
    set({ selectedStrategy });
    const state = get();
    const engineState = Engine.computeState(state.timeOffset, selectedStrategy);
    set({ engineState });
  },

  // ═══ APP PHASE ═══
  orbState: 'IDLE',
  setOrbState: (orbState) => set({ orbState }),

  // ═══ UI STATE ═══
  leftPanelOpen: true,
  rightPanelOpen: true,
  immersiveMode: false,
  showCinematicReveal: false,
  showSimChamber: false,

  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  toggleImmersive: () => set((s) => ({
    immersiveMode: !s.immersiveMode,
    leftPanelOpen: s.immersiveMode, // restore panels when exiting
    rightPanelOpen: s.immersiveMode,
  })),
  setShowCinematicReveal: (v) => set({ showCinematicReveal: v }),
  setShowSimChamber: (v) => set({ showSimChamber: v }),

  // ═══ ENGINE OUTPUT ═══
  engineState: initialState || { Pc: 0, riskTier: 'Safe', bPlaneStats: null, confidence: 100 },

  // ═══ V8 JUDGE & FOCUS FEATURES ═══
  judgeModeActive: false,
  setJudgeModeActive: (v) => set({ judgeModeActive: v, lightingMode: v ? 'CINEMATIC' : 'OPERATIONAL' }),
  judgeModeStep: 0,
  setJudgeModeStep: (v) => set({ judgeModeStep: v }),
  
  lightingMode: 'OPERATIONAL', // 'OPERATIONAL' | 'CINEMATIC'
  setLightingMode: (v) => set({ lightingMode: v }),
  
  focusElement: null,
  setFocusElement: (v) => set({ focusElement: v }),
  
  advancedAnalysis: false,
  toggleAdvancedAnalysis: () => set((s) => ({ advancedAnalysis: !s.advancedAnalysis })),

  // ═══ JUDGE MODE ORCHESTRATOR ═══
  runJudgeModeSequence: () => {
    set({ judgeModeActive: true, judgeModeStep: 1, lightingMode: 'CINEMATIC', immersiveMode: true, leftPanelOpen: false, rightPanelOpen: false, timeOffset: -72, selectedStrategy: null });
    
    // 1 Mission Brief
    // 2 Conjunction Detected
    setTimeout(() => set({ judgeModeStep: 2 }), 3000);
    // 3 Risk Escalation
    setTimeout(() => {
      set({ judgeModeStep: 3, leftPanelOpen: true });
      get().setTimeOffset(0); // Max risk at TCA
    }, 6000);
    // 4 Foster Analysis (Focus B-Plane)
    setTimeout(() => set({ judgeModeStep: 4, rightPanelOpen: true }), 10000);
    // 5 Monte Carlo Analysis
    setTimeout(() => set({ judgeModeStep: 5 }), 14000);
    // 6 AI Optimization
    setTimeout(() => set({ judgeModeStep: 6 }), 18000);
    // 7 Decision Trace
    setTimeout(() => {
      set({ judgeModeStep: 7 });
      get().activateCopilot();
    }, 22000);
    // 8 Maneuver Execution
    setTimeout(() => set({ judgeModeStep: 8 }), 28000);
    // 9 Risk Reduction
    setTimeout(() => set({ judgeModeStep: 9 }), 32000);
    // 10 Mission Safe
    setTimeout(() => {
      set({ judgeModeStep: 10 });
      setTimeout(() => set({ judgeModeActive: false, judgeModeStep: 0, lightingMode: 'OPERATIONAL', immersiveMode: false }), 5000);
    }, 36000);
  },

  // ═══ COPILOT ACTIVATION SEQUENCE ═══
  activateCopilot: () => {
    const { scenario, setOrbState, setShowSimChamber, setShowCinematicReveal, setSelectedStrategy } = get();
    
    // Phase 1: UI dims, Orb ignites
    setOrbState('THINKING');
    set({ immersiveMode: true, leftPanelOpen: false, rightPanelOpen: false });
    
    // Phase 2: Simulation chamber
    setTimeout(() => {
      setOrbState('SIMULATING');
      setShowSimChamber(true);
    }, 2000);
    
    // Phase 3: Decision reveal
    setTimeout(() => {
      setShowSimChamber(false);
      setOrbState('DECISION');
      setShowCinematicReveal(true);
      
      const best = scenario.strategies.find(s => s.recommendation === 'Best');
      setSelectedStrategy(best || scenario.strategies[0]);
    }, 6000);
    
    // Phase 4: Return to command deck
    setTimeout(() => {
      setShowCinematicReveal(false);
      set({ immersiveMode: false, leftPanelOpen: true, rightPanelOpen: true });
    }, 10000);
  },
}));
