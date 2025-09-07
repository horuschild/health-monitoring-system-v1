import React from 'react';
import '../styles/SideBar.scss';
import { FaSignOutAlt } from 'react-icons/fa'; // icon logout dari react-icons

const SideBar = ({ active, setActive, onLogout }) => {
  const menuItems = ['Dashboard', 'Employee List', 'Admin List'];

  return (
    <div className="sidebar">
      <ul className="menu-items">
        {menuItems.map((item) => (
          <li
            key={item}
            className={active === item ? 'active' : ''}
            onClick={() => setActive(item)}
          >
            {item}
          </li>
        ))}
      </ul>

      {/* Menu Logout di paling bawah */}
      <div className="sidebar-bottom" onClick={onLogout}>
        <span>Admin</span>
        <FaSignOutAlt className="logout-icon" />
      </div>
    </div>
  );
};

export default SideBar;
