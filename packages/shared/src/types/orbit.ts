/**
 * Orbital mechanics and calculation types
 * Based on standard orbital mechanics formulas and SGP4/SDP4 models
 */

import { Vector3 } from './satellite';

export interface OrbitalState {
  /** Position vector in ECI coordinates (km) */
  position: Vector3;
  /** Velocity vector in ECI coordinates (km/s) */
  velocity: Vector3;
  /** Timestamp of the state */
  timestamp: string;
}

export interface OrbitalParameters {
  /** Semi-major axis (km) */
  a: number;
  /** Eccentricity */
  e: number;
  /** Inclination (radians) */
  i: number;
  /** Right ascension of ascending node (radians) */
  Ω: number;
  /** Argument of periapsis (radians) */
  ω: number;
  /** Mean anomaly (radians) */
  M: number;
  /** Epoch time (seconds since J2000) */
  epoch: number;
}

export interface KeplerianElements {
  /** Semi-major axis (km) */
  semiMajorAxis: number;
  /** Eccentricity */
  eccentricity: number;
  /** Inclination (degrees) */
  inclination: number;
  /** Right ascension of ascending node (degrees) */
  rightAscension: number;
  /** Argument of periapsis (degrees) */
  argumentOfPeriapsis: number;
  /** True anomaly (degrees) */
  trueAnomaly: number;
  /** Epoch time (ISO timestamp) */
  epoch: string;
}

export interface CartesianElements {
  /** Position vector (km) */
  position: Vector3;
  /** Velocity vector (km/s) */
  velocity: Vector3;
  /** Epoch time (ISO timestamp) */
  epoch: string;
}

export interface OrbitalPeriod {
  /** Period in seconds */
  period: number;
  /** Period in minutes */
  periodMinutes: number;
  /** Period in hours */
  periodHours: number;
  /** Mean motion (rad/s) */
  meanMotion: number;
  /** Mean motion (rev/day) */
  meanMotionRevPerDay: number;
}

export interface OrbitalEnergy {
  /** Specific orbital energy (km²/s²) */
  specificEnergy: number;
  /** Specific angular momentum (km²/s) */
  specificAngularMomentum: number;
  /** Total energy (J/kg) */
  totalEnergy: number;
}

export interface OrbitalGeometry {
  /** Periapsis distance (km) */
  periapsis: number;
  /** Apoapsis distance (km) */
  apoapsis: number;
  /** Semi-minor axis (km) */
  semiMinorAxis: number;
  /** Focal parameter (km) */
  focalParameter: number;
  /** Eccentric anomaly (radians) */
  eccentricAnomaly: number;
  /** True anomaly (radians) */
  trueAnomaly: number;
}

export interface GroundTrack {
  /** Latitude (degrees) */
  latitude: number;
  /** Longitude (degrees) */
  longitude: number;
  /** Altitude (km) */
  altitude: number;
  /** Ground speed (km/s) */
  groundSpeed: number;
  /** Heading (degrees) */
  heading: number;
  /** Timestamp */
  timestamp: string;
}

export interface OrbitalPrediction {
  /** Predicted position */
  position: Vector3;
  /** Predicted velocity */
  velocity: Vector3;
  /** Prediction time */
  time: string;
  /** Prediction accuracy (km) */
  accuracy: number;
  /** Prediction method used */
  method: 'sgp4' | 'sgp8' | 'sdp4' | 'sdp8' | 'kepler';
}

export interface OrbitalPropagation {
  /** Start time */
  startTime: string;
  /** End time */
  endTime: string;
  /** Time step (seconds) */
  timeStep: number;
  /** Propagated states */
  states: OrbitalState[];
  /** Propagation method */
  method: 'sgp4' | 'sgp8' | 'sdp4' | 'sdp8' | 'kepler';
  /** Accuracy estimate */
  accuracy: number;
}

export interface CoordinateSystem {
  /** Coordinate system type */
  type: 'eci' | 'ecef' | 'geodetic' | 'topocentric';
  /** Reference frame */
  frame: 'j2000' | 'tod' | 'itrf' | 'wgs84';
  /** Epoch time */
  epoch: string;
}

export interface CoordinateTransform {
  /** Source coordinate system */
  from: CoordinateSystem;
  /** Target coordinate system */
  to: CoordinateSystem;
  /** Transformation matrix */
  matrix: number[][];
  /** Translation vector */
  translation: Vector3;
}

export interface OrbitalPerturbations {
  /** Atmospheric drag coefficient */
  dragCoefficient: number;
  /** Solar radiation pressure coefficient */
  solarRadiationPressure: number;
  /** Third body perturbations */
  thirdBody: {
    moon: boolean;
    sun: boolean;
    planets: boolean;
  };
  /** Geopotential model order */
  geopotentialOrder: number;
  /** Geopotential model degree */
  geopotentialDegree: number;
}

export interface OrbitalManeuver {
  /** Maneuver type */
  type: 'impulse' | 'continuous' | 'low-thrust';
  /** Delta-V vector (km/s) */
  deltaV: Vector3;
  /** Maneuver time */
  time: string;
  /** Maneuver duration (seconds) */
  duration: number;
  /** Thrust vector (N) */
  thrust?: Vector3;
  /** Specific impulse (seconds) */
  specificImpulse?: number;
}

export interface OrbitalAnalysis {
  /** Orbital period */
  period: OrbitalPeriod;
  /** Orbital energy */
  energy: OrbitalEnergy;
  /** Orbital geometry */
  geometry: OrbitalGeometry;
  /** Ground track */
  groundTrack: GroundTrack;
  /** Perturbations */
  perturbations: OrbitalPerturbations;
  /** Stability analysis */
  stability: {
    isStable: boolean;
    stabilityTime: number;
    decayRate: number;
  };
}

