import { useRef, useState, useEffect } from 'react';

/**
 * Smooth mouse-tracking glow using requestAnimationFrame.
 * @param {Object} options
 * @param {'div'|'text'} options.mode - 'div' = position a glow element; 'text' = set CSS vars for background-clip:text glow
 * @param {React.RefObject} options.coordinateRef - element for coordinate space (default: container). Use text element when gradient is on child.
 */
export function useMouseGlow(options = {}) {
  const { mode = 'div', coordinateRef } = options;
  const containerRef = useRef(null);
  const glowRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const glow = mode === 'div' ? glowRef.current : null;
    if (mode === 'div' && !glow) return;

    const lerp = (a, b, t) => a + (b - a) * t;
    const SMOOTH = 0.22;

    const updateGlow = () => {
      const target = targetRef.current;
      const current = currentRef.current;
      current.x = lerp(current.x, target.x, SMOOTH);
      current.y = lerp(current.y, target.y, SMOOTH);
      if (mode === 'div' && glow) {
        glow.style.left = `${current.x}px`;
        glow.style.top = `${current.y}px`;
      } else if (mode === 'text') {
        const varsEl = coordinateRef?.current || container;
        varsEl.style.setProperty('--mouse-x', `${current.x}px`);
        varsEl.style.setProperty('--mouse-y', `${current.y}px`);
      }
      rafRef.current = requestAnimationFrame(updateGlow);
    };

    const handleMove = (e) => {
      const coordEl = coordinateRef?.current || container;
      const rect = coordEl.getBoundingClientRect();
      targetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (!rafRef.current) {
        currentRef.current = { ...targetRef.current };
        rafRef.current = requestAnimationFrame(updateGlow);
      }
    };

    const handleLeave = () => {
      setIsHovering(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      /* Don't remove CSS vars on leave - avoids flash when [data-hover] is removed */
    };

    const handleEnter = (e) => {
      setIsHovering(true);
      const coordEl = coordinateRef?.current || container;
      const rect = coordEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetRef.current = { x, y };
      currentRef.current = { x, y };
      if (mode === 'text') {
        const varsEl = coordinateRef?.current || container;
        varsEl.style.setProperty('--mouse-x', `${x}px`);
        varsEl.style.setProperty('--mouse-y', `${y}px`);
      } else if (mode === 'div' && glow) {
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
      }
      if (!rafRef.current) rafRef.current = requestAnimationFrame(updateGlow);
    };

    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseleave', handleLeave);
    container.addEventListener('mouseenter', handleEnter);

    return () => {
      container.removeEventListener('mousemove', handleMove);
      container.removeEventListener('mouseleave', handleLeave);
      container.removeEventListener('mouseenter', handleEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mode, coordinateRef]);

  return { containerRef, glowRef, isHovering };
}
