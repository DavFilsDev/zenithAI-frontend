import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SettingsDropdown } from './SettingsDropdown';

describe('SettingsDropdown', () => {
  it('opens, closes on Escape, toggles the theme, and logs out', async () => {
    const onToggleTheme = vi.fn();
    const onLogout = vi.fn();
    const user = userEvent.setup();

    render(<SettingsDropdown theme="light" onToggleTheme={onToggleTheme} onLogout={onLogout} />);

    const trigger = screen.getByRole('button', { name: 'Settings' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Dark Mode' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('button', { name: 'Dark Mode' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Dark Mode' }));
    expect(onToggleTheme).toHaveBeenCalledTimes(1);

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('renders the icon variant and closes when clicking outside', async () => {
    const user = userEvent.setup();

    render(
      <>
        <button type="button">Outside</button>
        <SettingsDropdown theme="dark" onToggleTheme={vi.fn()} onLogout={vi.fn()} variant="icon" />
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Settings' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');

    await user.click(trigger);
    expect(screen.getByRole('button', { name: 'Light Mode' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('button', { name: 'Light Mode' })).not.toBeInTheDocument();
  });
});
