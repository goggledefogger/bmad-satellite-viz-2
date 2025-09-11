import React from 'react';
import { SatelliteVisualization } from './components/SatelliteVisualization';

export const App: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-900 text-white">
      <SatelliteVisualization />
    </div>
  );
};
