import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconWave, IconLock, IconFileText, IconLogOut } from './Icons';

export default function Header({ showAdmin = true, isAdmin = false }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    navigate('/admin');
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-icon">
            <IconWave size={26} />
          </div>
          <div>
            <h1 className="header-title">Flood Incident Reporting</h1>
            <p className="header-subtitle">
              Help us monitor and respond to urban flooding in real-time
            </p>
          </div>
        </div>
        <nav className="header-nav">
          {isAdmin ? (
            <>
              <Link to="/" className="nav-link">
                <IconFileText size={16} />
                Report Page
              </Link>
              <button onClick={handleLogout} className="nav-btn-danger">
                <IconLogOut size={16} />
                Logout
              </button>
            </>
          ) : showAdmin ? (
            <Link to="/admin" className="nav-link">
              <IconLock size={16} />
              Admin
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
