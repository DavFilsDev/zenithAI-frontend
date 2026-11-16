import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logError } from '../shared/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError('render', { error, info });
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[rgb(var(--color-bg))] p-6 text-[rgb(var(--color-text))]">
        <div
          role="alert"
          className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/5"
        >
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-3 text-sm opacity-70">
            The page could not render. Reload to start again; your conversation data is safe.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[rgb(var(--color-primary))] px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Reload the app
          </button>
        </div>
      </main>
    );
  }
}
