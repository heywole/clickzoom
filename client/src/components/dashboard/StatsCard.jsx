import React from 'react';

const StatsCard = ({ label, value, icon, color = 'blue', change }) => {
  const colors = {
    blue: 'bg-electric-blue/10 text-electric-blue',
    mint: 'bg-neon-mint/10 text-neon-mint',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-electric-blue/30 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-cz-gray mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 ${change >= 0 ? 'text-neon-mint' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}% this month
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
