import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { propagateTLE } from '../orbital/sgp4';
import { Engine } from '../orbital/OrbitalEngine';
import AuraSatellite from './AuraSatellite';
import DebrisObject from './DebrisObject';

function generateOrbitPath(tle1, tle2, hours, steps) {
  const points = [];
  const TARGET_DATE = new Date('2026-06-10T12:00:00Z');
  const startMs = TARGET_DATE.getTime() - (hours/2)*3600*1000;
  for (let i=0; i<=steps; i++) {
    const d = new Date(startMs + (hours * 3600 * 1000 * i) / steps);
    const state = propagateTLE(tle1, tle2, d);
    if (state && state.position) {
      points.push(new THREE.Vector3(state.position.x/1000, state.position.y/1000, state.position.z/1000));
    }
  }
  return points;
}

import { useStore } from '../state/store';

import MonteCarloCloud from './MonteCarloCloud';

export default function Globe3D({ scenario }) {
  const earthGroupRef = useRef();
  const cloudsRef = useRef();
  const judgeModeStep = useStore(s => s.judgeModeStep);
  const lightingMode = useStore(s => s.lightingMode);
  const engineState = useStore(s => s.engineState);

  const [colorMap, normalMap, specularMap, cloudsMap, nightMap] = useTexture([
    '/textures/earth_diffuse.jpg',
    '/textures/earth_normal.jpg',
    '/textures/earth_specular.jpg',
    '/textures/earth_clouds.png',
    '/textures/earth_night.png'
  ]);

  useFrame((state, delta) => {
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += delta * 0.02;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.025;
    }

    if (customMaterialRef.current?.userData?.shader) {
      const isCinematic = lightingMode === 'CINEMATIC';
      const targetSunDir = isCinematic 
        ? new THREE.Vector3(-20, 5, -15).normalize() 
        : new THREE.Vector3(-10, 5, 10).normalize();
      
      customMaterialRef.current.userData.shader.uniforms.sunDirection.value.lerp(targetSunDir, delta * 2);
      customMaterialRef.current.userData.shader.uniforms.viewVector.value.copy(state.camera.position).normalize();
    }
    
    if (cloudsRef.current?.material?.userData?.shader) {
      const isCinematic = lightingMode === 'CINEMATIC';
      const targetSunDir = isCinematic 
        ? new THREE.Vector3(-20, 5, -15).normalize() 
        : new THREE.Vector3(-10, 5, 10).normalize();
      cloudsRef.current.material.userData.shader.uniforms.sunDirection.value.lerp(targetSunDir, delta * 2);
    }
  });

  const orbit1 = React.useMemo(() => generateOrbitPath(scenario.tlePrimary[0], scenario.tlePrimary[1], 2, 200), [scenario]);
  const orbit2 = React.useMemo(() => generateOrbitPath(scenario.tleChaser[0], scenario.tleChaser[1], 2, 200), [scenario]);

  const baseState1 = Engine.baseState1;
  const baseState2 = Engine.baseState2;

  const isDanger = judgeModeStep >= 4 && judgeModeStep < 9;

  // Custom shader logic to mix day and night maps based on light direction
  const customMaterialRef = useRef();

  return (
    <group ref={earthGroupRef} scale={1.8} rotation={[0.2, 0, 0]}>
      
      {/* AAA Photorealistic Earth Core */}
      <mesh>
        <sphereGeometry args={[6.3, 128, 128]} />
        <meshStandardMaterial 
          ref={customMaterialRef}
          map={colorMap}
          normalMap={normalMap}
          normalScale={[1.5, 1.5]}
          roughnessMap={specularMap}
          roughness={0.7}
          metalness={0.1}
          onBeforeCompile={(shader) => {
            shader.uniforms.tNight = { value: nightMap };
            shader.uniforms.tSpecular = { value: specularMap };
            shader.uniforms.sunDirection = { value: new THREE.Vector3(-10, 5, 10).normalize() };
            shader.uniforms.viewVector = { value: new THREE.Vector3(0, 0, 1) };
            customMaterialRef.current.userData.shader = shader;
            
            shader.fragmentShader = `
              uniform sampler2D tNight;
              uniform sampler2D tSpecular;
              uniform vec3 sunDirection;
              uniform vec3 viewVector;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
              `#include <emissivemap_fragment>`,
              `
              #include <emissivemap_fragment>
              vec3 sunDir = normalize(sunDirection);
              float intensity = dot(vNormal, sunDir);
              float dayMix = smoothstep(-0.2, 0.2, intensity);
              
              // Night City Lights
              vec4 nightColor = texture2D(tNight, vMapUv);
              vec3 crushedNight = pow(nightColor.rgb, vec3(2.0));
              vec3 cityLights = crushedNight * vec3(1.0, 0.75, 0.3) * 15.0; 
              totalEmissiveRadiance += cityLights * (1.0 - dayMix);

              // Ocean Specular Mask
              vec4 specMap = texture2D(tSpecular, vMapUv);
              float isOcean = specMap.r; 

              // Ocean Fresnel
              float fresnelOcean = pow(1.0 - max(dot(vNormal, normalize(viewVector)), 0.0), 5.0);
              vec3 oceanReflection = vec3(0.05, 0.2, 0.5) * fresnelOcean * isOcean * dayMix * 3.0;
              
              // Dynamic Sun Glint
              vec3 halfVector = normalize(sunDir + normalize(viewVector));
              float NdotH = max(0.0, dot(vNormal, halfVector));
              float sunGlint = pow(NdotH, 150.0) * isOcean * dayMix * 10.0;

              totalEmissiveRadiance += oceanReflection + vec3(sunGlint);
              `
            );
          }}
        />
      </mesh>

      {/* High-Res Volumetric Clouds */}
      <mesh ref={cloudsRef} scale={1.012} receiveShadow castShadow>
        <sphereGeometry args={[6.3, 128, 128]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.85}
          blending={THREE.NormalBlending}
          depthWrite={false}
          side={THREE.FrontSide}
          roughness={1.0}
          onBeforeCompile={(shader) => {
            shader.uniforms.sunDirection = { value: new THREE.Vector3(-10, 5, 10).normalize() };
            cloudsRef.current.material.userData.shader = shader;
            
            shader.fragmentShader = `
              uniform vec3 sunDirection;
            ` + shader.fragmentShader;
            
            shader.fragmentShader = shader.fragmentShader.replace(
              `gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
              `
              // Cloud self-shadowing & terminator fade
              float lightDot = dot(vNormal, normalize(sunDirection));
              float cloudShadow = smoothstep(-0.1, 0.3, lightDot);
              vec3 finalCloudLight = outgoingLight * (0.1 + 0.9 * cloudShadow);
              gl_FragColor = vec4(finalCloudLight, diffuseColor.a);
              `
            );
          }}
        />
      </mesh>

      {/* Advanced Atmospheric Scattering (Rayleigh/Mie approximation) */}
      <Sphere args={[6.45, 64, 64]}>
        <shaderMaterial
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
               vNormal = normalize(normalMatrix * normal);
               vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
               vViewPosition = -mvPosition.xyz;
               gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
              vec3 viewDir = normalize(vViewPosition);
              // Thinner, but vibrant NASA blue rim
              float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.5);
              
              vec3 atmColor = vec3(0.05, 0.45, 1.0);
              gl_FragColor = vec4(atmColor, fresnel * 2.5);
            }
          `}
        />
      </Sphere>
      
      {/* Cinematic Glowing Orbit Trails */}
      <Line 
        points={orbit1} 
        color="#00f0ff" 
        lineWidth={2} 
        transparent 
        opacity={0.2} 
        toneMapped={false} 
      />
      <Line 
        points={orbit2} 
        color={scenario.tier === 'Critical' ? '#ff003c' : '#ffb400'} 
        lineWidth={2} 
        opacity={0.3} 
        transparent 
        toneMapped={false} 
      />

      {/* AAA Hero Satellites / Debris Models */}
      {baseState1?.position && (
        <group position={[baseState1.position.x/1000, baseState1.position.y/1000, baseState1.position.z/1000]}>
          <AuraSatellite scale={0.06} />
        </group>
      )}
      
      {baseState2?.position && (
        <group position={[baseState2.position.x/1000, baseState2.position.y/1000, baseState2.position.z/1000]}>
          <DebrisObject scale={0.04} />
          
          {engineState?.isSingular && (
            <MonteCarloCloud position={[0, 0, 0]} count={10000} isCritical={scenario.tier === 'Critical'} />
          )}

          {/* Danger Glow (Intensifies during Cinematic) */}
          <Sphere args={[isDanger ? 0.2 : 0.1, 16, 16]}>
             <meshBasicMaterial color={scenario.tier === 'Critical' ? '#ff003c' : '#ffb400'} transparent opacity={isDanger ? 0.6 : 0.2} toneMapped={false} />
          </Sphere>
          {isDanger && (
            <pointLight color="#ff003c" intensity={15} distance={5} />
          )}
        </group>
      )}

      {/* Cinematic Risk Corridor & TCA Visualization */}
      {isDanger && baseState1?.position && baseState2?.position && (() => {
        const pcValue = engineState?.Pc || 1e-6;
        // Normalize log(Pc) between 1e-6 (0.0) and 1e-2 (1.0)
        const normalizedRisk = Math.min(Math.max(Math.log10(pcValue) + 6, 0) / 4, 1);
        
        const corridorColor = new THREE.Color().lerpColors(
          new THREE.Color('#ffb400'), // Amber
          new THREE.Color('#ff003c'), // Red
          normalizedRisk
        ).getHexString();
        
        const corridorWidth = 1.0 + (normalizedRisk * 6.0); // Scales from 1.0 to 7.0

        return (
          <group>
            <Line 
              points={[
                [baseState1.position.x/1000, baseState1.position.y/1000, baseState1.position.z/1000],
                [baseState2.position.x/1000, baseState2.position.y/1000, baseState2.position.z/1000]
              ]} 
              color={`#${corridorColor}`} 
              lineWidth={corridorWidth} 
              transparent 
              opacity={0.8 + (normalizedRisk * 0.2)} 
              toneMapped={false} 
            />
          <Sphere position={[
              (baseState1.position.x/1000 + baseState2.position.x/1000) / 2,
              (baseState1.position.y/1000 + baseState2.position.y/1000) / 2,
              (baseState1.position.z/1000 + baseState2.position.z/1000) / 2
            ]} args={[0.05, 8, 8]}>
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.5} />
          </Sphere>
          {baseState2?.velocity && (
            <Line 
              points={[
                [baseState2.position.x/1000, baseState2.position.y/1000, baseState2.position.z/1000],
                [
                  baseState2.position.x/1000 + baseState2.velocity.x/200, 
                  baseState2.position.y/1000 + baseState2.velocity.y/200, 
                  baseState2.position.z/1000 + baseState2.velocity.z/200
                ]
              ]} 
              color="#ffb400" 
              lineWidth={1.5} 
              transparent 
              opacity={0.9} 
              toneMapped={false} 
            />
          )}
        </group>
        );
      })()}
    </group>
  );
}
