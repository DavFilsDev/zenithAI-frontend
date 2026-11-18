import { User } from 'lucide-react';

interface UserButtonProps {
  username?: string | undefined;
  onClick: () => void;
  variant?: 'full' | 'icon';
}

export const UserButton = ({ username, onClick, variant = 'full' }: UserButtonProps) => {
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Open profile"
        className="flex w-full items-center justify-center rounded-lg p-2 transition-all duration-200 hover:bg-white/10"
        title="Profile"
      >
        <User size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={username ? `Open profile for ${username}` : 'Open profile'}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-white/10"
    >
      <User size={16} strokeWidth={1.5} aria-hidden="true" />
      <span className="text-sm">{username || 'User'}</span>
    </button>
  );
};
