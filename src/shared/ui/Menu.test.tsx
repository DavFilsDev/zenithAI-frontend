import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from './Menu';

const renderMenu = (onSelect = vi.fn()) => {
  render(
    <Menu>
      <MenuTrigger>
        <button type="button">Options</button>
      </MenuTrigger>
      <MenuContent aria-label="Options menu">
        <MenuItem onClick={onSelect}>Rename</MenuItem>
        <MenuItem disabled>Archive</MenuItem>
        <MenuSeparator />
        <MenuItem danger>Delete</MenuItem>
      </MenuContent>
    </Menu>,
  );

  return { onSelect };
};

describe('Menu', () => {
  it('opens from trigger, supports arrow keys, and activates an item', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderMenu();

    const trigger = screen.getByRole('button', { name: 'Options' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    await user.click(trigger);

    const menu = screen.getByRole('menu', { name: 'Options menu' });
    expect(menu).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const rename = screen.getByRole('menuitem', { name: 'Rename' });
    const del = screen.getByRole('menuitem', { name: 'Delete' });

    expect(rename).toHaveFocus();
    expect(del).toHaveClass('h-8');

    await user.keyboard('{ArrowDown}');
    expect(del).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(rename).toHaveFocus();

    await user.keyboard('{End}');
    expect(del).toHaveFocus();

    await user.keyboard('{Home}');
    expect(rename).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape and outside click', async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Options' });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
