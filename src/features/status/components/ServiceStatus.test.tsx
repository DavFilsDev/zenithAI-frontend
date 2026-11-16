import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../test/msw/node';
import { renderWithProviders } from '../../../test/utils';
import { ServiceStatus } from './ServiceStatus';

const healthUrl = 'http://localhost:8000/api/v1/health/';

describe('ServiceStatus', () => {
  it('announces a reachable service', async () => {
    server.use(http.get(healthUrl, () => HttpResponse.json({ status: 'ok', database: 'ok' })));

    renderWithProviders(<ServiceStatus />);

    expect(await screen.findByText('Service online')).toBeInTheDocument();
  });

  it('shows a retry when the readiness probe fails', async () => {
    server.use(
      http.get(healthUrl, () =>
        HttpResponse.json({ status: 'error', database: 'error' }, { status: 503 }),
      ),
    );

    renderWithProviders(<ServiceStatus />);

    expect(await screen.findByText('Service unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
