import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DebrisObject({ scale = 1, position = [0, 0, 0] }) {
  const meshRef = useRef();

  // Create highly irregular, fragmented geometry
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.0, 4);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      // Add jagged displacement using simplex-like noise approximation
      const noise = Math.sin(v.x * 5) * Math.cos(v.y * 5) * Math.sin(v.z * 5);
      const randomJitter = (Math.random() - 0.5) * 0.2;
      
      // Make it look sheared and broken
      v.x *= 1.5 + noise * 0.5;
      v.y *= 0.5 + noise * 0.3;
      v.z *= 0.8 + noise * 0.4 + randomJitter;
      
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const burntMetalMaterial = new THREE.MeshStandardMaterial({
    color: '#3a3a3a',
    roughness: 0.9,
    metalness: 0.7,
    flatShading: true, // Gives it a faceted, broken look
  });

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Tumbling rotation
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.7;
      meshRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      material={burntMetalMaterial} 
      position={position} 
      scale={scale} 
      castShadow 
      receiveShadow 
    />
  );
}
