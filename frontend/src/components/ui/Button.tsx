import { ButtonHTMLAttributes, forwardRef } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  /** Defaults to true to match every existing caller's current look (full-width
   * form/submit buttons). Width must be controlled here, not via a `w-auto`
   * className override - Tailwind resolves conflicting same-specificity
   * utilities by their order in the compiled stylesheet, not the order they
   * appear in the class string, so `w-full` from `base` silently wins over a
   * later `w-auto` regardless of where it's written. */
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ children, variant = 'primary', isLoading, fullWidth = true, className = '', disabled, ...props }, ref) => {
    const base = `${fullWidth ? 'w-full' : 'w-auto'} whitespace-nowrap rounded-md px-4 py-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2`;
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
