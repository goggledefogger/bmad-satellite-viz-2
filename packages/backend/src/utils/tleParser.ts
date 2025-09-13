/**
 * TLE (Two-Line Element) Parser for satellite data
 * Parses NORAD TLE format and extracts orbital elements
 */

import { TLEData, OrbitalElements, SatelliteMetadata } from '@shared/types/satellite';

export interface ParsedTLE {
  noradId: string;
  name: string;
  line1: string;
  line2: string;
  epoch: string;
  orbitalElements: OrbitalElements;
  metadata: Partial<SatelliteMetadata>;
}

export class TLEParser {
  /**
   * Parse TLE data from raw text format
   */
  static parseTLE(rawTLE: string): ParsedTLE[] {
    const lines = rawTLE.trim().split('\n');
    const tles: ParsedTLE[] = [];

    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        const name = lines[i].trim();
        const line1 = lines[i + 1].trim();
        const line2 = lines[i + 2].trim();

        if (this.isValidTLE(name, line1, line2)) {
          const tle = this.parseSingleTLE(name, line1, line2);
          tles.push(tle);
        }
      }
    }

    return tles;
  }

  /**
   * Parse a single TLE (name + 2 lines)
   */
  static parseSingleTLE(name: string, line1: string, line2: string): ParsedTLE {
    const noradId = this.extractNoradId(line1);
    const epoch = this.extractEpoch(line1);
    const orbitalElements = this.extractOrbitalElements(line1, line2);
    const metadata = this.extractMetadata(name, line1, line2);

    return {
      noradId,
      name: name.trim(),
      line1,
      line2,
      epoch,
      orbitalElements,
      metadata,
    };
  }

  /**
   * Extract NORAD ID from TLE line 1
   */
  private static extractNoradId(line1: string): string {
    return line1.substring(2, 7).trim();
  }

  /**
   * Extract epoch time from TLE line 1
   */
  private static extractEpoch(line1: string): string {
    const epochString = line1.substring(18, 32).trim();
    const year = parseInt(epochString.substring(0, 2));
    const dayOfYear = parseFloat(epochString.substring(2));

    // Convert 2-digit year to 4-digit year
    const fullYear = year < 57 ? 2000 + year : 1900 + year;

    // Convert day of year to date
    const date = new Date(fullYear, 0, 1);
    date.setDate(date.getDate() + dayOfYear - 1);

    return date.toISOString();
  }

  /**
   * Extract orbital elements from TLE lines
   */
  private static extractOrbitalElements(line1: string, line2: string): OrbitalElements {
    // Line 1 elements
    const meanMotion = parseFloat(line1.substring(52, 63));
    const meanMotionDot = parseFloat(line1.substring(33, 43));
    const meanMotionDotDot = parseFloat(line1.substring(44, 52));
    const bstar = parseFloat(line1.substring(53, 61));

    // Line 2 elements
    const inclination = parseFloat(line2.substring(8, 16));
    const rightAscension = parseFloat(line2.substring(17, 25));
    const eccentricity = parseFloat('0.' + line2.substring(26, 33));
    const argumentOfPeriapsis = parseFloat(line2.substring(34, 42));
    const meanAnomaly = parseFloat(line2.substring(43, 51));
    const epoch = this.extractEpoch(line1);

    // Calculate semi-major axis from mean motion
    const semiMajorAxis = this.calculateSemiMajorAxis(meanMotion);

    // Calculate period in minutes
    const period = meanMotion > 0 ? (24 * 60) / meanMotion : 0;

    return {
      semiMajorAxis,
      eccentricity,
      inclination,
      rightAscension,
      argumentOfPeriapsis,
      meanAnomaly,
      epoch,
      meanMotion,
      period,
    };
  }

  /**
   * Calculate semi-major axis from mean motion
   */
  private static calculateSemiMajorAxis(meanMotion: number): number {
    if (meanMotion <= 0) return 0;

    // Earth's gravitational parameter (km³/s²)
    const GM = 3.986004418e5;

    // Convert mean motion from rev/day to rad/s
    const n = (meanMotion * 2 * Math.PI) / (24 * 3600);

    // Calculate semi-major axis using Kepler's third law
    const a = Math.pow(GM / (n * n), 1/3);

    return a;
  }

  /**
   * Extract metadata from TLE
   */
  private static extractMetadata(name: string, line1: string, line2: string): Partial<SatelliteMetadata> {
    const noradId = this.extractNoradId(line1);
    const internationalDesignator = line1.substring(9, 17).trim();

    return {
      noradId,
      internationalDesignator,
      // Additional metadata would need to be looked up from external sources
    };
  }

  /**
   * Validate TLE format
   */
  private static isValidTLE(name: string, line1: string, line2: string): boolean {
    // Basic validation
    if (!name || !line1 || !line2) return false;
    if (line1.length !== 69 || line2.length !== 69) return false;
    if (line1[0] !== '1' || line2[0] !== '2') return false;

    // Check checksums
    if (!this.validateChecksum(line1) || !this.validateChecksum(line2)) {
      console.warn('TLE checksum validation failed for:', name);
      // Don't fail completely, just warn
    }

    return true;
  }

  /**
   * Validate TLE checksum
   */
  private static validateChecksum(line: string): boolean {
    const checksum = parseInt(line[68]);
    let calculatedChecksum = 0;

    for (let i = 0; i < 68; i++) {
      const char = line[i];
      if (char === '-') {
        calculatedChecksum += 1;
      } else if (char >= '0' && char <= '9') {
        calculatedChecksum += parseInt(char);
      } else if (char >= 'A' && char <= 'Z') {
        calculatedChecksum += char.charCodeAt(0) - 55;
      }
    }

    return (calculatedChecksum % 10) === checksum;
  }

  /**
   * Convert TLE to satellite data format
   */
  static tleToSatelliteData(tle: ParsedTLE): Partial<SatelliteData> {
    return {
      id: tle.noradId,
      name: tle.name,
      orbitalElements: tle.orbitalElements,
      metadata: {
        noradId: tle.noradId,
        internationalDesignator: tle.metadata.internationalDesignator || '',
        ...tle.metadata,
      } as SatelliteMetadata,
      dataSource: 'celestrak',
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Parse TLE from CelesTrak format
   */
  static parseCelesTrakTLE(rawData: string): ParsedTLE[] {
    return this.parseTLE(rawData);
  }

  /**
   * Parse TLE from Space-Track JSON format
   */
  static parseSpaceTrackTLE(jsonData: any[]): ParsedTLE[] {
    const tles: ParsedTLE[] = [];

    for (const item of jsonData) {
      if (item.TLE_LINE0 && item.TLE_LINE1 && item.TLE_LINE2) {
        const tle = this.parseSingleTLE(
          item.TLE_LINE0,
          item.TLE_LINE1,
          item.TLE_LINE2
        );
        tles.push(tle);
      }
    }

    return tles;
  }
}

// Import SatelliteData type for the return type
import { SatelliteData } from '@shared/types/satellite';


