import { Link } from 'react-router-dom';
import { useSession } from '../../../shared/auth/useSession';
import { ThemeToggle } from '../../../shared/ui/ThemeToggle';
import { Typewriter } from '../components/Typewriter';
import { GlassButton } from '../components/GlassButton';
import { AnimatedBackground } from '../components/AnimatedBackground';

export const HomePage = () => {
  const { user } = useSession();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-canvas text-text">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-wide">
          Zenith<span className="text-accent-text">AI</span>
        </h1>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {!user && (
            <>
              <Link to="/login" className="text-sm opacity-80 transition hover:opacity-100">
                Login
              </Link>
              <Link to="/register" className="text-sm opacity-80 transition hover:opacity-100">
                Register
              </Link>
            </>
          )}

          {user && (
            <Link
              to="/chat"
              className="rounded-lg bg-accent px-4 py-2 text-white transition hover:opacity-90"
            >
              Chat
            </Link>
          )}
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6">
        <AnimatedBackground />

        <div className="relative z-10 max-w-2xl text-center">
          <Typewriter
            text="Zenith AI — your AI assistant for debugging code like a pro!"
            speed={80}
          />

          <p className="mt-4 text-sm opacity-80 md:text-lg">
            Get real-time coding guidance and best practices for all languages.
          </p>

          <div className="mt-8">
            <GlassButton to={user ? '/chat' : '/login'}>Get Started</GlassButton>
          </div>
        </div>
      </main>

      <footer className="mt-auto flex w-full flex-col items-center justify-center gap-4 border-t border-white/20 bg-white/10 py-2 text-sm text-text shadow-inner shadow-white/5 backdrop-blur-md transition-colors md:flex-row dark:border-white/10 dark:bg-white/5">
        <p>© 2026 Zenith AI</p>

        <div className="flex gap-4">
          <Link
            to="/privacy"
            className="opacity-80 transition hover:text-accent-text hover:underline"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="opacity-80 transition hover:text-accent-text hover:underline"
          >
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
};
