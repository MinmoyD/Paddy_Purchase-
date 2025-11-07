// src/components/PinPopup.jsx
import React, { useState } from "react";
import "./PinPopup.css";

const PinPopup = ({ onConfirm, onCancel }) => {
  const [pin, setPin] = useState("");

  return (
    <div className="pin-popup-overlay">
      <div className="pin-popup">
        <h3>Enter PIN</h3>
        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <div className="buttons">
          <button onClick={() => onConfirm(pin)}>Confirm</button>
          <button className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PinPopup;
