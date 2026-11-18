import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { server } from '../../../test/msw/node';
import { renderWithProviders } from '../../../test/utils';
import { useSessionStore } from '../../../shared/auth/sessionStore';
import { tokenManager } from '../../../shared/api/tokenManager';

describe('authentication flows', () => {
  it('signs in and redirects to chat', async () => {
    server.use(
      http.post('http://localhost:8000/api/v1/auth/token/', () =>
        HttpResponse.json({
          access: 'access-token',
          refresh: 'refresh-token',
          user_id: 1,
          email: 'ada@example.com',
          username: 'ada',
        }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login', path: '/login' });

    expect(screen.getByRole('main')).toHaveClass('px-4');
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByLabelText('location')).toHaveTextContent('/chat');
    });

    expect(useSessionStore.getState().user).toEqual({
      id: 1,
      email: 'ada@example.com',
      username: 'ada',
    });
    expect(tokenManager.getAccessToken()).toBe('access-token');
  });

  it('shows login errors for unauthorized, validation and server failures', async () => {
    let mode = 'unauthorized';
    server.use(
      http.post('http://localhost:8000/api/v1/auth/token/', () => {
        if (mode === 'unauthorized') {
          return HttpResponse.json(
            { error: { code: 'unauthorized', message: 'No access.' } },
            { status: 401 },
          );
        }

        if (mode === 'validation') {
          return HttpResponse.json(
            { error: { code: 'validation_error', message: 'Bad request.' } },
            { status: 400 },
          );
        }

        return HttpResponse.json(
          { error: { code: 'server_error', message: 'Server exploded.' } },
          { status: 500 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login', path: '/login' });

    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Invalid email or password. Please try again.'),
    ).toBeInTheDocument();

    mode = 'validation';
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(
      await screen.findByText('Invalid request format. Please check your input.'),
    ).toBeInTheDocument();

    mode = 'server';
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Server exploded.')).toBeInTheDocument();
  });

  it('maps registration field errors and reports unmapped errors', async () => {
    server.use(
      http.post('http://localhost:8000/api/v1/auth/register/', () =>
        HttpResponse.json(
          {
            error: {
              code: 'validation_error',
              message: 'Invalid registration.',
              details: {
                email: ['Already used'],
                username: ['Taken'],
                detail: ['Unexpected problem'],
              },
            },
          },
          { status: 400 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: '/register', path: '/register' });

    await user.type(screen.getByLabelText('Email'), 'grace@example.com');
    await user.type(screen.getByLabelText('Username'), 'grace');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Already used')).toBeInTheDocument();
    expect(await screen.findByText('Taken')).toBeInTheDocument();
    expect(await screen.findByText('Unexpected problem')).toBeInTheDocument();
  });

  it('shows a general registration error when no fields map', async () => {
    server.use(
      http.post('http://localhost:8000/api/v1/auth/register/', () =>
        HttpResponse.json(
          { error: { code: 'server_error', message: 'Registration failed.' } },
          { status: 500 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: '/register', path: '/register' });

    await user.type(screen.getByLabelText('Email'), 'grace@example.com');
    await user.type(screen.getByLabelText('Username'), 'grace');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Registration failed.')).toBeInTheDocument();
  });

  it('registers an account and returns to sign in', async () => {
    server.use(
      http.post('http://localhost:8000/api/v1/auth/register/', () =>
        HttpResponse.json(
          { id: 2, email: 'grace@example.com', username: 'grace' },
          { status: 201 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: '/register', path: '/register' });

    expect(screen.getByRole('main')).toHaveClass('px-4');
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), 'grace@example.com');
    await user.type(screen.getByLabelText('Username'), 'grace');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByLabelText('location')).toHaveTextContent('/login');
    });
    expect(await screen.findByText('Account created. Please sign in.')).toBeInTheDocument();
  });
});
