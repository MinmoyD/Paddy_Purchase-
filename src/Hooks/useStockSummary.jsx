// src/hooks/useStockSummary.js
import { useEffect, useState } from "react";
import axios from "axios";

const STOCKS_API = "http://car-qr-stock-backend.vercel.app/api/stocks/all"; // base stock
const SCANS_API = "http://car-qr-stock-backend.vercel.app/api/scans";       // production/scans

const BAG_WEIGHT_KG = 60;     // 1 bag = 60 kg
const KG_PER_QUINTAL = 100;   // 1 qtl = 100 kg

// Round to 2 decimals
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// safe number parser that removes commas and trims
const toNumber = (v) => {
  if (v === null || v === undefined) return 0;
  const s = String(v).replace(/,/g, "").trim();
  if (s === "") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

const useStockSummary = () => {
  const [totalBags, setTotalBags] = useState(0);     // ✅ Right bags available (net)
  const [totalWeight, setTotalWeight] = useState(0); // ✅ Right weight available (kg, net)
  const [totalQtl, setTotalQtl] = useState(0);       // ✅ Right weight available (qtl, net)
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);              // raw stock rows
  const [debug, setDebug] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [stockRes, scansRes] = await Promise.all([
          axios.get(STOCKS_API),
          axios.get(SCANS_API),
        ]);

        const stockData = Array.isArray(stockRes.data) ? stockRes.data : [];
        const scansData = Array.isArray(scansRes.data) ? scansRes.data : [];

        // Helper to compute per-row bags and kg:
        // Prefer Bags field (most reliable). If Bags absent/zero use Weight.
        const computeRow = (row) => {
          const bagsRaw = toNumber(row.Bags ?? row.bags);
          const weightRaw = toNumber(row.Weight ?? row.weight);

          // If Bags present (>0) use it as canonical source
          if (bagsRaw > 0) {
            const kgFromBags = bagsRaw * BAG_WEIGHT_KG;
            return { bags: Math.round(bagsRaw), kg: kgFromBags };
          }

          // Otherwise, fall back to Weight. Assume Weight is in KG.
          if (weightRaw > 0) {
            // if weight is provided and bags missing, estimate bags from weight
            const estimatedBags = Math.round(weightRaw / BAG_WEIGHT_KG);
            return { bags: estimatedBags, kg: weightRaw };
          }

          // nothing meaningful
          return { bags: 0, kg: 0 };
        };

        // Aggregate gross (stock) totals
        const gross = stockData.reduce(
          (acc, row) => {
            const r = computeRow(row);
            acc.bags += r.bags;
            acc.kg += r.kg;
            return acc;
          },
          { bags: 0, kg: 0 }
        );

        // Aggregate scanned/production totals (to subtract)
        const scanned = scansData.reduce(
          (acc, row) => {
            const r = computeRow(row);
            acc.bags += r.bags;
            acc.kg += r.kg;
            return acc;
          },
          { bags: 0, kg: 0 }
        );

        // NET (available) = gross - scanned (clamp at 0)
        const netBags = Math.max(0, Math.round(gross.bags - scanned.bags));
        const netKg = Math.max(0, r2(gross.kg - scanned.kg));
        const netQtl = r2(netKg / KG_PER_QUINTAL);

        // Save state
        setData(stockData);
        setTotalBags(netBags);
        setTotalWeight(netKg);
        setTotalQtl(netQtl);

        // Debug info (useful to inspect where numbers came from)
        setDebug({
          gross: {
            bags: gross.bags,
            kg: r2(gross.kg),
            qtl: r2(gross.kg / KG_PER_QUINTAL),
          },
          scanned: {
            bags: scanned.bags,
            kg: r2(scanned.kg),
            qtl: r2(scanned.kg / KG_PER_QUINTAL),
          },
          net: {
            bags: netBags,
            kg: netKg,
            qtl: netQtl,
          },
          counts: { stockRows: stockData.length, scanRows: scansData.length },
        });
      } catch (err) {
        console.error("Error fetching stock summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // no dependencies -> run on mount. If you want auto-refresh add an interval here.
  }, []);

  return { totalBags, totalWeight, totalQtl, loading, data, debug };
};

export default useStockSummary;
