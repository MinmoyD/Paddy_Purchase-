// src/components/SplashScreen.jsx
import React, { useEffect, useState } from "react";
import "../Animations/SplashScreen.css";
 // Adjust the path to your splash icon
 import icon from "../assets/R-removebg-preview.png"; // Ensure you have a splash icon

 
const SplashScreen = ({ onFinish }) => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
      setTimeout(onFinish, 1000); // Wait for animation to finish
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`splash-screen ${hide ? "hide" : ""}`}>
    <img src={icon} alt="Hemraj Logo" className="splash-icon" />
    </div>
  );
};

export default SplashScreen;
