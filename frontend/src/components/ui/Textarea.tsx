import { TextareaHTMLAttributes, forwardRef } from 'react';
import { FormMessage } from './FormMessage';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  showCounter?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, helperText, id, required, className = '', showCounter, maxLength, value, ...props }, ref) => {
    const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const count = typeof value === 'string' ? value.length : 0;
    return (
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label htmlFor={textareaId} className="block text-sm font-medium text-ink">
            {label}
            {required && <span className="text-iv-blue-deep"> *</span>}
          </label>
          {showCounter && maxLength != null && (
            <span className="text-xs text-muted">
              {count}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          maxLength={maxLength}
          value={value}
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
Textarea.displayName = 'Textarea';
