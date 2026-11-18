import { useCallback, useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  showCloseButton?: boolean;
  ariaLabel?: string;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Dialog = ({
  open,
  onOpenChange,
  title,
  children,
  footer,
  initialFocusRef,
  showCloseButton = true,
  ariaLabel,
}: DialogProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);

  // eslint-disable-next-line react-hooks/refs
  onOpenChangeRef.current = onOpenChange;

  const close = useCallback(() => {
    onOpenChangeRef.current(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusInitial = () => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      const initialFocus = initialFocusRef?.current;
      if (initialFocus) {
        initialFocus.focus();
        return;
      }
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      const first = focusable[0];
      if (first) {
        first.focus();
      } else {
        dialog.focus();
      }
    };

    focusInitial();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!first || !last) {
        return;
      }

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [close, initialFocusRef, open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-index-modal)] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 z-[var(--z-index-overlay)] animate-fade-in bg-overlay"
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabel ? undefined : titleId}
        aria-label={ariaLabel}
        tabIndex={-1}
        className="relative z-[var(--z-index-modal)] w-full max-w-[440px] animate-dialog rounded-[var(--radius)] border border-border bg-surface text-text shadow-float"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle p-6">
          <h2 id={titleId} className="text-h2 text-text">
            {title}
          </h2>
          {showCloseButton && (
            <IconButton aria-label="Close dialog" onClick={close} className="-mt-1 -mr-2 shrink-0">
              <X size={16} strokeWidth={1.5} aria-hidden="true" />
            </IconButton>
          )}
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border-subtle p-6 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
