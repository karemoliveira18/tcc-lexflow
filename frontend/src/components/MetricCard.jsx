import React from 'react';

const MetricCard = ({ title, value, description, icon: Icon, trend, trendValue }) => {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className="metric-icon p-3 rounded-xl">
          <Icon size={24} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium" style={{
            color: trend === 'up' ? '#7de1a9' : trend === 'down' ? '#ff9d9d' : '#a6a6a6'
          }}>
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