import React from 'react';

export const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const colors = { blue: 'border-electric-blue', mint: 'border-neon-mint', white: 'border-white' };
  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-dark-border ${colors[color]} border-t-transparent`} />
  );
};

const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <Spinner size="lg" />
    <p className="text-cz-gray text-sm">{text}</p>
  </div>
);

export default Loader;
