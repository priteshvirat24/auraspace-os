/**
 * Extended Kalman Filter (EKF) and Information Gain module
 * Implements covariance shrinkage using simulated ground radar / optical cross-links.
 */

/**
 * Perform EKF state covariance update based on measurement z_k
 * Returns the updated covariance matrix C_k
 */
export function updateCovarianceEKF(C_prior, R_noise) {
  // Simplified EKF update for 3D positional covariance
  // In a full implementation, this uses H_k (Jacobian of measurement model).
  // For this web implementation, we assume direct measurement of position
  // so H_k is a 3x3 identity matrix.
  
  const C_post = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === j) {
        const denom = C_prior[i][i] + R_noise[i][i];
        const K = denom > 0 ? C_prior[i][i] / denom : 0;
        C_post[i][i] = (1 - K) * C_prior[i][i];
      } else {
        C_post[i][j] = C_prior[i][j] * 0.5; 
      }
    }
  }
  
  return C_post;
}

/**
 * Calculates Kullback-Leibler (KL) Divergence between two 3D multivariate Gaussian distributions
 * Assumes equal means for this calculation, focusing purely on covariance shrinkage (information gain).
 * D_KL(p || q) = 0.5 * [ Tr(C_prior^-1 * C_post) - N + ln(det(C_prior) / det(C_post)) ]
 */
export function calculateKLDivergence(C_prior, C_post) {
  // Determinant approximation for diagonal-dominant 3x3
  const det = (C) => C[0][0]*C[1][1]*C[2][2];
  
  const detPrior = det(C_prior);
  const detPost = det(C_post);
  
  if (detPrior <= 0 || detPost <= 0) return 0;
  
  // Trace(C_prior^-1 * C_post)
  // For diagonal matrices, C^-1 is just 1/C_ii
  const trace = (C_post[0][0]/C_prior[0][0]) + 
                (C_post[1][1]/C_prior[1][1]) + 
                (C_post[2][2]/C_prior[2][2]);
                
  const D_kl = 0.5 * (trace - 3 + Math.log(detPrior / detPost));
  
  // Convert nats to bits
  return D_kl / Math.LN2;
}

/**
 * Simulates a tracking pass and recalculates Pc if Information Gain > 1.5 bits
 */
export function simulateTrackingPass(currentCovariance, currentPc, computePcCallback) {
  // Sensor noise covariance (highly accurate radar)
  const R_noise = [
    [0.05, 0, 0],
    [0, 0.05, 0],
    [0, 0, 0.05]
  ];
  
  const newCovariance = updateCovarianceEKF(currentCovariance, R_noise);
  const infoGainBits = calculateKLDivergence(currentCovariance, newCovariance);
  
  let newPc = currentPc;
  if (infoGainBits > 1.5) {
    // Massive reduction in false alarm space, trigger recalculation
    newPc = computePcCallback(newCovariance);
  }
  
  return { newCovariance, infoGainBits, newPc };
}
