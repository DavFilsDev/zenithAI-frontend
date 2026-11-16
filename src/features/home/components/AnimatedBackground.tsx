import { useEffect, useState } from 'react';
import bgLarge from '../../../assets/code-bg.webp';
import bgSmall from '../../../assets/code-bg-768.webp';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';

export const AnimatedBackground = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 20;
      const y = (event.clientY / window.innerHeight - 0.5) * 20;

      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <img
        src={bgSmall}
        srcSet={`${bgSmall} 768w, ${bgLarge} 1536w`}
        sizes="(min-width: 768px) 1600px, 100vw"
        alt=""
        width={1536}
        height={1024}
        decoding="async"
        fetchPriority="high"
        className="w-full max-w-[1600px] opacity-[0.08] transition-transform duration-700 ease-out select-none"
        style={
          prefersReducedMotion
            ? undefined
            : {
                transform: `translate(${position.x}px, ${position.y}px) rotate(${position.x * 0.15}deg)`,
              }
        }
      />
    </div>
  );
};
