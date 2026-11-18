import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../test/msw/node';
import { renderWithProviders } from '../../../test/utils';
import { ServiceStatus } from './ServiceStatus';

const healthUrl = 'http://localhost:8000/api/v1/health/';

describe('ServiceStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('announces a reachable service', async () => {
    server.use(http.get(healthUrl, () => HttpResponse.json({ status: 'ok', database: 'ok' })));

    renderWithProviders(<ServiceStatus />);

    expect(await screen.findByText('Service online')).toBeInTheDocument();
  });

  it('shows a waking state while the service is starting', async () => {
    vi.useFakeTimers();
    server.use(http.get(healthUrl, () => new Promise(() => {})));

    renderWithProviders(<ServiceStatus />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_600);
    });

    expect(screen.getByText('Starting the service…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checking…' })).toBeDisabled();
  });

  it('shows an unavailable state with retry', async () => {
    server.use(
      http.get(healthUrl, () =>
        HttpResponse.json({ status: 'error', database: 'error' }, { status: 503 }),
      ),
    );

    renderWithProviders(<ServiceStatus />);

    expect(await screen.findByText('Service unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('retries and recovers when the service becomes reachable', async () => {
    let calls = 0;
    server.use(
      http.get(healthUrl, () => {
        calls += 1;
        if (calls === 1) {
          return HttpResponse.json({ status: 'error', database: 'error' }, { status: 503 });
        }
        return HttpResponse.json({ status: 'ok', database: 'ok' });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<ServiceStatus />);

    expect(await screen.findByText('Service unavailable')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Service online')).toBeInTheDocument();
  });
});
