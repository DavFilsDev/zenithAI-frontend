import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../../shared/ui/ThemeToggle';

interface LegalLayoutProps {
  title: string;
  updatedAt: string;
  children: ReactNode;
}

export const LegalLayout = ({ title, updatedAt, children }: LegalLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-text">
      <header className="border-b border-white/10 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-wide">
            Zenith<span className="text-accent-text">AI</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link to="/" className="text-sm font-medium text-accent-text hover:underline">
          Back to home
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm opacity-60">Last updated: {updatedAt}</p>

        <article className="prose prose-sm mt-8 max-w-none dark:prose-invert">{children}</article>
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-sm">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4">
          <p className="opacity-70">© 2026 Zenith AI</p>
          <nav aria-label="Legal" className="flex gap-4">
            <Link to="/privacy" className="opacity-80 hover:underline">
              Privacy
            </Link>
            <Link to="/terms" className="opacity-80 hover:underline">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};
