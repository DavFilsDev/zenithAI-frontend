import { FiSidebar } from 'react-icons/fi';
import { useState } from 'react';

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SidebarHeader = ({ isOpen, onToggle }: SidebarHeaderProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <h1 className="text-xl font-bold tracking-wide">
        Zenith<span className="text-[rgb(var(--color-primary))]">AI</span>
      </h1>

      <div className="relative">
        <button
          onClick={onToggle}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
        >
          <FiSidebar
            size={20}
            className={`transition-all duration-300 ${isOpen ? '' : 'rotate-180'}`}
          />
        </button>

        {showTooltip && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-900 text-white border border-white/20 rounded whitespace-nowrap">
            {isOpen ? 'Collapse sidebar (Ctrl+B)' : 'Expand sidebar (Ctrl+B)'}
          </div>
        )}
      </div>
    </div>
  );
};
