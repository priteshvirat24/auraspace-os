import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Box } from '@react-three/drei';
import * as THREE from 'three';

export default function SimulationChamber({ active, strategies }) {
  const [phase, setPhase] = useState(0);
  const groupRef = useRef();

  useEffect(() => {
    if (active) {
      setPhase(1);
      const t1 = setTimeout(() => setPhase(2), 800);  // Collision Geometry
      const t2 = setTimeout(() => setPhase(3), 1600); // Maneuvers
      const t3 = setTimeout(() => setPhase(4), 2400); // Fuel (same visual, maybe pulse)
      const t4 = setTimeout(() => setPhase(5), 3200); // Selection
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    } else {
      setPhase(0);
    }
  }, [active]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.x += delta * 0.1;
    }
  });

  if (phase === 0 || !strategies) return null;

  const simStrats = strategies.filter(s => s.id !== 'no-action').slice(0, 3);

  // Phase 1: Satellites moving
  const satPos1 = phase >= 2 ? 0 : -5 + (phase === 1 ? 5 : 0); 
  // We can just animate them based on time if we want, but phase states are simpler.
  
  return (
    <group position={[7, 2, -5]} scale={1.5} ref={groupRef}>
      
      {/* Central Intercept Point */}
      <Sphere args={[0.1, 16, 16]}>
        <meshBasicMaterial color="#ff003c" toneMapped={false} />
      </Sphere>

      {/* Phase 1+: Relative Motion Lines */}
      <Line points={[[-5, 0, 0], [0, 0, 0]]} color="#00f0ff" lineWidth={2} transparent opacity={0.6} />
      <Line points={[[0, -5, 0], [0, 0, 0]]} color="#ff003c" lineWidth={2} transparent opacity={0.6} />

      {/* Phase 2+: Covariance Ellipsoid */}
      {phase >= 2 && (
        <Sphere args={[1.5, 32, 32]} scale={[2, 0.5, 1]}>
          <meshBasicMaterial color="#ff003c" wireframe transparent opacity={0.15} />
        </Sphere>
      )}

      {/* Phase 3+: Maneuver Candidates (Diverging lines) */}
      {phase >= 3 && simStrats.map((strat, idx) => {
        const isBest = strat.recommendation === 'Best';
        const isSelectedPhase = phase >= 5;
        const color = isSelectedPhase ? (isBest ? '#39ff14' : '#ff003c') : '#eab308';
        const opacity = isSelectedPhase && !isBest ? 0.1 : 0.8;
        
        // Diverge at different angles
        const angle = (idx - 1) * 0.5; // -0.5, 0, 0.5
        const endPoint = [
          Math.cos(angle) * 5,
          Math.sin(angle) * 5,
          0
        ];

        return (
          <group key={strat.id}>
            <Line 
              points={[[-2, 0, 0], endPoint]} 
              color={color} 
              lineWidth={isSelectedPhase && isBest ? 4 : 2} 
              transparent 
              opacity={opacity} 
            />
            {/* Fuel Bar representation for Phase 4+ */}
            {phase >= 4 && (
              <Box args={[0.2, strat.deltaV * 0.5, 0.2]} position={[endPoint[0], endPoint[1] + 1, endPoint[2]]}>
                <meshBasicMaterial color={color} transparent opacity={opacity} />
              </Box>
            )}
          </group>
        );
      })}
    </group>
  );
}
