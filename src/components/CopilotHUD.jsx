import React from 'react';
import { Shield, Activity, CheckCircle, ArrowRight } from 'lucide-react';

export default function CopilotHUD({ scenario, selectedStrategy, onActivate, isRunning, isActivated }) {
  
  if (!isActivated && !isRunning) {
    return (
      <div className="w-full bg-space-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-4 h-full">
        <Shield className="w-12 h-12 text-neon-blue opacity-50" />
        <div className="text-center">
          <h3 className="text-sm uppercase tracking-widest text-white font-bold mb-1">Mission Safety Copilot</h3>
          <p className="text-xs text-white/50 max-w-xs">AI-driven orbital mitigation analysis and maneuver synthesis.</p>
        </div>
        <button 
          onClick={onActivate}
          disabled={scenario.tier === 'Safe'}
          className="cyber-button py-3 px-6 rounded-lg font-bold text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Activate Safety Synthesis Engine
        </button>
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className="w-full bg-space-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-4 h-full">
        <Activity className="w-12 h-12 text-neon-blue animate-spin" />
        <h3 className="text-sm uppercase tracking-widest text-neon-blue font-bold">Synthesizing Maneuvers...</h3>
        <div className="flex flex-col gap-1 text-[10px] font-mono text-white/50 text-center w-full max-w-xs">
          <div className="flex justify-between"><span>Evaluating Radial Burn...</span><span>[OK]</span></div>
          <div className="flex justify-between"><span>Evaluating In-Track Burn...</span><span>[OK]</span></div>
          <div className="flex justify-between"><span>Evaluating Cross-Track Burn...</span><span>[OK]</span></div>
        </div>
      </div>
    );
  }

  // Active state
  return (
    <div className="w-full bg-space-900/50 border border-neon-blue/30 rounded-xl p-4 flex flex-col h-full overflow-hidden relative shadow-[0_0_15px_rgba(0,240,255,0.1)]">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neon-blue/20">
        <Shield className="w-4 h-4 text-neon-blue" />
        <h3 className="text-xs uppercase tracking-widest text-white font-bold">Safety Synthesis Complete</h3>
      </div>

      <div className="flex-1 overflow-auto flex flex-col gap-4 text-xs">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-2 rounded border border-white/5">
            <div className="text-[9px] uppercase tracking-wider text-white/40 mb-1">Goal</div>
            <div className="font-mono text-white/90">Minimize collision risk</div>
          </div>
          <div className="bg-black/30 p-2 rounded border border-white/5">
            <div className="text-[9px] uppercase tracking-wider text-white/40 mb-1">Constraints</div>
            <ul className="font-mono text-white/90 list-disc pl-3">
              <li>Fuel Budget &lt; 1 m/s</li>
              <li>No Secondary Conjunctions</li>
              <li>Maintain Mission Timeline</li>
            </ul>
          </div>
        </div>

        <div className="bg-space-900/80 p-3 rounded border border-neon-blue/20 flex flex-col gap-2 font-mono text-[9px] text-white/80 overflow-auto">
          <div className="text-[10px] uppercase tracking-wider text-neon-blue font-bold mb-1 border-b border-neon-blue/20 pb-1">Agent Autonomous Trace Generator</div>
          {selectedStrategy ? (
            <pre className="whitespace-pre-wrap">
{`{
  "event_id": "${scenario.id}",
  "conjunction_pair": { 
    "primary": "NORAD-58912", 
    "secondary": "NORAD-90124" 
  },
  "unmitigated_pc": ${scenario.unmitigatedPc.toExponential(2)},
  "decision": {
    "selected_strategy": "${selectedStrategy.label}",
    "rationale": "${selectedStrategy.explanation}"
  }
}`}
            </pre>
          ) : (
            <p className="font-mono text-white/40 italic">Awaiting strategy selection...</p>
          )}
        </div>

        {selectedStrategy && selectedStrategy.id !== 'no-action' && (
          <button className="mt-auto bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/50 py-2 rounded uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-2 transition-colors">
            <CheckCircle className="w-3 h-3" /> Commit Maneuver to Uplink
          </button>
        )}

      </div>
    </div>
  );
}
