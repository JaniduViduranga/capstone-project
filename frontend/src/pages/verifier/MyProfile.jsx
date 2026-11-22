import React, { useRef, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Award, CheckCircle, Clock, Upload, Edit2, Check, X } from 'lucide-react';

const API = `http://${window.location.hostname}:5000/api/verifier`;

export default function MyProfile(props) {
  const context = useOutletContext() || {};
  const stats = props.stats || context.stats || { totalVerified: 0, approvedToday: 0, rejectedToday: 0, accuracyRate: 100 };
  const profile = props.profile || context.currentProfile || {};
  const onSignOut = props.onSignOut || context.handleSignOut || (() => {});
  const onProfileUpdate = props.onProfileUpdate || context.handleProfileUpdate || (() => {});

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    setEditedName(profile?.name || '');
  }, [profile?.name]);

  const handleNameSave = async () => {
    if (!editedName.trim() || editedName === profile.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      const token = localStorage.getItem('verifierToken');
      const res = await fetch(`${API}/profile/${profile.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editedName.trim() })
      });
      
      if (res.ok) {
        onProfileUpdate({ name: editedName.trim() });
        setIsEditingName(false);
      } else {
        alert('Failed to update name.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        const token = localStorage.getItem('verifierToken');
        
        const res = await fetch(`${API}/profile/${profile.key}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profilePicture: base64String })
        });
        
        if (res.ok) {
          onProfileUpdate({ profilePicture: base64String });
        } else {
          alert('Failed to upload profile picture.');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert('An error occurred while uploading.');
    }
  };
  return (
    <div className="profile-container">
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">My Profile</h2>
        <p className="page-subtitle">Verifier account information</p>
      </div>

      {/* Main Profile Info Card */}
      <div className="profile-card">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        <div 
          className="profile-avatar-large" 
          style={{ overflow: 'hidden', padding: 0, cursor: isUploading ? 'wait' : 'pointer', position: 'relative' }}
          onClick={() => !isUploading && fileInputRef.current.click()}
          title="Click to change profile picture"
        >
          <img 
            src={profile.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=800000&color=fff&size=128`} 
            alt={profile.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isUploading ? 0.5 : 1 }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', 
            display: 'flex', justifyContent: 'center', padding: '4px', opacity: isUploading ? 1 : 0.8
          }}>
            <Upload size={14} color="#fff" />
          </div>
        </div>
        <div className="profile-info">
          {isEditingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <input 
                type="text" 
                value={editedName} 
                onChange={(e) => setEditedName(e.target.value)}
                style={{ 
                  padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', 
                  fontSize: '24px', fontWeight: 'bold', color: '#0f172a', width: '250px' 
                }}
                autoFocus
              />
              <button 
                onClick={handleNameSave} 
                disabled={isSavingName}
                style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}
                title="Save Name"
              >
                <Check size={16} />
              </button>
              <button 
                onClick={() => { setIsEditingName(false); setEditedName(profile.name); }}
                disabled={isSavingName}
                style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 className="profile-name" style={{ margin: 0 }}>{profile.name}</h3>
              <button 
                onClick={() => setIsEditingName(true)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex' }}
                title="Edit Name"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
          <p className="profile-title">{profile.role}</p>
          <div className="profile-metadata">
            <div className="profile-meta-item">
              <Mail size={16} className="profile-meta-icon" />
              <span>{profile.email}</span>
            </div>
            <div className="profile-meta-item">
              <Shield size={16} className="profile-meta-icon" />
              <span>{profile.department}</span>
            </div>
            <div className="profile-meta-item">
              <Calendar size={16} className="profile-meta-icon" />
              <span>{profile.membershipDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Statistics Grid */}
      <div>
        <h4 className="section-title">Performance Statistics</h4>
        <div className="stats-grid">
          <div className="stat-card stat-verified">
            <span className="stat-value">{stats.totalVerified}</span>
            <span className="stat-label">Total Verified</span>
          </div>
          <div className="stat-card stat-approved">
            <span className="stat-value">{stats.approvedToday}</span>
            <span className="stat-label">Approved Today</span>
          </div>
          <div className="stat-card stat-rejected">
            <span className="stat-value">{stats.rejectedToday}</span>
            <span className="stat-label">Rejected Today</span>
          </div>
          <div className="stat-card stat-accuracy">
            <span className="stat-value">{stats.accuracyRate}%</span>
            <span className="stat-label">Accuracy Rate</span>
          </div>
        </div>
      </div>

      {/* Account Details & Achievements Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        <div>
          <h4 className="section-title">Account Details</h4>
          <div className="details-card">
            <div className="details-grid">
              <div className="detail-row">
                <span className="detail-label">Avg. Processing Time:</span>
                <span className="detail-value">{profile.avgProcessingTime}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Certification Level:</span>
                <span className="detail-value">{profile.certificationLevel}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Login:</span>
                <span className="detail-value">{profile.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="section-title">Achievements</h4>
          <div className="achievements-grid">
            <div className="achievement-card">
              <div className="achievement-icon-wrapper gold">
                <Award size={20} />
              </div>
              <div className="achievement-info">
                <span className="achievement-name">100+ Verifications</span>
                <span className="achievement-desc">Completed 100 student verifications</span>
              </div>
            </div>

            <div className="achievement-card">
              <div className="achievement-icon-wrapper blue">
                <CheckCircle size={20} />
              </div>
              <div className="achievement-info">
                <span className="achievement-name">Accuracy Expert</span>
                <span className="achievement-desc">Maintained 98%+ accuracy for 30 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button className="btn-sign-out" onClick={onSignOut}>
        <span>Sign Out</span>
      </button>
    </div>
  );
}
