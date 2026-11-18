import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders initials, label, and default size', () => {
    render(<Avatar name="Ada Lovelace" />);

    const avatar = screen.getByLabelText('Ada Lovelace');

    expect(avatar).toHaveTextContent('AL');
    expect(avatar).toHaveClass('h-6', 'w-6', 'rounded-full', 'bg-raised', 'font-mono');
  });

  it('supports the 32px size', () => {
    render(<Avatar name="Ada" size={32} />);

    expect(screen.getByLabelText('Ada')).toHaveClass('h-8', 'w-8');
  });
});
