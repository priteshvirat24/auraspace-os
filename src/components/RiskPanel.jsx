import React from 'react';

export default function RiskPanel({ scenario, Pc, riskTier, confidence, onClose }) {
  const riskColor = riskTier === 'Critical' ? 'neon-red' : riskTier === 'Warning' ? 'neon-amber' : 'neon-green';
  const riskClass = riskTier === 'Critical' ? 'risk-critical' : riskTier === 'Warning' ? 'risk-warning' : 'risk-safe';

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-${riskColor} ${riskTier === 'Critical' ? 'animate-pulse' : ''}`}
               style={{ boxShadow: `0 0 12px var(--color-${riskColor})` }} />
          <h2 className="text-label text-white/60">Conjunction Risk</h2>
        </div>
        <button onClick={onClose} className="text-white/20 hover:text-white/50 text-sm transition-colors">✕</button>
      </div>

      {/* Tier 1: The Big Number */}
      <div className={`p-5 rounded-xl border ${riskClass} transition-all duration-500`}>
        <div className="text-metric text-white mb-1">
          {Pc === 0 ? '0.000' : Pc.toExponential(3)}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono tracking-widest text-white/40 flex items-center gap-1 group relative cursor-help">
            PROBABILITY (Pc) <span className="text-white/20">[?]</span>
            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-[#050a11]/90 backdrop-blur-md border border-white/10 text-white/70 text-[9px] leading-relaxed rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Estimated probability that the primary and secondary objects occupy the same volume at TCA.
            </div>
          </span>
          <span className={`text-[11px] font-mono font-bold tracking-widest text-${riskColor}`}>
            {riskTier.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Tier 2: Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/3 rounded-lg p-3 border border-white/5">
          <div className="text-[9px] font-mono tracking-widest text-white/30 mb-1 flex items-center gap-1 group relative cursor-help w-max">
            CONFIDENCE <span className="text-white/20">[?]</span>
            <div className="absolute bottom-full left-0 mb-2 w-40 p-2 bg-[#050a11]/90 backdrop-blur-md border border-white/10 text-white/70 text-[9px] leading-relaxed rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Sensor track fidelity and orbit determination confidence level.
            </div>
          </div>
          <div className="font-mono text-xl text-white/90">{confidence}%</div>
        </div>
        <div className="bg-white/3 rounded-lg p-3 border border-white/5">
          <div className="text-[9px] font-mono tracking-widest text-white/30 mb-1">SCENARIO</div>
          <div className="font-mono text-sm text-white/70 truncate">{scenario.shortName}</div>
        </div>
      </div>
    </div>
  );
}
