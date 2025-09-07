import React, { useState } from 'react';
import '../styles/Dashboard.scss';

const AdminMenu = ({ adminName, onLogout }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-menu">
      <span className="admin-name" onClick={() => setOpen(!open)}>
        {adminName} ▼
      </span>
      {open && (
        <div className="logout-popup">
          <button onClick={onLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
