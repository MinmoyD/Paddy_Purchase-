import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ import navigate
import "./Login.css";

function Login() {
  const [logData, setLogData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // ✅ hook

  const handleChange = (e) => {
    setLogData({
      ...logData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://https://paddy-login-backend.vercel.app/api/login", logData, {
        withCredentials: true,
      });
      navigate("/dashboard"); // ✅ redirect on success
      setMessage(`✅ ${res.data.msg} | Welcome ${res.data.user.name}`);
      console.log("User:", res.data.user);
    } catch (err) {
      if (err.response) {
        setMessage(`❌ ${err.response.data.msg}`);
          // navigate("/signup");
        // 🚀 redirect to Register page if user not found
        if (err.response.data.msg === "User does not exist") {
          navigate("/signup");
        }
      } else {
        setMessage("❌ Server not responding");
      }
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="Login">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {/* Email field */}
            <div className="input-group">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={logData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password field */}
            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={logData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">Login</button>
            <a href="/signup">Create accounts</a>

            {message && <p>{message}</p>}
          </form>
        </div>
      </div>
    </>
  );
}

export default Login ; 
