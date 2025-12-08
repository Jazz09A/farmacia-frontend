import { useState, useEffect, useRef } from 'react';

/**
 * Hook para obtener la altura dinámica del navbar
 * Calcula automáticamente la altura del navbar y se actualiza cuando cambia
 */
export const useNavbarHeight = (): number => {
  const [navbarHeight, setNavbarHeight] = useState(0);
  const isInitialized = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const calculateNavbarHeight = () => {
      try {
        const navbar = document.querySelector('[data-navbar]') as HTMLElement;
        if (navbar) {
          // Force a reflow to ensure accurate measurements
          navbar.offsetHeight;
          const height = navbar.getBoundingClientRect().height;
          
          if (height > 0) {
            setNavbarHeight(height);
            isInitialized.current = true;
          }
        }
      } catch (error) {
        console.warn('Error calculating navbar height:', error);
      }
    };

    // Initial calculation with multiple attempts to ensure navbar is rendered
    const attemptCalculation = (attempts = 0) => {
      if (attempts > 10) return; // Prevent infinite loops
      
      calculateNavbarHeight();
      
      if (!isInitialized.current && attempts < 10) {
        setTimeout(() => attemptCalculation(attempts + 1), 50);
      }
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        attemptCalculation();
      });
    } else {
      attemptCalculation();
    }

    // Set up ResizeObserver for dynamic updates
    resizeObserverRef.current = new ResizeObserver(() => {
      // Debounce the calculation to prevent excessive calls
      setTimeout(calculateNavbarHeight, 16);
    });

    const navbar = document.querySelector('[data-navbar]');
    if (navbar && resizeObserverRef.current) {
      resizeObserverRef.current.observe(navbar);
    }

    // Listen for window resize
    const handleResize = () => setTimeout(calculateNavbarHeight, 16);
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Sin dependencias para evitar loops infinitos

  return navbarHeight;
};

