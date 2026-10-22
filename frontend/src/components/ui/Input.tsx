import { InputHTMLAttributes, forwardRef } from 'react';
import { FormMessage } from './FormMessage';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, helperText, id, required, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-ink">
          {label}
          {required && <span className="text-iv-blue-deep"> *</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`w-full rounded-md border px-3 py-2.5 text-ink outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 ${
            error ? 'border-iv-blue-deep' : 'border-line'
          } ${className}`}
          {...props}
        />
        {helperText && !error && <p className="mt-1 text-xs text-muted">{helperText}</p>}
        {error && (
          <div className="mt-1">
            <FormMessage>{error}</FormMessage>
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
