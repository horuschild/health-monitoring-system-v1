import React from 'react';
import ChartWidget from '../components/ChartWidget';
import '../styles/EmployeeDetail.scss';

const EmployeeDetailPage = ({ employee, historyData, onClose }) => {

  const lineChartData = {
    labels: historyData.map((d) => d.time),
    datasets: [
      {
        label: 'Heart Rate',
        data: historyData.map((d) => d.heartRate),
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
      },
      {
        label: 'Temperature',
        data: historyData.map((d) => d.temperature),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
      },
    ],
  };

  return (
    <div className="employee-detail-page">
      <div className="detail-header">
        <h2>{employee.name} ({employee.nik})</h2>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      {/* Chart horizontal */}
      <div className="chart-container">
        <ChartWidget type="line" data={lineChartData} title="History Heart Rate & Temperature" />
      </div>

      {/* Tabel history */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Heart Rate (BPM)</th>
              <th>Temperature (°C)</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((d, idx) => (
              <tr key={idx}>
                <td>{d.time}</td>
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
