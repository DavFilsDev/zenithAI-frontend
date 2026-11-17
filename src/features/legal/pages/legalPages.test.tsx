import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import { PrivacyPage } from './PrivacyPage';
import { TermsPage } from './TermsPage';

describe('legal pages', () => {
  it('describes what the application stores', () => {
    renderWithProviders(<PrivacyPage />, { route: '/privacy', path: '/privacy' });

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy' })).toBeInTheDocument();
    expect(screen.getByText(/refresh token is kept in/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Third-party model provider' }),
    ).toBeInTheDocument();
  });

  it('links the terms to the privacy page', () => {
    renderWithProviders(<TermsPage />, { route: '/terms', path: '/terms' });

    expect(screen.getByRole('heading', { level: 1, name: 'Terms' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Privacy' })[0]).toHaveAttribute('href', '/privacy');
  });
});
