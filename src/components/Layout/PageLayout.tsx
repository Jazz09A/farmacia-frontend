import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Pages that shouldn't have navbar spacing (admin routes, HomePage with hero)
  const excludedRoutes = ['/admin'];
  const shouldApplySpacing = !excludedRoutes.some(route => location.pathname.startsWith(route)) 
                           && location.pathname !== '/';

  const calculateNavbarHeight = useCallback(() => {
    const navbar = document.querySelector('[data-navbar]') as HTMLElement;
    if (navbar) {
      // Force a reflow to ensure accurate measurements
      navbar.offsetHeight;
      const height = navbar.getBoundingClientRect().height;
      
      if (height > 0) {
        setNavbarHeight(height);
        // Set CSS custom property for immediate use
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
        setIsInitialized(true);
      }
    }
  }, []);

  useEffect(() => {
    // Initial calculation with multiple attempts to ensure navbar is rendered
    const attemptCalculation = (attempts = 0) => {
      if (attempts > 10) return; // Prevent infinite loops
      
      calculateNavbarHeight();
      
      if (!isInitialized && attempts < 10) {
        setTimeout(() => attemptCalculation(attempts + 1), 50);
      }
    };

    attemptCalculation();

    // Set up observers for dynamic updates
    const resizeObserver = new ResizeObserver(() => {
      // Debounce the calculation to prevent excessive calls
      setTimeout(calculateNavbarHeight, 16);
    });

    const intersectionObserver = new IntersectionObserver(() => {
      calculateNavbarHeight();
    });

    const navbar = document.querySelector('[data-navbar]');
    if (navbar) {
      resizeObserver.observe(navbar);
      intersectionObserver.observe(navbar);
    }

    // Listen for window resize and scroll
    const handleResize = () => setTimeout(calculateNavbarHeight, 16);
    const handleScroll = () => {
      // Only recalculate if navbar height might change on scroll
      requestAnimationFrame(calculateNavbarHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [calculateNavbarHeight, isInitialized, location.pathname]);

  // Don't apply spacing for excluded routes
  if (!shouldApplySpacing) {
    return <>{children}</>;
  }

  return (
    <div 
      style={{
        paddingTop: navbarHeight > 0 ? `${navbarHeight}px` : undefined,
        width: '100%',
        maxWidth: '100%'
      }}
      className="page-content flex-1"
    >
      {children}
    </div>
  );
}; 