import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '../shared/ui/ThemeProvider';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

const LocationProbe = () => {
  const location = useLocation();
  return <output aria-label="location">{location.pathname}</output>;
};

interface RenderOptions {
  route?: string;
  path?: string;
}

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', path = '*' }: RenderOptions = {},
) => {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[route]}>
            <LocationProbe />
            <Routes>
              <Route path={path} element={ui} />
            </Routes>
            <Toaster />
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    ),
  };
};

export const createTestWrapper = (queryClient = createTestQueryClient()) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  return { wrapper, queryClient };
};

export const renderHookWithProviders = <Result, Props>(
  callback: (initialProps: Props) => Result,
  queryClient = createTestQueryClient(),
) => {
  const { wrapper } = createTestWrapper(queryClient);
  return {
    queryClient,
    ...renderHook(callback, { wrapper }),
  };
};
