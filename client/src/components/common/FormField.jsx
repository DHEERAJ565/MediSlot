import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ============================================================================
 * UNIT II & IV: Reusable FormField Component with ARIA Accessibility
 * ============================================================================
 * Demonstrates:
 * - Props-driven component reusability and composition.
 * - Semantic HTML (<label>, <input>, error description with role="alert").
 * - Accessibility attributes: htmlFor, aria-invalid, aria-describedby.
 * - Conditional rendering of icons, required indicators, and validation error messages.
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  children,
}) => {
  const errorId = `${name}-error`;
  const inputId = `${name}-input`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
        >
          {label} {required && <span className="text-rose-500 font-black">*</span>}
        </label>
      )}

      {children ? (
        children
      ) : (
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`w-full py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:ring-2 ${
              Icon ? 'pl-10 pr-4' : 'px-4'
            } ${
              error
                ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
            } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
          />
        </div>
      )}

      {/* Accessible Validation Error Message */}
      {error && (
        <div
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-rose-600 font-medium animate-fadeIn pt-0.5"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;
