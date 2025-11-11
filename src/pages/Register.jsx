import React, { useState } from "react";
import axios from "axios";
import { Player } from "@lottiefiles/react-lottie-player";
//import Jokes from "./Jokes";
import "./Register.css";
import { useNavigate } from "react-router-dom";

// Animations
import registerAnimation from "../assets/register.json";
import successAnimation from "../assets/success.json";
import errorMes from "../assets/Error 404.json";
import Dashboard from "./Dashboard";
import Login from "./Login";

function Register() {
  const [isregister, setIsregister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false); // ⬅️ new state

  const [formsdata, setFormsdata] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormsdata({
      ...formsdata,
      [e.target.name]: e.target.value,
    });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formsdata;

    if (!name || !email || !password) {
      return alert("⚠️ Please enter all fields");
    }

    if (!validateEmail(email)) {
      return alert("❌ Please enter a valid email");
    }

    try {
      setLoading(true);
      setShowError(false); // reset error
      const res = await axios.post("https://paddy-login-backend.vercel.app/api/register", formsdata);

      console.log("✅ Successful", res.data);
      setFormsdata({ name: "", email: "", password: "" });
      setShowSuccess(true);
      setTimeout(() => setIsregister(true), 2500);      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setShowError(true); // ⬅️ trigger error component
      } else {
        alert("❌ Something went wrong, please try again");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isregister ? (
        <div className="register-container">
          {showSuccess ? (
            <div className="success-box">
              <Player
                autoplay
                loop={false}
                src={successAnimation}
                style={{ height: "300px", width: "300px" }}
              />
              <h2>🎉 Registration Successful!</h2>
            </div>
          ) : showError ? ( // ⬅️ error component
            <div className="error-box">
              <Player
                autoplay
                loop
                src={errorMes}
                style={{ height: "300px", width: "300px" }}
              />
              <h2>⚠️ User already exists!</h2>
              <button onClick={() => setShowError(false)}>🔄 Try Again</button>
            </div>
          ) : (
            <div className="register-box">
              {/* Left Side → Animation */}
              <div className="register-left">
                <Player
                  autoplay
                  loop
                  src={registerAnimation}
                  style={{ height: "350px", width: "350px" }}
                />
              </div>

              {/* Right Side → Form */}
              <div className="register-right">
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="name"
                    placeholder="👤 Enter your name"
                    value={formsdata.name}
                    onChange={handleChange}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="📧 Enter your email"
                    value={formsdata.email}
                    onChange={handleChange}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="🔑 Enter your password"
                    value={formsdata.password}
                    onChange={handleChange}
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? "⏳ Registering..." : "🚀 Register"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Login />
      )}
    </>
  );
}

export default Register;
