import React from 'react';
import { getStatusBg, capitalizeFirst } from '../../utils/helpers';

const Badge = ({ status, text, variant = 'status', className = '' }) => {
  if (variant === 'status') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBg(status)} ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
        {capitalizeFirst(status)}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  );
};

export default Badge;
