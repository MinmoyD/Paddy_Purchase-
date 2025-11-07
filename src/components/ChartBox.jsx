import "../components/ChartBox.css";

const data = [50, 10, 5, 15, 60, 10, 40];
const days = ["M", "T", "W", "T", "F", "S", "S"];

const ChartBox = () => {
  const maxVal = Math.max(...data);
  const step = 10;
  const yAxisLabels = [];

  for (let i = maxVal; i >= 0; i -= step) {
    yAxisLabels.push(i);
  }

  return (
    <div className="chart-wrapper">
      <div className="chart-box">
        <h3 className="chart-title">📊 Weekly Sales</h3>
        <div className="grid-lines">
          {yAxisLabels.map((label, index) => (
            <div key={index} className="grid-line">
              <span className="grid-label">{label}</span>
            </div>
          ))}
          <div className="bar-group">
            {data.map((val, i) => (
              <div className="bar-container" key={i}>
                <div className="bar" style={{ height: `${val * 2}px` }}></div>
                <div className="label">{days[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stock-info">
        <h3>Sales Overview</h3>
        <p><span className="positive">(+15%)</span> increase compared to last week</p>
      </div>
    </div>
  );
};

export default ChartBox;
