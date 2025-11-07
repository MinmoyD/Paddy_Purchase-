// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import WarehouseTable from "./pages/WarehouseTable";
import SplashScreen from "./Animations/SplashScreen";
import "./App.css";
import StockTable from "./pages/StockTable";
import BillingTable from "../src/components/BillingTable";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from "./pages/Login";
import Register from "./pages/Register";
import LabForm from "./pages/LabForm";
import Lab from "./pages/Lab";
import LabDashboard from "./pages/LabDashboard";

function MainLayout({ darkMode, setDarkMode, children }) {
  const location = useLocation();

  // paths where Sidebar should be hidden
  const hideSidebarPaths = ["/", "/signup"];

  const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);

  return (
    <div className="app-container">
      {!shouldHideSidebar && <Sidebar />}
      <div className="main-content">
        <header className="top-header">
          <button
            className="mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.className = darkMode ? "dark" : "light";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Login />
            </MainLayout>
          }
        />
        <Route
          path="/warehouse"
          element={
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <WarehouseTable />
            </MainLayout>
          }
        />
        <Route
          path="/lab"
          element={
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <LabForm/>
            </MainLayout>
          }
        />
        <Route
          path="/labfrom"
          element={
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Lab/>
            </MainLayout>
          }
        />
        <Route
          path="/labdashboard"
          element={
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <LabDashboard/>
            </MainLayout>
          }
        />
        <Route
          path="/stock"
          element={
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <StockTable />
            </MainLayout>
          }
        />
        <Route
          path="/billing"
          element={
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <BillingTable />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Register />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
