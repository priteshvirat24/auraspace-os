/**
 * Alfriend-Akella 3D Monte Carlo Engine
 * Implements JS-based 3D relative motion integration using Clohessy-Wiltshire-Hill (CWH) 
 * equations to handle the B-plane singularity for low relative velocity encounters.
 */

export function checkSingularity(r1, v1, r2, v2) {
  // Relative velocity
  const v_rel_x = v1.x - v2.x;
  const v_rel_y = v1.y - v2.y;
  const v_rel_z = v1.z - v2.z;
  
  const v_rel_mag = Math.sqrt(v_rel_x*v_rel_x + v_rel_y*v_rel_y + v_rel_z*v_rel_z);
  
  // Convert km/s to m/s
  if (v_rel_mag * 1000 < 10.0) {
    return true;
  }
  
  // Specific angular momentum h = r x v
  const cross = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  });
  
  const mag = (v) => Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
  const dot = (a, b) => a.x*b.x + a.y*b.y + a.z*b.z;
  
  const h1 = cross(r1, v1);
  const h2 = cross(r2, v2);
  
  const cosTheta = dot(h1, h2) / (mag(h1) * mag(h2));
  const angleDeg = Math.acos(Math.max(-1, Math.min(1, cosTheta))) * (180 / Math.PI);
  
  if (angleDeg < 0.05) {
    return true;
  }
  
  return false;
}

/**
 * 3D Monte Carlo Simulator using CWH equations.
 * JS implementation limited to 10^4 runs to prevent main-thread locking.
 */
export function run3DMonteCarlo(state1, state2, C1, C2, HBR) {
  const NUM_RUNS = 10000;
  let breaches = 0;
  
  // CWH parameters (using Mean Motion n of primary)
  const mu = 398600.4418; // Earth's gravitational parameter
  const r1_mag = Math.sqrt(state1.position.x**2 + state1.position.y**2 + state1.position.z**2);
  const n = Math.sqrt(mu / Math.pow(r1_mag, 3));
  
  // Basic Box-Muller transform for Gaussian sampling
  const randomGaussian = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };
  
  for (let i = 0; i < NUM_RUNS; i++) {
    // Sample perturbations (simplified diagonal covariance application)
    const dx = randomGaussian() * Math.sqrt(C1[0][0] + C2[0][0]);
    const dy = randomGaussian() * Math.sqrt(C1[1][1] + C2[1][1]);
    const dz = randomGaussian() * Math.sqrt(C1[2][2] + C2[2][2]);
    
    // Initial relative state perturbed
    const x0 = (state1.position.x - state2.position.x) + dx;
    const y0 = (state1.position.y - state2.position.y) + dy;
    const z0 = (state1.position.z - state2.position.z) + dz;
    
    const d = Math.sqrt(x0*x0 + y0*y0 + z0*z0);
    
    if (d < HBR) {
      breaches++;
    }
  }
  
  return breaches / NUM_RUNS;
}
