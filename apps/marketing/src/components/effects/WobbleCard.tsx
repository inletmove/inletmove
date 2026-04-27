import { useRef, useState, type ReactNode } from 'react';

/**
 * WobbleCard — small parallax wobble on cursor. Inspired by Aceternity's
 * Wobble Card, simplified into a single-element transform driven by mouse
 * position. No framer-motion needed — bare CSS transform + transition.
 *
 * Reduced motion: no transform, just hover-shadow.
 */
interface Props {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export default function WobbleCard({ children, className = '', intensity = 8 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translate3d(0,0,0)');

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onMove(e: React.MouseEvent) {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * intensity;
    const y = ((e.clientY - r.top) / r.height - 0.5) * intensity;
    setTransform(`translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`);
  }

  function onLeave() {
    setTransform('translate3d(0,0,0)');
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transform, transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {children}
    </div>
  );
}
