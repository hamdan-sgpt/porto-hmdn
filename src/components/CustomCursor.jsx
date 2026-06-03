import { useEffect, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const outlineRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const outlinePos = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);
  const rafRef = useRef(null);
  const isMobileRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const checkMobile = () => {
      isMobileRef.current =
        window.innerWidth <= 768 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;

      if (dotRef.current) dotRef.current.style.display = isMobileRef.current ? 'none' : '';
      if (outlineRef.current) outlineRef.current.style.display = isMobileRef.current ? 'none' : '';
    };

    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });

    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (!target || !target.tagName) return;
      try {
        const tag = target.tagName.toLowerCase();
        isHoveringRef.current =
          tag === 'a' ||
          tag === 'button' ||
          !!target.closest('a') ||
          !!target.closest('button') ||
          target.dataset?.cursor === 'hover' ||
          target.classList?.contains('hover-trigger');
      } catch {
        isHoveringRef.current = false;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });

    // Smooth animation loop using direct DOM updates — no React re-renders
    const animate = () => {
      if (!mountedRef.current) return;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hovering = isHoveringRef.current;

      // Dot — instant follow
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
        dotRef.current.style.opacity = hovering ? '0' : '1';
      }

      // Outline — lerp for smooth trailing
      outlinePos.current.x += (mx - outlinePos.current.x) * 0.15;
      outlinePos.current.y += (my - outlinePos.current.y) * 0.15;

      if (outlineRef.current) {
        const s = hovering ? 1.8 : 1;
        outlineRef.current.style.transform = `translate3d(${outlinePos.current.x - 20}px, ${outlinePos.current.y - 20}px, 0) scale(${s})`;
        outlineRef.current.style.backgroundColor = hovering ? 'rgba(255,255,255,0.1)' : 'transparent';
        outlineRef.current.style.borderColor = hovering ? 'transparent' : 'rgba(255,255,255,0.5)';
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={outlineRef} className="cursor-outline" />
    </>
  );
};

export default CustomCursor;
