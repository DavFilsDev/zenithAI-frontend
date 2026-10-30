import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button = ({
  children,
  loading = false,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        w-full py-3 px-4 rounded-xl font-semibold

        bg-[rgb(var(--color-primary))]
        text-white

        shadow-lg hover:shadow-xl
        hover:scale-[1.02] active:scale-[0.98]

        transition-all duration-200

        disabled:opacity-60 disabled:cursor-not-allowed

        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
