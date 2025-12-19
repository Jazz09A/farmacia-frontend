import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  // console.log('[ScrollToTop] Component rendered or updated.');

  useLayoutEffect(() => {
    // console.log(`[ScrollToTop] Effect triggered for pathname: "${pathname}"`);
    
    const currentScrollY = window.scrollY;
    // console.log(`[ScrollToTop] Current scroll position (before scroll): ${currentScrollY}`);

    if (currentScrollY > 0) {
      // console.log('[ScrollToTop] Attempting to scroll to top...');
      window.scrollTo({ top: 0, behavior: 'auto' });
      // console.log('[ScrollToTop] scrollTo(0, 0) called.');
    } else {
      // console.log('[ScrollToTop] Already at top. Scroll not needed.');
    }

  }, [pathname]);

  return null;
};

export default ScrollToTop;


