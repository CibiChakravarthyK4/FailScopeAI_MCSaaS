import { SelectHTMLAttributes, forwardRef } from 'react';
import { FormMessage } from './FormMessage';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, helperText, id, required, className = '', options, ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-ink">
          {label}
          {required && <span className="text-iv-blue-deep"> *</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`w-full rounded-md border bg-white px-3 py-2.5 text-ink outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 ${
            error ? 'border-iv-blue-deep' : 'border-line'
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
Select.displayName = 'Select';
