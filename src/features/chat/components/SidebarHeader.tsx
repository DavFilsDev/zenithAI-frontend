import { PanelLeft } from 'lucide-react';

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  compact?: boolean;
  controlsId?: string;
}

export const SidebarHeader = ({
  isOpen,
  onToggle,
  compact = false,
  controlsId,
}: SidebarHeaderProps) => {
  const label = isOpen ? 'Collapse sidebar' : 'Expand sidebar';

  const toggle = (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors duration-fast hover:bg-hover hover:text-text focus-visible:outline-none ${compact ? 'mx-auto mt-2' : ''}`}
    >
      <PanelLeft
        size={20}
        strokeWidth={1.5}
        aria-hidden="true"
        className={`transition-transform duration-base ${isOpen ? '' : 'rotate-180'}`}
      />
    </button>
  );

  if (compact) {
    return (
      <div className="border-b border-border-subtle p-3">
        <h1 className="text-center text-ui font-semibold tracking-wide text-text">
          Z<span className="text-accent-text">A</span>
        </h1>
        {toggle}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-border-subtle p-4">
      <h1 className="text-ui font-semibold tracking-wide text-text">
        Zenith<span className="text-accent-text">AI</span>
      </h1>
      {toggle}
    </div>
  );
};
