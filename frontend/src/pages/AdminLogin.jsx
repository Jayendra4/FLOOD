import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { IconLock } from '../components/Icons';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('admin_logged_in', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showAdmin={false} />
      <div className="container">
        <div className="login-container fade-in">
          <div className="login-header">
            <div className="login-icon">
              <IconLock size={28} />
            </div>
            <h2>Admin Login</h2>
            <p className="subtitle">Secure access to flood reports</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            <div className="form-group login-form-spacer">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
