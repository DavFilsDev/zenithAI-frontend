import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
}

export const Typewriter = ({ text, speed = 100 }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((previous) => previous + text[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [index, text, speed]);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((previous) => !previous), 500);
    return () => clearInterval(blink);
  }, []);

  return (
    <h2 className="text-3xl md:text-5xl font-bold leading-tight">
      {displayedText}
      <span
        className={`
          ml-1
          text-[rgb(var(--color-primary))]
          ${showCursor ? 'opacity-100' : 'opacity-0'}
        `}
      >
        |
      </span>
    </h2>
  );
};
