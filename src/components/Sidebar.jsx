import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../components/Sidebar.css";
import icon from "../assets/R-removebg-preview.png";
import { Menu, ChevronLeft } from "lucide-react"; // icons

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Warehouse", path: "/warehouse", icon: "🏗️" },
    { label: "Stock", path: "/stock", icon: "📦" },
    { label: "Billing", path: "/billing", icon: "💳" },
    { label: "Lab From", path: "/labfrom", icon: "🧪" },
    { label: "Lab Dashboard", path: "/labdashboard", icon: "📈" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <img src={icon} alt="Hemraj Logo" className="sidebar-logo" />
        {!collapsed && (
          <h2>
            🌾<span className="raj">Hemraj</span>{" "}
            <span className="paddy">Paddy</span>{" "}
            <span className="purchase">Purchase</span>
          </h2>
        )}
      </div>

      {/* Toggle Button */}
      <button
        className="toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Menu */}
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.label}
            className={location.pathname === item.path ? "active" : ""}
          >
            <Link to={item.path}>
              <span className="menu-icon">{item.icon}</span>
              {!collapsed && <span className="menu-text">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          &copy; 2025 Hemraj Group <br /> made by M.D.
        </div>
      )}
    </div>
  );
};

export default Sidebar;
