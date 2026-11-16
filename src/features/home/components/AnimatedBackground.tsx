import { useEffect, useState } from 'react';
import bg from '../../../assets/code-bg.png';

export const AnimatedBackground = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <img
        src={bg}
        alt="background"
        className="w-[1200px] opacity-[0.08] transition-transform duration-700 ease-out select-none md:w-[1600px]"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotate(${position.x * 0.15}deg)`,
        }}
      />
    </div>
  );
};
