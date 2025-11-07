// src/hooks/useWarehouseTableData.js
import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/scans"; // GET endpoint

export default function useWarehouseTableData() {
  const [totals, setTotals] = useState({
    totalWeight: 0,
    totalBags: 0,
    totalEntries: 0,
    loading: true,
  });

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();

      const Today = new Date().toISOString().split("T")[0];

      // Filter only today's entries
      const todayEntries = json.filter((entry) => {
        if (!entry.scannedAt) return false;
        const date = new Date(entry.scannedAt).toISOString().split("T")[0];
        return date === Today;
      });

      if (todayEntries.length > 0) {
        const totalWeight = todayEntries.reduce(
          (acc, row) => acc + (parseFloat(row.Weight) || 0), // ✅ use `Weight`
          0
        );
        const totalBags = todayEntries.reduce(
          (acc, row) => acc + (parseInt(row.Bags) || 0), // ✅ use `Bags`
          0
        );

        setTotals({
          totalWeight,
          totalBags,
          totalEntries: todayEntries.length,
          loading: false,
        });
      } else {
        setTotals({
          totalWeight: 0,
          totalBags: 0,
          totalEntries: 0,
          loading: false,
        });
      }
    } catch (err) {
      console.error("Error fetching warehouse data:", err);
      setTotals((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return totals;
}
