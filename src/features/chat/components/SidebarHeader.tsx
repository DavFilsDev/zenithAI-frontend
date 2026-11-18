import { FiSidebar } from 'react-icons/fi';
import { useState } from 'react';

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export const SidebarHeader = ({ isOpen, onToggle, compact = false }: SidebarHeaderProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const label = isOpen ? 'Collapse sidebar' : 'Expand sidebar';

  const toggle = (
    <div className={`relative ${compact ? 'mx-auto mt-2 w-fit' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={label}
        aria-expanded={isOpen}
        className="rounded-lg p-2 transition-all duration-200 hover:bg-white/10"
      >
        <FiSidebar
          size={20}
          className={`transition-all duration-300 ${isOpen ? '' : 'rotate-180'}`}
        />
      </button>

      {showTooltip && (
        <div className="absolute top-1/2 left-full ml-2 -translate-y-1/2 rounded border border-white/20 bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white">
          {label} (Ctrl+B)
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="border-b border-white/10 p-4">
        <h1 className="text-center text-xl font-bold tracking-wide">
          Z<span className="text-[rgb(var(--color-primary))]">A</span>
        </h1>
        {toggle}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-white/10 p-4">
      <h1 className="text-xl font-bold tracking-wide">
        Zenith<span className="text-[rgb(var(--color-primary))]">AI</span>
      </h1>
      {toggle}
    </div>
  );
};
