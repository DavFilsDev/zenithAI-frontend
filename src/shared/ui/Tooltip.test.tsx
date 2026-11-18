import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from './Tooltip';

afterEach(() => {
  vi.useRealTimers();
});

describe('Tooltip', () => {
  it('shows after the default delay on hover and hides on leave', () => {
    vi.useFakeTimers();

    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.mouseEnter(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Edit');
    expect(button).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveClass('font-mono', 'text-small', 'bg-raised', 'border-border');

    fireEvent.mouseLeave(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('supports custom delay and focus/blur', () => {
    vi.useFakeTimers();

    render(
      <Tooltip content="Settings" delay={400}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.focus(button);
    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Settings');

    fireEvent.blur(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
