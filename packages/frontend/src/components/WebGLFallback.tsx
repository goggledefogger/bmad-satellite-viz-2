import React, { useState, useEffect } from 'react';

export const WebGLFallback: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
          setWebglSupported(false);
          setWebglError('WebGL is not supported by your browser');
          return;
        }

        // Check for specific WebGL features
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          console.log('WebGL Renderer:', renderer);
        }

        setWebglSupported(true);
      } catch (error) {
        setWebglSupported(false);
        setWebglError(error instanceof Error ? error.message : 'Unknown WebGL error');
      }
    };

    checkWebGLSupport();
  }, []);

  // Don't show fallback if WebGL is supported or still checking
  if (webglSupported !== false) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-4 border border-gray-700">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            WebGL Not Supported
          </h2>
          <p className="text-gray-300 mb-6">
            Your browser or device doesn't support WebGL, which is required for the 3D visualization.
          </p>

          {webglError && (
            <div className="bg-gray-700 rounded p-3 mb-6">
              <p className="text-sm text-gray-400">Error: {webglError}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Try these solutions:</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li>• Update your browser to the latest version</li>
              <li>• Enable hardware acceleration in your browser settings</li>
              <li>• Try a different browser (Chrome, Firefox, Safari, Edge)</li>
              <li>• Update your graphics drivers</li>
              <li>• Check if your device meets the minimum requirements</li>
            </ul>
          </div>

          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Minimum requirements: WebGL 1.0 support, modern browser
          </div>
        </div>
      </div>
    </div>
  );
};
