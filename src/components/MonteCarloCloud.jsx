import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

export default function MonteCarloCloud({ position, scale = 1.0, isCritical = false }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Very slow orientation drift
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.z += delta * 0.05;
    }
  });

  // Ellipsoid scales representing 1, 2, and 3 sigma bounds
  // Extruded along Z to simulate velocity vector uncertainty
  const sigma1 = [0.15, 0.15, 0.4];
  const sigma2 = [0.3, 0.3, 0.8];
  const sigma3 = [0.6, 0.6, 1.6];

  const baseColor = isCritical ? '#ff003c' : '#ffb400';

  return (
    <group position={position} scale={scale} ref={groupRef}>
      
      {/* 3 Sigma Bound (99.7%) */}
      <Sphere args={[1, 32, 32]} scale={sigma3}>
        <meshBasicMaterial color={baseColor} transparent opacity={0.1} wireframe={false} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </Sphere>
      <Text position={[0, sigma3[1] + 0.1, 0]} fontSize={0.1} color={baseColor} font="https://fonts.gstatic.com/s/firamono/v14/N0bX2SlFPv1weGeLZDtgJv7S.woff" anchorX="center" anchorY="middle">
        99.7%
      </Text>

      {/* 2 Sigma Bound (95%) */}
      <Sphere args={[1, 32, 32]} scale={sigma2}>
        <meshBasicMaterial color={baseColor} transparent opacity={0.2} wireframe={false} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </Sphere>
      <Text position={[0, sigma2[1] + 0.1, 0]} fontSize={0.08} color={baseColor} font="https://fonts.gstatic.com/s/firamono/v14/N0bX2SlFPv1weGeLZDtgJv7S.woff" anchorX="center" anchorY="middle">
        95%
      </Text>

      {/* 1 Sigma Bound (68%) */}
      <Sphere args={[1, 32, 32]} scale={sigma1}>
        <meshBasicMaterial color={baseColor} transparent opacity={0.4} wireframe={false} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </Sphere>
      <Text position={[0, sigma1[1] + 0.1, 0]} fontSize={0.06} color="#ffffff" font="https://fonts.gstatic.com/s/firamono/v14/N0bX2SlFPv1weGeLZDtgJv7S.woff" anchorX="center" anchorY="middle">
        68%
      </Text>
      
      {/* Inner Core */}
      <Sphere args={[0.05, 16, 16]}>
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </Sphere>

    </group>
  );
}
