import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';

interface TypewriterProps {
  text: string;
  speed?: number;
}

export const Typewriter = ({ text, speed = 100 }: TypewriterProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion || index >= text.length) {
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText((previous) => previous + text[index]);
      setIndex(index + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [index, text, speed, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const blink = setInterval(() => setShowCursor((previous) => !previous), 500);
    return () => clearInterval(blink);
  }, [prefersReducedMotion]);

  return (
    <h2 aria-label={text} className="text-3xl leading-tight font-bold md:text-5xl">
      {prefersReducedMotion ? text : displayedText}
      {!prefersReducedMotion && (
        <span
          aria-hidden="true"
          className={`ml-1 text-[rgb(var(--color-primary))] ${showCursor ? 'opacity-100' : 'opacity-0'} `}
        >
          |
        </span>
      )}
    </h2>
  );
};
