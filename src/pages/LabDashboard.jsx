import React, { useEffect, useState } from "react";
import axios from "axios";
// import Chatbot from "../components/Chatbot"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import "./LabDashboard.css";
import Navbar from "../components/Navbar";

const LabDashboard = () => {
  const [dateRange, setDateRange] = useState({
    start: "2025-08-01",
    end: "2025-08-31",
  });

  const [labData, setLabData] = useState([]);
  const [stats, setStats] = useState(null);

  // 📌 Fetch Data from Backend
  useEffect(() => {
    axios
      .get("https://paddy-backend-lab.vercel.app/api/labform")
      .then((res) => {
        setLabData(res.data);
        calculateStats(res.data);
      })
      .catch((err) => console.error("Error fetching lab data:", err));
  }, []);

  // 📊 Calculate KPIs
  const calculateStats = (data) => {
    if (!data || data.length === 0) return;

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30); // 30 days ago

    // Filter data for last 30 days
    const last30DaysData = data.filter((d) => {
      const created = new Date(d.createdAt);
      return created >= thirtyDaysAgo && created <= today;
    });

    console.log("last 30 days", last30DaysData);

    const todayData = last30DaysData.filter(
      (d) =>
        d.createdAt && d.createdAt.startsWith(today.toISOString().split("T")[0])
    );

    const avg = (arr) => {
      const nums = arr.map((v) => Number(v)).filter((v) => !isNaN(v)); // remove invalid values
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    };

    setStats({
      good: data.filter((d) => Number(d.totalHandRice) >= 65).length,
      bad: data.filter((d) => Number(d.totalHandRice) < 65).length,
      todayPaddyMoisture: avg(todayData.map((d) => d.paddyMoisture)).toFixed(1),
      todayRiceMoisture: avg(todayData.map((d) => d.riceMoisture)).toFixed(1),
      weeklyHandRice: avg(data.map((d) => d.totalHandRice)).toFixed(1),
      carsToday: todayData.length,
      avgPaddyWeight: avg(data.map((d) => d.paddyWeight)).toFixed(0),
      totalSamples: last30DaysData.length, // reset after 30 days
      rejected: last30DaysData.filter((d) => Number(d.totalHandRice) < 60)
        .length,
      avgTurnaround: 42, // placeholder
      throughput: (data.length / 8).toFixed(1), // assuming 8-hour shift
      bestVariety: findBestVariety(data),
      worstVariety: findWorstVariety(data),
      qualityScore: avg(data.map((d) => d.totalHandRice)).toFixed(0),
      labUtilization: 78,
      bestDay: "Wednesday",
      worstDay: "Tuesday",
      operatorEfficiency: 91,
    });
  };

  // 📌 Best/Worst Variety
  const findBestVariety = (data) => {
    const grouped = {};
    data.forEach((d) => {
      if (!grouped[d.paddyName]) grouped[d.paddyName] = [];
      grouped[d.paddyName].push(Number(d.totalHandRice));
    });
    let best = "";
    let bestAvg = 0;
    for (const key in grouped) {
      const avg = grouped[key].reduce((a, b) => a + b, 0) / grouped[key].length;
      if (avg > bestAvg) {
        bestAvg = avg;
        best = key;
      }
    }
    return best;
  };

  const findWorstVariety = (data) => {
    const grouped = {};
    data.forEach((d) => {
      if (!grouped[d.paddyName]) grouped[d.paddyName] = [];
      grouped[d.paddyName].push(Number(d.totalHandRice));
    });
    let worst = "";
    let worstAvg = 100;
    for (const key in grouped) {
      const avg = grouped[key].reduce((a, b) => a + b, 0) / grouped[key].length;
      if (avg < worstAvg) {
        worstAvg = avg;
        worst = key;
      }
    }
    return worst;
  };

  // 📅 Date Filter Change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  if (!stats) return <div>Loading Dashboard...</div>;

  // 📈 Prepare Weekly Data (group by day)
  const weeklyData = [];
  const groupedByDay = {};
  labData.forEach((d) => {
    const day = new Date(d.createdAt).toLocaleDateString("en-US", {
      weekday: "short",
    });
    if (!groupedByDay[day]) groupedByDay[day] = [];
    groupedByDay[day].push(d);
  });
  for (const day in groupedByDay) {
    const entries = groupedByDay[day];
    weeklyData.push({
      day,
      paddy:
        entries.reduce((a, b) => a + Number(b.paddyMoisture), 0) /
        entries.length,
      rice:
        entries.reduce((a, b) => a + Number(b.riceMoisture), 0) /
        entries.length,
      rejected: entries.filter((d) => Number(d.totalHandRice) < 60).length,
      weight:
        entries.reduce((a, b) => a + Number(b.paddyWeight), 0) / entries.length,
    });
  }

  // 📆 Monthly Moisture (group by month)
  const monthlyData = [];
  const groupedByMonth = {};
  labData.forEach((d) => {
    const month = new Date(d.createdAt).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(d);
  });
  for (const month in groupedByMonth) {
    const entries = groupedByMonth[month];
    monthlyData.push({
      month,
      paddy:
        entries.reduce((a, b) => a + Number(b.paddyMoisture), 0) /
        entries.length,
      rice:
        entries.reduce((a, b) => a + Number(b.riceMoisture), 0) /
        entries.length,
    });
  }

  // 📈 Variety Performance Data
  const varietyData = [];
  const groupedVariety = {};
  labData.forEach((d) => {
    if (!groupedVariety[d.paddyName]) groupedVariety[d.paddyName] = [];
    groupedVariety[d.paddyName].push(Number(d.totalHandRice));
  });
  for (const variety in groupedVariety) {
    varietyData.push({
      variety,
      score:
        groupedVariety[variety].reduce((a, b) => a + b, 0) /
        groupedVariety[variety].length,
    });
  }

  const COLORS = ["#00C49F", "#FF4C4C"];

  return (
    <div className="lab-dashboard">
      <Navbar />
      {/* <Chatbot/> */}

      <h2 className="title">📊 Lab Quality Dashboard</h2>

      {/* 🔎 Date Filter */}
      {/* <div className="filter-bar">
        <label>
          From:{" "}
          <input
            type="date"
            name="start"
            value={dateRange.start}
            onChange={handleDateChange}
          />
        </label>
        <label>
          To:{" "}
          <input
            type="date"
            name="end"
            value={dateRange.end}
            onChange={handleDateChange}
          />
        </label>
        <button
          className="apply-btn"
          onClick={() =>
            alert(`Filtering from ${dateRange.start} to ${dateRange.end}`)
          }
        >
          Apply
        </button>
      </div> */}

      {/* KPI Cards */}
      <div className="cards">
        <div className="card success">
          <h3>{parseInt(stats.todayPaddyMoisture)}%</h3>
          <p>Today Avg Paddy Moisture</p>
        </div>
        <div className="card">
          <h3>{stats.todayRiceMoisture}%</h3>
          <p>Today Avg Rice Moisture</p>
        </div>
        <div className="card">
          <h3>{stats.weeklyHandRice}%</h3>
          <p>Weekly Avg Hand Rice</p>
        </div>
        <div className="card warning">
          <h3>{stats.rejected}</h3>
          <p>Rejected Samples (Monthly)</p>
        </div>
        <div className="card">
          <h3>{stats.totalSamples}</h3>
          <p>Total Samples (Monthly)</p>
        </div>
        <div className="card">
          <h3>{stats.throughput}/hr</h3>
          <p>Throughput</p>
        </div>
        <div className="card">
          <h3>{stats.avgTurnaround} min</h3>
          <p>Avg Turnaround Time</p>
        </div>
        <div className="card highlight">
          <h3>{stats.bestVariety}</h3>
          <p>Best Variety</p>
        </div>
        <div className="card danger">
          <h3>{stats.worstVariety}</h3>
          <p>Worst Variety</p>
        </div>
        <div className="card">
          <h3>{stats.labUtilization}%</h3>
          <p>Lab Utilization</p>
        </div>
        <div className="card">
          <h3>{stats.operatorEfficiency}%</h3>
          <p>Operator Efficiency</p>
        </div>
        <div className="card">
          <h3>{stats.bestDay}</h3>
          <p>Best Day of Week</p>
        </div>
        <div className="card">
          <h3>{stats.worstDay}</h3>
          <p>Worst Day of Week</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts">
        {/* Good vs Bad Ratio */}
        <div className="chart">
          <h4>Good vs Bad Ratio</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Good", value: stats.good },
                  { name: "Bad", value: stats.bad },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="chart">
          <h4>Weekly Moisture & Rejection</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="paddy"
                stroke="#8884d8"
                name="Paddy"
              />
              <Line
                type="monotone"
                dataKey="rice"
                stroke="#82ca9d"
                name="Rice"
              />
              <Line
                type="monotone"
                dataKey="rejected"
                stroke="#FF4C4C"
                name="Rejected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Moisture */}
        <div className="chart">
          <h4>Monthly Avg Moisture</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorPaddy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="paddy"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorPaddy)"
              />
              <Area
                type="monotone"
                dataKey="rice"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorRice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Paddy Weight per Day */}
        <div className="chart">
          <h4>Avg Paddy Weight per Day</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="weight" fill="#00C49F" name="Weight (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Variety Performance */}
        <div className="chart variety">
          <h4>Variety Performance</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={varietyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="variety" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#8884d8" name="Quality Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
