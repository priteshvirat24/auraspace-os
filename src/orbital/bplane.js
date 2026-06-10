function mag(v) { return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z); }
function sub(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z }; }
function cross(v1, v2) {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  };
}
function normalize(v) {
  const m = mag(v);
  if (m < 1e-12) return { x: 1, y: 0, z: 0 }; // Fallback to avoid NaN
  return { x: v.x / m, y: v.y / m, z: v.z / m };
}
function dot(v1, v2) { return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z; }

/**
 * Computes Encounter Plane (B-Plane) Projection
 */
export function computeBPlane(r1, v1, r2, v2, cov3D) {
  const r_rel = sub(r1, r2);
  const v_rel = sub(v1, v2);
  
  const uz = normalize(v_rel);
  let ux = cross(r_rel, v_rel);
  
  if (mag(ux) < 1e-10) {
    // If r_rel is parallel to v_rel or one is zero
    ux = { x: 0, y: 1, z: 0 }; // Safe perpendicular fallback
  } else {
    ux = normalize(ux);
  }
  const uy = cross(uz, ux);
  
  const T = [
    [ux.x, ux.y, ux.z],
    [uy.x, uy.y, uy.z]
  ];
  
  const mu = {
    x: dot(ux, r_rel),
    y: dot(uy, r_rel)
  };
  
  const C = [[0, 0], [0, 0]];
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
