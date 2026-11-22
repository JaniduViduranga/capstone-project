import React, { useState } from 'react';
import { BookOpen, Users, Plus, Search, Edit3, Trash2, X } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { PageHeader, MetricCard, Panel, Badge, ReadField } from '../../components/admin/AdminComponents';

export default function ExamManagementPage() {
  const { exams, fetchData } = useAdminData();
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const emptyForm = {
    courseCode: '',
    courseName: '',
    description: '',
    date: '',
    time: '',
    duration: 1,
    proctoring: 'Online Proctored',
    capacity: 50,
    status: 'Open'
  };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditExam(null);
    setForm(emptyForm);
    setShowModal(true);
  };
  const openEdit = (exam) => {
    setEditExam(exam);
    setForm({ ...exam });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditExam(null);
    setForm(emptyForm);
  };

  const handleFormChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.courseCode || !form.courseName || !form.date || !form.time) {
      alert('Course Code, Name, Date, and Time are required.');
      return;
    }
    setSaving(true);
    try {
      const url = editExam
        ? `http://${window.location.hostname}:5000/api/exam/${editExam.id}`
        : `http://${window.location.hostname}:5000/api/exam`;
      const method = editExam ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save exam');
      closeModal();
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/exam/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete exam');
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const openCount = exams.filter((e) => e.status === 'Open').length;
  const fullCount = exams.filter((e) => e.status === 'Full').length;
  const totalEnrolled = exams.reduce((sum, e) => sum + (parseInt(e.enrolled) || 0), 0);

  return (
    <>
      <PageHeader
        title="Exam Management"
        subtitle="Create, edit and manage all exam subjects for the student portal"
        action={
          <button type="button" className="primary-btn" onClick={openCreate}>
            <Plus size={15} /> Create New Exam
          </button>
        }
      />
      <div className="stats-row four">
        <MetricCard icon={BookOpen} label="Total Exams" value={exams.length.toString()} detail="Live from database" />
        <MetricCard label="Open Exams" value={openCount.toString()} tone="success" detail="Accepting enrollments" />
        <MetricCard label="Full Exams" value={fullCount.toString()} tone="danger" detail="No seats available" />
        <MetricCard icon={Users} label="Total Enrollments" value={totalEnrolled.toString()} detail="Across all exams" />
      </div>
      <Panel
        title="All Exams"
        subtitle="Manage exam schedules and availability"
        action={
          <div className="table-search">
            <Search size={14} />
            <input placeholder="Search exams..." />
          </div>
        }
      >
        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Capacity</th>
              <th>Enrolled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                  No exams yet. Click "Create New Exam" to add one.
                </td>
              </tr>
            )}
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td>
                  <strong>{exam.courseCode}</strong>
                </td>
                <td>{exam.courseName}</td>
                <td>{exam.date}</td>
                <td>{exam.time}</td>
                <td>{exam.duration}h</td>
                <td>{exam.capacity}</td>
                <td>{exam.enrolled || 0}</td>
                <td>
                  <Badge tone={exam.status === 'Open' ? 'success' : exam.status === 'Full' ? 'danger' : 'neutral'}>
                    {exam.status}
                  </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="small-btn" onClick={() => openEdit(exam)}>
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className="small-btn"
                      style={{ color: '#ef4444' }}
                      onClick={() => handleDelete(exam.id)}
                      disabled={deleting === exam.id}
                    >
                      <Trash2 size={13} /> {deleting === exam.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card)', borderRadius: '1rem', padding: '2rem', width: '580px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{editExam ? 'Edit Exam' : 'Create New Exam'}</h2>
              <button type="button" onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="form-grid">
              <ReadField label="Course Code (e.g. MATH-401)" value={form.courseCode} onChange={handleFormChange('courseCode')} readOnly={false} />
              <ReadField label="Course Name" value={form.courseName} onChange={handleFormChange('courseName')} readOnly={false} />
              <ReadField label="Description" value={form.description} onChange={handleFormChange('description')} readOnly={false} />
              <ReadField label="Date (YYYY-MM-DD)" value={form.date} onChange={handleFormChange('date')} readOnly={false} />
              <ReadField label="Time (e.g. 10:00 AM)" value={form.time} onChange={handleFormChange('time')} readOnly={false} />
              <ReadField label="Duration (hours)" value={form.duration} onChange={handleFormChange('duration')} readOnly={false} />
              <ReadField label="Capacity (seats)" value={form.capacity} onChange={handleFormChange('capacity')} readOnly={false} />
              <ReadField label="Proctoring Type" value={form.proctoring} onChange={handleFormChange('proctoring')} readOnly={false} />
              <div>
                <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Status</label>
                <select
                  value={form.status}
                  onChange={handleFormChange('status')}
                  style={{ width: '100%', height: '38px', padding: '0 12px', background: '#fff', border: '1px solid var(--line)', borderRadius: '7px', color: '#334155', fontSize: '15px' }}
                >
                  <option value="Open">Open</option>
                  <option value="Full">Full</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="ghost-btn" onClick={closeModal}>Cancel</button>
              <button type="button" className="primary-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editExam ? 'Save Changes' : 'Create Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

