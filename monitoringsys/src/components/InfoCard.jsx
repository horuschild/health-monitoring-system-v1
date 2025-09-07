import React from 'react';
import '../styles/InfoCard.scss';

const InfoCard = ({ name, nik, heartRate, temperature, onClick }) => {
  const isAlert = heartRate > 120 || temperature > 37;

  return (
    <div className="info-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className={`info-header ${isAlert ? 'alert' : ''}`}>
        <span className="info-name">{name}</span>
        <span className="info-nik">{nik}</span>
      </div>
      <div className="info-stats">
        <span className="heart-rate">{heartRate} BPM</span>
        <span className="temperature">{temperature}°C</span>
      </div>
    </div>
  );
};

export default InfoCard;
