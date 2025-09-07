import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { dbFS } from "../firebase";
import ChartWidget from "../components/ChartWidget";
import "../styles/EmployeeDetail.scss";

const EmployeeDetailPage = ({ employee, onClose }) => {
  const [historyData, setHistoryData] = useState([]);
  const [filter, setFilter] = useState("1d"); // default 1 hari

  // 🔹 Ambil data history dari Firestore
  useEffect(() => {
    const fetchHistory = async () => {
      if (!employee?.uid) return;

      const historyRef = collection(dbFS, "users", employee.uid, "history");
      const q = query(historyRef, orderBy("__name__")); // __name__ = timestamp key

      const snap = await getDocs(q);
      const allData = [];
      snap.forEach((doc) => {
        const timestamp = parseInt(doc.id, 10); // id = timestamp
        const { temperature, humidity } = doc.data();
        allData.push({
          timestamp,
          temperature,
          heartRate: humidity, // asumsinya humidity = HR
        });
      });

      setHistoryData(allData);
    };

    fetchHistory();
  }, [employee]);

  // 🔹 Filter berdasarkan waktu
  const now = Date.now();
  const filteredData = historyData.filter((d) => {
    if (filter === "1d") return d.timestamp >= now - 24 * 60 * 60 * 1000;
    if (filter === "7d") return d.timestamp >= now - 7 * 24 * 60 * 60 * 1000;
    if (filter === "1m") return d.timestamp >= now - 30 * 24 * 60 * 60 * 1000;
    return true; // all
  });

  // 🔹 Format chart
  const lineChartData = {
    labels: filteredData.map((d) =>
      new Date(d.timestamp).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      })
    ),
    datasets: [
      {
        label: "Heart Rate",
        data: filteredData.map((d) => d.heartRate),
        borderColor: "#e74c3c",
        backgroundColor: "rgba(231, 76, 60, 0.2)",
      },
      {
        label: "Temperature",
        data: filteredData.map((d) => d.temperature),
        borderColor: "#3498db",
        backgroundColor: "rgba(52, 152, 219, 0.2)",
      },
    ],
  };

  return (
    <div className="employee-detail-page">
      <div className="detail-header">
        <h2>
          {employee.name} ({employee.nik})
        </h2>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      {/* 🔹 Filter buttons */}
      <div className="filter-buttons">
        <button onClick={() => setFilter("1d")}>1 Hari</button>
        <button onClick={() => setFilter("7d")}>7 Hari</button>
        <button onClick={() => setFilter("1m")}>1 Bulan</button>
        <button onClick={() => setFilter("all")}>All Time</button>
      </div>

      {/* 🔹 Chart tetap di atas (tidak scrollable) */}
      <div className="chart-container">
        <ChartWidget
          type="line"
          data={lineChartData}
          title="History Heart Rate & Temperature"
        />
      </div>

      {/* 🔹 Tabel scrollable */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Heart Rate (BPM)</th>
              <th>Temperature (°C)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d, idx) => (
              <tr key={idx}>
                <td>{new Date(d.timestamp).toLocaleString("id-ID")}</td>
                <td>{d.heartRate}</td>
                <td>{d.temperature}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
