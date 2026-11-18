import { LogOut, User } from 'lucide-react';
import { Avatar } from '../../../shared/ui/Avatar';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '../../../shared/ui/Menu';
import { Tooltip } from '../../../shared/ui/Tooltip';

interface UserMenuProps {
  username?: string | undefined;
  expanded: boolean;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const UserMenu = ({ username, expanded, onOpenProfile, onLogout }: UserMenuProps) => {
  const label = username || 'User';

  const trigger = (
    <button
      type="button"
      aria-label={expanded ? 'User menu' : `User menu for ${label}`}
      className={`flex w-full items-center rounded-[var(--radius)] text-ui text-text transition-colors duration-fast hover:bg-hover ${
        expanded ? 'h-9 gap-2 px-3' : 'h-9 justify-center px-0'
      }`}
    >
      <Avatar name={label} size={24} />
      {expanded ? <span className="min-w-0 truncate">{label}</span> : null}
    </button>
  );

  return (
    <Menu>
      {expanded ? (
        <MenuTrigger>{trigger}</MenuTrigger>
      ) : (
        <Tooltip content={label} side="top">
          <MenuTrigger>{trigger}</MenuTrigger>
        </Tooltip>
      )}
      <MenuContent align={expanded ? 'end' : 'start'} aria-label="User menu">
        <MenuItem onClick={onOpenProfile}>
          <User size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Profile</span>
        </MenuItem>
        <MenuSeparator />
        <MenuItem onClick={onLogout} danger>
          <LogOut size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Log out</span>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};
