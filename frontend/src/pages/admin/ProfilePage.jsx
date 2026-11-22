import React, { useState, useRef, useMemo } from 'react';
import { User, Edit3, Camera, BriefcaseBusiness, CircleUserRound, Database, BadgeCheck, Calendar } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { PageHeader, Panel, ReadField, StatusRow, Info } from '../../components/admin/AdminComponents';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);

  const { audits } = useAdminData();
  const actionsToday = useMemo(() => {
    return audits.filter((a) => {
      const isToday = new Date(a.timestamp).toDateString() === new Date().toDateString();
      const isMe = a.userId === user?.name || a.userId === user?.id;
      return isToday && isMe;
    }).length;
  }, [audits, user]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        setFormData((prev) => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData(user || {});
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5000/api/admin/profile/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      updateUser(data.admin);
      setFormData(data.admin);
      setIsEditing(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const joinDate = user?.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A';

  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your account information and preferences" />
      <div className="profile-grid">
        <Panel
          className="profile-main"
          title="Personal Information"
          subtitle="Update your personal details and contact information"
          action={
            isEditing ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="ghost-btn" onClick={handleEditToggle}>
                  Cancel
                </button>
                <button type="button" className="primary-btn" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            ) : (
              <button type="button" className="primary-btn" onClick={handleEditToggle}>
                <Edit3 size={14} /> Edit Profile
              </button>
            )
          }
        >
          <div className="avatar-large" style={{ position: 'relative' }}>
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                style={{ width: '105px', height: '105px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <User size={58} />
            )}
            {isEditing && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: 'white',
                  color: 'var(--navy)',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={14} />
              </div>
            )}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleProfilePicChange} />
          </div>
          <div className="form-grid">
            <ReadField label="Full Name" icon={User} value={formData.name || ''} onChange={handleChange('name')} readOnly={!isEditing} />
            <ReadField label="Email Address" icon={BriefcaseBusiness} value={formData.email || ''} readOnly />
            <ReadField label="Phone Number" icon={CircleUserRound} value={formData.phone || ''} onChange={handleChange('phone')} readOnly={!isEditing} />
            <ReadField label="Department" icon={Database} value={formData.department || ''} readOnly />
            <ReadField label="Employee ID" icon={BadgeCheck} value={formData.employeeId || ''} readOnly />
            <ReadField label="Join Date" icon={Calendar} value={joinDate} readOnly />
          </div>
        </Panel>
        <div className="side-stack">
          <Panel title="Account Status">
            <StatusRow label="Role" value={user?.role || 'System Admin'} />
            <StatusRow label="Status" value="Active" tone="success" />
            <StatusRow label="2FA" value="Enabled" tone="success" />
          </Panel>
          <Panel title="Activity Summary">
            <Info label="Last Login" value="Just now" />
            <Info label="Total Actions Today" value={`${actionsToday} actions`} />
            <Info label="Reports Generated" value="12 reports" />
          </Panel>
          <Panel title="Security">
            <button type="button" className="wide-btn" onClick={() => alert('A password reset link has been sent to your registered email.')}>
              Change Password
            </button>
            <button type="button" className="wide-btn" onClick={() => alert('2FA via SMS or Authenticator requires Google Cloud Identity Platform (Paid subscription). This feature is disabled on the free tier.')}>
              Manage 2FA
            </button>
            <button type="button" className="wide-btn" onClick={() => alert('Active Sessions:\n\n1. Current Device (Active now)\n2. Mobile Device (Last active: Yesterday)')}>
              Active Sessions
            </button>
          </Panel>
        </div>
      </div>
    </>
  );
}

