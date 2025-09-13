import { ShaderMaterial, Vector3 } from 'three';

// Shader loading utility
export const loadShader = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load shader: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading shader:', error);
    throw error;
  }
};

/**
 * Enhanced Earth Shader Material with Artistic Effects
 *
 * This function creates a custom Three.js ShaderMaterial for the Earth component
 * with advanced visual effects including:
 * - Shimmering surface animations
 * - Atmospheric glow effects
 * - Dynamic color gradients
 * - Performance-optimized calculations
 *
 * @param time - Current time value for animations
 * @param options - Configuration options for shader effects
 * @returns Three.js ShaderMaterial with custom vertex and fragment shaders
 */
export const createEarthShaderMaterial = (
  time: number,
  options: {
    shimmerIntensity?: number;
    shimmerSpeed?: number;
    glowIntensity?: number;
    surfaceDisplacement?: number;
    lightDirection?: Vector3;
    lightColor?: Vector3;
    dayNightCycle?: number;
  } = {}
): ShaderMaterial => {
  const {
    shimmerIntensity = 0.5,
    shimmerSpeed = 2.0,
    glowIntensity = 0.3,
    surfaceDisplacement = 0.2,
    lightDirection = new Vector3(1, 1, 1).normalize(),
    lightColor = new Vector3(1, 1, 1),
    dayNightCycle = 0.0
  } = options;

  return new ShaderMaterial({
    uniforms: {
      time: { value: time },
      color: { value: new Vector3(0.3, 0.6, 0.9) },
      opacity: { value: 1.0 },
      shimmerIntensity: { value: shimmerIntensity },
      shimmerSpeed: { value: shimmerSpeed },
      glowIntensity: { value: glowIntensity },
      surfaceDisplacement: { value: surfaceDisplacement },
      lightDirection: { value: lightDirection },
      lightColor: { value: lightColor },
      dayNightCycle: { value: dayNightCycle },
    },
    vertexShader: `
      // Enhanced Earth Vertex Shader with Artistic Effects
      //
      // This vertex shader handles:
      // - Surface displacement for organic movement
      // - Shimmering effects using noise functions
      // - World position calculations for lighting
      // - Fresnel calculations for atmospheric effects

      uniform float time;                    // Animation time for effects
      uniform float shimmerIntensity;        // Intensity of shimmering (0-1)
      uniform float shimmerSpeed;           // Speed of shimmer animation (0-5)
      uniform float surfaceDisplacement;    // Amount of surface displacement (0-1)

      varying vec2 vUv;                     // UV coordinates for texture mapping
      varying vec3 vNormal;                 // Surface normal for lighting
      varying vec3 vPosition;               // Local position for effects
      varying vec3 vWorldPosition;          // World position for lighting
      varying float vFresnel;               // Fresnel factor for rim lighting

      // Simple 3D noise function for organic effects
      // Uses a hash function to generate pseudo-random values
      float noise(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      }

      // Smooth noise function using bilinear interpolation
      // Creates smoother, more natural-looking noise patterns
      float smoothNoise(vec3 p) {
        vec3 i = floor(p);                    // Integer part for grid lookup
        vec3 f = fract(p);                    // Fractional part for interpolation
        f = f * f * (3.0 - 2.0 * f);         // Smoothstep interpolation

        // Sample noise at four corners of the grid cell
        float a = noise(i);
        float b = noise(i + vec3(1.0, 0.0, 0.0));
        float c = noise(i + vec3(0.0, 1.0, 0.0));
        float d = noise(i + vec3(1.0, 1.0, 0.0));

        // Bilinear interpolation
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        // Pass data to fragment shader
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

        // Calculate Fresnel factor for rim lighting effects
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        vFresnel = 1.0 - max(0.0, dot(normalize(vNormal), viewDirection));

        // Apply surface displacement for organic movement
        vec3 displacedPosition = position;
        if (surfaceDisplacement > 0.0) {
          float noiseValue = smoothNoise(position * 2.0 + time * 0.1);
          displacedPosition += normal * noiseValue * surfaceDisplacement * 0.01;
        }

        // Apply shimmering effect for dynamic surface animation
        if (shimmerIntensity > 0.0) {
          float shimmer = sin(time * shimmerSpeed + position.x * 10.0 + position.y * 10.0) * shimmerIntensity * 0.005;
          displacedPosition += normal * shimmer;
        }

        // Transform to clip space
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
      }
    `,
    fragmentShader: `
      // Enhanced Earth Fragment Shader with Artistic Effects
      //
      // This fragment shader handles:
      // - Dynamic color gradients for day/night cycles
      // - Shimmering surface effects
      // - Atmospheric glow and rim lighting
      // - Performance-optimized calculations

      uniform float time;                    // Animation time for effects
      uniform vec3 color;                    // Base color for the Earth
      uniform float opacity;                 // Overall opacity
      uniform float shimmerIntensity;        // Intensity of shimmering (0-1)
      uniform float shimmerSpeed;           // Speed of shimmer animation (0-5)
      uniform float glowIntensity;          // Intensity of atmospheric glow (0-1)
      uniform vec3 lightDirection;          // Direction of main light source
      uniform vec3 lightColor;              // Color of main light source
      uniform float dayNightCycle;          // Day/night cycle progress (0-1)

      varying vec2 vUv;                     // UV coordinates from vertex shader
      varying vec3 vNormal;                 // Surface normal from vertex shader
      varying vec3 vPosition;               // Local position from vertex shader
      varying vec3 vWorldPosition;          // World position from vertex shader
      varying float vFresnel;               // Fresnel factor from vertex shader

      float noise(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      }

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

      vec3 createColorGradient(vec2 uv, float time) {
        // Enhanced day/night cycle with more realistic transitions
        float dayNightMix = sin(uv.x * 3.14159 + time * 0.1) * 0.5 + 0.5;
        dayNightMix = pow(dayNightMix, 0.8); // Smoother transition

        // Enhanced ocean colors with depth variation
        vec3 oceanDeep = vec3(0.05, 0.15, 0.4);
        vec3 oceanShallow = vec3(0.2, 0.5, 0.9);
        vec3 oceanDay = mix(oceanDeep, oceanShallow, sin(uv.y * 2.0) * 0.5 + 0.5);
        vec3 oceanNight = vec3(0.02, 0.05, 0.15);

        // Enhanced land colors with biome variation
        vec3 forestDay = vec3(0.15, 0.5, 0.15);
        vec3 desertDay = vec3(0.8, 0.6, 0.3);
        vec3 mountainDay = vec3(0.4, 0.3, 0.2);
        vec3 landNight = vec3(0.05, 0.1, 0.05);

        // Create more detailed continent patterns
        float continentNoise = smoothNoise(vec3(uv * 12.0, time * 0.03));
        continentNoise = smoothstep(0.2, 0.8, continentNoise);

        // Add biome variation within continents
        float biomeNoise = smoothNoise(vec3(uv * 6.0, time * 0.02));
        vec3 landDay = mix(forestDay, desertDay, smoothstep(0.3, 0.7, biomeNoise));
        landDay = mix(landDay, mountainDay, smoothstep(0.6, 0.9, continentNoise));

        // Add polar ice caps
        float polar = abs(uv.y - 0.5) > 0.4 ? 1.0 : 0.0;
        vec3 iceColor = vec3(0.9, 0.95, 1.0);
        landDay = mix(landDay, iceColor, polar * 0.8);

        // Mix ocean and land colors with enhanced blending
        vec3 dayColor = mix(oceanDay, landDay, continentNoise);
        vec3 nightColor = mix(oceanNight, landNight, continentNoise);

        // Apply enhanced day/night transition with atmospheric scattering
        vec3 baseColor = mix(nightColor, dayColor, dayNightMix);

        // Add subtle atmospheric tinting
        float atmosphereTint = pow(1.0 - abs(uv.y - 0.5) * 2.0, 2.0);
        baseColor = mix(baseColor, vec3(0.6, 0.8, 1.0), atmosphereTint * 0.1);

        return baseColor;
      }

      void main() {
        vec3 baseColor = createColorGradient(vUv, time);

        float shimmer = 0.0;
        if (shimmerIntensity > 0.0) {
          float shimmerNoise = smoothNoise(vPosition * 5.0 + time * shimmerSpeed);
          shimmer = sin(time * shimmerSpeed * 1.5 + shimmerNoise * 10.0) * shimmerIntensity * 0.3;
          shimmer = max(0.0, shimmer);
        }

        float fresnel = pow(vFresnel, 1.5);
        float surfaceShimmer = sin(time * shimmerSpeed + vPosition.x * 8.0 + vPosition.y * 8.0) * 0.1 + 0.9;

        vec3 glowColor = vec3(0.3, 0.6, 1.0) * glowIntensity;
        vec3 shimmerColor = vec3(1.0, 1.0, 0.8) * shimmer;

        vec3 finalColor = baseColor * surfaceShimmer;
        finalColor += glowColor * fresnel;
        finalColor += shimmerColor;

        float lighting = max(0.3, dot(vNormal, normalize(lightDirection)));
        finalColor *= lighting * lightColor;

        finalColor = clamp(finalColor, 0.0, 1.0);

        gl_FragColor = vec4(finalColor, opacity);
      }
    `,
    transparent: true,
  });
};

// Shader compilation error handling
export const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    console.error('Shader compilation error:', error);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};
