import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../state/store';

const heatmapVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const heatmapFragmentShader = `
  varying vec2 vUv;
  uniform float sigmaX;
  uniform float sigmaY;
  uniform vec2 mu;
  uniform float hbr;
  uniform float riskLevel;
  
  void main() {
    vec2 p = vUv - vec2(0.5);
    p *= 20.0;
    
    float distSq = (p.x * p.x) / (sigmaX * sigmaX) + (p.y * p.y) / (sigmaY * sigmaY);
    float prob = exp(-0.5 * distSq);
    
    vec3 col = vec3(0.0);
    if (riskLevel > 2.5) {
      col = mix(vec3(0.05, 0.0, 0.0), vec3(1.0, 0.0, 0.2), prob);
    } else if (riskLevel > 1.5) {
      col = mix(vec3(0.05, 0.04, 0.0), vec3(1.0, 0.7, 0.0), prob);
    } else {
      col = mix(vec3(0.0, 0.04, 0.0), vec3(0.0, 1.0, 0.2), prob);
    }
    
    float primary = smoothstep(0.3, 0.2, length(p));
    float chaser = smoothstep(hbr, hbr - 0.1, length(p - mu));
    
    col = mix(col, vec3(0.0, 0.9, 1.0), primary);
    col = mix(col, vec3(1.0, 1.0, 1.0), chaser);
    
    float alpha = prob * 0.8 + primary + chaser;
    if (alpha < 0.03) discard;
    
    gl_FragColor = vec4(col, min(alpha, 1.0));
  }
`;

function BPlaneScene({ stats, hbr, riskTier }) {
  const matRef = useRef();

  useFrame(() => {
    if (matRef.current && stats) {
      matRef.current.uniforms.sigmaX.value = Math.sqrt(Math.abs(stats.lambda1) || 1);
      matRef.current.uniforms.sigmaY.value = Math.sqrt(Math.abs(stats.lambda2) || 1);
      matRef.current.uniforms.mu.value.set(stats.mu?.x || 0, stats.mu?.y || 0);
      matRef.current.uniforms.hbr.value = hbr || 0.05;
      matRef.current.uniforms.riskLevel.value = riskTier === 'Critical' ? 3.0 : riskTier === 'Warning' ? 2.0 : 1.0;
    }
  });

  return (
    <>
      <OrbitControls enableDamping dampingFactor={0.05} enableRotate={false} />
      <mesh rotation={[0, 0, stats ? -(stats.theta || 0) : 0]}>
        <planeGeometry args={[15, 15]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={heatmapVertexShader}
          fragmentShader={heatmapFragmentShader}
          uniforms={{
            sigmaX: { value: 1.0 },
            sigmaY: { value: 1.0 },
            mu: { value: new THREE.Vector2(0, 0) },
            hbr: { value: 0.05 },
            riskLevel: { value: 1.0 },
          }}
          transparent
          depthWrite={false}
        />
      </mesh>
      <gridHelper args={[20, 20, 0x00f0ff, 0x00f0ff]} rotation={[Math.PI / 2, 0, 0]} material-opacity={0.08} material-transparent />
    </>
  );
}

export default function BPlaneVisualization() {
  const engineState = useStore((s) => s.engineState);
  const scenario = useStore((s) => s.scenario);
  
  const [showEKF, setShowEKF] = React.useState(false);
  const [ekfStats, setEkfStats] = React.useState(null);

  if (!engineState || !scenario) return null;

  const stats = engineState.bPlaneStats;
  const riskLevel = engineState.riskTier === 'Critical' ? 3 : engineState.riskTier === 'Warning' ? 2 : 1;

  // Simulate EKF shrink
  const runEKF = () => {
    setShowEKF(true);
    setEkfStats({
      sigmaX: stats.lambda1 * 0.1, // Massive shrink for demo
      sigmaY: stats.lambda2 * 0.1,
      infoGain: 3.42, // Bits
    });
    setTimeout(() => {
      setShowEKF(false);
      setEkfStats(null);
    }, 5000);
  };

  const currentStats = showEKF && ekfStats 
    ? { ...stats, lambda1: ekfStats.sigmaX, lambda2: ekfStats.sigmaY } 
    : stats;

  return (
    <div className="w-full h-full relative group">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
          <OrbitControls enableZoom={false} enablePan={false} />
          <BPlaneScene stats={currentStats} hbr={scenario.hbr} riskTier={engineState.riskTier} />
        </Canvas>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.3
      }} />

      {/* Labels */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-neon-blue uppercase">
        <div className="font-bold border-b border-neon-blue/30 pb-1 mb-1">Encounter Frame (B-Plane)</div>
        <div className="opacity-70">Primary (Center) vs Target</div>
        <div className="opacity-70">Covariance 2σ Bound</div>
        {showEKF && (
          <div className="mt-2 text-neon-green font-bold animate-pulse">
            EKF PASS ACTIVE<br/>
            INFO GAIN: {ekfStats.infoGain} BITS<br/>
            KL DIVERGENCE: &gt; 1.5
          </div>
        )}
      </div>

      <button 
        onClick={runEKF}
        className="absolute bottom-4 right-4 text-[9px] font-mono border border-neon-blue/30 px-2 py-1 text-neon-blue hover:bg-neon-blue/10 rounded transition-colors z-20 pointer-events-auto"
      >
        SIMULATE EKF
      </button>

      <div className="absolute bottom-4 left-4 flex gap-4 font-mono text-[9px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#00f0ff]"></div>
          <span className="text-white/70">Primary</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <span className="text-white/70">Secondary</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-gradient-to-r from-red-500/0 to-red-500"></div>
          <span className="text-white/70">Probability Cloud</span>
        </div>
      </div>
    </div>
  );
}
