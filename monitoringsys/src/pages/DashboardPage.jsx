import React, { useState } from "react";
import InfoCard from "../components/InfoCard";
import ChartWidget from "../components/ChartWidget";
import EmployeeDetailPage from "./EmployeeDetailPage";
import "../styles/Dashboard.scss";

const employees = [
  { name: "Budi Santoso", nik: "12345", heartRate: 78, temperature: 36.7 },
  { name: "Siti Aminah", nik: "23456", heartRate: 82, temperature: 36.9 },
  { name: "Andi Wijaya", nik: "34567", heartRate: 75, temperature: 37.1 },
  { name: "Dewi Lestari", nik: "45678", heartRate: 80, temperature: 36.8 },
  { name: "Rudi Hartono", nik: "56789", heartRate: 77, temperature: 36.6 },
  { name: "Tina Marlina", nik: "67890", heartRate: 81, temperature: 37.0 },
  { name: "Budi Santoso", nik: "12345", heartRate: 78, temperature: 36.7 },
  { name: "Siti Aminah", nik: "23456", heartRate: 82, temperature: 36.9 },
  { name: "Andi Wijaya", nik: "34567", heartRate: 75, temperature: 37.1 },
  { name: "Dewi Lestari", nik: "45678", heartRate: 80, temperature: 36.8 },
  { name: "Rudi Hartono", nik: "56789", heartRate: 77, temperature: 36.6 },
  { name: "Tina Marlina", nik: "67890", heartRate: 81, temperature: 37.0 },
  { name: "Budi Santoso", nik: "12345", heartRate: 78, temperature: 36.7 },
  { name: "Siti Aminah", nik: "23456", heartRate: 82, temperature: 36.9 },
  { name: "Andi Wijaya", nik: "34567", heartRate: 75, temperature: 37.1 },
  { name: "Dewi Lestari", nik: "45678", heartRate: 80, temperature: 36.8 },
  { name: "Rudi Hartono", nik: "56789", heartRate: 77, temperature: 36.6 },
  { name: "Tina Marlina", nik: "67890", heartRate: 81, temperature: 37.0 },
];

const lineChartData = {
  labels: ["08:00", "09:00", "10:00", "11:00"],
  datasets: [
    {
      label: "Heart Rate",
      data: [78, 80, 82, 79],
      borderColor: "#e74c3c",
      backgroundColor: "rgba(231, 76, 60, 0.2)",
    },
    {
      label: "Temperature",
      data: [36.7, 36.8, 36.9, 37.0],
      borderColor: "#3498db",
      backgroundColor: "rgba(52, 152, 219, 0.2)",
    },
  ],
};

const pieChartData = {
  labels: ["Normal", "High", "Low"],
  datasets: [
    {
      label: "Heart Rate Status",
      data: [4, 1, 1],
      backgroundColor: ["#2ecc71", "#e74c3c", "#f1c40f"],
    },
  ],
};

const DashboardPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  if (selectedEmployee) {
    return (
      <EmployeeDetailPage
        employee={selectedEmployee}
        historyData={[
          { time: "08:00", heartRate: 78, temperature: 36.7 },
          { time: "09:00", heartRate: 80, temperature: 36.8 },
          { time: "10:00", heartRate: 82, temperature: 36.9 },
          { time: "11:00", heartRate: 79, temperature: 37.0 },
        ]}
        onClose={() => setSelectedEmployee(null)} // tombol close → matiin selected
      />
    );
  }

  return (
    <div className="dashboard-page">
      <div className="left-section">
        {employees.map((emp, idx) => (
          <InfoCard
            key={idx}
            name={emp.name}
            nik={emp.nik}
            heartRate={emp.heartRate}
            temperature={emp.temperature}
            onClick={() => setSelectedEmployee(emp)} // klik → buka detail
          />
        ))}
      </div>

      <div className="right-section">
        <div className="line-chart-container">
          <ChartWidget
            type="line"
            data={lineChartData}
            title="Employee Vitals Over Time"
          />
        </div>
        <div className="pie-chart-container">
          <ChartWidget
            type="pie"
            data={pieChartData}
            title="Heart Rate Status Distribution"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
