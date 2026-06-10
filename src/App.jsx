import React, { useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

import { useStore } from './state/store';
import GlobalCameraController from './systems/cameraController';
import MainCommandDeck from './scenes/MainCommandDeck';
import SimulationChamber from './scenes/SimulationChamber';
import Environment from './components/Environment';
import CommandDeckHUD from './components/CommandDeckHUD';
import NarrativeOverlay from './components/NarrativeOverlay';



export default function App() {
  const showSimChamber = useStore((s) => s.showSimChamber);
  const scenario = useStore((s) => s.scenario);
  const immersiveMode = useStore((s) => s.immersiveMode);
  const toggleImmersive = useStore((s) => s.toggleImmersive);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' && !e.target.closest('input, select, textarea, button')) {
      e.preventDefault();
      toggleImmersive();
    }
    if (e.code === 'Escape' && immersiveMode) {
      toggleImmersive();
    }
  }, [immersiveMode, toggleImmersive]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative font-sans text-white select-none">
      {/* ═══ FULLSCREEN 3D SCENE ═══ */}
      <Canvas
        camera={{ position: [0, 2, 20], fov: 45 }}
        gl={{ 
          antialias: true, 
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3
        }}
        shadows
        dpr={[1, 2]}
      >
        <GlobalCameraController />
        <Environment />
        <MainCommandDeck />
        
        {showSimChamber && (
          <SimulationChamber
            active={showSimChamber}
            strategies={scenario.strategies}
          />
        )}

        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.2} mipmapBlur />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.001, 0.001]} radialModulation modulationOffset={0.5} />
          <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>

      {/* ═══ HTML OVERLAY LAYER ═══ */}
      <NarrativeOverlay />
      <CommandDeckHUD />
    </div>
  );
}
