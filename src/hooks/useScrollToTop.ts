import { useCallback, useRef } from 'react';

interface ScrollToTopOptions {
  smooth?: boolean;
  offset?: number;
}

export const useScrollToTop = () => {
  const lastScrollRef = useRef<number>(0);

  const scrollToTop = useCallback((options: ScrollToTopOptions = {}) => {
    const { smooth = true, offset = 0 } = options;
    const targetPosition = offset;
    
    // Avoid unnecessary scrolls if already at target position
    if (Math.abs(window.pageYOffset - targetPosition) < 5) return;
    
    // Throttle scroll calls to avoid performance issues
    const now = Date.now();
    if (now - lastScrollRef.current < 16) return; // ~60fps
    lastScrollRef.current = now;
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      window.scrollTo({
        top: targetPosition,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    });
  }, []);

  const scrollToElement = useCallback((elementId: string, options: ScrollToTopOptions = {}) => {
    const { smooth = true, offset = 0 } = options;
    
    // Use requestAnimationFrame for DOM operation
    requestAnimationFrame(() => {
      const element = document.getElementById(elementId);
      
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const targetPosition = elementPosition - offset;
        
        // Avoid unnecessary scrolls
        if (Math.abs(window.pageYOffset - targetPosition) < 5) return;
        
        window.scrollTo({
          top: targetPosition,
          left: 0,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    });
  }, []);

  return { scrollToTop, scrollToElement };
};

export default useScrollToTop; 