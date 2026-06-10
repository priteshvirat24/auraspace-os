import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

// States: 'IDLE', 'THINKING', 'SIMULATING', 'DECISION'

export default function QuantumOrb({ state = 'IDLE', position = [0, 0, 0] }) {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const particlesRef = useRef();

  const [particlePositions, particlePhases] = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for(let i=0; i<count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.0;
      pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      phases[i] = Math.random() * Math.PI * 2;
    }
    return [pos, phases];
  }, []);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    
    let coreScale = 1.0;
    let ringSpeed = 1.0;
    let particleExpansion = 1.0;

    if (state === 'IDLE') {
      coreScale = 1.0 + Math.sin(time * 2) * 0.05;
      ringSpeed = 1.0;
      particleExpansion = 1.1;
    } else if (state === 'THINKING') {
      coreScale = 1.1 + Math.sin(time * 10) * 0.1;
      ringSpeed = 4.0;
      particleExpansion = 1.5;
    } else if (state === 'SIMULATING') {
      coreScale = 1.3 + Math.sin(time * 20) * 0.15;
      ringSpeed = 8.0;
      particleExpansion = 2.5;
    } else if (state === 'DECISION') {
      coreScale = 1.2;
      ringSpeed = 2.0;
      particleExpansion = 1.2;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
      // Smoothly interpolate scale
      coreRef.current.scale.lerp(new THREE.Vector3(coreScale, coreScale, coreScale), 0.1);
    }
    
    if (ring1Ref.current && ring2Ref.current) {
      ring1Ref.current.rotation.x += delta * ringSpeed;
      ring1Ref.current.rotation.y += delta * ringSpeed * 0.5;
      ring2Ref.current.rotation.y -= delta * ringSpeed;
      ring2Ref.current.rotation.z += delta * ringSpeed * 0.5;
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.2;
      const positions = particlesRef.current.geometry.attributes.position.array;
      const phases = particlesRef.current.geometry.attributes.phase.array;
      
      for(let i=0; i<particlePositions.length / 3; i++) {
        // Base direction
        const dir = new THREE.Vector3(particlePositions[i*3], particlePositions[i*3+1], particlePositions[i*3+2]).normalize();
        
        // Pulsate radius
        const r = 1.0 + Math.sin(time * 5 + phases[i]) * 0.1 * particleExpansion;
        const currentR = r * particleExpansion;
        
        positions[i*3] = dir.x * currentR;
        positions[i*3+1] = dir.y * currentR;
        positions[i*3+2] = dir.z * currentR;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const isHighEnergy = state === 'THINKING' || state === 'SIMULATING';

  return (
    <group position={position}>
      {/* Outer Shell */}
      <Sphere ref={coreRef} args={[1, 32, 32]}>
        <meshBasicMaterial color={state === 'SIMULATING' ? "#ff00ff" : state === 'DECISION' ? "#39ff14" : "#00f0ff"} wireframe transparent opacity={0.6} />
      </Sphere>
      
      {/* Energy Core */}
      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial color={state === 'SIMULATING' ? "#ffffff" : "#0055ff"} transparent opacity={0.8} />
      </Sphere>
      
      {/* Rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshBasicMaterial color={isHighEnergy ? "#ffffff" : "#00f0ff"} transparent opacity={0.8} />
      </mesh>
      
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshBasicMaterial color={isHighEnergy ? "#ff00ff" : "#00f0ff"} transparent opacity={0.5} />
      </mesh>

      {/* Emitted Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particlePositions.length / 3} array={particlePositions} itemSize={3} />
          <bufferAttribute attach="attributes-phase" count={particlePhases.length} array={particlePhases} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color={state === 'DECISION' ? "#39ff14" : "#ffffff"} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

    </group>
  );
}
