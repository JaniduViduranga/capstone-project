import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import VerifierSidebar from '../components/verifier/VerifierSidebar';
import VerifierFooter from '../components/verifier/VerifierFooter';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import '../styles/verifier.css';

const API = `http://${window.location.hostname}:5000/api/verifier`;

function authHeaders() {
  const token = localStorage.getItem('verifierToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export default function VerifierLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState([]);
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [pendingList, setPendingList] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState({
    totalVerified: 0,
    approvedToday: 0,
    rejectedToday: 0,
    accuracyRate: 100
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'high-volume',
      headline: 'System Connected',
      message: 'Verifier dashboard is successfully connected to the live backend database.',
      date: new Date().toLocaleString()
    },
    {
      id: 2,
      type: 'maintenance',
      headline: 'Image Review Reminder',
      message: 'Always verify both the ID document and live selfie match before approving.',
      date: ''
    }
  ]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const fetchQueue = useCallback(async () => {
    setPendingLoading(true);
    try {
      const res = await fetch(`${API}/queue`, { headers: authHeaders() });
      if (res.status === 401) {
        handleSignOut();
        return;
      }
      const data = await res.json();
      setPendingList(data.queue || []);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API}/history`, { headers: authHeaders() });
      if (res.status === 401) {
        handleSignOut();
        return;
      }
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/stats`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      const total = data.total || 0;
      const rejections = data.rejected || 0;
      const accuracy = total > 0 ? Math.round(((total - rejections) / total) * 1000) / 10 : 100;

      setStats({
        totalVerified: total,
        approvedToday: data.approved || 0,
        rejectedToday: rejections,
        accuracyRate: accuracy
      });
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    fetchHistory();
    fetchStats();
  }, [fetchQueue, fetchHistory, fetchStats]);

  const handleVerifyStudent = async (studentId, decision, note) => {
    const student = pendingList.find((s) => s.id === studentId);
    if (!student) return;

    try {
      const res = await fetch(`${API}/queue/${student.id}/decide`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ decision, notes: note })
      });
      if (!res.ok) {
        const err = await res.json();
        addToast(`Error: ${err.error || 'Decision failed'}`, 'danger');
        return;
      }

      const responseData = await res.json();

      setPendingList((prev) => prev.filter((s) => s.id !== student.id));

      const now = new Date().toLocaleString();
      setHistory((prev) => [
        {
          ...student,
          decision,
          decidedAt: now,
          notes: note,
          blockchainTxHash: responseData.blockchainTxHash || null,
          polygonscanUrl: responseData.polygonscanUrl || null
        },
        ...prev
      ]);

      addToast(
        `${decision === 'Approved' ? 'Approved' : 'Rejected'}: ${student.name}'s identity credentials logged!`,
        decision === 'Approved' ? 'success' : 'danger'
      );

      fetchStats();
    } catch {
      addToast('Network error. Please try again.', 'danger');
    }
  };

  const handleDismissAlert = (id, headline) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    addToast(`Alert "${headline}" dismissed.`, 'info');
  };

  const handleProfileUpdate = (updates) => {
    updateUser(updates);
  };

  return (
    <div className="verifier-theme" style={{ minHeight: '100vh', width: '100%' }}>
      <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="toast-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>

        <VerifierSidebar
          currentProfile={user}
          isCollapsed={sidebarCollapsed}
          toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="main-content">
          <Outlet
            context={{
              pendingList,
              pendingLoading,
              fetchQueue,
              history,
              historyLoading,
              fetchHistory,
              stats,
              fetchStats,
              alerts,
              setAlerts,
              addToast,
              handleVerifyStudent,
              handleDismissAlert,
              handleProfileUpdate,
              currentProfile: user,
              handleSignOut
            }}
          />
        </main>

        <VerifierFooter />
      </div>
    </div>
  );
}
