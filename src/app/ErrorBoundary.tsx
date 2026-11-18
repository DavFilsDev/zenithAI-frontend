import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logError } from '../shared/lib/logger';
import { Button } from '../shared/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError('render', { error, info });
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const errorCode = this.state.error?.name;

    return (
      <main className="flex min-h-dvh items-start bg-canvas px-4 py-16 text-text sm:px-6">
        <div role="alert" className="mx-auto w-full max-w-[720px]">
          <h1 className="text-h1 text-text">Something went wrong</h1>
          <p className="mt-4 max-w-prose text-body text-text-secondary">
            The page could not render. Reload to start again; your conversation data is safe.
          </p>
          {errorCode ? (
            <p className="mt-3 font-mono text-small text-text-tertiary">{errorCode}</p>
          ) : null}
          <div className="mt-8">
            <Button type="button" variant="primary" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
