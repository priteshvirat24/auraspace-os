import { useEffect, useRef } from 'react';
import { CameraControls } from '@react-three/drei';
import { useStore } from '../state/store';
import { useFrame } from '@react-three/fiber';

export default function GlobalCameraController() {
  const cameraRef = useRef();
  const orbState = useStore((s) => s.orbState);
  const immersiveMode = useStore((s) => s.immersiveMode);
  const judgeModeActive = useStore((s) => s.judgeModeActive);
  const judgeModeStep = useStore((s) => s.judgeModeStep);

  useEffect(() => {
    if (!cameraRef.current) return;

    if (judgeModeActive) {
      switch (judgeModeStep) {
        case 1: // Mission Brief (Focus Earth)
          cameraRef.current.setLookAt(0, 0, 25, 0, 0, -5, true);
          break;
        case 2: // Conjunction Detected (Focus Conjunction)
          cameraRef.current.setLookAt(-8, 3, 5, -6, -2, -16, true);
          break;
        case 3: // Risk Escalation (Zoom closer)
          cameraRef.current.setLookAt(-7, 2, 0, -6, -2, -16, true);
          break;
        case 4: // Foster Analysis (Focus B-Plane - Abstract)
          cameraRef.current.setLookAt(0, 10, 0, 0, 0, -10, true);
          break;
        case 5: // Monte Carlo Analysis (Focus Cloud)
          cameraRef.current.setLookAt(-6.5, -1.5, -14, -6, -2, -16, true);
          break;
        case 6: // AI Optimization (Focus AI Core)
          cameraRef.current.setLookAt(5, 3, 8, 7, 2, -5, true);
          break;
        case 7: // Decision Trace
          cameraRef.current.setLookAt(7, 2, 5, 7, 2, -5, true);
          break;
        case 8: // Maneuver Execution
          cameraRef.current.setLookAt(-5, 0, -10, -6, -2, -16, true);
          break;
        case 9: // Risk Reduction
          cameraRef.current.setLookAt(-8, 3, 5, -6, -2, -16, true);
          break;
        case 10: // Mission Safe (Focus Satellite)
          cameraRef.current.setLookAt(-5.5, -1.8, -15.5, -6, -2, -16, true);
          break;
        default:
          break;
      }
    } else if (orbState === 'THINKING') {
      cameraRef.current.setLookAt(5, 3, 8, 7, 2, -5, true);
    } else if (immersiveMode) {
      cameraRef.current.setLookAt(0, 2, 16, 0, 0, -2, true);
    } else {
      cameraRef.current.setLookAt(0, 2, 20, 0, 0, 0, true);
    }
  }, [orbState, immersiveMode, judgeModeActive, judgeModeStep]);

  useFrame((state, delta) => {
    if (cameraRef.current) {
      if (judgeModeActive && judgeModeStep === 10) {
        // Cinematic flyby: smoothly truck around the satellite
        cameraRef.current.truck(delta * 0.2, delta * 0.1, false);
        cameraRef.current.rotate(delta * 0.08, 0, false);
      } else if (orbState === 'IDLE' && !immersiveMode && !judgeModeActive) {
        cameraRef.current.rotate(delta * 0.015, Math.sin(state.clock.elapsedTime * 0.5) * delta * 0.01, false);
      }
    }
  });

  return <CameraControls ref={cameraRef} makeDefault smoothTime={1.5} maxSpeed={0.5} />;
}

