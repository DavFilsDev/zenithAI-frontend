import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';
import { ThemeProvider } from '../../../shared/ui/ThemeProvider';
import { useSessionStore } from '../../../shared/auth/sessionStore';

vi.mock('../../status/model/useServiceHealth', () => ({
  useServiceHealth: () => ({
    data: { status: 'ok', database: 'ok' },
    error: null,
    isPending: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

const renderHomePage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<div>login page</div>} />
            <Route path="/register" element={<div>register page</div>} />
            <Route path="/chat" element={<div>chat page</div>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null, status: 'anonymous' });
  });

  it('renders hero, capabilities, preview, and anonymous actions', () => {
    renderHomePage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Chat for code and writing' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Ask questions, review code, and draft text in a streaming conversation. Free to use with no credits or payment required.',
      ),
    ).toBeInTheDocument();

    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(within(header).getByRole('link', { name: 'Sign up' })).toHaveAttribute(
      'href',
      '/register',
    );

    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute(
      'href',
      '/register',
    );
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');

    expect(screen.getByText('Streaming responses')).toBeInTheDocument();
    expect(screen.getByText('Conversation history')).toBeInTheDocument();
    expect(screen.getByLabelText('Chat preview')).toBeInTheDocument();

    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'Privacy' })).toHaveAttribute(
      'href',
      '/privacy',
    );
    expect(within(footer).getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
    expect(within(footer).getByText('Service online')).toBeInTheDocument();
  });

  it('shows authenticated actions', () => {
    useSessionStore.setState({
      user: { id: 1, email: 'ada@example.com', username: 'ada' },
      status: 'authenticated',
    });
    renderHomePage();

    const openChatLinks = screen.getAllByRole('link', { name: 'Open chat' });
    expect(openChatLinks.length).toBeGreaterThanOrEqual(1);
    openChatLinks.forEach((link) => expect(link).toHaveAttribute('href', '/chat'));
    expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Create account' })).not.toBeInTheDocument();
  });
});
