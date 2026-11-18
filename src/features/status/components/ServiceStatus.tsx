import { useEffect, useState } from 'react';
import { deriveServiceState, type ServiceState } from '../model/serviceState';
import { useServiceHealth } from '../model/useServiceHealth';

const labels: Record<ServiceState, string> = {
  online: 'Service online',
  waking: 'Starting the service…',
  unavailable: 'Service unavailable',
};

const dotClasses: Record<ServiceState, string> = {
  online: 'bg-success',
  waking: 'bg-warning',
  unavailable: 'bg-danger',
};

interface ServiceStatusProps {
  variant?: 'floating' | 'inline';
  className?: string;
}

export const ServiceStatus = ({ variant = 'floating', className = '' }: ServiceStatusProps) => {
  const { data, error, isPending, isFetching, refetch } = useServiceHealth();
  const [showSlowState, setShowSlowState] = useState(false);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const timer = setTimeout(() => setShowSlowState(true), 1_500);
    return () => clearTimeout(timer);
  }, [isPending]);

  if (isPending && !showSlowState) {
    return null;
  }

  const state = deriveServiceState(data, error);
  const canRetry = state !== 'online';

  const pill = (
    <div
      className={`flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-small text-text ${variant === 'floating' ? 'pointer-events-auto' : ''} ${className}`.trim()}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotClasses[state]}`} />
      <span>{labels[state]}</span>
      {state === 'waking' && variant === 'floating' && (
        <span className="text-text-secondary">This can take up to 30 seconds.</span>
      )}
      {canRetry && (
        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
          disabled={isFetching}
          className="rounded-[var(--radius-sm)] px-1 text-text-secondary underline underline-offset-2 transition-colors duration-fast hover:text-text focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none disabled:cursor-wait disabled:no-underline"
        >
          {isFetching ? 'Checking…' : 'Retry'}
        </button>
      )}
    </div>
  );

  if (variant === 'inline') {
    return (
      <div role="status" aria-live="polite" className="inline-flex">
        {pill}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 justify-center"
    >
      {pill}
    </div>
  );
};
