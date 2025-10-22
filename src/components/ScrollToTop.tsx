import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollContext } from '../contexts/ScrollContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { scrollToTop } = useScrollContext();

  useEffect(() => {
    // Use the context's method, ensuring behavior is consistent with the app's architecture.
    // Set smooth to false for instant scrolling on navigation.
    scrollToTop({ smooth: false });
  }, [pathname, scrollToTop]);

  return null;
};

export default ScrollToTop;
