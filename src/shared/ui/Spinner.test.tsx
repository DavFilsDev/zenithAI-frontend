import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders an accessible route loading fallback', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toHaveClass('min-h-dvh', 'bg-canvas');
    expect(screen.getByText('Loading')).toHaveClass('sr-only');
  });
});
