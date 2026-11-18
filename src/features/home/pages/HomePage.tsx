import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../../shared/auth/useSession';
import { Button } from '../../../shared/ui/Button';
import { ThemeToggle } from '../../../shared/ui/ThemeToggle';

export const HomePage = () => {
  const { user } = useSession();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-canvas text-text">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <h1 className="text-h3 text-text">Zenith AI</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!user && (
            <>
              <Link to="/login" className="text-ui text-text-secondary hover:text-text">
                Log in
              </Link>
              <Link to="/register" className="text-ui text-text-secondary hover:text-text">
                Register
              </Link>
            </>
          )}
          {user && (
            <Link to="/chat" className="text-ui text-text-secondary hover:text-text">
              Chat
            </Link>
          )}
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex max-w-[720px] flex-col items-start gap-4 px-4 py-16 sm:px-6"
      >
        <h2 className="text-h1 text-text">Zenith AI</h2>
        <p className="text-body text-text-secondary">A chat interface for coding assistance.</p>
        <Button
          variant="primary"
          onClick={() => {
            void navigate(user ? '/chat' : '/login');
          }}
        >
          Continue
        </Button>
      </main>

      <footer className="border-t border-border px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[720px] items-center gap-4 text-small text-text-secondary">
          <Link to="/privacy" className="hover:text-text">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-text">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
};
