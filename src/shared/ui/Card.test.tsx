import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders a bordered surface panel with default radius', () => {
    render(<Card>Content</Card>);

    const card = screen.getByText('Content');

    expect(card).toHaveClass(
      'bg-surface',
      'border',
      'border-border',
      'p-6',
      'rounded-[var(--radius)]',
    );
    expect(card.className).not.toMatch(/shadow|blur|hover/);
  });

  it('supports no radius', () => {
    render(<Card radius="none">Content</Card>);

    expect(screen.getByText('Content')).toHaveClass('rounded-[var(--radius-none)]');
  });
});
