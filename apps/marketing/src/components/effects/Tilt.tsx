import { useRef, type ReactNode, useState } from 'react';

/**
 * Tilt — subtle 3D rotation following the cursor. Disables under
 * prefers-reduced-motion. Inspired by Motion Primitives' Tilt.
 *
 * Used: hero phone mockup hover.
 */
interface Props {
  children: ReactNode;
  max?: number;
  className?: string;
}

export default function Tilt({ children, max = 6, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(900px) rotateX(0deg) rotateY(0deg)');

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onMove(e: React.MouseEvent) {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = (-py * max).toFixed(2);
    const ry = (px * max).toFixed(2);
    setTransform(`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`);
  }

  function onLeave() {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg)');
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transform, transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}
