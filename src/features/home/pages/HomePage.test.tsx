import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { HomePage } from './HomePage';
import { ThemeProvider } from '../../../shared/ui/ThemeProvider';
import { useSessionStore } from '../../../shared/auth/sessionStore';

const renderHomePage = () =>
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<div>login page</div>} />
          <Route path="/chat" element={<div>chat page</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('HomePage', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null, status: 'anonymous' });
  });

  it('renders anonymous actions and continues to login', async () => {
    const user = userEvent.setup();
    renderHomePage();

    expect(screen.getByRole('heading', { name: 'Zenith AI', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('A chat interface for coding assistance.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('link', { name: 'Chat' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('shows authenticated actions and continues to chat', async () => {
    useSessionStore.setState({
      user: { id: 1, email: 'ada@example.com', username: 'ada' },
      status: 'authenticated',
    });
    const user = userEvent.setup();
    renderHomePage();

    expect(screen.getByRole('link', { name: 'Chat' })).toHaveAttribute('href', '/chat');
    expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Register' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('chat page')).toBeInTheDocument();
  });
});
