import { useEffect, useState } from "react";
import "../pages/WarehouseTable.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "../components/Navbar";

const API_URL = "http://car-qr-stock-backend.vercel.app/api/scans";
const ADMIN_PIN = "1234"; 

function WarehouseTable() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [visibleRows, setVisibleRows] = useState(10);
  const [loading, setLoading] = useState(true);

  // 🔹 Form visibility + PIN check
  const [showForm, setShowForm] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

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
      if (!res.ok) throw new Error("Failed to fetch data from server");
      const json = await res.json();
      setData(json);
      setFilteredData(json);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch warehouse data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  // Filter by scannedAt date
  const filterByDate = () => {
    if (!fromDate && !toDate) {
      setFilteredData(data);
      setVisibleRows(10);
      return;
    }

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filtered = data.filter((row) => {
      if (!row.scannedAt) return false;
      const rowDate = new Date(row.scannedAt);
      const rowDateOnly = new Date(
        rowDate.getFullYear(),
        rowDate.getMonth(),
        rowDate.getDate()
      );
      return (!from || rowDateOnly >= from) && (!to || rowDateOnly <= to);
    });

    setFilteredData(filtered);
    setVisibleRows(10);
  };

  // Export filtered data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((row) => ({
        Timestamp: row.scannedAt?.slice(11, 19) || "-",
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouse Data");
    XLSX.writeFile(workbook, "warehouse_data.xlsx");
  };

  // Export filtered data to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Warehouse - Paddy Challai Records", 14, 20);

    const headers = [
      [
        "Timestamp",
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
      row.scannedAt?.slice(11, 19) || "-",
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
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("warehouse_data.pdf");
  };

  // Totals
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

  // 🔹 Submit form data to API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newData = {
        ...formData,
        LastUpdate: new Date().toLocaleString(),
        scannedAt: new Date().toISOString(),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (!res.ok) throw new Error("Failed to save data");

      const result = await res.json();
      console.log("Saved:", result);

      // refresh table instantly
      fetchData();

      // clear form
      setFormData({
        Date: "",
        Type: "",
        Bags: "",
        Weight: "",
        CarNo: "",
        PartyName: "",
        UnloaderName: "",
      });

      setShowForm(false); // hide form after submit
    } catch (err) {
      console.error("Error submitting data:", err);
    }
  };

  // 🔹 Check PIN
  const checkPin = () => {
    if (pinInput === ADMIN_PIN) {
      setShowForm(true);
      setPinError("");
    } else {
      setPinError("❌ Wrong PIN");
    }
  };

  return (
    <div className="warehouse-container">
      <Navbar />
      <div className="warehouse-header">
        <div className="warehouse-title">
          Warehouse - Paddy Challai Records
        </div>

        {/* 🔹 Button to open form */}
        {!showForm ? (
          <div className="pin-box">
            <input
              type="password"
              placeholder="Enter Admin PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            <button onClick={checkPin}>Unlock Form</button>
            {pinError && <p className="pin-error">{pinError}</p>}
          </div>
        ) : (
          <form className="warehouse-form" onSubmit={handleSubmit}>
            <input
              type="date"
              name="Date"
              value={formData.Date}
              onChange={handleChange}
              required
            />
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

      {/* Existing filters + table remain unchanged */}
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
        <div className="text">
          Total Entries: <strong>{totalEntries}</strong>
        </div>
        <div className="text">
          Total Bags: <strong>{totalBags}</strong>
        </div>
        <div className="text">
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
                <th>Timestamp</th>
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
                  <td>{row.scannedAt ? row.scannedAt.slice(11, 19) : "-"}</td>
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

export default WarehouseTable;
