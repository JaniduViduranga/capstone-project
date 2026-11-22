import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminDataProvider } from '../context/AdminDataContext';
import AdminSidebar, { adminNavItems } from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import '../styles/admin.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const currentItem = adminNavItems.find((item) => location.pathname.startsWith(item.path));
  const title = currentItem ? currentItem.label : location.pathname.includes('profile') ? 'My Profile' : 'Admin Dashboard';

  return (
    <AdminDataProvider>
      <div className="admin-theme" style={{ minHeight: '100vh', width: '100%' }}>
        <div className="shell">
          <AdminSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
          <div className={`workspace ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <AdminTopbar
              title={title}
              onOpenSidebar={() => setSidebarOpen(true)}
            />
            <main className="content">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </AdminDataProvider>
  );
}

