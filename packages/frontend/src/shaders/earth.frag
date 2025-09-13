// Enhanced Earth fragment shader with artistic effects
uniform float time;
uniform vec3 color;
uniform float opacity;
uniform float shimmerIntensity;
uniform float glowIntensity;
uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform float dayNightCycle;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying float vFresnel;

// Noise function for organic effects
float noise(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

// Smooth noise for surface effects
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

// Create beautiful color gradients
vec3 createColorGradient(vec2 uv, float time) {
  // Day/night color transition
  vec3 dayColor = vec3(0.2, 0.6, 1.0);    // Blue ocean
  vec3 nightColor = vec3(0.05, 0.1, 0.3); // Dark blue

  // Create continent colors
  vec3 continentColor = vec3(0.2, 0.8, 0.3); // Green land

  // Mix day/night based on UV coordinates and time
  float dayNightMix = sin(uv.x * 3.14159 + time * 0.1) * 0.5 + 0.5;
  vec3 baseColor = mix(nightColor, dayColor, dayNightMix);

  // Add continent patterns
  float continentNoise = smoothNoise(vec3(uv * 10.0, time * 0.05));
  if (continentNoise > 0.3) {
    baseColor = mix(baseColor, continentColor, 0.7);
  }

  return baseColor;
}

void main() {
  // Create beautiful color gradients
  vec3 baseColor = createColorGradient(vUv, time);

  // Add shimmering effect
  float shimmer = 0.0;
  if (shimmerIntensity > 0.0) {
    float shimmerNoise = smoothNoise(vPosition * 5.0 + time * 2.0);
    shimmer = sin(time * 3.0 + shimmerNoise * 10.0) * shimmerIntensity * 0.3;
    shimmer = max(0.0, shimmer);
  }

  // Enhanced Fresnel effect for atmospheric glow
  float fresnel = pow(vFresnel, 1.5);

  // Add subtle surface shimmer
  float surfaceShimmer = sin(time * 2.0 + vPosition.x * 8.0 + vPosition.y * 8.0) * 0.1 + 0.9;

  // Create atmospheric glow colors
  vec3 glowColor = vec3(0.3, 0.6, 1.0) * glowIntensity;
  vec3 shimmerColor = vec3(1.0, 1.0, 0.8) * shimmer;

  // Combine all effects
  vec3 finalColor = baseColor * surfaceShimmer;
  finalColor += glowColor * fresnel;
  finalColor += shimmerColor;

  // Add subtle lighting
  float lighting = max(0.3, dot(vNormal, normalize(lightDirection)));
  finalColor *= lighting * lightColor;

  // Ensure color values are within valid range
  finalColor = clamp(finalColor, 0.0, 1.0);

  gl_FragColor = vec4(finalColor, opacity);
}
