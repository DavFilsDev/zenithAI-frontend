import { Link } from 'react-router-dom';
import { SiteFooter } from '../shared/layout/SiteFooter';
import { SiteHeader } from '../shared/layout/SiteHeader';
import { getButtonClassName } from '../shared/ui/buttonStyles';

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-text">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-start px-4 py-16 sm:px-6">
        <h1 className="text-h1 text-text">Page not found</h1>
        <p className="mt-4 max-w-prose text-body text-text-secondary">
          The page you requested does not exist or has moved.
        </p>
        <Link to="/" className={getButtonClassName({ variant: 'primary', className: 'mt-8' })}>
          Back to home
        </Link>
      </main>

      <SiteFooter />
    </div>
  );
};
