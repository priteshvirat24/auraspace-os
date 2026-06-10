import React, { useRef } from 'react';
import { useStore } from '../state/store';
import Globe3D from '../components/Globe3D';
import QuantumOrb from '../components/QuantumOrb';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function CinematicLighting({ judgeModeStep, lightingMode }) {
  const dirLight = useRef();
  const ambLight = useRef();

  useFrame((state, delta) => {
    const isDanger = judgeModeStep >= 4 && judgeModeStep < 9;
    const isCinematic = lightingMode === 'CINEMATIC';
    
    const targetSun = isDanger ? 0.2 : (isCinematic ? 3.0 : 2.5);
    const targetAmb = isDanger ? 0.01 : (isCinematic ? 0.05 : 0.1);
    const targetPos = isCinematic ? new THREE.Vector3(-20, 5, -15) : new THREE.Vector3(-10, 5, 10);

    if (dirLight.current) {
      dirLight.current.intensity = THREE.MathUtils.lerp(dirLight.current.intensity, targetSun, delta * 2);
      dirLight.current.position.lerp(targetPos, delta * 2);
    }
    if (ambLight.current) {
      ambLight.current.intensity = THREE.MathUtils.lerp(ambLight.current.intensity, targetAmb, delta * 2);
    }
  });

  return (
    <>
      <ambientLight ref={ambLight} intensity={0.1} color="#020412" />
      <directionalLight 
        ref={dirLight}
        position={[-10, 5, 10]}
        intensity={1.5} 
        color="#ffffff" 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
    </>
  );
}

export default function MainCommandDeck() {
  const orbState = useStore((s) => s.orbState);
  const scenario = useStore((s) => s.scenario);
  const immersiveMode = useStore((s) => s.immersiveMode);
  const judgeModeStep = useStore((s) => s.judgeModeStep);
  const lightingMode = useStore((s) => s.lightingMode);

  return (
    <>
      <CinematicLighting judgeModeStep={judgeModeStep} lightingMode={lightingMode} />

      {/* Earth — 1.5x scale, balanced composition */}
      <group position={immersiveMode ? [0, -3, -12] : [-6, -2, -16]}>
        <Globe3D scenario={scenario} />
      </group>

      {/* Quantum Orb — shifts right normally, centers in immersive */}
      <group position={immersiveMode ? [0, 3, -3] : [7, 2, -5]}>
        <QuantumOrb state={orbState} />
      </group>
    </>
  );
}
