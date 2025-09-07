import React, { useState } from "react";

const ThresholdModal = ({ type, thresholds, onSave, onClose }) => {
  const [low, setLow] = useState(thresholds.low);
  const [high, setHigh] = useState(thresholds.high);

  const handleSave = () => {
    onSave({ low, high });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit {type} Threshold</h3>
        <label>
          Low (max):
          <input
            type="number"
            value={low}
            onChange={(e) => setLow(parseFloat(e.target.value))}
          />
        </label>
        <label>
          High (min):
          <input
            type="number"
            value={high}
            onChange={(e) => setHigh(parseFloat(e.target.value))}
          />
        </label>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ThresholdModal;
