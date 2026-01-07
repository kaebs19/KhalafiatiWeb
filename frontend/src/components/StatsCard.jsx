import '../styles/StatsCard.css';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-card-content">
        <div className="stats-card-header">
          <h3 className="stats-card-title">{title}</h3>
          <div className={`stats-card-icon stats-icon-${color}`}>
            <Icon />
          </div>
        </div>

        <div className="stats-card-body">
          <p className="stats-card-value">{value}</p>

          {trend && (
            <p className={`stats-card-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
              {trend === 'up' ? '+' : '-'}{trendValue}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
