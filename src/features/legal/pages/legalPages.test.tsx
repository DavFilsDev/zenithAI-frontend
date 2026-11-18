import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import { PrivacyPage } from './PrivacyPage';
import { TermsPage } from './TermsPage';

describe('legal pages', () => {
  it('renders the privacy layout with table of contents and shared chrome', () => {
    renderWithProviders(<PrivacyPage />, { route: '/privacy', path: '/privacy' });

    expect(screen.getByRole('link', { name: 'Zenith' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy' })).toBeInTheDocument();
    expect(screen.getByText('Last updated: 16 November 2026')).toBeInTheDocument();
    expect(screen.getByText(/refresh token is kept in/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Third-party model provider' }),
    ).toBeInTheDocument();

    const toc = screen.getByRole('navigation', { name: 'Table of contents', hidden: true });
    expect(within(toc).getByRole('link', { name: 'What is stored' })).toHaveAttribute(
      'href',
      '#what-is-stored',
    );
    expect(within(toc).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact');

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the terms layout and links to the privacy page', () => {
    renderWithProviders(<TermsPage />, { route: '/terms', path: '/terms' });

    expect(screen.getByRole('heading', { level: 1, name: 'Terms' })).toBeInTheDocument();
    expect(screen.getByText('Last updated: 16 November 2026')).toBeInTheDocument();
    expect(
      within(screen.getByRole('article')).getByRole('link', { name: 'Privacy' }),
    ).toHaveAttribute('href', '/privacy');

    const toc = screen.getByRole('navigation', { name: 'Table of contents', hidden: true });
    expect(within(toc).getByRole('link', { name: 'A free service' })).toHaveAttribute(
      'href',
      '#a-free-service',
    );
  });
});
