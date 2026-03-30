import React from 'react';

const ProgressBar = ({ value = 0, label, showPercent = true, color = 'blue', animated = false }) => {
  const colors = {
    blue: 'bg-electric-blue',
    mint: 'bg-neon-mint',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-cz-gray">{label}</span>}
          {showPercent && <span className="text-sm font-medium text-white">{Math.round(value)}%</span>}
        </div>
      )}
      <div className="w-full bg-dark-border rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color]} ${animated ? 'progress-pulse' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
