import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { FormMessage } from './FormMessage';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, Props>(({ label, error, id, className = '', ...props }, ref) => {
  const checkboxId = id ?? 'checkbox';
  return (
    <div>
      <label htmlFor={checkboxId} className="flex items-start gap-2 text-sm text-ink">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border-line text-brand-blue focus:ring-2 focus:ring-brand-blue/20 ${className}`}
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && (
        <div className="mt-1">
          <FormMessage>{error}</FormMessage>
        </div>
      )}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';
