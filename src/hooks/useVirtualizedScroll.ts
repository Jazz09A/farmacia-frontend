import { useCallback, useEffect, useRef, useState } from 'react';

interface VirtualizedScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

export const useVirtualizedScroll = <T>(
  items: T[],
  options: VirtualizedScrollOptions
) => {
  const { itemHeight, containerHeight, overscan = 5, threshold = 100 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const paddingTop = Math.max(0, (visibleStart - overscan) * itemHeight);
  const paddingBottom = Math.max(0, (items.length - visibleEnd - 1 - overscan) * itemHeight);

  const visibleItems = items.slice(
    Math.max(0, visibleStart - overscan),
    Math.min(items.length, visibleEnd + 1 + overscan)
  );

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (scrollElement) {
      // Use passive scroll listener for better performance
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return {
    scrollElementRef,
    visibleItems,
    paddingTop,
    paddingBottom,
    totalHeight: items.length * itemHeight
  };
};

export default useVirtualizedScroll; 