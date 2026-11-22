import React, { useState, useMemo } from 'react';
import { Users, Plus, Search, X } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { PageHeader, MetricCard, Panel, Badge, ReadField } from '../../components/admin/AdminComponents';

export default function UsersPage() {
  const { users, setUsers } = useAdminData();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifying, setVerifying] = useState(false);

  const students = useMemo(() => {
    return users.map((s) => {
      let verifStatus = s.verificationStatus;
      if (!verifStatus) {
        verifStatus = s.isVerified ? 'Verified' : 'Pending';
      }
      return {
        id: s.id,
        name: s.name || 'N/A',
        nic: s.nic || 'N/A',
        email: s.email || 'N/A',
        date: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : 'N/A',
        status: s.isVerified ? 'Active' : 'Pending',
        verification: verifStatus,
        original: s
      };
    });
  }, [users]);

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.nic.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const total = students.length;
  const verified = students.filter((s) => s.verification === 'Verified').length;
  const pending = total - verified;

  const handleAddStudent = () => {
    alert('For security reasons, students must register themselves via the Student Portal to undergo automated Identity Verification.');
  };

  const handleStatusChange = async (studentId, newStatus) => {
    setVerifying(true);
    try {
      const isVerified = newStatus === 'Verified';
      const res = await fetch(`http://${window.location.hostname}:5000/api/admin/students/${studentId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update verification status');

      setUsers((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, isVerified, verificationStatus: newStatus } : s
        )
      );
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent((prev) => ({
          ...prev,
          status: isVerified ? 'Active' : 'Pending',
          verification: newStatus
        }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteUser = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to permanently delete student '${studentName}'? This action cannot be undone and will clear all their enrollments and data.`)) {
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/admin/students/${studentId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete student');
      }

      alert('Student deleted successfully.');
      setUsers((prev) => prev.filter((s) => s.id !== studentId));
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent(null);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage student accounts and verification status"
        action={
          <button type="button" className="primary-btn" onClick={handleAddStudent}>
            <Plus size={15} /> Add New Student
          </button>
        }
      />
      <div className="stats-row">
        <MetricCard icon={Users} label="Total Students" value={total.toString()} />
        <MetricCard label="Verified" value={verified.toString()} tone="success" />
        <MetricCard label="Pending Verification" value={pending.toString()} tone="warning" />
      </div>
      <Panel
        title="Student Directory"
        subtitle="Search and manage student records"
        action={
          <div className="table-search">
            <Search size={14} />
            <input
              placeholder="Search by name, NIC, or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        }
      >
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>NIC</th>
              <th>Email</th>
              <th>Enrolled Date</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  {students.length === 0 ? 'No students registered yet.' : 'No students match your search.'}
                </td>
              </tr>
            ) : (
              filteredStudents.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.nic}</td>
                  <td>{row.email}</td>
                  <td>{row.date}</td>
                  <td>
                    <Badge tone={row.status === 'Pending' ? 'neutral' : 'success'}>{row.status}</Badge>
                  </td>
                  <td>
                    <select
                      value={row.verification}
                      onChange={(e) => handleStatusChange(row.id, e.target.value)}
                      disabled={verifying}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        background: row.verification === 'Verified' ? '#ecfdf5' : row.verification === 'Rejected' ? '#fef2f2' : '#f8fafc',
                        color: row.verification === 'Verified' ? '#16a34a' : row.verification === 'Rejected' ? '#dc2626' : '#64748b',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Verified">Verified</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="small-btn" onClick={() => setSelectedStudent(row)}>
                        View Details
                      </button>
                      <button
                        type="button"
                        className="small-btn"
                        style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
                        onClick={() => handleDeleteUser(row.id, row.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>

      {selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card)', borderRadius: '1rem', padding: '2rem', width: '500px', maxWidth: '95vw', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Student Details</h2>
              <button type="button" onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="form-grid">
              <ReadField label="Full Name" value={selectedStudent.name} />
              <ReadField label="NIC Number" value={selectedStudent.nic} />
              <ReadField label="Email Address" value={selectedStudent.email} />
              <ReadField label="Registration Date" value={selectedStudent.date} />
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <select
                  value={selectedStudent.verification}
                  onChange={(e) => handleStatusChange(selectedStudent.id, e.target.value)}
                  disabled={verifying}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="Verified">Set as Verified</option>
                  <option value="Pending">Set as Pending</option>
                  <option value="Rejected">Set as Rejected</option>
                </select>
              </div>
              <button type="button" className="ghost-btn" onClick={() => setSelectedStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

