export const SkipLink = () => {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-index-toast)] focus:rounded-[var(--radius)] focus:border focus:border-border focus:bg-surface focus:px-3 focus:py-2 focus:text-ui focus:text-text focus:shadow-float"
    >
      Skip to content
    </a>
  );
};
