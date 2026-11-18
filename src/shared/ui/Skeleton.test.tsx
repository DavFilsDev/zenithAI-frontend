import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders a raised pulsing block', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const skeleton = container.firstElementChild;

    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveClass('animate-skeleton', 'bg-raised', 'rounded-[var(--radius)]', 'h-4');
  });
});
