import { FiUser } from 'react-icons/fi';

interface UserButtonProps {
  username?: string | undefined;
  onClick: () => void;
  variant?: 'full' | 'icon';
}

export const UserButton = ({ username, onClick, variant = 'full' }: UserButtonProps) => {
  if (variant === 'icon') {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
        title="Profile"
      >
        <FiUser size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
    >
      <FiUser size={18} />
      <span className="text-sm">{username || 'User'}</span>
    </button>
  );
};
