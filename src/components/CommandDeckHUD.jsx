import React, { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { 
  Home, Activity, AlertTriangle, TrendingUp, Video, FileText, 
  Settings, Power, Bell, Target, Box, Camera, RefreshCw, Clock, Cpu, 
  CheckCircle2, Circle
} from 'lucide-react';
import BPlaneVisualization from './BPlaneVisualization';
import DecisionArena from './DecisionArena';

export default function CommandDeckHUD() {
  const scenario = useStore((s) => s.scenario);
  const engineState = useStore((s) => s.engineState);
  const timeOffset = useStore((s) => s.timeOffset);
  const setTimeOffset = useStore((s) => s.setTimeOffset);
  const selectedStrategy = useStore((s) => s.selectedStrategy);
  const setSelectedStrategy = useStore((s) => s.setSelectedStrategy);
  const orbState = useStore((s) => s.orbState);
  const immersiveMode = useStore((s) => s.immersiveMode);
  const toggleImmersive = useStore((s) => s.toggleImmersive);
  const activateCopilot = useStore((s) => s.activateCopilot);
  const judgeModeActive = useStore((s) => s.judgeModeActive);
  const runJudgeModeSequence = useStore((s) => s.runJudgeModeSequence);
  const judgeModeStep = useStore((s) => s.judgeModeStep);

  const riskTier = engineState?.riskTier || 'Safe';
  const Pc = engineState?.Pc || 0;
  const confidence = engineState?.confidence || 0;
  const isThinking = orbState === 'THINKING' || orbState === 'SIMULATING';

  // Format Time to TCA
  const hoursToTca = Math.abs(timeOffset);
  const timeString = timeOffset <= 0 ? `-${Math.floor(hoursToTca)}h ${Math.floor((hoursToTca % 1) * 60)}m` : `+${Math.floor(hoursToTca)}h`;

  const isBPlaneDominant = judgeModeActive && judgeModeStep === 4;

  if (immersiveMode && judgeModeActive && judgeModeStep < 9) {
    // Return minimal overlay during cinematic judge sequence
    return (
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-between py-12">
        {judgeModeStep >= 3 && !isBPlaneDominant && (
          <div className="animate-fade-in bg-black/60 backdrop-blur-md border border-neon-red/30 px-8 py-4 rounded-xl text-center">
            <h1 className="text-xl font-mono text-neon-red font-bold tracking-widest mb-2">CRITICAL CONJUNCTION ALERT</h1>
            <p className="text-white/70 font-mono text-sm">{scenario.shortName} • Pc: {Pc.toExponential(2)}</p>
          </div>
        )}

        {isBPlaneDominant && (
          <div className="absolute inset-10 z-50 bg-[#050b14]/95 backdrop-blur-3xl border border-neon-blue/50 rounded-2xl shadow-[0_0_100px_rgba(0,240,255,0.2)] flex flex-col p-6 animate-fade-in pointer-events-auto">
            <div className="p-3 border-b border-white/5 flex justify-between items-center mb-4">
              <span className="text-sm font-mono text-white/30 tracking-widest">SCIENTIFIC B-PLANE DOMINANCE</span>
              <span className="text-xs font-mono text-white/20">AURA-1 VS DEBRIS-327A</span>
            </div>
            <div className="flex-1 relative border border-white/5 rounded-lg overflow-hidden bg-black/50">
              <BPlaneVisualization />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 pointer-events-none z-10 font-sans transition-opacity duration-700 ${immersiveMode && !judgeModeActive ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* ═══ TOP BAR ═══ */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-[#050b14]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 pointer-events-auto">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-neon-blue/10 flex items-center justify-center border border-neon-blue/30">
            <Activity className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <div className="text-white font-bold tracking-widest text-sm">AURASPACE OS</div>
            <div className="text-neon-blue/60 font-mono text-[9px] tracking-widest uppercase">Mission Safety Copilot</div>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/40 mb-1">SYSTEM STATUS</span>
            <span className={`text-xs font-mono font-bold ${riskTier === 'Critical' ? 'text-neon-red' : 'text-neon-green'}`}>
              {riskTier.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/40 mb-1">COLLISION PROBABILITY</span>
            <span className="text-xs font-mono text-white/90">{Pc === 0 ? '—' : Pc.toExponential(3)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/40 mb-1">CONFIDENCE</span>
            <span className="text-xs font-mono text-white/90">{confidence}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/40 mb-1">SCENARIO</span>
            <span className="text-xs font-mono text-white/90 truncate max-w-[150px]">{scenario.shortName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/40 mb-1">TIME TO TCA</span>
            <span className="text-xs font-mono text-neon-amber">{timeString}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={runJudgeModeSequence} className="text-[10px] font-mono text-neon-purple hover:text-white border border-neon-purple/30 px-3 py-1.5 rounded transition-colors">JUDGE MODE</button>
          <button onClick={toggleImmersive} className="text-[10px] font-mono text-white/50 hover:text-white border border-white/10 px-3 py-1.5 rounded transition-colors">FULLSCREEN</button>
          <Settings className="w-4 h-4 text-white/40 hover:text-white cursor-pointer" />
          <Bell className="w-4 h-4 text-white/40 hover:text-white cursor-pointer" />
          <Power className="w-4 h-4 text-neon-red/60 hover:text-neon-red cursor-pointer" />
        </div>
      </div>

      {/* ═══ LEFT SIDEBAR ═══ */}
      <div className="absolute left-6 top-24 bottom-24 w-64 flex flex-col gap-4 pointer-events-auto overflow-y-auto overflow-x-hidden scrollbar-hide">
        
        {/* Mission Overview Nav */}
        <div className="bg-[#050b14]/60 backdrop-blur-xl border border-white/5 rounded-xl p-2 flex flex-col gap-1 shadow-2xl">
          <span className="text-[9px] font-mono text-white/30 mb-2 pl-2">MISSION OVERVIEW</span>
          <button className="flex items-center gap-3 px-3 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-lg text-neon-blue text-xs transition-colors">
            <Home className="w-4 h-4" /> Dashboard
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-white/50 hover:bg-white/5 rounded-lg text-xs transition-colors">
            <Target className="w-4 h-4" /> Orbit Monitor
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-white/50 hover:bg-white/5 rounded-lg text-xs transition-colors">
            <AlertTriangle className="w-4 h-4" /> Conjunctions
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-white/50 hover:bg-white/5 rounded-lg text-xs transition-colors">
            <TrendingUp className="w-4 h-4" /> Risk Assessment
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-white/50 hover:bg-white/5 rounded-lg text-xs transition-colors">
            <FileText className="w-4 h-4" /> Maneuver Planning
          </button>
        </div>

        {/* Live Feed */}
        <div className="bg-[#050b14]/60 backdrop-blur-xl border border-white/5 rounded-xl p-2 flex flex-col shadow-2xl">
          <span className="text-[9px] font-mono text-white/30 mb-2 pl-2">LIVE FEED</span>
          <div className="h-20 rounded-lg overflow-hidden relative border border-white/10 bg-black/50">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
              <span className="text-[8px] font-mono text-white/60">Deep Space Network<br/>Madrid, Spain</span>
              <span className="text-[9px] font-mono text-neon-green">RT 120ms</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-[#050b14]/60 backdrop-blur-xl border border-white/5 rounded-xl p-3 flex flex-col gap-1 shadow-2xl">
          <span className="text-[9px] font-mono text-white/30 mb-1">SYSTEM HEALTH</span>
          {['Propagator', 'Sensors', 'Comms', 'Power', 'AI Engine'].map(sys => (
            <div key={sys} className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-white/60">{sys}</span>
              <span className="text-neon-green flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" /> Nominal
              </span>
            </div>
          ))}
        </div>

        {/* Mission Timeline */}
        <div className="bg-[#050b14]/60 backdrop-blur-xl border border-white/5 rounded-xl p-3 flex flex-col shadow-2xl mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] font-mono text-white/30">MISSION TIMELINE</span>
            <span className="text-[8px] font-mono text-white/20">COVARIANCE SCALING</span>
          </div>
          <div className="relative h-1 bg-white/10 rounded-full mb-4">
            <div className="absolute top-0 left-0 h-full bg-neon-blue rounded-full" style={{ width: `${((timeOffset + 72) / 72) * 100}%` }} />
            {[-72, -48, -24, -12, 0].map(val => (
              <div 
                key={val}
                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#050b14] transition-all cursor-pointer
                  ${timeOffset === val ? 'bg-neon-blue scale-125' : 'bg-white/30 hover:bg-white/60'}
                `}
                style={{ left: `calc(${((val + 72) / 72) * 100}% - 6px)` }}
                onClick={() => setTimeOffset(val)}
              />
            ))}
          </div>
          <div className="flex justify-between text-[8px] font-mono text-white/40">
            <span>T-72h</span>
            <span>T-48h</span>
            <span>T-24h</span>
            <span>T-12h</span>
            <span>TCA</span>
          </div>
        </div>

        {/* Mission Impact */}
        <div className="bg-[#050b14]/60 backdrop-blur-xl border border-white/5 rounded-xl p-3 flex flex-col shadow-2xl">
          <span className="text-[9px] font-mono text-white/30 mb-3">MISSION IMPACT</span>
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-white/40 mb-1">ASSET VALUE</span>
              <span className="text-sm font-mono text-white/90">{scenario.consequences.value}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-white/40 mb-1">DOWNTIME</span>
              <span className="text-sm font-mono text-white/90">{scenario.consequences.downtime}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-white/40 mb-1">FUEL</span>
              <span className="text-sm font-mono text-white/90">{scenario.consequences.fuelRemaining}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM DOCK ═══ */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-6 pointer-events-auto">
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-white/40 group-hover:border-neon-blue/50 group-hover:text-neon-blue transition-colors">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-[8px] font-mono text-white/40 text-center leading-tight">FOCUS<br/>EARTH</span>
        </div>
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-white/40 group-hover:border-neon-blue/50 group-hover:text-neon-blue transition-colors">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-[8px] font-mono text-white/40 text-center leading-tight">FOCUS<br/>B-PLANE</span>
        </div>
        
        {/* Center Orb */}
        <div className="flex flex-col items-center gap-2 group cursor-pointer mx-4 mt-[-20px]">
          <div className="w-16 h-16 rounded-full border border-neon-blue/40 bg-neon-blue/10 flex items-center justify-center text-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-neon-blue font-bold text-center leading-tight tracking-wider">AURA CORE<br/><span className="text-[8px] font-normal text-white/40">AI ENGINE</span></span>
        </div>

        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-white/40 group-hover:border-neon-blue/50 group-hover:text-neon-blue transition-colors">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[8px] font-mono text-white/40 text-center leading-tight">TIME<br/>WARP</span>
        </div>
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-white/40 group-hover:border-neon-blue/50 group-hover:text-neon-blue transition-colors">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-[8px] font-mono text-white/40 text-center leading-tight">CAMERA<br/>ORBIT</span>
        </div>
      </div>

      {/* ═══ BOTTOM ACTIVATION BAR ═══ */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[600px] h-12 pointer-events-auto">
        <button
          onClick={activateCopilot}
          disabled={isThinking}
          className={`w-full h-full rounded-lg border flex items-center justify-center font-mono text-xs tracking-[4px] transition-all
            ${isThinking 
              ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue/50 cursor-wait' 
              : 'bg-[#050b14]/80 backdrop-blur-xl border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 hover:border-neon-blue hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]'
            }`}
        >
          {isThinking ? 'PROCESSING...' : 'ACTIVATE SAFETY SYNTHESIS ENGINE'}
        </button>
      </div>

      {/* ═══ RIGHT SIDEBAR ═══ */}
      <div className={`absolute right-6 top-24 bottom-24 w-80 flex flex-col gap-4 pointer-events-auto transition-opacity duration-700 ${isBPlaneDominant ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* B-Plane Analysis */}
        <div className="bg-[#050b14]/60 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden shadow-2xl h-[240px] flex flex-col">
          <div className="p-3 border-b border-white/5 flex justify-between items-center">
            <span className="text-[9px] font-mono text-white/30">B-PLANE ANALYSIS</span>
            <span className="text-[8px] font-mono text-white/20 hover:text-white cursor-pointer transition-colors">ⓘ</span>
          </div>
          <div className="flex-1 relative">
            <BPlaneVisualization />
          </div>
        </div>

        {/* Decision Arena */}
        <div className="bg-[#050b14]/60 backdrop-blur-xl border border-white/5 rounded-xl p-4 flex flex-col shadow-2xl h-[240px]">
          <DecisionArena scenario={scenario} selectedStrategy={selectedStrategy} onSelectStrategy={setSelectedStrategy} />
        </div>

        {/* AI Reasoning */}
        <div className="bg-[#050b14]/60 backdrop-blur-xl border border-white/5 rounded-xl p-4 flex flex-col shadow-2xl flex-1">
          <span className="text-[9px] font-mono text-white/30 mb-4">AI REASONING</span>
          
          <div className="flex flex-col gap-3">
            {[
              { id: 1, text: 'Analyzing relative motion...' },
              { id: 2, text: 'Evaluating collision geometry...' },
              { id: 3, text: 'Computing maneuver candidates...' },
              { id: 4, text: 'Estimating fuel cost...' },
              { id: 5, text: 'Selecting optimal strategy...' },
            ].map((step, idx) => {
              const isActive = isThinking && (idx === 0 || orbState === 'SIMULATING'); // Simplified active logic
              const isDone = !isThinking && selectedStrategy;
              const color = isDone ? 'text-neon-green' : (isActive ? 'text-neon-blue' : 'text-white/20');
              const Icon = isDone ? CheckCircle2 : Circle;
              
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <Icon className={`w-3.5 h-3.5 ${color} ${isActive ? 'animate-pulse' : ''}`} />
                  <span className={`text-[10px] font-mono ${isActive ? 'text-white/80' : 'text-white/40'}`}>
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>
          
          {selectedStrategy && !isThinking && (
            <div className="mt-auto h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-neon-blue w-[100%]" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
