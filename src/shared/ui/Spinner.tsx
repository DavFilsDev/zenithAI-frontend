export const Spinner = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-canvas"
    >
      <div
        aria-hidden="true"
        className="h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-accent"
      />
      <span className="sr-only">Loading</span>
    </div>
  );
};
