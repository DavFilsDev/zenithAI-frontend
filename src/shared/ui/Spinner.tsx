export const Spinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))]">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[rgb(var(--color-primary))]" />
    </div>
  );
};
