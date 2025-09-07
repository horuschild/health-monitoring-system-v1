import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { dbRT, dbFS } from "../firebase"; // RTDB + Firestore
import { collection, getDocs } from "firebase/firestore";
import InfoCard from "../components/InfoCard";
import ChartWidget from "../components/ChartWidget";
import EmployeeDetailPage from "./EmployeeDetailPage";
import "../styles/Dashboard.scss";

const DashboardPage = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeMeta, setEmployeeMeta] = useState({}); // name & nik dari Firestore
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // 🔹 Ambil name & nik dari Firestore
  useEffect(() => {
    const fetchMeta = async () => {
      const snap = await getDocs(collection(dbFS, "employees"));
      const meta = {};
      snap.forEach((doc) => {
        meta[doc.id] = doc.data(); // { name, nik }
      });
      setEmployeeMeta(meta);
    };
    fetchMeta();
  }, []);

  // 🔹 Ambil data sensor dari RTDB
  useEffect(() => {
    const usersRef = ref(dbRT, "users/");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const employeeList = Object.keys(data).map((uid) => {
          const entry = data[uid];
          const meta = employeeMeta[uid] || {}; // gabungkan Firestore meta

          return {
            uid,
            name: meta.name || "Unknown",       // dari Firestore
            nik: meta.nik || "-",               // dari Firestore
            heartRate: entry.humidity || 0,     // RTDB → heartRate
            temperature: entry.temp || 0,       // RTDB → temperature
            timestamp: entry.timestamp || null, // RTDB
          };
        });
        setEmployees(employeeList);
      }
    });

    return () => unsubscribe();
  }, [employeeMeta]); // rerun kalau Firestore meta berubah

  // 🔹 Kalau klik employee, masuk ke detail
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
        onClose={() => setSelectedEmployee(null)}
      />
    );
  }

  // 🔹 Render dashboard
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
            onClick={() => setSelectedEmployee(emp)}
          />
        ))}
      </div>

      <div className="right-section">
        <div className="line-chart-container">
          <ChartWidget
            type="line"
            data={{
              labels: employees.map((e) =>
                e.timestamp
                  ? new Date(e.timestamp * 1000).toLocaleTimeString()
                  : "-"
              ),
              datasets: [
                {
                  label: "Temperature",
                  data: employees.map((e) => e.temperature),
                  borderColor: "#3498db",
                  backgroundColor: "rgba(52, 152, 219, 0.2)",
                },
                {
                  label: "Heart Rate",
                  data: employees.map((e) => e.heartRate),
                  borderColor: "#e74c3c",
                  backgroundColor: "rgba(231, 76, 60, 0.2)",
                },
              ],
            }}
            title="Employee Vitals Over Time"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
