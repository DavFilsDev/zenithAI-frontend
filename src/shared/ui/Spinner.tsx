export const Spinner = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-[rgb(var(--color-bg))]"
    >
      <div
        aria-hidden="true"
        className="h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-[rgb(var(--color-primary))]"
      />
      <span className="sr-only">Loading</span>
    </div>
  );
};
