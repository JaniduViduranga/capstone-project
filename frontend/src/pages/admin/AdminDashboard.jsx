import React, { useState } from 'react';
import { Users, Wallet, Gauge, Download, FileText, ChevronDown, X, AlertTriangle } from 'lucide-react';
import { useAdminData, exportAuditPDF } from '../../context/AdminDataContext';
import { PageHeader, MetricCard, Panel, AuditTable, MiniLine, Badge } from '../../components/admin/AdminComponents';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { users, verifications, verifiers, setVerifiers, audits } = useAdminData();

  const [managingRole, setManagingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  const totalUsers = users.length;
  const pendingUsers = users.filter((u) => u.isVerified === false).length;
  const pendingRequests = verifications.filter((v) => v.status === 'Pending').length;
  const inProgressRequests = verifications.filter((v) => v.status === 'Approved').length;
  const successfulActionsToday = audits.filter((a) => {
    const isToday = new Date(a.timestamp).toDateString() === new Date().toDateString();
    const isSuccess = !a.event?.toLowerCase().includes('reject') && !a.event?.toLowerCase().includes('fail');
    return isToday && isSuccess;
  }).length;

  const usersMap = {
    ...Object.fromEntries(users.map((u) => [u.id, u.name])),
    ...Object.fromEntries(verifiers.map((v) => [v.id, v.name]))
  };

  const handleUpdateRole = async () => {
    if (!managingRole) return;
    setSavingRole(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/admin/verifiers/${managingRole.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      });
      if (!res.ok) throw new Error('Failed to update role');
      setVerifiers((prev) => prev.map((v) => (v.id === managingRole.id ? { ...v, role: selectedRole } : v)));
      setManagingRole(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <>
      <PageHeader title="Dashboard Overview" subtitle="System vitals and pending verification actions" />
      <div className="dashboard-grid">
        <MetricCard label="Total Enrolled Students" value={totalUsers.toString()} icon={Users} detail="Live database feed">
          <MiniLine />
        </MetricCard>
        <MetricCard
          label="Polygon Gas Balance (MATIC)"
          value="12.47"
          icon={Wallet}
          tone="danger"
          detail="Daily Consumption: ~2.3 MATIC  Est. Days Remaining: 5 days"
        >
          <div className="alert-box">
            <AlertTriangle size={14} /> Low Balance Alert: Gas balance is below threshold. Please top up to ensure continuous blockchain operations.
          </div>
        </MetricCard>
        <MetricCard label="Avg. AI Face Match Time" value="1.24s" icon={Gauge} detail={`Total Verifications: ${verifications.length}`}>
          <div className="target-row">
            <span>Performance Target:</span>
            <strong>&lt; 2.0s</strong>
          </div>
          <div className="progress">
            <span style={{ width: '86%' }} />
          </div>
        </MetricCard>
      </div>

      <h2 className="section-title">Pending verification requests</h2>
      <div className="mini-metrics">
        <MetricCard label="Pending Verifications" value={pendingRequests.toString()} />
        <MetricCard label="Approved Verifications" value={inProgressRequests.toString()} />
        <MetricCard label="Pending Students" value={pendingUsers.toString()} />
        <MetricCard label="Completed Today" value={successfulActionsToday.toString()} />
      </div>

      <Panel
        title="Audit Logs"
        subtitle="Group 14 Requirement: Detailed system activity tracking"
        action={
          <button type="button" className="ghost-btn" onClick={() => exportAuditPDF(audits, usersMap)}>
            <Download size={14} /> Export Logs
          </button>
        }
      >
        <AuditTable compact customRows={audits} usersMap={usersMap} />
      </Panel>

      <Panel title="Role Management" subtitle="Manage staff access and verifier permissions">
        <table>
          <thead>
            <tr>
              <th>Verifier ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Current Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {verifiers.map((v) => (
              <tr key={v.id}>
                <td>{v.id.substring(0, 8)}</td>
                <td>{v.name}</td>
                <td>{v.email}</td>
                <td>{v.department || 'N/A'}</td>
                <td>
                  <Badge tone={v.role === 'Admin' ? 'danger' : 'success'}>{v.role || 'verifier'}</Badge>
                </td>
                <td>
                  <button
                    type="button"
                    className="small-btn"
                    onClick={() => {
                      setManagingRole(v);
                      setSelectedRole(v.role || 'verifier');
                    }}
                  >
                    Manage Role <ChevronDown size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="center-action">
        <button type="button" className="primary-btn">
          <FileText size={15} /> Generate System Report for {user?.name || 'Admin'}
        </button>
      </div>

      {managingRole && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card)', borderRadius: '1rem', padding: '2rem', width: '400px', maxWidth: '95vw', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Manage Role</h2>
              <button type="button" onClick={() => setManagingRole(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              Assign a new role to <strong>{managingRole.name}</strong>.
            </p>
            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '7px', border: '1px solid var(--line)', background: '#fff', color: '#334155', fontSize: '14px', marginBottom: '1.5rem' }}
              >
                <option value="verifier">Verifier (Standard)</option>
                <option value="Admin">Admin (Full Access)</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="ghost-btn" onClick={() => setManagingRole(null)}>Cancel</button>
              <button type="button" className="primary-btn" onClick={handleUpdateRole} disabled={savingRole}>
                {savingRole ? 'Saving...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

