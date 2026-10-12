import { ButtonHTMLAttributes, forwardRef } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ children, variant = 'primary', isLoading, className = '', disabled, ...props }, ref) => {
    const base = 'w-full rounded-md px-4 py-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';
    const styles =
      variant === 'primary'
        ? 'bg-brand-blue text-white hover:bg-brand-blue-dark'
        : 'border border-line bg-white text-ink hover:bg-brand-blue-light';

    return (
      <button ref={ref} className={`${base} ${styles} ${className}`} disabled={disabled || isLoading} {...props}>
        {isLoading ? 'Please wait...' : children}
      </button>
    );
  }
);
Button.displayName = 'Button';
