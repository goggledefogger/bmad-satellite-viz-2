/**
 * Color design tokens for the satellite visualization platform
 */

export const colors = {
  // Space-themed color palette
  space: {
    deep: '#0B0E14',
    dark: '#1A1F2E',
    medium: '#2D3748',
    light: '#4A5568',
  },

  // Cosmic gradients
  cosmic: {
    blue: '#1E3A8A',
    purple: '#7C3AED',
    violet: '#A855F7',
    indigo: '#4338CA',
  },

  // Satellite type colors
  satellite: {
    communication: '#3B82F6', // Blue
    weather: '#10B981', // Green
    military: '#EF4444', // Red
    scientific: '#8B5CF6', // Purple
    navigation: '#F59E0B', // Amber
    spaceStation: '#EC4899', // Pink
    debris: '#6B7280', // Gray
    other: '#9CA3AF', // Light gray
  },

  // UI colors
  ui: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  },

  // Text colors
  text: {
    primary: '#F7FAFC',
    secondary: '#A0AEC0',
    muted: '#718096',
    inverse: '#1A202C',
  },

  // Background colors
  background: {
    primary: '#0B0E14',
    secondary: '#1A1F2E',
    tertiary: '#2D3748',
    overlay: 'rgba(11, 14, 20, 0.8)',
  },

  // Border colors
  border: {
    primary: '#2D3748',
    secondary: '#4A5568',
    focus: '#3B82F6',
    error: '#EF4444',
  },
} as const;

export type ColorToken = typeof colors;
