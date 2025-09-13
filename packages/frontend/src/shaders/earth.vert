// Enhanced Earth vertex shader with artistic effects
uniform float time;
uniform float shimmerIntensity;
uniform float surfaceDisplacement;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying float vFresnel;

// Noise function for organic effects
float noise(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

// Smooth noise for surface displacement
float smoothNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = noise(i);
  float b = noise(i + vec3(1.0, 0.0, 0.0));
  float c = noise(i + vec3(0.0, 1.0, 0.0));
  float d = noise(i + vec3(1.0, 1.0, 0.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

  // Calculate Fresnel effect for atmospheric glow
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  vFresnel = 1.0 - max(0.0, dot(normalize(vNormal), viewDirection));

  // Add subtle surface displacement for organic feel
  vec3 displacedPosition = position;
  if (surfaceDisplacement > 0.0) {
    float noiseValue = smoothNoise(position * 2.0 + time * 0.1);
    displacedPosition += normal * noiseValue * surfaceDisplacement * 0.01;
  }

  // Add shimmering effect to vertex position
  if (shimmerIntensity > 0.0) {
    float shimmer = sin(time * 2.0 + position.x * 10.0 + position.y * 10.0) * shimmerIntensity * 0.005;
    displacedPosition += normal * shimmer;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
