import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "./BillingTable.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";


export default function BillingTable() {
  const STORAGE_KEY = "pdfHistory";
  const EXPIRY_DAYS = 30;

  // ✅ Load history & cleanup expired items
  const loadHistory = () => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const now = Date.now();
    const filtered = saved.filter(
      (item) => now - item.timestamp < EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered)); // cleanup
    return filtered;
  };

  const [pdfHistory, setPdfHistory] = useState(loadHistory);

  // ✅ Keep localStorage updated whenever pdfHistory changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pdfHistory));
  }, [pdfHistory]);

  // ---------------- Car Data ----------------
  const [data, setData] = useState([
    {
      id: 1,
      carNumber: "WB-34A-9087",
      driverName: "Raju Das",
      partyName: "Shiv Traders",
      unloadingDate: "2025-08-01",
      bags: 110,
      weight: 5500,
      isBilled: false,
    },
    {
      id: 2,
      carNumber: "JH-11B-2200",
      driverName: "Mohan Yadav",
      partyName: "Hemraj Exports",
      unloadingDate: "2025-08-01",
      bags: 90,
      weight: 4500,
      isBilled: false,
    },
    {
      id: 3,
      carNumber: "JH-11B-2200",
      driverName: "Mohan Yadav",
      partyName: "Hemraj Exports",
      unloadingDate: "2025-08-01",
      bags: 90,
      weight: 4500,
      isBilled: false,
    },
    {
      id: 4,
      carNumber: "JH-11B-2200",
      driverName: "Mohan Yadav",
      partyName: "Hemraj Exports",
      unloadingDate: "2025-08-01",
      bags: 90,
      weight: 4500,
      isBilled: false,
    },
    {
      id: 5,
      carNumber: "JH-11B-2200",
      driverName: "Mohan Yadav",
      partyName: "Hemraj Exports",
      unloadingDate: "2025-08-01",
      bags: 90,
      weight: 4500,
      isBilled: false,
    },
  ]);

  const [paddyTypesCount, setPaddyTypesCount] = useState(0);
  const [paddyData, setPaddyData] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [batha, setBatha] = useState("");
  const [moisture, setMoisture] = useState("");
  const [bags, setBags] = useState("");

  const handleGenerateBill = (car) => {
    setSelectedCar(car);
    setRate("");
    setAmount(0);
    setSubmitted(false);
    setPdfGenerated(false);
  };

  const handleSubmit = () => {
    let rightWeight = 0;
    const total = paddyData.reduce((sum, item) => {
      rightWeight = rightWeight + item.bags;
      const itemTotal =
        (item.bags || item.weight || 0) * parseFloat(item.rate || 0) -
        (selectedCar.weight / 100) * parseFloat(item.batha || 0);
      return sum + itemTotal;
    }, 0);

    if (rightWeight > selectedCar.weight || rightWeight < selectedCar.weight) {
      toast.warn("⚠️ ওজন আর বস্তা ঠিকমতো মিলিয়ে দেখুন।");
    } else {
      toast.success("Thank You");
      setAmount(total);
      setSubmitted(true);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const logoDataUrl = "../src/assets/R-removebg-preview.png"; 
    doc.addImage(logoDataUrl, "PNG", 20, 10, 30, 15);

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Paddy Billing Slip", 105, 20, { align: "center" });

    doc.setDrawColor(100, 149, 237);
    doc.setLineWidth(1);
    doc.line(20, 27, 190, 27);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString("en-GB")}`,
      150,
      35
    );

    const carInfo = [
      ["Car Number", selectedCar.carNumber],
      ["Driver Name", selectedCar.driverName],
      ["Party Name", selectedCar.partyName],
      ["Unloading Date", selectedCar.unloadingDate],
      ["Bags", selectedCar.bags],
      ["Weight (kg)", selectedCar.weight],
    ];

    let startY = 45;
    doc.setFont("helvetica", "bold");
    doc.setFillColor(230, 230, 250);
    doc.rect(20, startY - 6, 170, 8, "F");
    doc.setTextColor(0);
    doc.text("Car Details", 22, startY);

    doc.setFont("helvetica", "normal");
    carInfo.forEach(([label, value], index) => {
      const y = startY + index * 10;
      doc.rect(20, y - 6, 170, 10);
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y - 6, 60, 10, "F");
      doc.rect(80, y - 6, 110, 10, "F");
      doc.setTextColor(0);
      doc.text(label, 22, y);
      doc.text(String(value), 82, y);
    });

    startY += carInfo.length * 10 + 10;
    doc.setFont("helvetica", "bold");
    doc.setFillColor(200, 230, 255);
    doc.rect(20, startY - 6, 170, 8, "F");
    doc.text("Paddy Details", 22, startY);

    let paddyTotal = 0;
    paddyData.forEach((paddy, index) => {
      const y = startY + (index + 1) * 10;
      const paddyAmount =
        (paddy.bags || selectedCar.weight) * parseFloat(paddy.rate || 0) -
        (selectedCar.weight / 100) * parseFloat(paddy.batha || 0);

      paddyTotal += paddyAmount;

      doc.rect(20, y - 6, 170, 10);
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y - 6, 50, 10, "F");
      doc.rect(70, y - 6, 30, 10, "F");
      doc.rect(100, y - 6, 30, 10, "F");
      doc.rect(130, y - 6, 60, 10, "F");

      doc.text(paddy.name || "-", 22, y);
      doc.text(`Rate:${String(paddy.rate || "-")}`, 72, y);
      doc.text(`Weight:${String(paddy.bags || selectedCar.weight)}`, 45, y);
      doc.text(`Moisture:${String(paddy.moisture || "-")}`, 102, y);
      doc.text(`₹${paddyAmount.toFixed(2)}`, 132, y);
    });

    const totalY = startY + (paddyData.length + 1) * 10;
    doc.setFillColor(255, 220, 180);
    doc.rect(20, totalY - 6, 170, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount", 22, totalY);
    doc.text(`₹${paddyTotal.toFixed(2)}`, 132, totalY);

    const sigY = totalY + 20;
    doc.setDrawColor(0);
    doc.line(30, sigY, 80, sigY);
    doc.line(130, sigY, 180, sigY);
    doc.setFontSize(10);
    doc.text("Authorized Signature", 35, sigY + 5);
    doc.text("Receiver Signature", 135, sigY + 5);

    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80);
    doc.text("Thank you for your service!", 105, sigY + 20, {
      align: "center",
    });

    doc.save(`${selectedCar.carNumber}_bill.pdf`);
    setPdfGenerated(true);

    const updated = data.map((item) =>
      item.id === selectedCar.id ? { ...item, isBilled: true } : item
    );
    setData(updated);

    // ✅ Save to history with timestamp
    const newHistory = {
      carNumber: selectedCar.carNumber,
      date: selectedCar.unloadingDate,
      data: selectedCar,
      paddyData,
      amount: paddyTotal,
      timestamp: Date.now(),
    };
    setPdfHistory((prev) => [...prev, newHistory]);
  };

  const downloadPDF = (historyItem) => {
    const { data, paddyData, amount } = historyItem;
    const doc = new jsPDF();
    const logoDataUrl = "../src/assets/R-removebg-preview.png"; 
    doc.addImage(logoDataUrl, "PNG", 20, 10, 30, 15);

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Paddy Billing Slip", 105, 20, { align: "center" });

    doc.setDrawColor(100, 149, 237);
    doc.setLineWidth(1);
    doc.line(20, 27, 190, 27);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-GB")}`, 150, 35);

    const carInfo = [
      ["Car Number", data.carNumber],
      ["Driver Name", data.driverName],
      ["Party Name", data.partyName],
      ["Unloading Date", data.unloadingDate],
      ["Bags", data.bags],
      ["Weight (kg)", data.weight],
    ];

    let startY = 45;
    doc.setFont("helvetica", "bold");
    doc.setFillColor(230, 230, 250);
    doc.rect(20, startY - 6, 170, 8, "F");
    doc.setTextColor(0);
    doc.text("Car Details", 22, startY);

    doc.setFont("helvetica", "normal");
    carInfo.forEach(([label, value], index) => {
      const y = startY + index * 10;
      doc.rect(20, y - 6, 170, 10);
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y - 6, 60, 10, "F");
      doc.rect(80, y - 6, 110, 10, "F");

      doc.setTextColor(0);
      doc.text(label, 22, y);
      doc.text(String(value), 82, y);
    });

    startY += carInfo.length * 10 + 10;
    doc.setFont("helvetica", "bold");
    doc.setFillColor(200, 230, 255);
    doc.rect(20, startY - 6, 170, 8, "F");
    doc.text("Paddy Details", 22, startY);

    let paddyTotal = 0;
    paddyData.forEach((paddy, index) => {
      const y = startY + (index + 1) * 10;
      const paddyAmount =
        (paddy.bags || data.weight) * parseFloat(paddy.rate || 0) -
        (data.weight / 100) * parseFloat(paddy.batha || 0);

      paddyTotal += paddyAmount;

      doc.rect(20, y - 6, 170, 10);
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y - 6, 50, 10, "F");
      doc.rect(70, y - 6, 30, 10, "F");
      doc.rect(100, y - 6, 30, 10, "F");
      doc.rect(130, y - 6, 60, 10, "F");

      doc.text(paddy.name || "-", 22, y);
      doc.text(`Rate:${String(paddy.rate || "-")}`, 72, y);
      doc.text(`Weight:${String(paddy.bags || data.weight)}`, 45, y);
      doc.text(`Moisture:${String(paddy.moisture || "-")}`, 102, y);
      doc.text(`₹${paddyAmount.toFixed(2)}`, 132, y);
    });

    const totalY = startY + (paddyData.length + 1) * 10;
    doc.setFillColor(255, 220, 180);
    doc.rect(20, totalY - 6, 170, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount", 22, totalY);
    doc.text(`₹${paddyTotal.toFixed(2)}`, 132, totalY);

    const sigY = totalY + 20;
    doc.setDrawColor(0);
    doc.line(30, sigY, 80, sigY);
    doc.line(130, sigY, 180, sigY);
    doc.setFontSize(10);
    doc.text("Authorized Signature", 35, sigY + 5);
    doc.text("Receiver Signature", 135, sigY + 5);

    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80);
    doc.text("Thank you for your service!", 105, sigY + 20, {
      align: "center",
    });

    doc.save(`${data.carNumber}_bill.pdf`);
  };


  const closeModal = () => {
    setSelectedCar(null);
    setRate("");
    setBatha("");
    setAmount(0);
    setBags("");
    setSubmitted(false);
    setPdfGenerated(false);
  };

  const handleTypeChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setPaddyTypesCount(count);

    // Create empty data structure for each type
    setPaddyData(
      Array.from({ length: count }, () => ({
        name: "",
        rate: "",
        moisture: "",
        batha: "",
        bags: "",
      }))
    );
  };

  const handleChange = (index, field, value) => {
    const updatedData = [...paddyData];
    updatedData[index][field] = value;
    setPaddyData(updatedData);
  };

  

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="billing-container">
        <Navbar />
        <h2 className="billing-title">Billing Section</h2>
        <div className="billing-content">
          <div className="table-area">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Car Number</th>
                  <th>Driver</th>
                  <th>Party</th>
                  <th>Date</th>
                  <th>Bags</th>
                  <th>Weight (kg)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((car) => (
                  <tr key={car.id}>
                    <td>{car.carNumber}</td>
                    <td>{car.driverName}</td>
                    <td>{car.partyName}</td>
                    <td>{car.unloadingDate}</td>
                    <td>{car.bags}</td>
                    <td>{car.weight}</td>
                    <td>
                      {car.isBilled ? (
                        <span className="billed">Completed</span>
                      ) : (
                        <span className="pending">Pending</span>
                      )}
                    </td>
                    <td>
                      {!car.isBilled && (
                        <button
                          className="generate-btn"
                          onClick={() => handleGenerateBill(car)}
                        >
                          Generate Bill
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sidebar for PDF history */}
        <div className="pdf-history-sidebar">
      <h3>📄 PDF History</h3>
      <ul>
        {pdfHistory.map((item, index) => (
          <li key={index}>
            <strong>{item.carNumber}</strong> <br />
            <small>{item.date}</small>
            <br />
            <button
              className="download-btn"
              onClick={() => downloadPDF(item)}
            >
              ⬇ Download PDF
            </button>
          </li>
        ))}
      </ul>

      {/* Example button to add PDF */}
    </div>
        </div>

        {/* Modal */}
        {selectedCar && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>Generate Bill for {selectedCar.carNumber}</h3>
              <p>
                <strong>Party:</strong> {selectedCar.partyName}
              </p>
              <p>
                <strong>Bags:</strong> {selectedCar.bags}
              </p>
              <p>
                <strong>Weight:</strong> {selectedCar.weight} kg
              </p>

              <div className="billing-container-2">
                {!submitted ? (
                  <>
                    <label>Select number of Paddy Types:</label>
                    <select
                      className="custom-select"
                      value={paddyTypesCount}
                      onChange={handleTypeChange}
                    >
                      <option value="">--Select--</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>

                    {paddyData.map((paddy, index) => (
                      <div key={index} className="paddy-card">
                        <h4>Paddy Type {index + 1}</h4>
                        <label>Name of Paddy:</label>
                        <input
                          type="text"
                          value={paddy.name}
                          onChange={(e) =>
                            handleChange(index, "name", e.target.value)
                          }
                        />

                        <label>Rate per Kg (₹):</label>
                        <input
                          type="number"
                          value={paddy.rate}
                          onChange={(e) =>
                            handleChange(index, "rate", e.target.value)
                          }
                        />

                        <label>Kg :</label>
                        <input
                          type="number"
                          value={paddy.bags}
                          onChange={(e) => {
                            const newBags = parseFloat(e.target.value);
                            if (newBags > selectedCar.weight) {
                              toast.error("❌ ওজন গাড়ির ওজনের বেশি!", {
                                position: "bottom-right",
                                autoClose: 3000,
                              });
                            } else {
                              handleChange(index, "bags", newBags);
                            }
                          }}
                        />

                        <label>Moisture (%):</label>
                        <input
                          type="number"
                          value={paddy.moisture}
                          onChange={(e) =>
                            handleChange(index, "moisture", e.target.value)
                          }
                        />

                        <label>Batha per 100Kg (₹):</label>
                        <input
                          type="number"
                          value={paddy.batha}
                          onChange={(e) =>
                            handleChange(index, "batha", e.target.value)
                          }
                        />
                      </div>
                    ))}

                    {paddyTypesCount > 0 && (
                      <button className="submit-btn" onClick={handleSubmit}>
                        Submit
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Total Amount:</strong> ₹{amount.toFixed(2)}
                    </p>
                    {!pdfGenerated ? (
                      <button
                        className="export-btn"
                        onClick={() => {
                          generatePDF();
                          toast.success("✅ PDF Generated Successfully! Please Save This",{
                            position: "top-right",
                            autoClose: 3000,
                          });
                        }}
                      >
                        Export to PDF
                      </button>
                      
                    ) : (
                      <p className="completed-status">✅ Status: Completed</p>
                    )}
                    <ToastContainer />
                  </>
                )}
                <ToastContainer position="top-center" autoClose={3000} />
              </div>
              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
