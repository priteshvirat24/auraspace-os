import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export default function DecisionArena({ scenario, selectedStrategy, onSelectStrategy }) {
  const [evaluating, setEvaluating] = useState(true);
  
  // Simulate AI evaluation time
  useEffect(() => {
    setEvaluating(true);
    const t = setTimeout(() => {
      setEvaluating(false);
      // Auto-select best strategy when done
      const best = scenario.strategies.find(s => s.recommendation === 'Best');
      if (best && onSelectStrategy) onSelectStrategy(best);
    }, 2500);
    return () => clearTimeout(t);
  }, [scenario.id, onSelectStrategy]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <h3 className="text-[10px] font-mono text-neon-blue font-bold tracking-widest uppercase flex items-center gap-2">
          {evaluating ? <Activity className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          AI Decision Arena
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-3 pr-2 scrollbar-hide pb-4">
        {scenario.strategies.map((strat, idx) => {
          if (strat.id === 'no-action') return null; // Only evaluate active burns
          
          const isSelected = selectedStrategy?.id === strat.id;
          
          // Determine rejection logic based on mock secondary sweep logic
          let status = 'EVALUATING KINEMATICS...';
          let statusColor = 'text-neon-amber';
          let bgColor = 'bg-white/5 border-white/10';
          let icon = <Activity className="w-4 h-4 animate-spin text-neon-amber" />;
          
          if (!evaluating) {
            if (strat.recommendation === 'Best') {
              status = 'SELECTED: OPTIMAL SOLUTION';
              statusColor = 'text-neon-green';
              bgColor = isSelected ? 'bg-neon-green/10 border-neon-green shadow-[0_0_15px_rgba(0,255,100,0.15)]' : 'bg-black/50 border-neon-green/30';
              icon = <CheckCircle2 className="w-4 h-4 text-neon-green" />;
            } else if (strat.id === 'in-track' && strat.deltaV > 0.1) {
              status = 'REJECTED: SECONDARY CONJUNCTION RISK';
              statusColor = 'text-neon-red';
              bgColor = 'bg-black/50 border-neon-red/30 opacity-50 grayscale hover:grayscale-0';
              icon = <ShieldAlert className="w-4 h-4 text-neon-red" />;
            } else {
              status = 'REJECTED: FUEL COST SUB-OPTIMAL';
              statusColor = 'text-neon-red';
              bgColor = 'bg-black/50 border-neon-red/30 opacity-50 grayscale hover:grayscale-0';
              icon = <XCircle className="w-4 h-4 text-neon-red" />;
            }
          }

          return (
            <div 
              key={strat.id}
              onClick={() => { if (!evaluating) onSelectStrategy(strat); }}
              className={`flex flex-col p-3 rounded-lg border transition-all duration-700 cursor-pointer ${bgColor} ${evaluating ? 'animate-pulse' : ''}`}
            >
              <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">{strat.name} BURN</span>
                <span className="text-[10px] font-mono text-white/50">ΔV: {strat.deltaV.toFixed(3)} m/s</span>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <div className={`flex items-center gap-2 text-[9px] font-mono font-bold ${statusColor}`}>
                  {icon} {status}
                </div>
                {!evaluating && (
                  <div className="text-[9px] font-mono text-white/40">
                    Pc: {strat.newPc.toExponential(2)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
