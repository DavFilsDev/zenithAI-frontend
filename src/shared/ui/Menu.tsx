import {
  cloneElement,
  createContext,
  isValidElement,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type PendingFocus = 'first' | 'last' | null;

interface MenuContextValue {
  open: boolean;
  menuId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  pendingFocus: React.MutableRefObject<PendingFocus>;
  openMenu: (focus?: 'first' | 'last') => void;
  closeMenu: (restoreFocus?: boolean) => void;
  toggleMenu: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

const useMenuContext = (component: string): MenuContextValue => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error(`${component} must be used within Menu`);
  }
  return context;
};

const getMenuItems = (menu: HTMLDivElement | null): HTMLButtonElement[] => {
  if (!menu) {
    return [];
  }
  return Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).filter(
    (item) => !item.disabled,
  );
};

export interface MenuProps {
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export const Menu = ({ children, onOpenChange }: MenuProps) => {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef(true);
  const pendingFocus = useRef<PendingFocus>(null);
  const wasOpen = useRef(false);

  const setOpenState = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const openMenu = useCallback(
    (focus: 'first' | 'last' = 'first') => {
      restoreFocusRef.current = true;
      pendingFocus.current = focus;
      setOpenState(true);
    },
    [setOpenState],
  );

  const closeMenu = useCallback(
    (restoreFocus = true) => {
      restoreFocusRef.current = restoreFocus;
      pendingFocus.current = null;
      setOpenState(false);
    },
    [setOpenState],
  );

  const toggleMenu = useCallback(() => {
    setOpen((previous) => {
      const next = !previous;
      onOpenChange?.(next);
      if (next) {
        restoreFocusRef.current = true;
        pendingFocus.current = 'first';
      } else {
        pendingFocus.current = null;
      }
      return next;
    });
  }, [onOpenChange]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    const focus = pendingFocus.current;
    if (!focus) {
      return;
    }
    const items = getMenuItems(menuRef.current);
    if (items.length === 0) {
      menuRef.current?.focus();
    } else if (focus === 'last') {
      items[items.length - 1]?.focus();
    } else {
      items[0]?.focus();
    }
    pendingFocus.current = null;
  }, [open]);

  useEffect(() => {
    if (wasOpen.current && !open && restoreFocusRef.current) {
      triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      closeMenu(true);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [closeMenu, open]);

  const value = useMemo(
    () => ({
      open,
      menuId,
      triggerRef,
      menuRef,
      pendingFocus,
      openMenu,
      closeMenu,
      toggleMenu,
    }),
    [closeMenu, menuId, open, openMenu, toggleMenu],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export interface MenuTriggerProps {
  children: ReactElement<Record<string, unknown>>;
}

export const MenuTrigger = ({ children }: MenuTriggerProps) => {
  const { open, menuId, triggerRef, openMenu, toggleMenu } = useMenuContext('MenuTrigger');
  if (!isValidElement(children)) {
    return children;
  }

  const child = children as ReactElement<
    {
      onClick?: (event: MouseEvent<HTMLElement>) => void;
      onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
    } & Record<string, unknown>
  >;

  const existingRef = (child as unknown as { ref?: Ref<HTMLElement> }).ref;
  const setRef = (node: HTMLElement | null) => {
    // eslint-disable-next-line react-hooks/immutability
    (triggerRef as { current: HTMLElement | null }).current = node;
    if (typeof existingRef === 'function') {
      existingRef(node);
    } else if (existingRef && typeof existingRef === 'object') {
      // eslint-disable-next-line react-hooks/immutability
      (existingRef as { current: HTMLElement | null }).current = node;
    }
  };

  return cloneElement(child, {
    ref: setRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: (event: MouseEvent<HTMLElement>) => {
      child.props.onClick?.(event);
      if (!event.defaultPrevented) {
        toggleMenu();
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      child.props.onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openMenu('first');
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        openMenu('last');
      }
    },
  } as Partial<Record<string, unknown>> & { ref: (node: HTMLElement | null) => void });
};

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
}

export const MenuContent = ({
  align = 'end',
  className = '',
  children,
  ...props
}: MenuContentProps) => {
  const { open, menuId, triggerRef, menuRef, closeMenu } = useMenuContext('MenuContent');
  const [style, setStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const gap = 4;
      let left = align === 'end' ? rect.right - menuRect.width : rect.left;
      left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));
      let top = rect.bottom + gap;
      if (top + menuRect.height > window.innerHeight - 8) {
        top = Math.max(8, rect.top - menuRect.height - gap);
      }
      setStyle({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [align, open, triggerRef, menuRef, children]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }

    const items = getMenuItems(menuRef.current);
    if (items.length === 0) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
      }
      return;
    }

    const active = document.activeElement as HTMLButtonElement | null;
    const current = items.findIndex((item) => item === active);

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = current === -1 ? 0 : (current + 1) % items.length;
      items[next]?.focus();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = current === -1 ? items.length - 1 : (current - 1 + items.length) % items.length;
      items[next]?.focus();
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      {...props}
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={{ position: 'fixed', top: style.top, left: style.left }}
      className={`z-[var(--z-index-dropdown)] min-w-[160px] rounded-[var(--radius)] border border-border bg-surface p-1 shadow-float ${className}`}
    >
      {children}
    </div>,
    document.body,
  );
};

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  closeOnSelect?: boolean;
  danger?: boolean;
}

export const MenuItem = ({
  children,
  className = '',
  closeOnSelect = true,
  danger = false,
  onClick,
  disabled,
  ...props
}: MenuItemProps) => {
  const { closeMenu } = useMenuContext('MenuItem');

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) {
      return;
    }
    if (closeOnSelect) {
      closeMenu(true);
    }
  };

  return (
    <button
      {...props}
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={`flex h-8 w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 text-left text-ui transition-colors duration-fast hover:bg-hover focus:bg-hover focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${danger ? 'text-danger' : 'text-text'} ${className}`}
    >
      {children}
    </button>
  );
};

export type MenuSeparatorProps = HTMLAttributes<HTMLDivElement>;

export const MenuSeparator = ({ className = '', ...props }: MenuSeparatorProps) => {
  return <div {...props} role="separator" className={`my-1 h-px bg-border ${className}`} />;
};
