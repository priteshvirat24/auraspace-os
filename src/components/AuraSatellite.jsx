import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

export default function AuraSatellite({ scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const groupRef = useRef();

  // Advanced PBR Materials
  const goldKapton = new THREE.MeshStandardMaterial({
    color: '#e6ac00',
    roughness: 0.4,
    metalness: 0.8,
    bumpScale: 0.05,
  });

  const spaceAluminum = new THREE.MeshStandardMaterial({
    color: '#d0d0d0',
    roughness: 0.3,
    metalness: 0.9,
  });
  
  const radiatorMaterial = new THREE.MeshStandardMaterial({
    color: '#f0f0f0',
    roughness: 0.8,
    metalness: 0.1,
  });

  const solarCell = new THREE.MeshStandardMaterial({
    color: '#020b1f',
    roughness: 0.1,
    metalness: 0.7,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const sensorGlass = new THREE.MeshPhysicalMaterial({
    color: '#000000',
    metalness: 0.9,
    roughness: 0.05,
    envMapIntensity: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.9
  });

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Very slow nadir pointing drift
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      
      {/* 1. Core Bus Assembly (Hexagonal) */}
      <Cylinder args={[0.5, 0.5, 1.5, 6]} material={goldKapton} castShadow receiveShadow />
      
      {/* 2. Top Payload Deck & Radiators */}
      <Cylinder args={[0.5, 0.5, 0.1, 6]} position={[0, 0.8, 0]} material={spaceAluminum} castShadow receiveShadow />
      <Box args={[0.8, 0.05, 0.8]} position={[0, 0.85, 0]} material={radiatorMaterial} />
      
      {/* 3. Primary Earth-pointing Dish Antenna */}
      <group position={[0, 1.0, 0]} rotation={[Math.PI, 0, 0]}>
        <Sphere args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI/2]} scale={[1, 0.3, 1]} material={spaceAluminum} />
        {/* Antenna Feed Horn */}
        <Cylinder args={[0.01, 0.01, 0.3, 8]} position={[0, -0.2, 0]} material={spaceAluminum} />
        <Sphere args={[0.03, 16, 16]} position={[0, -0.35, 0]} material={spaceAluminum} />
        {/* Support Struts */}
        <Cylinder args={[0.005, 0.005, 0.35, 4]} position={[0.15, -0.15, 0]} rotation={[0, 0, Math.PI/6]} material={spaceAluminum} />
        <Cylinder args={[0.005, 0.005, 0.35, 4]} position={[-0.15, -0.15, 0]} rotation={[0, 0, -Math.PI/6]} material={spaceAluminum} />
        <Cylinder args={[0.005, 0.005, 0.35, 4]} position={[0, -0.15, 0.15]} rotation={[-Math.PI/6, 0, 0]} material={spaceAluminum} />
        <Cylinder args={[0.005, 0.005, 0.35, 4]} position={[0, -0.15, -0.15]} rotation={[Math.PI/6, 0, 0]} material={spaceAluminum} />
      </group>

      {/* Secondary Antennas (X-Band / S-Band) */}
      <Cylinder args={[0.02, 0.02, 0.4, 8]} position={[0.3, 0.9, 0.3]} rotation={[0.2, 0, 0.2]} material={spaceAluminum} />
      <Cylinder args={[0.02, 0.02, 0.4, 8]} position={[-0.3, 0.9, -0.3]} rotation={[-0.2, 0, -0.2]} material={spaceAluminum} />

      {/* 4. Solar Array Wings */}
      {[-1, 1].map((side, index) => (
        <group key={index} position={[side * 0.6, 0, 0]}>
          {/* Drive Mechanism & Yoke */}
          <Cylinder args={[0.08, 0.08, 0.3, 16]} rotation={[0, 0, Math.PI/2]} material={spaceAluminum} />
          <Box args={[0.4, 0.1, 0.1]} position={[side * 0.2, 0, 0]} material={spaceAluminum} />
          
          {/* Main Array Panel */}
          <Box args={[3.0, 1.0, 0.02]} position={[side * 1.8, 0, 0]} material={solarCell} />
          {/* Solar Cell Grid Lines */}
          <Box args={[3.0, 0.02, 0.025]} position={[side * 1.8, 0.25, 0]} material={spaceAluminum} />
          <Box args={[3.0, 0.02, 0.025]} position={[side * 1.8, -0.25, 0]} material={spaceAluminum} />
          {[0.6, 1.4, 2.2, 3.0].map((x, i) => (
             <Box key={i} args={[0.02, 1.0, 0.025]} position={[side * x, 0, 0]} material={spaceAluminum} />
          ))}
        </group>
      ))}
      
      {/* 5. Star Trackers & Optical Sensors */}
      <group position={[0, -0.4, 0.45]}>
        <Box args={[0.2, 0.2, 0.2]} material={spaceAluminum} />
        {/* Star Tracker 1 */}
        <Cylinder args={[0.06, 0.04, 0.15, 16]} position={[0.05, 0, 0.15]} rotation={[Math.PI/2, Math.PI/8, 0]} material={spaceAluminum} />
        <Cylinder args={[0.03, 0.03, 0.02, 16]} position={[0.07, 0, 0.22]} rotation={[Math.PI/2, Math.PI/8, 0]} material={sensorGlass} />
        {/* Star Tracker 2 */}
        <Cylinder args={[0.06, 0.04, 0.15, 16]} position={[-0.05, 0, 0.15]} rotation={[Math.PI/2, -Math.PI/8, 0]} material={spaceAluminum} />
        <Cylinder args={[0.03, 0.03, 0.02, 16]} position={[-0.07, 0, 0.22]} rotation={[Math.PI/2, -Math.PI/8, 0]} material={sensorGlass} />
      </group>
      
      {/* 6. Propulsion Deck (Aft) */}
      <Cylinder args={[0.45, 0.45, 0.1, 6]} position={[0, -0.8, 0]} material={spaceAluminum} />
      {/* Main Engine Nozzle */}
      <Cylinder args={[0.1, 0.2, 0.3, 16]} position={[0, -1.0, 0]} material={spaceAluminum} />
      {/* RCS Thruster Pods */}
      {[0, Math.PI/2, Math.PI, 3*Math.PI/2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]} position={[0.4, -0.75, 0]}>
          <Box args={[0.1, 0.1, 0.1]} material={spaceAluminum} />
          <Cylinder args={[0.02, 0.04, 0.05, 8]} position={[0.05, 0, 0]} rotation={[0, 0, Math.PI/2]} material={spaceAluminum} />
          <Cylinder args={[0.02, 0.04, 0.05, 8]} position={[0, -0.05, 0]} material={spaceAluminum} />
        </group>
      ))}

      {/* Thermal Blanket Details (Torus strips around bus) */}
      {[0.4, 0, -0.4].map((y, i) => (
        <Torus key={i} args={[0.48, 0.02, 8, 24]} position={[0, y, 0]} rotation={[Math.PI/2, 0, 0]} material={spaceAluminum} />
      ))}
    </group>
  );
}
