export const Spinner = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--color-bg))]">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-[rgb(var(--color-primary))]" />
    </div>
  );
};
