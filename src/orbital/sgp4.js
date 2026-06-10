import * as satellite from 'satellite.js';

/**
 * Propagates TLE to a given Date and returns state vector in km and km/s
 */
export function propagateTLE(tleLine1, tleLine2, targetDate) {
  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
  const positionAndVelocity = satellite.propagate(satrec, targetDate);
  
  if (!positionAndVelocity.position) return null;
  
  return {
    position: positionAndVelocity.position, // {x, y, z}
    velocity: positionAndVelocity.velocity  // {x, y, z}
  };
}
