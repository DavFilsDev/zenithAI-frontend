import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, type ToastPosition } from 'react-hot-toast';
import { ThemeProvider } from '../shared/ui/ThemeProvider';
import { tokenManager } from '../shared/api/tokenManager';
import { useSessionStore } from '../shared/auth/sessionStore';

const ProfileBootstrap = lazy(() =>
  import('./ProfileBootstrap').then((module) => ({ default: module.ProfileBootstrap })),
);

const ServiceStatus = lazy(() =>
  import('../features/status/components/ServiceStatus').then((module) => ({
    default: module.ServiceStatus,
  })),
);

const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  const status =
    typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : null;

  if (status !== null && [401, 403, 404, 429].includes(status)) {
    return false;
  }

  return failureCount < 2;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const status = useSessionStore((state) => state.status);
  const shouldBootstrap = status !== 'anonymous' || tokenManager.hasRefreshToken();
  const [toastPosition, setToastPosition] = useState<ToastPosition>('bottom-center');

  useEffect(() => {
    const media = window.matchMedia('(min-width: 640px)');
    const update = () => setToastPosition(media.matches ? 'bottom-right' : 'bottom-center');
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {shouldBootstrap ? (
          <Suspense fallback={children}>
            <ProfileBootstrap>{children}</ProfileBootstrap>
          </Suspense>
        ) : (
          children
        )}
        <Toaster position={toastPosition} />
        <Suspense fallback={null}>
          <ServiceStatus />
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
