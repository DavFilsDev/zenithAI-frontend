import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders a neutral badge by default', () => {
    render(<Badge>beta</Badge>);

    const badge = screen.getByText('beta');

    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveClass(
      'font-mono',
      'text-label',
      'uppercase',
      'rounded-[var(--radius-sm)]',
      'border-border',
    );
    expect(badge.className).not.toMatch(/shadow|blur/);
  });

  it.each([
    ['success', 'text-success', 'bg-success-subtle'],
    ['warning', 'text-warning', 'bg-warning-subtle'],
    ['danger', 'text-danger', 'bg-danger-subtle'],
  ] as const)('renders the %s variant', (variant, textClass, bgClass) => {
    render(<Badge variant={variant}>status</Badge>);

    expect(screen.getByText('status')).toHaveClass(textClass, bgClass);
  });
});
