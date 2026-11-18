import { useEffect, useState } from 'react';
import { deriveServiceState, type ServiceState } from '../model/serviceState';
import { useServiceHealth } from '../model/useServiceHealth';

const labels: Record<ServiceState, string> = {
  online: 'Service online',
  waking: 'Starting the service…',
  unavailable: 'Service unavailable',
};

const dotClasses: Record<ServiceState, string> = {
  online: 'bg-green-400',
  waking: 'animate-pulse bg-amber-400',
  unavailable: 'bg-red-400',
};

const pillClasses: Record<ServiceState, string> = {
  online: 'border-green-400/30 bg-white/90 text-slate-700 dark:bg-slate-900/90 dark:text-slate-200',
  waking: 'border-amber-400/30 bg-white/95 text-slate-800 dark:bg-slate-900/95 dark:text-slate-100',
  unavailable:
    'border-red-400/30 bg-white/95 text-slate-800 dark:bg-slate-900/95 dark:text-slate-100',
};

export const ServiceStatus = () => {
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

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-2 text-center text-sm shadow-lg"
    >
      <div
        className={`pointer-events-auto flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md ${pillClasses[state]}`}
      >
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotClasses[state]}`} />
        <span>{labels[state]}</span>
        {state === 'waking' && <span className="opacity-70">This can take up to 30 seconds.</span>}
        {canRetry && (
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            disabled={isFetching}
            className="rounded-full px-2 py-0.5 font-semibold underline underline-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isFetching ? 'Checking…' : 'Retry'}
          </button>
        )}
      </div>
    </div>
  );
};
