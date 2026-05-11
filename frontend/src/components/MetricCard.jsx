import React from 'react';

const MetricCard = ({ title, value, description, icon: Icon, trend, trendValue }) => {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-800 rounded-xl">
          <Icon size={24} className="text-blue-400" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
          }`}>
            <span>{trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div className="metric-value">{value}</div>
      <div className="metric-label">{title}</div>
      {description && (
        <div className="metric-description">{description}</div>
      )}
    </div>
  );
};

export default MetricCard;