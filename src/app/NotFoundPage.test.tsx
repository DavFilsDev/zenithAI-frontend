import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { AppRoutes } from './router';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('renders a 404 heading and a link home', () => {
    renderWithProviders(<NotFoundPage />, { route: '/missing', path: '*' });

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });

  it('renders for unknown routes', async () => {
    renderWithProviders(<AppRoutes />, { route: '/does-not-exist', path: '*' });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    });
  });
});
