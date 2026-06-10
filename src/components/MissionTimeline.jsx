import React, { useState } from 'react';

const STAGES = [
  { label: 'T-72h', value: -72, desc: 'Early detection. High covariance uncertainty.', covQuality: 'Low' },
  { label: 'T-48h', value: -48, desc: 'Tracking updates refine covariance.', covQuality: 'Medium' },
  { label: 'T-24h', value: -24, desc: 'Maneuver decision window opens.', covQuality: 'High' },
  { label: 'T-12h', value: -12, desc: 'Final maneuver window. High confidence.', covQuality: 'Very High' },
  { label: 'TCA', value: 0, desc: 'Time of Closest Approach. Maximum precision.', covQuality: 'Maximum' },
];

const confidenceMap = { '-72': 78, '-48': 85, '-24': 92, '-12': 96, '0': 99 };

export default function MissionTimeline({ timeOffset, setTimeOffset }) {
  const [hoveredStage, setHoveredStage] = useState(null);

  const activeIndex = STAGES.findIndex(s => s.value === timeOffset);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-label text-white/40">Mission Timeline</h3>
        <span className="text-[9px] font-mono text-white/30 tracking-wider">COVARIANCE SCALING</span>
      </div>

      {/* Timeline Track */}
      <div className="relative flex items-center justify-between py-2">
        {/* Background Track */}
        <div className="absolute left-5 right-5 h-[2px] bg-white/8 top-[18px]" />
        
        {/* Active Fill */}
        <div
          className="absolute left-5 h-[2px] bg-neon-blue top-[18px] transition-all duration-500 ease-out"
          style={{ width: `calc(${(activeIndex / (STAGES.length - 1)) * 100}% - 20px)` }}
        />

        {STAGES.map((stage, i) => {
          const isActive = i <= activeIndex;
          const isSelected = timeOffset === stage.value;
          const isHovered = hoveredStage === i;
          const conf = confidenceMap[stage.value.toString()] || 85;

          return (
            <div
              key={stage.label}
              className="flex flex-col items-center gap-2 z-10 cursor-pointer group relative"
              onClick={() => setTimeOffset(stage.value)}
              onMouseEnter={() => setHoveredStage(i)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              {/* Node */}
              <div
                className={`
                  timeline-node w-4 h-4 rounded-full border-2 transition-all duration-300
                  ${isSelected
                    ? 'bg-neon-blue border-neon-blue scale-125 timeline-node-active'
                    : isActive
                      ? 'bg-neon-blue/80 border-neon-blue/80'
                      : 'bg-space-900 border-white/20 group-hover:border-white/50'
                  }
                `}
              />
              
              {/* Label */}
              <span className={`text-[10px] font-mono transition-colors ${isSelected ? 'text-white font-bold' : isActive ? 'text-white/60' : 'text-white/25'}`}>
                {stage.label}
              </span>

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-48 holo-panel p-3 z-50 animate-fade-in pointer-events-none">
                  <div className="text-[9px] font-mono text-neon-blue tracking-wider mb-1">{stage.label}</div>
                  <p className="text-[10px] text-white/60 leading-relaxed mb-2">{stage.desc}</p>
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-white/30">Confidence</span>
                    <span className="text-white/70">{conf}%</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-white/30">Cov Quality</span>
                    <span className="text-white/70">{stage.covQuality}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
