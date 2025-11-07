import "../components/StatCard.css";

const StatCard = ({ title, value, description, colorClass }) => {
  return (
    <div className={`stat-card ${colorClass}`}>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-desc">{description}</div>
    </div>
  );
};

export default StatCard;
