import { describe, it, expect } from 'vitest';
import { propagateRK4 } from '../orbital/kepler';
import { computeBPlane } from '../orbital/bplane';
import { computeFosterPc, decomposeCovariance } from '../orbital/collision';
import { Engine } from '../orbital/OrbitalEngine';

describe('Orbital Mechanics', () => {
  it('RK4 propagates effectively', () => {
    const r = { x: 7000, y: 0, z: 0 };
    const v = { x: 0, y: 7.5, z: 0 };
    const result = propagateRK4(r, v, 100);
    expect(result.position).toBeDefined();
    
    const magR = Math.sqrt(result.position.x**2 + result.position.y**2 + result.position.z**2);
    expect(magR).toBeCloseTo(7000, 0);
  });
  
  it('B-Plane handles zero relative velocity edge case safely', () => {
    const r1 = { x: 7000, y: 0, z: 0 };
    const v1 = { x: 0, y: 7.5, z: 0 };
    const r2 = { x: 7000, y: 0, z: 0 };
    const v2 = { x: 0, y: 7.5, z: 0 }; // Exact same velocity
    
    const cov = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    
    const bp = computeBPlane(r1, v1, r2, v2, cov);
    // Should fallback or return zero vector instead of NaN
    expect(bp.mu.x).not.toBeNaN();
    expect(bp.C[0][0]).not.toBeNaN();
  });
});

describe('Numerical Stability', () => {
  it('Foster Pc handles near-singular covariance matrices', () => {
    const mu = { x: 0.1, y: 0.05 };
    const C = [
      [1e-10, 0],
      [0, 1e-10]
    ];
    const pc = computeFosterPc(mu, C, 0.05);
    // If variance is basically zero, and miss distance is 0.11 km, HBR is 0.05.
    // The objects don't overlap. Pc should be 0 safely, not Infinity or NaN.
    expect(pc).toBe(0);
  });

  it('Foster Pc handles extremely small Pc values without underflow NaN', () => {
    const mu = { x: 1000.0, y: 1000.0 }; // huge miss distance
    const C = [
      [1, 0],
      [0, 1]
    ];
    const pc = computeFosterPc(mu, C, 0.05);
    expect(pc).toBeGreaterThanOrEqual(0);
    expect(pc).toBeLessThan(1e-100);
    expect(pc).not.toBeNaN();
  });
  
  it('Foster Pc handles extremely large Pc values', () => {
    const mu = { x: 0.0, y: 0.0 }; // exact hit
    const C = [
      [1, 0],
      [0, 1]
    ];
    const pc = computeFosterPc(mu, C, 10.0); // huge HBR
    expect(pc).toBeGreaterThan(0.99);
    expect(pc).toBeLessThanOrEqual(1.0);
  });
});
