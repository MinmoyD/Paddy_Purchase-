import React from "react";
import { useLocation } from "react-router-dom";
import { FaUser, FaCog, FaBell } from "react-icons/fa";
import "../components/Navbar.css";
import useUserName from "../Hooks/userName";

const Navbar = () => {
  const location = useLocation();
  const  userName  = useUserName();
  console.log("Navbar userName:", userName);

  // Convert pathname to readable title
  const getPageTitle = (path) => {
    if (path === "/") return "Dashboard";
    return path
      .replace("/", "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="navbar">
      {/* Left - Breadcrumb */}
      <div className="navbar-left">
        <span className="breadcrumb">/ {pageTitle}</span>
        <span className="page-title">{pageTitle}</span>
      </div>



      {/* Right - Search & Icons */}
      <div className="navbar-right">
        <input
          type="text"
          placeholder="Search here"
          className="navbar-search"
          value={userName}
          readOnly
        />
        <FaUser className="navbar-icon" />
        <FaCog className="navbar-icon" />
        <FaBell className="navbar-icon" />
      </div>
    </div>
  );
};

export default Navbar;
