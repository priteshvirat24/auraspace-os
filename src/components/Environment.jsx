import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from '../shaders/particles';
import { nebulaVertexShader, nebulaFragmentShader } from '../shaders/nebula';

export default function Environment() {
  const particlesRef = useRef();
  const nebulaRef = useRef();
  
  // Far Stars Layer (Static)
  const [farStars] = useMemo(() => {
    const pos = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 600;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 600;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 600;
    }
    return [pos];
  }, []);

  // Near Stars Layer (Parallax)
  const [nearStars] = useMemo(() => {
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return [pos];
  }, []);

  // Space Dust (Current Shader Particles)
  const [dustPos, dustSizes, dustPhases] = useMemo(() => {
    const pos = new Float32Array(15000 * 3);
    const size = new Float32Array(15000);
    const phase = new Float32Array(15000);
    for (let i = 0; i < 15000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
      size[i] = Math.random() * 0.15 + 0.02;
      phase[i] = Math.random() * Math.PI * 2;
    }
    return [pos, size, phase];
  }, []);

  const uniforms = useMemo(() => ({
    time: { value: 0 }
  }), []);

  const farStarsRef = useRef();
  const nearStarsRef = useRef();

  useFrame((state) => {
    uniforms.time.value = state.clock.elapsedTime;
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
    if (nearStarsRef.current) {
      nearStarsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
    if (farStarsRef.current) {
      farStarsRef.current.rotation.y = state.clock.elapsedTime * 0.001;
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <group>
      <color attach="background" args={['#050212']} />
      
      <Sphere ref={nebulaRef} args={[80, 64, 64]} rotation={[0, 0, Math.PI / 6]}>
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
          vertexShader={nebulaVertexShader}
          fragmentShader={nebulaFragmentShader}
        />
      </Sphere>

      {/* Far Stars Layer */}
      <points ref={farStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={3000} array={farStars} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.5} sizeAttenuation={true} toneMapped={false} />
      </points>

      {/* Near Stars Layer */}
      <points ref={nearStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={1500} array={nearStars} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.2} color="#b3e5fc" transparent opacity={0.8} sizeAttenuation={true} toneMapped={false} />
      </points>

      {/* Drifting Space Dust */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={15000} array={dustPos} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={15000} array={dustSizes} itemSize={1} />
          <bufferAttribute attach="attributes-phase" count={15000} array={dustPhases} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
        />
      </points>
    </group>
  );
}
