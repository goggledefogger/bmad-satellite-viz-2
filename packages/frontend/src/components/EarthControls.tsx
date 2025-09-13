import React, { useState, useCallback } from 'react';

interface EarthControlsProps {
  /** Callback when rotation is toggled */
  onRotationToggle?: (enabled: boolean) => void;
  /** Callback when rotation speed changes */
  onRotationSpeedChange?: (speed: number) => void;
  /** Callback when atmosphere is toggled */
  onAtmosphereToggle?: (enabled: boolean) => void;
  /** Callback when scale changes */
  onScaleChange?: (scale: number) => void;
  /** Initial rotation state */
  initialRotationEnabled?: boolean;
  /** Initial rotation speed */
  initialRotationSpeed?: number;
  /** Initial atmosphere state */
  initialAtmosphereEnabled?: boolean;
  /** Initial scale */
  initialScale?: number;
  /** Optional camera reset callback provided by parent */
  onResetCamera?: () => void;
}

export const EarthControls: React.FC<EarthControlsProps> = ({
  onRotationToggle,
  onRotationSpeedChange,
  onAtmosphereToggle,
  onScaleChange,
  initialRotationEnabled = true,
  initialRotationSpeed = 1.0,
  initialAtmosphereEnabled = true,
  initialScale = 1.0,
  onResetCamera
}) => {
  const [rotationEnabled, setRotationEnabled] = useState(initialRotationEnabled);
  const [rotationSpeed, setRotationSpeed] = useState(initialRotationSpeed);
  const [atmosphereEnabled, setAtmosphereEnabled] = useState(initialAtmosphereEnabled);
  const [scale, setScale] = useState(initialScale);

  const handleRotationToggle = useCallback(() => {
    const newState = !rotationEnabled;
    setRotationEnabled(newState);
    onRotationToggle?.(newState);
  }, [rotationEnabled, onRotationToggle]);

  const handleRotationSpeedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    setRotationSpeed(newSpeed);
    onRotationSpeedChange?.(newSpeed);
  }, [onRotationSpeedChange]);

  const handleAtmosphereToggle = useCallback(() => {
    const newState = !atmosphereEnabled;
    setAtmosphereEnabled(newState);
    onAtmosphereToggle?.(newState);
  }, [atmosphereEnabled, onAtmosphereToggle]);

  const handleScaleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(event.target.value);
    setScale(newScale);
    onScaleChange?.(newScale);
  }, [onScaleChange]);

  const resetCamera = useCallback(() => {
    if (onResetCamera) {
      onResetCamera();
    } else {
      // eslint-disable-next-line no-console
      console.warn('[EarthControls] onResetCamera not provided; camera reset no-op');
    }
  }, [onResetCamera]);

  return (
    <div className="earth-controls" role="group" aria-label="Earth visualization controls">
      <div className="control-group">
        <h3>Earth Controls</h3>

        {/* Rotation Controls */}
        <div className="control-item">
          <label htmlFor="rotation-toggle">
            <input
              id="rotation-toggle"
              type="checkbox"
              checked={rotationEnabled}
              onChange={handleRotationToggle}
              aria-describedby="rotation-description"
            />
            Enable Earth Rotation
          </label>
          <p id="rotation-description" className="control-description">
            Toggle the Earth's rotation animation (24-hour day cycle)
          </p>
        </div>

        <div className="control-item">
          <label htmlFor="rotation-speed">
            Rotation Speed: {rotationSpeed.toFixed(1)}x
          </label>
          <input
            id="rotation-speed"
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={rotationSpeed}
            onChange={handleRotationSpeedChange}
            disabled={!rotationEnabled}
            aria-describedby="rotation-speed-description"
          />
          <p id="rotation-speed-description" className="control-description">
            Adjust the speed of Earth's rotation (1.0 = normal 24-hour cycle)
          </p>
        </div>

        {/* Atmosphere Controls */}
        <div className="control-item">
          <label htmlFor="atmosphere-toggle">
            <input
              id="atmosphere-toggle"
              type="checkbox"
              checked={atmosphereEnabled}
              onChange={handleAtmosphereToggle}
              aria-describedby="atmosphere-description"
            />
            Enable Atmosphere
          </label>
          <p id="atmosphere-description" className="control-description">
            Toggle atmospheric effects around the Earth
          </p>
        </div>

        {/* Scale Controls */}
        <div className="control-item">
          <label htmlFor="earth-scale">
            Earth Scale: {scale.toFixed(1)}x
          </label>
          <input
            id="earth-scale"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={scale}
            onChange={handleScaleChange}
            aria-describedby="scale-description"
          />
          <p id="scale-description" className="control-description">
            Adjust the size of the Earth model
          </p>
        </div>

        {/* Camera Controls */}
        <div className="control-item">
          <button
            onClick={resetCamera}
            aria-describedby="camera-reset-description"
          >
            Reset Camera View
          </button>
          <p id="camera-reset-description" className="control-description">
            Return camera to default position and orientation
          </p>
        </div>
      </div>

      <style>{`
        .earth-controls {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 20px;
          border-radius: 8px;
          min-width: 250px;
          z-index: 1000;
        }

        .control-group h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #60A5FA;
        }

        .control-item {
          margin-bottom: 15px;
        }

        .control-item label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          cursor: pointer;
        }

        .control-item input[type="checkbox"] {
          margin-right: 8px;
        }

        .control-item input[type="range"] {
          width: 100%;
          margin: 5px 0;
        }

        .control-item button {
          background: #3B82F6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .control-item button:hover {
          background: #2563EB;
        }

        .control-item button:disabled {
          background: #6B7280;
          cursor: not-allowed;
        }

        .control-description {
          font-size: 12px;
          color: #9CA3AF;
          margin: 5px 0 0 0;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .earth-controls {
            position: relative;
            top: auto;
            right: auto;
            margin: 20px;
            width: calc(100% - 40px);
          }
        }
      `}</style>
    </div>
  );
};
