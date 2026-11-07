import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../shared/ui/ThemeProvider';
import { ApiError } from '../shared/api/apiError';
import { ProfileBootstrap } from './ProfileBootstrap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && [401, 403, 404, 429].includes(error.status)) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ProfileBootstrap>
          {children}
          <Toaster position="top-right" />
        </ProfileBootstrap>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
