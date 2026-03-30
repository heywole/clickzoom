import React from 'react';

const Input = ({
  label, name, type = 'text', value, onChange, placeholder, error,
  required, disabled, className = '', icon, hint, rows,
}) => {
  const base = 'bg-dark-card border rounded-lg px-4 py-3 text-white placeholder-cz-gray focus:outline-none transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed';
  const borderClass = error ? 'border-red-500 focus:border-red-500' : 'border-dark-border focus:border-electric-blue';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cz-gray">{icon}</span>}
        {type === 'textarea' ? (
          <textarea
            id={name} name={name} value={value} onChange={onChange}
            placeholder={placeholder} disabled={disabled} rows={rows || 4}
            className={`${base} ${borderClass} resize-none ${icon ? 'pl-10' : ''}`}
          />
        ) : (
          <input
            id={name} name={name} type={type} value={value} onChange={onChange}
            placeholder={placeholder} disabled={disabled} required={required}
            className={`${base} ${borderClass} ${icon ? 'pl-10' : ''}`}
          />
        )}
      </div>
      {hint && !error && <p className="text-xs text-cz-gray">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
