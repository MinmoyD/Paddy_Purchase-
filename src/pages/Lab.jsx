import React, { useState } from "react";
import LabForm from "./LabForm";
import Navbar from "../components/Navbar";
import axios from "axios";
import "./Lab.css";
import PinPopup from "../components/PinPopup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Lab = () => {
  const [cars] = useState([
    {
      id: 1,
      carNo: "WB23AB1234",
      driver: "Ramesh",
      party: "Sharma Traders",
      date: "2025-08-31",
      weight: 12000,
    },
    {
      id: 2,
      carNo: "WB45CD5678",
      driver: "Suresh",
      party: "Gupta Agro",
      date: "2025-08-30",
      weight: 15000,
    },
    {
      id: 3,
      carNo: "WB12EF9999",
      driver: "Mahesh",
      party: "Patel Rice",
      date: "2025-08-29",
      weight: 11000,
    },
    {
      id: 4,
      carNo: "WB12EF9948",
      driver: "Mahesh",
      party: "Patel Rice",
      date: "2025-08-29",
      weight: 21050,
    },
    {
      id: 5,
      carNo: "WB12EF7899",
      driver: "Mahesh",
      party: "Patel Rice",
      date: "2025-08-29",
      weight: 15860,
    },
  ]);

  const [selectedCar, setSelectedCar] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [paddyCount, setPaddyCount] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [labData, setLabData] = useState([]);
  const [formEntries, setFormEntries] = useState([]);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Open Fill Form Modal
  const handleFillForm = (car) => {
    setSelectedCar(car);
    setShowFormModal(true);
    setFormEntries(Array.from({ length: paddyCount }).map(() => ({})));
  };
  const handleDelete = async (pin) => {
    if (pin !== "1234") {
      toast.error("Not allowed! Wrong Pin");
      setShowPinPopup(false);
      setDeleteId(null);
      return;
    }

    try {
      await axios.delete(`http://localhost:4010/api/labform/${deleteId}`);
      setLabData((prev) => prev.filter((item) => item._id !== deleteId));
      toast.success("Deleted !!");
    } catch (error) {
      console.error("Error in handleDelete function", error);
      toast.error("Failed to delete entry");
    } finally {
      setShowPinPopup(false);
      setDeleteId(null);
    }
  };

  const requestDelete = (id) => {
    setDeleteId(id); // store which record to delete
    setShowPinPopup(true); // open popup
  };

  // render AlertBox

  // Handle individual form change
  const handleFormChange = (index, data) => {
    const updated = [...formEntries];
    updated[index] = data;
    setFormEntries(updated);
  };

  // Submit all lab forms at once
  const handleSubmitLabForm = async () => {
    if (!selectedCar) return;

    try {
      const entriesWithCarNo = formEntries.map((entry) => ({
        ...entry,
        carNo: selectedCar.carNo,
        createdAt: new Date(),
        createdBy: "Admin",
      }));

      await Promise.all(
        entriesWithCarNo.map((entry) =>
          axios.post("http://localhost:4010/api/labform", entry)
        )
      );

      alert("Lab entries saved successfully!");
      setShowFormModal(false);
      setFormEntries([]);
    } catch (err) {
      console.error(err);
      alert("Failed to save lab entries");
    }
  };

  // View lab entries for a car
  const handleView = async (car) => {
    setSelectedCar(car);
    setShowViewModal(true);

    try {
      const res = await axios.get(
        `http://localhost:4010/api/labform?carNo=${car.carNo}`
      );

      const detailedEntries = res.data.filter(
        (item) => item.siNo !== undefined && item.paddyName !== undefined
      );

      setLabData(detailedEntries);
    } catch (err) {
      console.error(err);
      setLabData([]);
    }
  };

  const handleCloseModal = () => {
    setSelectedCar(null);
    setShowFormModal(false);
    setShowViewModal(false);
    setFormEntries([]);
    setPaddyCount(1);
    setLabData([]);
  };

  const filteredCars = filterDate
    ? cars.filter((car) => car.date === filterDate)
    : cars;

  return (
    <div className="lab-container">
      <Navbar />
      <ToastContainer position="top-left" autoClose={2000} />

      <h2 className="title">Lab Entries</h2>

      {/* Filter by Date */}
      <div className="filter-box">
        <label>Filter by Date:</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        {filterDate && (
          <button className="btn reset" onClick={() => setFilterDate("")}>
            Reset
          </button>
        )}
      </div>

      {/* Car Table */}
      <table className="car-table">
        <thead>
          <tr>
            <th>Car Number</th>
            <th>Driver</th>
            <th>Party</th>
            <th>Date</th>
            <th>Weight (Kg)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <tr key={car.id}>
                <td>{car.carNo}</td>
                <td>{car.driver}</td>
                <td>{car.party}</td>
                <td>{car.date}</td>
                <td>{car.weight}</td>
                <td>
                  <button
                    className="btn fill"
                    onClick={() => handleFillForm(car)}
                  >
                    Fill Form
                  </button>
                  <button className="btn view" onClick={() => handleView(car)}>
                    👁 View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No cars found for this date
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Fill Form Modal */}
      {showFormModal && selectedCar && (
        <div className="modal">
          <div className="modal-content">
            <h3>
              Fill Paddy Forms for Car: <span>{selectedCar.carNo}</span>
            </h3>

            <label>Select No. of Paddy Types:</label>
            <select
              value={paddyCount}
              onChange={(e) => {
                const count = Number(e.target.value);
                setPaddyCount(count);
                setFormEntries(Array.from({ length: count }).map(() => ({})));
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>

            <div className="forms-container">
              {Array.from({ length: paddyCount }).map((_, i) => (
                <div key={i} className="form-wrapper">
                  <h4>Paddy Type {i + 1}</h4>
                  <LabForm
                    carNo={selectedCar.carNo} // ✅ Pass car number
                    onSubmit={(data) => handleFormChange(i, data)}
                  />
                </div>
              ))}
            </div>

            <button className="btn submit" onClick={handleSubmitLabForm}>
              Submit All
            </button>
            <button className="btn close" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedCar && (
        <div className="modal">
          <div className="modal-content">
            <h3>Lab Entries for Car: {selectedCar.carNo}</h3>
            {labData.length > 0 ? (
              labData.map((item, index) => (
                <div key={item._id} className="lab-item">
                  <h4>Entry {index + 1}</h4>
                  <p>
                    <strong>SI No:</strong> {item.siNo}
                  </p>
                  <p>
                    <strong>Paddy Name:</strong> {item.paddyName}
                  </p>
                  <p>
                    <strong>Paddy Moisture:</strong> {item.paddyMoisture}%
                  </p>
                  <p>
                    <strong>Paddy Moisture:</strong>
                    <span className="badge paddyMoisture">
                      {item.paddyMoisture}%
                    </span>
                  </p>

                  <p>
                    <strong>Rice Moisture:</strong>
                    <span className="badge riceMoisture">
                      {item.riceMoisture}%
                    </span>
                  </p>

                  <p>
                    <strong>Total Rice:</strong>
                    <span className="badge totalRice">{item.totalRice} kg</span>
                  </p>

                  <p>
                    <strong>Husk to Rice:</strong>
                    <span className="badge huskToRice">{item.huskToRice}%</span>
                  </p>

                  <p>
                    <strong>Husk:</strong>
                    <span className="badge husk">{item.husk}%</span>
                  </p>

                  <p>
                    <strong>Bran:</strong>
                    <span className="badge bran">{item.bran}%</span>
                  </p>

                  <p>
                    <strong>Dust:</strong> {item.dust}
                  </p>
                  <p>
                    <strong>DDC:</strong> {item.ddc}
                  </p>
                  <p>
                    <strong>Paddy %:</strong> {item.paddyPercent}
                  </p>
                  <p>
                    <strong>Total Rice:</strong> {item.totalRice}
                  </p>
                  <p>
                    <strong>Husk to Rice:</strong> {item.huskToRice}
                  </p>
                  <p>
                    <strong>Total Hand Rice:</strong> {item.totalHandRice}
                  </p>
                  <p>
                    <strong>Created By:</strong> {item.createdBy}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>

                  <button
                    className="btn delete"
                    onClick={() => requestDelete(item._id)}
                  >
                    🗑 Delete
                  </button>
                  <hr />
                </div>
              ))
            ) : (
              <p>No detailed lab entries found for this car.</p>
            )}
            <button className="btn close" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}
      {showPinPopup && (
        <PinPopup
          onConfirm={handleDelete}
          onCancel={() => {
            setShowPinPopup(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
};

export default Lab;
