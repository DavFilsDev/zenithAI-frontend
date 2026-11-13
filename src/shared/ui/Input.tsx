import { type InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { type UseFormRegisterReturn } from 'react-hook-form';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  registration?: UseFormRegisterReturn;
}

export const Input = ({
  label,
  error,
  registration,
  type = 'text',
  className = '',
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1 relative">
      <label className="text-sm font-medium opacity-80">{label}</label>
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          {...registration}
          {...props}
          className={`
            w-full px-4 py-2 rounded-xl
            bg-white/10 dark:bg-white/5
            backdrop-blur-md
            border border-white/20 dark:border-white/10
            focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]
            pr-10
            transition-all
            ${className}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition"
          >
            {showPassword ? (
              <EyeOff className="text-[rgb(var(--color-primary))]" size={18} />
            ) : (
              <Eye className="text-[rgb(var(--color-primary))]" size={18} />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};
