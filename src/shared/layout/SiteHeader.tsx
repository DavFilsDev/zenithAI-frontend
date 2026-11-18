import { Link } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { getButtonClassName } from '../ui/buttonStyles';
import { ThemeToggle } from '../ui/ThemeToggle';

export const SiteHeader = () => {
  const { user } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-canvas px-4 sm:px-6">
      <Link
        to="/"
        className="text-h3 font-semibold tracking-[-0.01em] text-text focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none"
      >
        Zenith
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <Link to="/chat" className={getButtonClassName({ variant: 'primary', size: 'sm' })}>
            Open chat
          </Link>
        ) : (
          <>
            <Link to="/login" className={getButtonClassName({ variant: 'ghost', size: 'sm' })}>
              Log in
            </Link>
            <Link to="/register" className={getButtonClassName({ variant: 'primary', size: 'sm' })}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};
