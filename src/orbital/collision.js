/**
 * Evaluates Foster's 2D Probability of Collision (Pc)
 */
export function computeFosterPc(mu, C, HBR) {
  const detC = C[0][0] * C[1][1] - C[0][1] * C[1][0];
  if (detC <= 0) return 0;
  
  const invC = [
    [C[1][1] / detC, -C[0][1] / detC],
    [-C[1][0] / detC, C[0][0] / detC]
  ];
  
  const distSq = mu.x * (invC[0][0] * mu.x + invC[0][1] * mu.y) + 
                 mu.y * (invC[1][0] * mu.x + invC[1][1] * mu.y);
  let pc = (Math.pow(HBR, 2) / (2 * Math.sqrt(detC))) * Math.exp(-0.5 * distSq);
  return Math.min(pc, 1.0);
}

/**
 * Calculates Eigenvalues and Eigenvectors of 2x2 symmetric matrix
 */
export function decomposeCovariance(C) {
  const a = C[0][0];
  const b = C[0][1];
  const c = C[1][0];
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
