// src/components/WarehouseStockLineChart.jsx
import React, { useEffect, useState } from "react";
import "../components/WarehouseStockLineChart.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const BAG_WEIGHT_KG = 60;   // 1 bag = 60 kg
const KG_PER_QUINTAL = 100; // 1 qtl = 100 kg

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const toNumber = (v) => {
  if (v === null || v === undefined) return 0;
  const s = String(v).replace(/,/g, "").trim();
  if (s === "") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// ✅ Fixed: Prefer Weight (kg) → qtl; fallback to Bags
const computeQtlFromRow = (row) => {
  const weightRaw = toNumber(row.Weight ?? row.weight); // kg
  if (weightRaw > 0) {
    return weightRaw / KG_PER_QUINTAL; // kg → qtl
  }

  const bags = Math.round(toNumber(row.Bags ?? row.bags));
  if (bags > 0) {
    const kg = bags * BAG_WEIGHT_KG;
    return kg / KG_PER_QUINTAL; // bags → qtl
  }

  return 0;
};

const normalizeType = (t) => {
  if (!t && t !== 0) return "Unknown";
  return String(t).trim() || "Unknown";
};

const WarehouseStockLineChart = () => {
  const [data, setData] = useState([]);
  const [debug, setDebug] = useState(null);

  const fetchStockData = async () => {
    try {
      const [stockRes, scansRes] = await Promise.all([
        axios.get("https://car-qr-stock-backend.vercel.app/api/stocks/all"),
        axios.get("https://car-qr-stock-backend.vercel.app/api/scans"),
      ]);

      const stocks = Array.isArray(stockRes.data) ? stockRes.data : [];
      const scans = Array.isArray(scansRes.data) ? scansRes.data : [];

      // --- Aggregate gross stock (qtl) by type ---
      const stockMap = {};
      stocks.forEach((item) => {
        const type = normalizeType(item.Type || item.type);
        const qtl = computeQtlFromRow(item);
        stockMap[type] = (stockMap[type] || 0) + qtl;
      });

      // --- Aggregate scanned stock (qtl) by type ---
      const scannedMap = {};
      scans.forEach((item) => {
        const type = normalizeType(item.Type || item.type);
        const qtl = computeQtlFromRow(item);
        scannedMap[type] = (scannedMap[type] || 0) + qtl;
      });

      // --- Compute net stock per type ---
      const types = Array.from(
        new Set([...Object.keys(stockMap), ...Object.keys(scannedMap)])
      );

      const netStockMap = {};
      types.forEach((type) => {
        const gross = stockMap[type] || 0;
        const scanned = scannedMap[type] || 0;
        const net = Math.max(0, gross - scanned);
        netStockMap[type] = r2(net);
      });

      // --- Convert to chart data ---
      const chartData = Object.keys(netStockMap)
        .map((type) => ({
          name: type,
          stock: netStockMap[type],
        }))
        .sort((a, b) => b.stock - a.stock);

      setData(chartData);

      // Debug info
      setDebug({
        stockMap: Object.fromEntries(
          Object.entries(stockMap).map(([k, v]) => [k, r2(v)])
        ),
        scannedMap: Object.fromEntries(
          Object.entries(scannedMap).map(([k, v]) => [k, r2(v)])
        ),
        netStockMap,
        counts: { stockRows: stocks.length, scanRows: scans.length },
      });
      console.debug("📊 WarehouseStockLineChart debug:", {
        stockMap,
        scannedMap,
        netStockMap,
      });
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setData([]);
      setDebug(null);
    }
  };

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 300000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: 350,
        background: "rgb(70 83 101)",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ marginBottom: 20 }}>📦 Warehouse Paddy Stock</h3>

      <ResponsiveContainer width="100%" height="70%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            label={{ value: "Quintals", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="stock"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, fill: "#10b981" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <p style={{ fontSize: "12px", color: "#d1d5db", marginTop: 12 }}>
        Paddy stock in quintals (Gross − Scanned per type)
      </p>
    </div>
  );
};

export default WarehouseStockLineChart;
