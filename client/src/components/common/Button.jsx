import React from 'react';

const variants = {
  primary: 'bg-electric-blue hover:bg-blue-600 text-white',
  secondary: 'bg-dark-card hover:bg-dark-hover text-white border border-dark-border',
  mint: 'bg-neon-mint hover:bg-green-400 text-deep-dark',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-dark-hover text-cz-gray hover:text-white',
};

const sizes = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-6 py-3 text-sm min-h-[44px]',
  lg: 'px-8 py-4 text-base min-h-[52px]',
};

const Button = ({
  children, variant = 'primary', size = 'md', className = '',
  loading = false, disabled = false, icon, onClick, type = 'button', fullWidth = false,
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-deep-dark disabled:opacity-50 disabled:cursor-not-allowed';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? <span className="flex-shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
};

export default Button;
