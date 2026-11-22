import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleUserRound, ChevronDown, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminTopbar({ title, onOpenSidebar }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminName = user?.name || 'System Admin';
  const adminRole = user?.role === 'admin' ? 'Administrator' : (user?.role || 'System Admin');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu" onClick={onOpenSidebar} aria-label="Open navigation">
        <Menu size={20} />
      </button>

      <div style={{ flex: 1, paddingLeft: '1rem' }}>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>{title}</span>
      </div>

      <div className="account">
        <button className="account-button" type="button" onClick={() => setMenuOpen(!menuOpen)}>
          <CircleUserRound size={22} />
          <span>
            <strong>{adminName}</strong>
            <small>{adminRole}</small>
          </span>
          <ChevronDown size={15} />
        </button>
        {menuOpen && (
          <div className="account-menu">
            <strong>My Account</strong>
            <button
              type="button"
              onClick={() => {
                navigate('/admin/profile');
                setMenuOpen(false);
              }}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => {
                navigate('/admin/settings');
                setMenuOpen(false);
              }}
            >
              Settings
            </button>
            <button className="logout" type="button" onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
