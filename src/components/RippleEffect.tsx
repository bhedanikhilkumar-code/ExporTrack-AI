import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global Ripple Effect component.
 * Attach this globally to listen for mousedown events on interactive elements
 * (buttons, nav items, cards). Does not interfere with React event handlers.
 */
export default function RippleEffect() {
  const location = useLocation();

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Find the closest interactive element
      const target = (e.target as HTMLElement).closest(
        'button, a, .btn-base, .btn-primary, .btn-secondary, .card-hover, .card-premium, .nav-item-hover'
      ) as HTMLElement;

      if (!target) return;

      // Ensure the element can contain the absolute positioned ripple
      const style = window.getComputedStyle(target);
      if (style.position === 'static') {
        target.style.position = 'relative';
      }
      // Ensure overflow is hidden to contain the ripple within rounded borders
      target.style.overflow = 'hidden';

      // Create the ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect-element';

      const rect = target.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      // Position the ripple where the click occurred
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;

      // Define color mode check to make ripples visible gracefully
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Inherit or adjust subtle color based on target's background brightness
      // For primary solid buttons, white semitransparent ripple often works well.
      // For ghost buttons/cards, a dark semitransparent ripple.
      const isPrimary = target.classList.contains('btn-primary') || style.backgroundColor === 'rgb(15, 23, 42)' || style.backgroundColor === 'rgb(13, 148, 136)';
      
      if (isPrimary) {
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
      } else {
        ripple.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      }

      target.appendChild(ripple);

      // Clean up the DOM element after animation completes (600ms)
      setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [location.pathname]); // Re-bind on route changes just in case, though global

  return null;
}
