import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect scroll direction and visibility for auto-hiding headers.
 * Optimized with requestAnimationFrame for smooth performance.
 */
export function useScrollDirection(threshold = 10, offset = 80) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    // Optimization: avoid event listener if not in browser
    if (typeof window === 'undefined') return;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;

      // Ignore small movements
      if (Math.abs(scrollY - lastScrollY.current) < threshold) {
        ticking.current = false;
        return;
      }

      // Scroll Down + passed certain offset -> Hide
      if (scrollY > lastScrollY.current && scrollY > offset) {
        setIsVisible(false);
      } 
      // Scroll Up -> Show
      else {
        setIsVisible(true);
      }

      lastScrollY.current = scrollY > 0 ? scrollY : 0;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold, offset]);

  return isVisible;
}
