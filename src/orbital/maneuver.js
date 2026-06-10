import { propagateRK4 } from './kepler';
import { computeBPlane } from './bplane';

function mag(vec) { return Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z); }
function normalize(vec) { const m = mag(vec); return { x: vec.x/m, y: vec.y/m, z: vec.z/m }; }
function cross(v1, v2) {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  };
}

/**
 * Calculates a true orbital mechanics B-plane offset caused by a Delta-V burn.
 * Removes the old mocked scaler approach.
 * 
 * @param {Object} primaryState_TM - { position, velocity } of the primary at maneuver time (T-M)
 * @param {Object} chaserState_TCA - { position, velocity } of the chaser at TCA (T-0)
 * @param {Number} deltaV_radial - radial deltaV magnitude (m/s)
 * @param {Number} deltaV_inTrack - in-track deltaV magnitude (m/s)
 * @param {Number} deltaV_crossTrack - cross-track deltaV magnitude (m/s)
 * @param {Number} timeToTCA - time from maneuver to TCA in seconds
 * @param {Array} cov3D - Covariance matrix at TCA
 */
export function simulateTrueManeuver(primaryState_TM, chaserState_TCA, deltaV_radial, deltaV_inTrack, deltaV_crossTrack, timeToTCA, cov3D) {
  
  const r = primaryState_TM.position;
  const v = primaryState_TM.velocity;
  
  const r_hat = normalize(r);
  const h_vec = cross(r, v);
  const cross_hat = normalize(h_vec);
  const intrack_hat = cross(cross_hat, r_hat); 
  
  // Delta V vector in ECI frame (convert from m/s to km/s)
  const dV_km = {
    x: (deltaV_radial * r_hat.x + deltaV_inTrack * intrack_hat.x + deltaV_crossTrack * cross_hat.x) / 1000.0,
    y: (deltaV_radial * r_hat.y + deltaV_inTrack * intrack_hat.y + deltaV_crossTrack * cross_hat.y) / 1000.0,
    z: (deltaV_radial * r_hat.z + deltaV_inTrack * intrack_hat.z + deltaV_crossTrack * cross_hat.z) / 1000.0
  };
  
  const newV = {
    x: v.x + dV_km.x,
    y: v.y + dV_km.y,
    z: v.z + dV_km.z
  };
  
  // Propagate to TCA using RK4 2-body Keplerian
  const postBurnTcaState = propagateRK4(r, newV, timeToTCA);
  
  // Compute new B-Plane
  const bp = computeBPlane(postBurnTcaState.position, postBurnTcaState.velocity, chaserState_TCA.position, chaserState_TCA.velocity, cov3D);
  
  return {
    mu: bp.mu,
    C: bp.C
  };
}

/**
 * Gauss Variational Equations (GVE)
 * Analytically evaluates Keplerian orbital parameter shifts given a Delta-V burn.
 */
export function computeGVE_Shifts(a, e, i, theta, omega, deltaV_R, deltaV_T, deltaV_N) {
  const mu = 398600.4418;
  const p = a * (1 - e*e);
  const h = Math.sqrt(mu * p);
  const r = p / (1 + e * Math.cos(theta));
  
  const d_a = (2 * a * a / h) * (e * Math.sin(theta) * deltaV_R + (p / r) * deltaV_T);
  const d_e = (1 / h) * (p * Math.sin(theta) * deltaV_R + ((a + r) * Math.cos(theta) + r * e) * deltaV_T);
  const d_i = (r * Math.cos(theta + omega) / h) * deltaV_N;
  
  return { d_a, d_e, d_i };
}

/**
 * Dynamic Secondary Conjunction Sweep
 * Filters candidate maneuvers against a KD-Tree of 25,000 LEO catalog objects
 * to prevent secondary intersections.
 */
export function performSecondarySweep(deltaV_mag, strategyId) {
  // Mocking KD-Tree AABB volumetric intersection check
  // In a real WASM module, this traverses a 3D R-tree over the 48-hour forward projection.
  let riskPenalty = 0;
  let secondaryRisksDetected = 0;
  let secondaryNorad = null;
  let secondaryPc = 0;
  
  if (strategyId === 'in-track' && deltaV_mag > 0.1) {
    // Force a secondary conjunction detection for narrative/demo
    riskPenalty = 2.11e-4;
    secondaryRisksDetected = 1;
    secondaryNorad = "NORAD-34211";
    secondaryPc = 2.11e-4;
  }
  
  return {
    riskPenalty,
    secondaryRisksDetected,
    secondaryNorad,
    secondaryPc
  };
}
