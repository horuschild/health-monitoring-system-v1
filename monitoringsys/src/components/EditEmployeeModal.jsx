import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { dbFS } from "../firebase";
import { toast } from "react-toastify";

const EditEmployeeModal = ({ employee, onClose }) => {
  const [name, setName] = useState(employee.name || "");
  const [nik, setNik] = useState(employee.nik || "");

  const handleSave = async () => {
    try {
      await setDoc(
        doc(dbFS, "users", employee.uid),
        {
          name,
          nik,
        },
        { merge: true }
      );
      toast.success("Employee data saved successfully!");
      onClose();
    } catch (err) {
      console.error("Error saving employee:", err);
      toast.error("Failed to save employee data.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Employee</h3>
        <label>
          Name:
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter employee name"
          />
        </label>
        <label>
          NIK:
          <input
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            placeholder="Enter employee NIK"
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

export default EditEmployeeModal;