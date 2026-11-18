import {
  type ButtonHTMLAttributes,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { ButtonVariant } from './buttonStyles';

const TOOLTIP_DELAY_MS = 400;

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> {
  'aria-label': string;
  variant?: ButtonVariant;
  tooltip?: string;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-accent bg-accent text-on-accent enabled:hover:bg-accent-hover enabled:active:bg-accent-active',
  secondary: 'border-border bg-surface text-text enabled:hover:bg-hover enabled:active:bg-raised',
  ghost:
    'border-transparent bg-transparent text-text enabled:hover:bg-hover enabled:active:bg-raised',
  danger:
    'border-danger bg-transparent text-danger enabled:hover:bg-raised enabled:active:bg-hover',
};

const baseClasses =
  'inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11';

export const IconButton = ({
  'aria-label': ariaLabel,
  tooltip,
  variant = 'ghost',
  className = '',
  type = 'button',
  disabled,
  children,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  onKeyDown,
  ...props
}: IconButtonProps) => {
  const tooltipId = useId();
  const tooltipTimer = useRef<number | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipText = tooltip ?? ariaLabel;

  const clearTooltipTimer = () => {
    if (tooltipTimer.current !== null) {
      window.clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
  };

  const hideTooltip = () => {
    clearTooltipTimer();
    setIsTooltipVisible(false);
  };

  const showTooltipAfterDelay = () => {
    if (disabled) {
      return;
    }

    clearTooltipTimer();
    tooltipTimer.current = window.setTimeout(() => {
      setIsTooltipVisible(true);
      tooltipTimer.current = null;
    }, TOOLTIP_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimer.current !== null) {
        window.clearTimeout(tooltipTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!disabled) {
      return;
    }

    if (tooltipTimer.current !== null) {
      window.clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
  }, [disabled]);

  const isVisible = isTooltipVisible && !disabled;

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event);
    showTooltipAfterDelay();
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    hideTooltip();
  };

  const handleMouseEnter = (event: MouseEvent<HTMLButtonElement>) => {
    onMouseEnter?.(event);
    showTooltipAfterDelay();
  };

  const handleMouseLeave = (event: MouseEvent<HTMLButtonElement>) => {
    onMouseLeave?.(event);
    hideTooltip();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Escape') {
      hideTooltip();
    }
  };

  return (
    <span className="relative inline-flex">
      <button
        {...props}
        type={type}
        aria-label={ariaLabel}
        aria-describedby={isVisible ? tooltipId : undefined}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
      {isVisible && tooltipText && (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-[var(--z-index-dropdown)] mb-2 -translate-x-1/2 rounded-[var(--radius)] border border-border bg-raised px-2 py-1 font-mono text-small whitespace-nowrap text-text shadow-float"
        >
          {tooltipText}
        </span>
      )}
    </span>
  );
};
