import { LoaderCircle } from 'lucide-react';

export const Spinner = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-canvas"
    >
      <LoaderCircle
        aria-hidden="true"
        size={20}
        strokeWidth={1.5}
        className="animate-spin text-accent-text"
      />
      <span className="sr-only">Loading</span>
    </div>
  );
};
