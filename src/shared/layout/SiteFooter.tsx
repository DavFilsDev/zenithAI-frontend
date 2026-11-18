import { Link } from 'react-router-dom';
import { ServiceStatus } from '../../features/status/components/ServiceStatus';

export const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-canvas px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-text-secondary">
          <Link
            to="/privacy"
            className="transition-colors duration-fast hover:text-text focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="transition-colors duration-fast hover:text-text focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none"
          >
            Terms
          </Link>
          <ServiceStatus variant="inline" />
        </div>
        <p className="font-mono text-small text-text-tertiary">© 2026 Zenith AI</p>
      </div>
    </footer>
  );
};
