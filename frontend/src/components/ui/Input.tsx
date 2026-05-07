import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="field-label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'field-input',
              icon && 'pl-9',
              error && 'border-status-cancelled focus:border-status-cancelled focus:ring-status-cancelled/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="field-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="field-label">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={3}
          className={cn(
            'field-input h-auto py-2 resize-none',
            error && 'border-status-cancelled',
            className
          )}
          {...props}
        />
        {error && <p className="field-error">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
