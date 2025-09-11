import { useState, useEffect } from 'react';

interface ResponsiveState {
  width: number;
  height: number;
  aspectRatio: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  devicePixelRatio: number;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      aspectRatio: width / height,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setState({
        width,
        height,
        aspectRatio: width / height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        devicePixelRatio: window.devicePixelRatio || 1,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
};
