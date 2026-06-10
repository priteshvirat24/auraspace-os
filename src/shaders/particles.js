export const particleVertexShader = `
  uniform float time;
  attribute float size;
  attribute float phase;
  varying vec3 vColor;
  
  void main() {
    vColor = vec3(0.5, 0.8, 1.0); // Icy blue dust
    
    vec3 pos = position;
    // GPU-accelerated drift
    pos.x += sin(time * 0.1 + phase) * 2.0;
    pos.y += cos(time * 0.15 + phase) * 2.0;
    pos.z += sin(time * 0.05 + phase) * 2.0;
    
    // Wrap around bounds (-50 to 50)
    pos = mod(pos + 50.0, 100.0) - 50.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Size attenuation
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleFragmentShader = `
  varying vec3 vColor;
  void main() {
    // Soft circular particle
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (0.5 - dist) * 2.0;
    gl_FragColor = vec4(vColor, alpha * 0.4);
  }
`;
