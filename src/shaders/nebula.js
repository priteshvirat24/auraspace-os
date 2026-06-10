export const nebulaVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const nebulaFragmentShader = `
  uniform float time;
  varying vec2 vUv;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv * 3.0; // Higher frequency
    float n1 = snoise(uv + time * 0.02);
    float n2 = snoise(uv * 2.0 - time * 0.01);
    float n = (n1 + n2) * 0.5;
    
    // Deep Space Milky Way Colors (Very subtle)
    vec3 color1 = vec3(0.02, 0.0, 0.05); // Very faint purple
    vec3 color2 = vec3(0.0, 0.1, 0.2);  // Faint deep blue
    vec3 finalColor = mix(color1, color2, n * 0.5 + 0.5);
    
    // Soft edges, sparse opacity
    float alpha = smoothstep(0.2, 1.0, n * 0.5 + 0.5) * 0.2;
    
    // Fade out near edges of the sphere
    float edgeFade = sin(vUv.x * 3.14159) * sin(vUv.y * 3.14159);
    
    gl_FragColor = vec4(finalColor, alpha * edgeFade);
  }
`;
