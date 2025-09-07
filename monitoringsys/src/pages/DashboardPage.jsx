import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { dbRT, dbFS } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import InfoCard from "../components/InfoCard";
import ChartWidget from "../components/ChartWidget";
import EmployeeDetailPage from "./EmployeeDetailPage";
import ThresholdModal from "../components/ThresholdModal"; // ⬅️ tambahin
import "../styles/Dashboard.scss";

const DashboardPage = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeMeta, setEmployeeMeta] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // threshold state
  const [hrThresholds, setHrThresholds] = useState({ low: 60, high: 100 });
  const [tempThresholds, setTempThresholds] = useState({ low: 36.0, high: 37.5 });

  // modal state
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    const fetchMeta = async () => {
      const snap = await getDocs(collection(dbFS, "users"));
      const meta = {};
      snap.forEach((doc) => {
        meta[doc.id] = doc.data();
      });
      setEmployeeMeta(meta);
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const usersRef = ref(dbRT, "users/");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const employeeList = Object.keys(data).map((uid) => {
          const entry = data[uid];
          const meta = employeeMeta[uid] || {};

          return {
            uid,
            name: meta.name || "Unknown",
            nik: meta.nik || "-",
            heartRate: entry.humidity || 0,
            temperature: entry.temperature || 0,
            timestamp: entry.timestamp || null,
          };
        });
        setEmployees(employeeList);
      }
    });

    return () => unsubscribe();
  }, [employeeMeta]);

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

  // 🔹 Hitung distribusi HR & Temp
  let hrLow = 0,
    hrNormal = 0,
    hrHigh = 0;
  let tempLow = 0,
    tempNormal = 0,
    tempHigh = 0;

  employees.forEach((e) => {
    // HR kategori
    if (e.heartRate < hrThresholds.low) hrLow++;
    else if (e.heartRate <= hrThresholds.high) hrNormal++;
    else hrHigh++;

    // Temp kategori
    if (e.temperature < tempThresholds.low) tempLow++;
    else if (e.temperature <= tempThresholds.high) tempNormal++;
    else tempHigh++;
  });

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
        <div
          className="pie-chart-container"
          onClick={() => setModalType("Heart Rate")}
        >
          <ChartWidget
            type="doughnut"
            data={{
              labels: ["Low", "Normal", "High"],
              datasets: [
                {
                  data: [hrLow, hrNormal, hrHigh],
                  backgroundColor: ["#3498db", "#2ecc71", "#e74c3c"],
                },
              ],
            }}
            title="Heart Rate Distribution"
          />
        </div>
        <div
          className="pie-chart-container"
          onClick={() => setModalType("Temperature")}
        >
          <ChartWidget
            type="doughnut"
            data={{
              labels: ["Low", "Normal", "High"],
              datasets: [
                {
                  data: [tempLow, tempNormal, tempHigh],
                  backgroundColor: ["#3498db", "#2ecc71", "#e74c3c"],
                },
              ],
            }}
            title="Temperature Distribution"
          />
        </div>
      </div>

      {/* Modal muncul kalau ada modalType */}
      {modalType && (
        <ThresholdModal
          type={modalType}
          thresholds={modalType === "Heart Rate" ? hrThresholds : tempThresholds}
          onSave={(newVal) =>
            modalType === "Heart Rate"
              ? setHrThresholds(newVal)
              : setTempThresholds(newVal)
          }
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
