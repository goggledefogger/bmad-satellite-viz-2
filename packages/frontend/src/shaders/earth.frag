// Earth fragment shader
uniform float time;
uniform vec3 color;
uniform float opacity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Create a simple atmospheric glow effect
  float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
  fresnel = pow(fresnel, 2.0);

  // Add some subtle animation
  float pulse = sin(time * 0.5) * 0.1 + 0.9;

  // Create the final color with atmospheric effect
  vec3 finalColor = color * pulse;
  finalColor += fresnel * vec3(0.2, 0.4, 0.8) * 0.3;

  gl_FragColor = vec4(finalColor, opacity);
}
