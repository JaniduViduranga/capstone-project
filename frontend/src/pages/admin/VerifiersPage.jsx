import React, { useState } from 'react';
import { UserRoundCog, Plus, Minus, Edit3, Trash2, Shield } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { PageHeader, Panel } from '../../components/admin/AdminComponents';

export default function VerifiersPage() {
  const API = `http://${window.location.hostname}:5000/api`;
  const { verifiers, fetchData } = useAdminData();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', employeeId: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/verifiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create verifier');
        return;
      }
      setSuccessMsg(`Verifier "${form.name}" created! Login email: ${form.email}`);
      setForm({ name: '', email: '', password: '', department: '', employeeId: '' });
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch {
      setFormError('Network error. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/verifiers/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to update verifier');
        return;
      }
      setSuccessMsg(`Verifier "${form.name}" updated successfully!`);
      setForm({ name: '', email: '', password: '', department: '', employeeId: '' });
      setEditingId(null);
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch {
      setFormError('Network error. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this verifier account? They will no longer be able to log in.')) return;
    setDeleteId(id);
    try {
      const res = await fetch(`${API}/admin/verifiers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        setSuccessMsg('Verifier account deleted.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch {
      /* silent */
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <PageHeader title="Verifier Management" subtitle="Create and manage verifier accounts" />

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', color: '#166534', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {successMsg}
        </div>
      )}

      <Panel
        title="Verifier Accounts"
        subtitle={`${verifiers.length} verifier${verifiers.length !== 1 ? 's' : ''} registered`}
        icon={UserRoundCog}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            type="button"
            className={showForm ? 'ghost-btn' : 'primary-btn'}
            onClick={() => {
              setShowForm(!showForm);
              setFormError('');
              setEditingId(null);
              setForm({ name: '', email: '', password: '', department: '', employeeId: '' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              ...(showForm ? { background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' } : {})
            }}
          >
            {showForm ? <Minus size={16} /> : <Plus size={16} />} {showForm ? 'Cancel' : 'Add Verifier'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={editingId ? handleEditSubmit : handleAdd} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                {editingId ? 'Edit Verifier Account' : 'New Verifier Account'}
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                These credentials will be used to log into the Verifier Dashboard.
              </p>
            </div>
            {formError && (
              <div style={{ gridColumn: '1 / -1', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.6rem 0.9rem', color: '#dc2626', fontSize: '0.82rem' }}>
                {formError}
              </div>
            )}
            {[
              { label: 'Full Name *', key: 'name', placeholder: 'e.g. John Smith', type: 'text' },
              { label: 'Email Address *', key: 'email', placeholder: 'john.smith@ms.sab.ac.lk', type: 'email' },
              { label: editingId ? 'Password' : 'Password *', key: 'password', placeholder: editingId ? 'Leave blank to keep unchanged' : 'Min. 8 characters', type: 'password' },
              { label: 'Employee ID', key: 'employeeId', placeholder: 'e.g. VER-003', type: 'text' },
              { label: 'Department', key: 'department', placeholder: 'e.g. Student Affairs', type: 'text' }
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{label}</label>
                <input
                  type={type}
                  required={label.endsWith('*')}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button type="button" className="ghost-btn" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? (editingId ? 'Updatingâ€¦' : 'Creatingâ€¦') : (editingId ? 'Update Verifier' : 'Create Verifier Account')}
              </button>
            </div>
          </form>
        )}

        {verifiers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            No verifier accounts yet. Click "Add Verifier" to create one.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifiers.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.name || 'â€”'}</td>
                    <td>{v.email}</td>
                    <td>{v.employeeId || 'â€”'}</td>
                    <td>{v.department || 'â€”'}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {v.lastLogin ? new Date(v.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(v.id);
                          setForm({ name: v.name || '', email: v.email || '', password: '', department: v.department || '', employeeId: v.employeeId || '' });
                          setShowForm(true);
                          setFormError('');
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, marginRight: '0.5rem' }}
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id)}
                        disabled={deleteId === v.id}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <Trash2 size={13} /> {deleteId === v.id ? 'Deletingâ€¦' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Login Instructions" subtitle="Share these details with your verifiers" icon={Shield}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dashboard URL</p>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.875rem', color: '#1e293b', fontWeight: 600 }}>{window.location.origin}/login</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>Select "Verifier Portal" on the unified login screen</p>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credentials</p>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.875rem', color: '#1e293b' }}>Email + Password set when creating their account</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>Passwords are hashed and securely verified</p>
          </div>
        </div>
      </Panel>
    </>
  );
}

