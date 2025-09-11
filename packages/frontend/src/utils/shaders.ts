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

// Create Earth shader material
export const createEarthShaderMaterial = (time: number): ShaderMaterial => {
  return new ShaderMaterial({
    uniforms: {
      time: { value: time },
      color: { value: new Vector3(0.3, 0.6, 0.9) },
      opacity: { value: 1.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
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
