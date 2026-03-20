import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect scroll direction and visibility for auto-hiding headers.
 * Optimized with requestAnimationFrame for smooth performance and handles
 * edge cases like iOS bounce and "at top" visibility.
 */
export function useScrollDirection(threshold = 10, offset = 20) {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY || window.pageYOffset;

      // Handle iOS bounce (negative scrollY)
      if (scrollY < 0) {
        setIsVisible(true);
        setIsScrolled(false);
        lastScrollY.current = 0;
        ticking.current = false;
        return;
      }

      // Track if we are scrolled past offset
      setIsScrolled(scrollY > offset);

      // At the top of the page, the header should ALWAYS be visible
      if (scrollY < offset) {
        setIsVisible(true);
        lastScrollY.current = scrollY;
        ticking.current = false;
        return;
      }

      // Ignore small movements (threshold)
      if (Math.abs(scrollY - lastScrollY.current) < threshold) {
        ticking.current = false;
        return;
      }

      // Scroll Down -> Hide
      if (scrollY > lastScrollY.current) {
        setIsVisible(false);
      } 
      // Scroll Up -> Show
      else {
        setIsVisible(true);
      }

      lastScrollY.current = scrollY;
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

  return { isVisible, isScrolled };
}
