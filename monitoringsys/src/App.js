import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import EmployeeList from "./pages/EmployeeList";
import AdminList from "./pages/AdminList";
import "./styles/Dashboard.scss";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <DashboardPage />;
      case "Employee List":
        return <EmployeeList />;
      case "Admin List":
        return <AdminList />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar
        active={activePage}
        setActive={setActivePage}
        onLogout={() => alert("Logout berhasil!")}
      />

      <div className="main-content" style={{ flex: 1, padding: "2rem" }}>
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
