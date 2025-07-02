import { useEffect, memo } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = memo(() => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll if we're not already at the top to avoid unnecessary operations
    if (window.pageYOffset > 0) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      });
    }
  }, [pathname]);

  return null;
});

ScrollToTop.displayName = 'ScrollToTop';

export default ScrollToTop; 