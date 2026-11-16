import { act, fireEvent, render, screen } from '@testing-library/react';
import { Settings, Trash2 } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';

afterEach(() => {
  vi.useRealTimers();
});

describe('IconButton', () => {
  it('renders a labelled ghost icon button without banned visual classes', () => {
    render(
      <IconButton aria-label="Open settings">
        <Settings />
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Open settings' });

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('h-9', 'w-9', 'bg-transparent');
    expect(button.className).not.toMatch(/(?:hover|active):scale-/);
    expect(button.className).not.toMatch(/backdrop-blur|rounded-(?:xl|2xl)|shadow-/);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('supports variants and custom classes', () => {
    render(
      <IconButton aria-label="Delete" variant="danger" className="custom-class">
        <Trash2 />
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Delete' });

    expect(button).toHaveClass('border-danger', 'text-danger', 'custom-class');
  });

  it('shows the label as a tooltip after 400ms on hover and hides it on leave', () => {
    vi.useFakeTimers();

    render(
      <IconButton aria-label="Open settings">
        <Settings />
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Open settings' });

    fireEvent.mouseEnter(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Open settings');
    expect(button).toHaveAttribute('aria-describedby', tooltip.id);

    fireEvent.mouseLeave(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows a custom tooltip after 400ms on focus and hides it on blur', () => {
    vi.useFakeTimers();

    render(
      <IconButton aria-label="Open settings" tooltip="Settings">
        <Settings />
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Open settings' });

    fireEvent.focus(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent('Settings');

    fireEvent.blur(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not show a tooltip when disabled', () => {
    vi.useFakeTimers();

    render(
      <IconButton aria-label="Delete" disabled>
        <Trash2 />
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Delete' });

    expect(button).toBeDisabled();

    fireEvent.mouseEnter(button);
    fireEvent.focus(button);
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
