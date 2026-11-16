import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';
import { ThemeProvider } from '../../../shared/ui/ThemeProvider';
import { useSessionStore } from '../../../shared/auth/sessionStore';

const renderHomePage = () =>
  render(
    <ThemeProvider>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('HomePage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders anonymous actions and animates the background and copy', () => {
    vi.useFakeTimers();
    const { unmount } = renderHomePage();

    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', '/login');
    expect(screen.getByAltText('background')).toBeInTheDocument();

    fireEvent.mouseMove(window, { clientX: 512, clientY: 384 });
    act(() => {
      vi.advanceTimersByTime(160);
    });

    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('Z');

    unmount();
  });

  it('points authenticated users to chat', () => {
    useSessionStore.setState({
      user: { id: 1, email: 'ada@example.com', username: 'ada' },
      status: 'authenticated',
    });

    renderHomePage();

    expect(screen.getByRole('link', { name: 'Chat' })).toHaveAttribute('href', '/chat');
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', '/chat');
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
  });
});
