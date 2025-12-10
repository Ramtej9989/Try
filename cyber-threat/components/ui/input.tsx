import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helpText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        
        {(error || helpText) && (
          <div className="mt-1 text-sm">
            {error ? (
              <p className="text-red-600">{error}</p>
            ) : helpText ? (
              <p className="text-gray-500">{helpText}</p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
