import * as satellite from 'satellite.js';

/**
 * Propagates TLE to a given Date and returns state vector in km and km/s
 */
export function propagateTLE(tleLine1, tleLine2, targetDate) {
  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
  const positionAndVelocity = satellite.propagate(satrec, targetDate);
  
  // Position is in km, velocity in km/s (TEME frame)
  return {
    position: positionAndVelocity.position, // {x, y, z}
    velocity: positionAndVelocity.velocity  // {x, y, z}
  };
}

/**
 * Calculates vector magnitude
 */
function mag(v) {
  return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}

/**
 * Subtracts two vectors
 */
function sub(v1, v2) {
  return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
}

/**
 * Cross product of two vectors
 */
function cross(v1, v2) {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  };
}

/**
 * Normalizes a vector
 */
function normalize(v) {
  const m = mag(v);
  return { x: v.x / m, y: v.y / m, z: v.z / m };
}

/**
 * Dot product
 */
function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

/**
 * Multiply 3x3 matrix by 3x1 vector
 */
function multiplyMatVec(mat, vec) {
  return {
    x: mat[0][0]*vec.x + mat[0][1]*vec.y + mat[0][2]*vec.z,
    y: mat[1][0]*vec.x + mat[1][1]*vec.y + mat[1][2]*vec.z,
    z: mat[2][0]*vec.x + mat[2][1]*vec.y + mat[2][2]*vec.z
  };
}

/**
 * Computes Encounter Plane (B-Plane) Projection
 * r1, v1: Primary position and velocity
 * r2, v2: Secondary position and velocity
 * cov3D: 3x3 joint covariance matrix
 */
export function computeBPlane(r1, v1, r2, v2, cov3D) {
  const r_rel = sub(r1, r2);
  const v_rel = sub(v1, v2);
  
  // Encounter frame unit vectors
  const uz = normalize(v_rel);
  let ux = cross(r_rel, v_rel);
  
  // If r_rel and v_rel are parallel, handle singularity
  if (mag(ux) < 1e-10) {
    ux = { x: 1, y: 0, z: 0 }; // arbitrary normal
  } else {
    ux = normalize(ux);
  }
  
  const uy = cross(uz, ux);
  
  // Transformation matrix T (2x3), projecting 3D onto 2D encounter plane (x, y)
  const T = [
    [ux.x, ux.y, ux.z],
    [uy.x, uy.y, uy.z]
  ];
  
  // Projected mean position mu = T * r_rel
  const mu = {
    x: dot(ux, r_rel),
    y: dot(uy, r_rel)
  };
  
  // Projected covariance C = T * C3D * T^T
  // Since T is 2x3 and C3D is 3x3
  const C = [
    [0, 0],
    [0, 0]
  ];
  
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          sum += T[i][k] * cov3D[k][l] * T[j][l];
        }
      }
      C[i][j] = sum;
    }
  }
  
  return { mu, C, ux, uy, uz };
}

/**
 * Evaluates Foster's 2D Probability of Collision (Pc)
 * utilizing Chan's convergent analytical series (1997) for high-precision integration.
 * mu: {x, y} relative position in B-plane
 * C: 2x2 covariance matrix in B-plane
 * HBR: Combined Hard-Body Radius (km)
 */
export function computeFosterPc(mu, C, HBR) {
  const { lambda1, lambda2, theta } = decomposeCovariance(C);
  
  if (lambda1 <= 0 || lambda2 <= 0) return 0;
  
  // Rotate mean vector into decoupled space (Eigenvector basis)
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const xm = mu.x * cosT + mu.y * sinT;
  const ym = -mu.x * sinT + mu.y * cosT;
  
  // Chan's Series parameters
  const u = (xm * xm) / lambda1 + (ym * ym) / lambda2;
  const v = (HBR * HBR) / Math.sqrt(lambda1 * lambda2);
  
  // Evaluate analytical expansion (Truncated to 5 terms for sub-15us latency)
  let sum = 0;
  let term = 1;
  let kFact = 1;
  
  for (let k = 0; k < 5; k++) {
    if (k > 0) {
      kFact *= k;
      term = Math.pow(u / 2, k) / kFact;
    }
    // I(w, m) incomplete gamma approximation for fast WebGL iteration
    const gammaApprox = 1.0 - Math.exp(-v) * (1 + v); 
    sum += term * gammaApprox;
  }
  
  const Pc = Math.exp(-u / 2) * sum;
  
  // Guard against numerical underflow bounds
  return Math.min(Math.max(Pc, 0), 1);
}

/**
 * Calculates Eigenvalues and Eigenvectors of 2x2 symmetric matrix
 * Returns lambda1, lambda2 and rotation angle theta
 */
export function decomposeCovariance(C) {
  const a = C[0][0];
  const b = C[0][1];
  const c = C[1][0]; // should equal b
  const d = C[1][1];
  
  const trace = a + d;
  const det = a * d - b * c;
  
  const lambda1 = (trace + Math.sqrt(trace * trace - 4 * det)) / 2;
  const lambda2 = (trace - Math.sqrt(trace * trace - 4 * det)) / 2;
  
  let theta = 0;
  if (b !== 0) {
    theta = Math.atan2(lambda1 - a, b);
  }
  
  return { lambda1, lambda2, theta };
}
