import React, { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { dbRT, dbFS} from "../firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../styles/EmployeeList.scss";
import EditEmployeeModal from "../components/EditEmployeeModal";

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [editEmployee, setEditEmployee] = useState(null);

  useEffect(() => {
    const usersRef = ref(dbRT, "users");
    const unsubscribe = onValue(usersRef, async (snapshot) => {
      const data = snapshot.val() || {};
      const employeeArr = await Promise.all(
        Object.entries(data).map(async ([uid, val]) => {
          // cek Firestore apakah ada Name/NIK
          const fsDoc = await getDoc(doc(dbFS, "employees", uid));
          const extra = fsDoc.exists() ? fsDoc.data() : { name: "", nik: "" };

          return {
            uid,
            email: `${uid}@device.com`, // sementara unique email
            heartRate: val.humidity, // map humidity → HR
            temperature: val.temperature,
            timestamp: val.timestamp,
            ...extra,
          };
        })
      );
      setEmployees(employeeArr);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (uid) => {
    if (window.confirm("Are you sure you want to delete this employee and all history?")) {
      await deleteDoc(doc(dbFS, "employees", uid));
      await remove(ref(dbRT, `users/${uid}`));
      // optional: hapus auth user kalau ada
    }
  };

  return (
    <div className="employee-list-page">
      <h2>Employee List</h2>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>NIK</th>
            <th>Heart Rate</th>
            <th>Temperature</th>
            <th>Device Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, idx) => (
            <tr key={emp.uid}>
              <td>{idx + 1}</td>
              <td>{emp.name || "-"}</td>
              <td>{emp.nik || "-"}</td>
              <td>{emp.heartRate}</td>
              <td>{emp.temperature}</td>
              <td>{emp.email}</td>
              <td>
                <button onClick={() => setEditEmployee(emp)}>
                  <FaEdit/>
                </button>
                <button onClick={() => handleDelete(emp.uid)}>
                  <FaTrash/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editEmployee && (
        <EditEmployeeModal employee={editEmployee} onClose={() => setEditEmployee(null)} />
      )}
    </div>
  );
};

export default EmployeeListPage;
