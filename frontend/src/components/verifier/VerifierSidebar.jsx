import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Clock, History, Bell, MessageSquare, LogOut, Menu } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import { useAuth } from '../../context/AuthContext';

export default function VerifierSidebar({ currentProfile, isCollapsed, toggleCollapse }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'pending', name: 'Pending Queue', icon: Clock, path: '/verifier/queue' },
    { id: 'history', name: 'My History', icon: History, path: '/verifier/history' },
    { id: 'alerts', name: 'System Alerts', icon: Bell, path: '/verifier/alerts' },
    { id: 'feedback', name: 'Feedback', icon: MessageSquare, path: '/verifier/feedback' },
  ];

  const profile = currentProfile || { name: 'Verifier', email: 'verifier@ms.sab.ac.lk' };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div>
        <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          {!isCollapsed && (
            <>
              <div style={{ width: 48, height: 48, overflow: 'hidden', background: 'white', borderRadius: '50%', flexShrink: 0 }}>
                <img src={logoImg} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h1 className="sidebar-title" style={{ flexGrow: 1, fontSize: '15px', lineHeight: '1.3', margin: 0 }}>
                Verifier<br />Dashboard
              </h1>
            </>
          )}
          <button
            type="button"
            onClick={toggleCollapse}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <IconComponent size={20} style={{ minWidth: '20px' }} />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: isCollapsed ? '16px 8px' : '16px' }}>
        <div
          className="profile-trigger-card"
          onClick={() => navigate('/verifier/profile')}
          title="View your profile"
          style={{ width: '100%', margin: 0, justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px 0' : '12px', cursor: 'pointer' }}
        >
          <div className="avatar-badge-circle" style={{ overflow: 'hidden', padding: 0 }}>
            <img
              src={profile.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Verifier')}&background=800000&color=fff&size=128`}
              alt={profile.name || 'Verifier'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {!isCollapsed && (
            <div className="profile-trigger-info">
              <span className="profile-trigger-name">{profile.name || 'Verifier'}</span>
              <span className="profile-trigger-sub">View Profile</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          title="Log out"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px 0',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: '600',
            fontSize: '13px'
          }}
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
