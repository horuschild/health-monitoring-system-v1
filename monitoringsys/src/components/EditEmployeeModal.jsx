import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { dbFS } from "../firebase";

const EditEmployeeModal = ({ employee, onClose }) => {
  const [name, setName] = useState(employee.name || "");
  const [nik, setNik] = useState(employee.nik || "");

  const handleSave = async () => {
    await setDoc(doc(dbFS, "employees", employee.uid), {
      name,
      nik,
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Employee</h3>
        <label>
          Name:
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          NIK:
          <input value={nik} onChange={(e) => setNik(e.target.value)} />
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
