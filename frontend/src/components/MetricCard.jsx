import React from 'react';

const MetricCard = ({ title, value, description, icon: Icon, trend, trendValue }) => {
  return (
    <div className="metric-card min-w-0 w-full">
      <div className="metric-card-header">
        <div className="metric-icon">
          <Icon size={22} />
        </div>
        {trend && (
          <div className="metric-card-trend" style={{
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