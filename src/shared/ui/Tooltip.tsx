import {
  cloneElement,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement<Record<string, unknown>>;
  delay?: number;
  side?: 'top' | 'bottom';
}

type TooltipChildProps = {
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  'aria-describedby'?: string;
  disabled?: boolean;
};

export const Tooltip = ({ content, children, delay = 150, side = 'top' }: TooltipProps) => {
  const tooltipId = useId();
  const timer = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const child = children as ReactElement<TooltipChildProps>;

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  const show = useCallback(() => {
    if (child.props.disabled) {
      return;
    }
    clearTimer();
    timer.current = window.setTimeout(() => {
      setVisible(true);
      timer.current = null;
    }, delay);
  }, [child.props, clearTimer, delay]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  const isDisabled = Boolean(child.props.disabled);
  const isVisible = visible && !isDisabled && Boolean(content);

  const describedBy = [child.props['aria-describedby'], isVisible ? tooltipId : undefined]
    .filter(Boolean)
    .join(' ');

  const existingRef = (child as unknown as { ref?: Ref<HTMLElement> }).ref;
  const setRef = (node: HTMLElement | null) => {
    if (typeof existingRef === 'function') {
      existingRef(node);
    } else if (existingRef && typeof existingRef === 'object') {
      // eslint-disable-next-line react-hooks/immutability
      (existingRef as { current: HTMLElement | null }).current = node;
    }
  };

  const cloned = cloneElement(child, {
    ref: setRef,
    'aria-describedby': describedBy || undefined,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      child.props.onFocus?.(event);
      show();
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      child.props.onBlur?.(event);
      hide();
    },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      child.props.onMouseEnter?.(event);
      show();
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      child.props.onMouseLeave?.(event);
      hide();
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      child.props.onKeyDown?.(event);
      if (event.key === 'Escape') {
        hide();
      }
    },
  } as Partial<TooltipChildProps> & { ref: (node: HTMLElement | null) => void });

  const positionClass =
    side === 'top'
      ? 'bottom-full left-1/2 mb-2 -translate-x-1/2'
      : 'top-full left-1/2 mt-2 -translate-x-1/2';

  return (
    <span className="relative inline-flex">
      {cloned}
      {isVisible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`pointer-events-none absolute ${positionClass} z-[var(--z-index-dropdown)] rounded-[var(--radius)] border border-border bg-raised px-2 py-1 font-mono text-small whitespace-nowrap text-text shadow-float`}
        >
          {content}
        </span>
      )}
    </span>
  );
};
