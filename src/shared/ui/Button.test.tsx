import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders a default primary button without banned visual classes', () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('bg-accent', 'text-on-accent', 'h-9', 'px-4');
    expect(button.className).not.toMatch(/(?:hover|active):scale-/);
    expect(button.className).not.toMatch(/backdrop-blur|rounded-(?:xl|2xl)|shadow-/);
  });

  it.each([
    ['primary', 'bg-accent'],
    ['secondary', 'bg-surface'],
    ['ghost', 'bg-transparent'],
    ['danger', 'text-danger'],
  ] as const)('applies the %s variant', (variant, expectedClass) => {
    render(<Button variant={variant}>Action</Button>);

    expect(screen.getByRole('button', { name: 'Action' })).toHaveClass(expectedClass);
  });

  it.each([
    ['sm', 'h-7', 'px-3'],
    ['md', 'h-9', 'px-4'],
    ['lg', 'h-11', 'px-5'],
  ] as const)('applies the %s size', (size, heightClass, paddingClass) => {
    render(<Button size={size}>Action</Button>);

    expect(screen.getByRole('button', { name: 'Action' })).toHaveClass(heightClass, paddingClass);
  });

  it('supports full width, custom classes, and submit buttons', () => {
    render(
      <Button type="submit" fullWidth className="custom-class">
        Save
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('w-full', 'custom-class');
  });

  it('disables the button, keeps the label, and does not fire while loading', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is disabled and does not fire when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('receives keyboard focus', async () => {
    const user = userEvent.setup();
    render(<Button>Save</Button>);

    await user.tab();

    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  });
});
