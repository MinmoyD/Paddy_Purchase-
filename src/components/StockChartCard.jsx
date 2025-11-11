import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/StockChartCard.css";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BAG_WEIGHT_KG = 60; // ✅ 1 entry = 1 bag = 60 KG

const StockChartCard = () => {
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState("thisWeek"); // thisWeek | lastWeek | all | custom
  const [chartRanges, setChartRanges] = useState([0]); // ✅ dynamic Y-axis ranges
  const [rangeFilter, setRangeFilter] = useState({ min: 0, max: Infinity });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // ✅ Fetch raw stock records
  const fetchStockData = async () => {
    try {
      const res = await axios.get("http://car-qr-stock-backend.vercel.app/api/stocks/all");
      setRawData(res.data || []);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setRawData([]);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  // ✅ Convert API data → daily totals
  const processData = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const date = new Date(item.Date); // e.g., "2025-08-28"
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, count: 0, volume: 0 };
      }
      grouped[dateKey].count = item.Bags
        ? grouped[dateKey].count + Math.round(Number(item.Bags))
        : grouped[dateKey].count + 1;

      grouped[dateKey].volume = item.Weight
        ? grouped[dateKey].volume + Number(item.Weight)
        : grouped[dateKey].volume + BAG_WEIGHT_KG; // default 60 KG per bag
    });

    // ✅ Sort by date
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  // ✅ Handle filter
  useEffect(() => {
    if (!rawData.length) return;

    const dailyData = processData(rawData);

    let filtered = [];
    if (filter === "thisWeek") {
      filtered = dailyData.slice(-7);
    } else if (filter === "lastWeek") {
      filtered = dailyData.slice(-14, -7);
    } else if (filter === "all") {
      filtered = dailyData;
    } else if (filter === "custom" && dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      filtered = dailyData.filter((d) => {
        const dDate = new Date(d.date);
        return dDate >= start && dDate <= end;
      });
    }

    // ✅ Convert to weekdays (for chart labels)
    let weekData = filtered.map((d) => {
      const day = weekDays[new Date(d.date).getDay()];
      return { day, volume: d.volume };
    });

    // ✅ Apply range filter
    weekData = weekData.filter(
      (d) => d.volume >= rangeFilter.min && d.volume <= rangeFilter.max
    );

    setFilteredData(weekData);

    // ✅ Dynamically calculate chart ranges
    const maxVolume = Math.max(...weekData.map((d) => d.volume), 0);
    const step = Math.ceil(maxVolume / 5 / 10) * 10 || 50; // rounded step
    const ranges = [];
    for (let val = Math.ceil(maxVolume / step) * step; val >= 0; val -= step) {
      ranges.push(val);
    }
    setChartRanges(ranges);
  }, [rawData, filter, rangeFilter, dateRange]);

  // ✅ Extract volumes and labels
  const volumes = filteredData.map((d) => d.volume || 0);
  const labels = filteredData.map((d) => d.day);

  // ✅ Percentage change (last 2 days)
  const getPercentageChange = () => {
    if (volumes.length < 2) return 0;
    const yesterday = volumes[volumes.length - 2];
    const today = volumes[volumes.length - 1];
    if (yesterday === 0) return today > 0 ? 100 : 0;
    return Math.round(((today - yesterday) / yesterday) * 100);
  };

  const percentageChange = getPercentageChange();
  const isPositive = percentageChange >= 0;

  const maxVolume = Math.max(...volumes, 1);
  const scaleFactor = 100 / maxVolume; // scale bar heights

  return (
    <div className="stock-card">
      <h3 className="stock-title">📦 Warehouse Stock</h3>

      {/* 🔽 Time Filter buttons */}
      <div className="filters">
        <button
          className={filter === "thisWeek" ? "active" : ""}
          onClick={() => setFilter("thisWeek")}
        >
          This Week
        </button>
        <button
          className={filter === "lastWeek" ? "active" : ""}
          onClick={() => setFilter("lastWeek")}
        >
          Last Week
        </button>
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "custom" ? "active" : ""}
          onClick={() => setFilter("custom")}
        >
          Custom Range
        </button>
      </div>

      {/* 🔽 Date Range Picker (only active if custom range selected) */}
      {filter === "custom" && (
        <div className="date-filters">
          <label>
            Start Date:
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </label>
        </div>
      )}

      {/* 🔽 Volume Range Filter */}
      <div className="range-filters">
        <label>
          Min (KG):
          <input
            type="number"
            value={rangeFilter.min === 0 ? "" : rangeFilter.min}
            onChange={(e) =>
              setRangeFilter({
                ...rangeFilter,
                min: Number(e.target.value) || 0,
              })
            }
          />
        </label>
        <label>
          Max (KG):
          <input
            type="number"
            value={rangeFilter.max === Infinity ? "" : rangeFilter.max}
            onChange={(e) =>
              setRangeFilter({
                ...rangeFilter,
                max: Number(e.target.value) || Infinity,
              })
            }
          />
        </label>
      </div>

      {/* 🔽 Chart */}
      <div className="stock-chart">
        <div className="grid">
          {chartRanges.map((val, i) => (
            <div className="grid-line" key={i}>
              <span className="grid-label">{val}</span>
            </div>
          ))}
        </div>

        <div className="bars">
          {volumes.map((value, i) => (
            <div key={i} className="bar-container">
              <div
                className="bar"
                style={{ height: `${value * scaleFactor}px` }}
                title={`Entries: ${value / BAG_WEIGHT_KG}, Volume: ${value} kg`}
              ></div>
              <div className="day-label">{labels[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔽 Stock Info */}
      <div className="stock-info">
        <p>
          <span className={isPositive ? "positive" : "negative"}>
            ({isPositive ? "+" : ""}
            {percentageChange}%)
          </span>{" "}
          change compared to yesterday.
        </p>
      </div>
    </div>
  );
};

export default StockChartCard;
