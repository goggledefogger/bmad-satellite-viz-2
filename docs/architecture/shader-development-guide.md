# Shader Development Guide

## Overview

This guide provides comprehensive documentation for developing and maintaining shader effects in the BMAD Satellite Visualization project. The shader system is built on Three.js WebGL shaders and provides artistic visual effects for the Earth model.

## Architecture

### Shader System Components

1. **Vertex Shaders** (`packages/frontend/src/shaders/earth.vert`)
   - Handle vertex transformations and displacement
   - Calculate world positions and normals
   - Generate Fresnel factors for rim lighting

2. **Fragment Shaders** (`packages/frontend/src/shaders/earth.frag`)
   - Handle pixel-level color calculations
   - Implement dynamic color gradients
   - Apply shimmering and glow effects

3. **Shader Utilities** (`packages/frontend/src/utils/shaders.ts`)
   - Shader compilation and error handling
   - Material creation and uniform management
   - Performance optimization utilities

4. **Performance Monitoring** (`packages/frontend/src/hooks/usePerformanceMonitor.ts`)
   - Real-time FPS monitoring
   - Performance degradation detection
   - Automatic quality adjustment

5. **WebGL Detection** (`packages/frontend/src/utils/webglDetection.ts`)
   - WebGL capability detection
   - Browser-specific optimizations
   - Fallback shader generation

## Shader Development Guidelines

### 1. Code Structure

#### Vertex Shader Structure
```glsl
// Header comments explaining the shader's purpose
// List of uniforms with descriptions
// List of varyings with descriptions
// Helper functions (noise, interpolation, etc.)
// Main function with step-by-step comments
```

#### Fragment Shader Structure
```glsl
// Header comments explaining the shader's purpose
// List of uniforms with descriptions
// List of varyings with descriptions
// Helper functions (noise, color calculations, etc.)
// Main function with step-by-step comments
```

### 2. Performance Considerations

#### Optimization Techniques
- **Precision Management**: Use appropriate precision (`highp`, `mediump`, `lowp`)
- **Conditional Calculations**: Use `if` statements sparingly, prefer `mix()` functions
- **Texture Sampling**: Minimize texture lookups
- **Loop Optimization**: Avoid loops in shaders when possible
- **Uniform Updates**: Update uniforms only when necessary

#### Performance Monitoring
```typescript
// Use the performance monitor to track FPS
const { stats, isLowPerformance } = usePerformanceMonitor({
  targetFps: 60,
  onPerformanceDrop: (stats) => {
    console.log(`Performance drop: ${stats.averageFps} FPS`);
  }
});
```

### 3. Cross-Browser Compatibility

#### WebGL Version Detection
```typescript
import { detectWebGLCapabilities, getShaderCompatibility } from '../utils/webglDetection';

const capabilities = detectWebGLCapabilities();
const compatibility = getShaderCompatibility(capabilities);

// Adjust shader quality based on capabilities
if (compatibility.recommendedQualityLevel === 'low') {
  // Use simplified shaders
}
```

#### Browser-Specific Optimizations
- **Chrome**: Supports advanced features, use high precision
- **Firefox**: Good WebGL2 support, optimize for performance
- **Safari**: Use medium precision, avoid complex calculations
- **Edge**: Similar to Chrome, test thoroughly

### 4. Shader Uniforms

#### Standard Uniforms
```glsl
uniform float time;                    // Animation time
uniform float shimmerIntensity;        // Effect intensity (0-1)
uniform float shimmerSpeed;           // Animation speed (0-5)
uniform float glowIntensity;          // Glow intensity (0-1)
uniform vec3 lightDirection;          // Light direction
uniform vec3 lightColor;              // Light color
```

#### Uniform Management
```typescript
// Update uniforms efficiently
useFrame((state) => {
  if (shaderMaterial) {
    shaderMaterial.uniforms.time.value = state.clock.elapsedTime;
    shaderMaterial.uniforms.shimmerSpeed.value = shimmerSpeed;
  }
});
```

### 5. Noise Functions

#### Basic Noise
```glsl
// Simple 3D noise for basic effects
float noise(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}
```

#### Smooth Noise
```glsl
// Smooth noise with bilinear interpolation
float smoothNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f); // Smoothstep

  float a = noise(i);
  float b = noise(i + vec3(1.0, 0.0, 0.0));
  float c = noise(i + vec3(0.0, 1.0, 0.0));
  float d = noise(i + vec3(1.0, 1.0, 0.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
```

### 6. Color Calculations

#### Dynamic Color Gradients
```glsl
vec3 createColorGradient(vec2 uv, float time) {
  // Day/night cycle
  float dayNightMix = sin(uv.x * 3.14159 + time * 0.1) * 0.5 + 0.5;

  // Ocean and land colors
  vec3 oceanDay = vec3(0.2, 0.5, 0.9);
  vec3 landDay = vec3(0.15, 0.5, 0.15);

  // Mix based on continent patterns
  float continent = smoothNoise(vec3(uv * 12.0, time * 0.03));
  vec3 dayColor = mix(oceanDay, landDay, continent);

  return dayColor;
}
```

### 7. Effect Implementation

#### Shimmering Effect
```glsl
// In vertex shader
if (shimmerIntensity > 0.0) {
  float shimmer = sin(time * shimmerSpeed + position.x * 10.0) * shimmerIntensity * 0.005;
  displacedPosition += normal * shimmer;
}

// In fragment shader
float shimmer = 0.0;
if (shimmerIntensity > 0.0) {
  float shimmerNoise = smoothNoise(vPosition * 5.0 + time * shimmerSpeed);
  shimmer = sin(time * shimmerSpeed * 1.5 + shimmerNoise * 10.0) * shimmerIntensity * 0.3;
}
```

#### Atmospheric Glow
```glsl
// Fresnel-based rim lighting
float fresnel = 1.0 - max(0.0, dot(vNormal, vViewDirection));
fresnel = pow(fresnel, 1.5);

// Atmospheric glow
vec3 glowColor = vec3(0.3, 0.6, 1.0) * glowIntensity;
vec3 finalColor = baseColor + glowColor * fresnel;
```

## Testing and Debugging

### 1. Shader Compilation Testing
```typescript
// Test shader compilation
try {
  const material = createEarthShaderMaterial(0, options);
  console.log('Shader compiled successfully');
} catch (error) {
  console.error('Shader compilation failed:', error);
}
```

### 2. Performance Testing
```typescript
// Monitor performance during development
const { stats } = usePerformanceMonitor({
  targetFps: 60,
  onPerformanceDrop: (stats) => {
    console.warn(`FPS dropped to ${stats.averageFps}`);
  }
});
```

### 3. Visual Debugging
```typescript
// Add debug indicators in development
{process.env.NODE_ENV === 'development' && (
  <mesh position={[0, 0, 1.5]}>
    <boxGeometry args={[0.05, 0.05, 0.05]} />
    <meshBasicMaterial color={isLowPerformance ? "#FF0000" : "#00FF00"} />
  </mesh>
)}
```

## Best Practices

### 1. Code Organization
- Keep shaders in separate files for better organization
- Use descriptive variable names
- Add comprehensive comments
- Group related calculations together

### 2. Performance Optimization
- Test on low-end devices
- Use adaptive quality levels
- Monitor frame rates during development
- Optimize for mobile devices

### 3. Error Handling
- Always check for WebGL support
- Provide fallback shaders for older GPUs
- Handle shader compilation errors gracefully
- Log performance issues

### 4. Documentation
- Document all uniforms and their ranges
- Explain complex calculations
- Provide usage examples
- Keep this guide updated

## Troubleshooting

### Common Issues

#### Shader Compilation Errors
- Check for syntax errors in GLSL code
- Verify uniform declarations match usage
- Ensure proper precision declarations
- Test on different browsers

#### Performance Issues
- Reduce shader complexity
- Lower texture resolutions
- Use fewer uniform updates
- Implement quality scaling

#### Visual Artifacts
- Check for precision issues
- Verify normal calculations
- Ensure proper UV mapping
- Test on different devices

### Debug Tools
- Browser WebGL inspector
- Three.js debugger
- Performance monitoring hooks
- Visual debug indicators

## Future Enhancements

### Planned Features
- Advanced atmospheric scattering
- Dynamic weather effects
- Seasonal color variations
- Enhanced particle systems

### Performance Improvements
- Shader LOD system
- GPU instancing
- Texture atlasing
- Compute shaders

## Resources

### Documentation
- [Three.js ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial)
- [WebGL Specification](https://www.khronos.org/registry/webgl/specs/latest/1.0/)
- [GLSL Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)

### Tools
- [Shadertoy](https://www.shadertoy.com/) - Online shader editor
- [WebGL Inspector](https://github.com/KhronosGroup/WebGL-Inspector) - Debug tool
- [Three.js Editor](https://threejs.org/editor/) - Visual editor

### Examples
- [Three.js Shader Examples](https://threejs.org/examples/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Shader School](https://github.com/stackgl/shader-school)

