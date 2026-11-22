import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Users,
  UserRoundCog,
  ClipboardList,
  BookOpen,
  Database,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

export const adminNavItems = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3, path: '/admin/dashboard' },
  { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
  { id: 'verifiers', label: 'Verifier Management', icon: UserRoundCog, path: '/admin/verifiers' },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList, path: '/admin/audit' },
  { id: 'exams', label: 'Exam Management', icon: BookOpen, path: '/admin/exams' },
  { id: 'blockchain', label: 'Blockchain Status', icon: Database, path: '/admin/blockchain' },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal, path: '/admin/settings' }
];

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed
}) {
  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div
          className="brand"
          style={{
            padding: sidebarCollapsed ? '0 10px' : '0 22px',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            position: 'relative'
          }}
        >
          {!sidebarCollapsed && (
            <>
              <div
                className="brand-icon"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden',
                  padding: 0,
                  backgroundColor: 'white'
                }}
              >
                <img src={logoImg} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <strong>Admin<br />Dashboard</strong>
            </>
          )}

          <button
            type="button"
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              position: sidebarCollapsed ? 'static' : 'absolute',
              right: sidebarCollapsed ? 'auto' : '15px',
              marginTop: sidebarCollapsed ? '15px' : '0',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '4px'
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav style={{ padding: sidebarCollapsed ? '6px 8px' : '6px 15px' }}>
          {adminNavItems.map(({ id, label, icon: Icon, path }) => (
            <NavLink
              to={path}
              key={id}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
              title={sidebarCollapsed ? label : undefined}
              style={{
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                padding: sidebarCollapsed ? '0' : '0 14px'
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
      {sidebarOpen && <button className="scrim" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}
