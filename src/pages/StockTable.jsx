import { useEffect, useState } from "react";
import "../pages/WarehouseTable.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "../components/Navbar";

const API_URL = "https://car-qr-stock-backend.vercel.app/api/stocks/all"; // stock API
const SECURITY_PIN = "1234"; // change this to your desired PIN

function StockTable() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [visibleRows, setVisibleRows] = useState(10);
  const [loading, setLoading] = useState(true);

  // 🔹 Form visibility
  const [showForm, setShowForm] = useState(false);

  // 🔹 PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pendingData, setPendingData] = useState(null);

  // 🔹 Form states
  const [formData, setFormData] = useState({
    Date: "",
    Type: "",
    Bags: "",
    Weight: "",
    CarNo: "",
    PartyName: "",
    UnloaderName: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch stock data");
      const json = await res.json();
      setData(json);
      setFilteredData(json);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch stock data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  // 🔹 Filter by Date
  const filterByDate = () => {
    if (!fromDate && !toDate) {
      setFilteredData(data);
      setVisibleRows(10);
      return;
    }
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const filtered = data.filter((row) => {
      if (!row.Date) return false;
      const rowDate = new Date(row.Date);
      return (!from || rowDate >= from) && (!to || rowDate <= to);
    });
    setFilteredData(filtered);
    setVisibleRows(10);
  };

  // 🔹 Export Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((row) => ({
        Date: row.Date || "-",
        Type: row.Type || "-",
        Bags: row.Bags || 0,
        Weight: row.Weight || 0,
        "Car No": row.CarNo || "-",
        "Party Name": row.PartyName || "-",
        "Unloader Name": row.UnloaderName || "-",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Data");
    XLSX.writeFile(workbook, "stock_data.xlsx");
  };

  // 🔹 Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Stock Records", 14, 20);
    const headers = [
      [
        "Date",
        "Type",
        "Bags",
        "Weight",
        "Car No",
        "Party Name",
        "Unloader Name",
      ],
    ];
    const rows = filteredData.map((row) => [
      row.Date || "-",
      row.Type || "-",
      row.Bags || 0,
      row.Weight || 0,
      row.CarNo || "-",
      row.PartyName || "-",
      row.UnloaderName || "-",
    ]);
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },
    });
    doc.save("stock_data.pdf");
  };

  // 🔹 Totals
  const totalWeight = filteredData.reduce(
    (acc, row) => acc + (parseFloat(row.Weight) || 0),
    0
  );
  const totalBags = filteredData.reduce(
    (acc, row) => acc + (parseInt(row.Bags) || 0),
    0
  );
  const totalEntries = filteredData.length;

  // 🔹 Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Handle form submit (show PIN modal first)
  const handleSubmit = (e) => {
    e.preventDefault();
    setPendingData({ ...formData, LastUpdate: new Date().toLocaleString() });
    setShowPinModal(true); // open PIN modal
  };

  // 🔹 Confirm PIN
  const confirmPin = async () => {
    if (pinInput !== SECURITY_PIN) {
      alert("❌ Wrong PIN. Record not added.");
      setPinInput("");
      return;
    }
    try {
      const res = await fetch("https://car-qr-stock-backend.vercel.app/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingData),
      });
      if (!res.ok) throw new Error("Failed to save stock data");
      await res.json();
      fetchData();
      setFormData({
        Date: "",
        Type: "",
        Bags: "",
        Weight: "",
        CarNo: "",
        PartyName: "",
        UnloaderName: "",
      });
      setShowForm(false);
      alert("✅ Stock record added successfully!");
    } catch (err) {
      alert("Error: " + err.message);
      console.error("Error submitting stock data:", err);
    } finally {
      setShowPinModal(false);
      setPinInput("");
      setPendingData(null);
    }
  };

  return (
    <div className="warehouse-container">
      <Navbar />
      <div className="warehouse-header">
        <div className="warehouse-title">Stock Records</div>

        {/* 🔹 Toggle form */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)}>➕ Add Stock</button>
        ) : (
          <form className="warehouse-form" onSubmit={handleSubmit}>
            <input
              type="date"
              name="Date"
              value={formData.Date}
              onChange={handleChange}
              required
            />
            {/* Replace this line: 
                <input type="text" name="Type" placeholder="Type" value={formData.Type} onChange={handleChange} required /> 
          */}

            <select
              name="Type"
              value={formData.Type}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Type --</option>
              <option value="1001">1001</option>
              <option value="D-Sita">D-Sita</option>
              <option value="Sita">Sita</option>
              <option value="Mota">Mota</option>
              <option value="D-Mota">D-Mota</option>
              <option value="CM">CM</option>
              <option value="By-pass">By-pass</option>
            </select>

            <input
              type="number"
              name="Bags"
              placeholder="Bags"
              value={formData.Bags}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="Weight"
              placeholder="Weight"
              value={formData.Weight}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="CarNo"
              placeholder="Car No"
              value={formData.CarNo}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="PartyName"
              placeholder="Party Name"
              value={formData.PartyName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="UnloaderName"
              placeholder="Unloader Name"
              value={formData.UnloaderName}
              onChange={handleChange}
              required
            />
            <button type="submit">Add</button>
          </form>
        )}
      </div>

      {/* 🔹 PIN Modal */}
      {showPinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🔒 Enter Security PIN</h3>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN"
            />
            <div className="modal-actions">
              <button onClick={confirmPin}>Confirm</button>
              <button onClick={() => setShowPinModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters + Exports */}
      <div className="filters">
        <label>
          From:{" "}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        <label>
          To:{" "}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
        <button onClick={filterByDate}>Filter</button>
        <button onClick={exportToExcel}>Export Excel</button>
        <button onClick={exportToPDF}>Export PDF</button>
      </div>

      <div className="summary-box">
        <div>
          Total Entries: <strong>{totalEntries}</strong>
        </div>
        <div>
          Total Bags: <strong>{totalBags}</strong>
        </div>
        <div>
          Total Weight: <strong>{totalWeight.toFixed(2)} Qtl</strong>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <table className="warehouse-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Bags</th>
                <th>Weight</th>
                <th>Car No</th>
                <th>Party Name</th>
                <th>Unloader Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, visibleRows).map((row, idx) => (
                <tr key={idx}>
                  <td>{row.Date || "-"}</td>
                  <td>
                    <strong>{row.Type || "-"}</strong>
                  </td>
                  <td>{row.Bags || 0}</td>
                  <td>{row.Weight || 0}</td>
                  <td>{row.CarNo || "-"}</td>
                  <td>{row.PartyName || "-"}</td>
                  <td>{row.UnloaderName || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleRows < filteredData.length && (
            <div className="show-more-container">
              <button
                className="show-more-button"
                onClick={() => setVisibleRows((prev) => prev + 10)}
              >
                Show More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StockTable;
