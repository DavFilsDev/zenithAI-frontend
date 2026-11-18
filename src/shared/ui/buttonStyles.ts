export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: 'border-accent bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active',
  secondary: 'border-border bg-surface text-text hover:bg-hover active:bg-raised',
  ghost: 'border-transparent bg-transparent text-text hover:bg-hover active:bg-raised',
  danger: 'border-danger bg-transparent text-danger hover:bg-raised active:bg-hover',
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-3',
  md: 'h-9 px-4',
  lg: 'h-11 px-5',
};

export const buttonBaseClasses =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border text-ui whitespace-nowrap transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [@media(pointer:coarse)]:min-h-11';

export const getButtonClassName = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) =>
  `${buttonBaseClasses} ${buttonVariantClasses[variant]} ${buttonSizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`.trim();
