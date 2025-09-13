/**
 * WebGL Detection and Fallback Utilities
 * Provides WebGL version detection and fallback capabilities for cross-browser compatibility
 */

export interface WebGLCapabilities {
  version: 1 | 2 | null;
  isSupported: boolean;
  hasWebGL2: boolean;
  hasWebGL1: boolean;
  renderer: string;
  vendor: string;
  maxTextureSize: number;
  maxVertexUniforms: number;
  maxFragmentUniforms: number;
  maxVaryingVectors: number;
  aliasedLineWidthRange: [number, number];
  aliasedPointSizeRange: [number, number];
  maxViewportDims: [number, number];
  maxAnisotropy: number;
  precision: 'highp' | 'mediump' | 'lowp';
  extensions: string[];
}

export interface ShaderCompatibility {
  supportsAdvancedShaders: boolean;
  supportsMultipleTextures: boolean;
  supportsFramebuffers: boolean;
  supportsInstancing: boolean;
  recommendedQualityLevel: 'ultra' | 'high' | 'medium' | 'low' | 'minimal';
}

/**
 * Detect WebGL capabilities and version
 */
export const detectWebGLCapabilities = (): WebGLCapabilities => {
  const canvas = document.createElement('canvas');
  const gl = (canvas.getContext('webgl2') as WebGL2RenderingContext | null)
    || (canvas.getContext('webgl') as WebGLRenderingContext | null)
    || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

  if (!gl) {
    return {
      version: null,
      isSupported: false,
      hasWebGL2: false,
      hasWebGL1: false,
      renderer: 'Unknown',
      vendor: 'Unknown',
      maxTextureSize: 0,
      maxVertexUniforms: 0,
      maxFragmentUniforms: 0,
      maxVaryingVectors: 0,
      aliasedLineWidthRange: [0, 0],
      aliasedPointSizeRange: [0, 0],
      maxViewportDims: [0, 0],
      maxAnisotropy: 0,
      precision: 'lowp',
      extensions: []
    };
  }

  const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info') as any;

  return {
    version: isWebGL2 ? 2 : 1,
    isSupported: true,
    hasWebGL2: isWebGL2,
    hasWebGL1: !isWebGL2,
    renderer: debugInfo ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string) : 'Unknown',
    vendor: debugInfo ? (gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string) : 'Unknown',
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
    maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
    maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
    aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
    aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
    maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
    maxAnisotropy: (() => {
      const aniso = gl.getExtension('EXT_texture_filter_anisotropic') as any;
      return aniso ? (gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number) : 0;
    })(),
    precision: 'highp',
    extensions: (gl.getSupportedExtensions() || []) as string[]
  };
};

/**
 * Determine shader compatibility based on WebGL capabilities
 */
export const getShaderCompatibility = (capabilities: WebGLCapabilities): ShaderCompatibility => {
  if (!capabilities.isSupported) {
    return {
      supportsAdvancedShaders: false,
      supportsMultipleTextures: false,
      supportsFramebuffers: false,
      supportsInstancing: false,
      recommendedQualityLevel: 'minimal'
    };
  }

  const hasWebGL2 = capabilities.hasWebGL2;
  const hasGoodUniforms = capabilities.maxVertexUniforms >= 1024 && capabilities.maxFragmentUniforms >= 1024;
  const hasGoodTextures = capabilities.maxTextureSize >= 2048;
  const hasAnisotropy = capabilities.maxAnisotropy >= 4;
  const hasFramebuffers = capabilities.extensions.includes('WEBGL_depth_texture') || hasWebGL2;

  let recommendedQualityLevel: ShaderCompatibility['recommendedQualityLevel'] = 'minimal';

  if (hasWebGL2 && hasGoodUniforms && hasGoodTextures && hasAnisotropy) {
    recommendedQualityLevel = 'ultra';
  } else if (hasWebGL2 && hasGoodUniforms && hasGoodTextures) {
    recommendedQualityLevel = 'high';
  } else if (hasGoodUniforms && hasGoodTextures) {
    recommendedQualityLevel = 'medium';
  } else if (hasGoodUniforms || hasGoodTextures) {
    recommendedQualityLevel = 'low';
  }

  return {
    supportsAdvancedShaders: hasGoodUniforms,
    supportsMultipleTextures: hasGoodTextures,
    supportsFramebuffers: hasFramebuffers,
    supportsInstancing: hasWebGL2,
    recommendedQualityLevel
  };
};

/**
 * Get browser-specific optimizations
 */
export const getBrowserOptimizations = (): {
  useHighPrecision: boolean;
  useInstancing: boolean;
  useMultipleTextures: boolean;
  shaderPrecision: 'highp' | 'mediump' | 'lowp';
} => {
  const userAgent = navigator.userAgent.toLowerCase();
  const capabilities = detectWebGLCapabilities();
  const compatibility = getShaderCompatibility(capabilities);

  // Browser-specific optimizations
  const isChrome = userAgent.includes('chrome');
  const isFirefox = userAgent.includes('firefox');
  const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
  const isEdge = userAgent.includes('edge');

  // Determine precision based on browser and capabilities
  let shaderPrecision: 'highp' | 'mediump' | 'lowp' = 'mediump';
  if (capabilities.maxVertexUniforms >= 1024 && capabilities.maxFragmentUniforms >= 1024) {
    shaderPrecision = 'highp';
  } else if (capabilities.maxVertexUniforms >= 256 && capabilities.maxFragmentUniforms >= 256) {
    shaderPrecision = 'mediump';
  } else {
    shaderPrecision = 'lowp';
  }

  // Safari-specific optimizations
  if (isSafari) {
    shaderPrecision = 'mediump'; // Safari has issues with highp in some cases
  }

  return {
    useHighPrecision: shaderPrecision === 'highp' && compatibility.supportsAdvancedShaders,
    useInstancing: compatibility.supportsInstancing && (isChrome || isFirefox),
    useMultipleTextures: compatibility.supportsMultipleTextures,
    shaderPrecision
  };
};

/**
 * Create fallback shader code for older GPUs
 */
export const createFallbackShader = (originalShader: string, precision: 'highp' | 'mediump' | 'lowp'): string => {
  // Replace high precision with the specified precision
  let fallbackShader = originalShader.replace(/precision\s+highp\s+float;/g, `precision ${precision} float;`);
  fallbackShader = fallbackShader.replace(/precision\s+highp\s+int;/g, `precision ${precision} int;`);

  // Simplify complex calculations for low-end GPUs
  if (precision === 'lowp') {
    // Replace complex noise functions with simpler versions
    fallbackShader = fallbackShader.replace(
      /float\s+smoothNoise\([^)]+\)\s*{[^}]+}/g,
      'float smoothNoise(vec3 p) { return sin(p.x + p.y + p.z) * 0.5 + 0.5; }'
    );

    // Simplify color calculations
    fallbackShader = fallbackShader.replace(
      /vec3\s+createColorGradient\([^)]+\)\s*{[^}]+}/g,
      'vec3 createColorGradient(vec2 uv, float time) { return mix(vec3(0.1, 0.3, 0.8), vec3(0.2, 0.6, 0.2), sin(uv.x * 3.14159) * 0.5 + 0.5); }'
    );
  }

  return fallbackShader;
};

/**
 * Check if the current environment supports the required WebGL features
 */
export const checkWebGLSupport = (requiredFeatures: {
  webgl2?: boolean;
  maxTextureSize?: number;
  maxUniforms?: number;
  extensions?: string[];
}): boolean => {
  const capabilities = detectWebGLCapabilities();

  if (!capabilities.isSupported) {
    return false;
  }

  if (requiredFeatures.webgl2 && !capabilities.hasWebGL2) {
    return false;
  }

  if (requiredFeatures.maxTextureSize && capabilities.maxTextureSize < requiredFeatures.maxTextureSize) {
    return false;
  }

  if (requiredFeatures.maxUniforms &&
      (capabilities.maxVertexUniforms < requiredFeatures.maxUniforms ||
       capabilities.maxFragmentUniforms < requiredFeatures.maxUniforms)) {
    return false;
  }

  if (requiredFeatures.extensions) {
    for (const extension of requiredFeatures.extensions) {
      if (!capabilities.extensions.includes(extension)) {
        return false;
      }
    }
  }

  return true;
};
