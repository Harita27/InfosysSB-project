import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h2 className="navbar-brand">🏥 Medical Dashboard</h2>
        <div className="navbar-menu">
          <span className="navbar-user">
            {user?.firstName} {user?.lastName}
            <span className="navbar-role">{user?.role}</span>
          </span>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
