/**
 * Runge-Kutta 4 (RK4) Two-Body Orbital Integrator
 * Integrates the state vector forward in time using Earth's standard gravitational parameter.
 */

const MU_EARTH = 398600.4418; // km^3/s^2

function normalize(v) {
  const mag = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
  return { x: v.x/mag, y: v.y/mag, z: v.z/mag };
}

function magnitude(v) {
  return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}

function add(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}

function multiply(v, scalar) {
  return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
}

// Derivative function for the state vector [r, v]
function derivative(state) {
  const r = { x: state.rx, y: state.ry, z: state.rz };
  const v = { x: state.vx, y: state.vy, z: state.vz };
  
  const rMag = magnitude(r);
  const factor = -MU_EARTH / (rMag * rMag * rMag);
  
  const a = multiply(r, factor);
  
  return {
    dr: v,
    dv: a
  };
}

/**
 * Propagates a state vector [r, v] forward by deltaT (seconds)
 */
export function propagateRK4(r, v, deltaT, stepSize = 10) {
  let currentR = { ...r };
  let currentV = { ...v };
  let t = 0;
  
  while (t < deltaT) {
    const dt = Math.min(stepSize, deltaT - t);
    
    const state = { rx: currentR.x, ry: currentR.y, rz: currentR.z, vx: currentV.x, vy: currentV.y, vz: currentV.z };
    
    const k1 = derivative(state);
    
    const state2 = {
      rx: state.rx + k1.dr.x * dt * 0.5,
      ry: state.ry + k1.dr.y * dt * 0.5,
      rz: state.rz + k1.dr.z * dt * 0.5,
      vx: state.vx + k1.dv.x * dt * 0.5,
      vy: state.vy + k1.dv.y * dt * 0.5,
      vz: state.vz + k1.dv.z * dt * 0.5
    };
    const k2 = derivative(state2);
    
    const state3 = {
      rx: state.rx + k2.dr.x * dt * 0.5,
      ry: state.ry + k2.dr.y * dt * 0.5,
      rz: state.rz + k2.dr.z * dt * 0.5,
      vx: state.vx + k2.dv.x * dt * 0.5,
      vy: state.vy + k2.dv.y * dt * 0.5,
      vz: state.vz + k2.dv.z * dt * 0.5
    };
    const k3 = derivative(state3);
    
    const state4 = {
      rx: state.rx + k3.dr.x * dt,
      ry: state.ry + k3.dr.y * dt,
      rz: state.rz + k3.dr.z * dt,
      vx: state.vx + k3.dv.x * dt,
      vy: state.vy + k3.dv.y * dt,
      vz: state.vz + k3.dv.z * dt
    };
    const k4 = derivative(state4);
    
    currentR.x += (dt / 6.0) * (k1.dr.x + 2 * k2.dr.x + 2 * k3.dr.x + k4.dr.x);
    currentR.y += (dt / 6.0) * (k1.dr.y + 2 * k2.dr.y + 2 * k3.dr.y + k4.dr.y);
    currentR.z += (dt / 6.0) * (k1.dr.z + 2 * k2.dr.z + 2 * k3.dr.z + k4.dr.z);
    
    currentV.x += (dt / 6.0) * (k1.dv.x + 2 * k2.dv.x + 2 * k3.dv.x + k4.dv.x);
    currentV.y += (dt / 6.0) * (k1.dv.y + 2 * k2.dv.y + 2 * k3.dv.y + k4.dv.y);
    currentV.z += (dt / 6.0) * (k1.dv.z + 2 * k2.dv.z + 2 * k3.dv.z + k4.dv.z);
    
    t += dt;
  }
  
  return { position: currentR, velocity: currentV };
}
