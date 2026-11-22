import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Check, X, ShieldAlert, Award, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export default function PendingQueue(props) {
  const context = useOutletContext() || {};
  const pendingList = props.pendingList || context.pendingList || [];
  const onVerify = props.onVerify || context.handleVerifyStudent || (() => {});
  const loading = props.loading !== undefined ? props.loading : context.pendingLoading;
  const onRefresh = props.onRefresh || context.fetchQueue || (() => {});
  const [selectedId, setSelectedId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const selectedStudent = pendingList.find(s => s.id === selectedId) || (pendingList.length > 0 ? pendingList[0] : null);

  // Auto select another student when queue changes
  React.useEffect(() => {
    if (pendingList.length > 0 && (!selectedId || !pendingList.some(s => s.id === selectedId))) {
      setSelectedId(pendingList[0].id);
    }
  }, [pendingList, selectedId]);

  const handleApprove = () => {
    if (!selectedStudent) return;
    onVerify(selectedStudent.id, 'Approved', 'Valid student identity card. Match confirmed.');
  };

  const handleReject = () => {
    if (!selectedStudent) return;
    setShowRejectModal(true);
  };

  const submitReject = () => {
    if (!selectedStudent) return;
    const reason = rejectReason.trim() || 'Document authentication failed.';
    onVerify(selectedStudent.id, 'Rejected', reason);
    setRejectReason('');
    setShowRejectModal(false);
  };

  if (loading && pendingList.length === 0) {
    return (
      <div className="empty-history" style={{ padding: '100px 40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Loading Queue...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'slideUp 0.4s ease-out' }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Pending Queue</h2>
          <p className="page-subtitle">Verify student identities and authenticate university credentials</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
            color: 'var(--color-accent)', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={14} />
          <span>{loading ? 'Refreshing...' : 'Refresh Queue'}</span>
        </button>
      </div>

      {pendingList.length === 0 ? (
        <div className="empty-history" style={{ padding: '100px 40px' }}>
          <CheckCircle2 size={56} color="#16a34a" style={{ strokeWidth: 1.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Queue Fully Processed</h3>
          <p className="empty-history-text" style={{ maxWidth: '400px', margin: '0 auto' }}>
            Outstanding student verification requests have been cleared. Fresh registration documents will sync automatically as they arrive.
          </p>
        </div>
      ) : (
        <div className="queue-grid">
          {/* List panel */}
          <div className="queue-card">
            <div className="queue-header">
              <h3 className="queue-title">Incoming Verification Requests</h3>
              <span className="queue-badge">{pendingList.length} Pending</span>
            </div>

            <div className="queue-list">
              {pendingList.map((student) => {
                const isHighUrgency = student.score != null && student.score < 60;
                return (
                  <div
                    key={student.id}
                    className={`student-item ${selectedStudent && selectedStudent.id === student.id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(student.id)}
                  >
                    <div className="student-item-info">
                      <div className="student-avatar" style={{ backgroundColor: isHighUrgency ? '#ef4444' : '#800000' }}>
                        {student.name.charAt(0)}
                      </div>
                      <div className="student-details">
                        <span className="student-name">{student.name}</span>
                        <span className="student-id">{student.nic}</span>
                      </div>
                    </div>
                    {student.score != null && (
                      <span className={`student-urgency ${isHighUrgency ? 'high' : 'normal'}`}>
                        {student.score}% Match
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editor panel */}
          {selectedStudent && (
            <div className="editor-card">
              <div className="editor-header">
                <h3 className="editor-title">Verify Credentials</h3>
                <p className="editor-subtitle">Review document details to confirm identity matching</p>
              </div>

              {/* Document View */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* ID Image */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', backgroundColor: '#f8fafc' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>ID Document / NIC</span>
                    {selectedStudent.idImageUrl ? (
                      <a href={selectedStudent.idImageUrl} target="_blank" rel="noreferrer">
                        <img src={selectedStudent.idImageUrl} alt="ID Document" style={{ width: '100%', height: '180px', objectFit: 'contain', borderRadius: '4px', backgroundColor: '#fff' }} />
                      </a>
                    ) : (
                      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '4px' }}>
                        <User size={32} color="#94a3b8" />
                      </div>
                    )}
                  </div>

                  {/* Selfie Image */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', backgroundColor: '#f8fafc' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Live Selfie</span>
                    {selectedStudent.selfieImageUrl ? (
                      <a href={selectedStudent.selfieImageUrl} target="_blank" rel="noreferrer">
                        <img src={selectedStudent.selfieImageUrl} alt="Live Selfie" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#fff' }} />
                      </a>
                    ) : (
                      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '4px' }}>
                        <User size={32} color="#94a3b8" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="id-card-sim" style={{ margin: 0, minHeight: 'auto' }}>
                  <div className="id-card-header">
                    <span className="id-card-university">UNIVERSITY IDENTITY PORTAL</span>
                    <Award size={14} color="var(--color-accent)" />
                  </div>
                  <div className="id-card-body" style={{ padding: '16px' }}>
                    <div className="id-card-fields" style={{ marginLeft: 0 }}>
                      <div className="id-card-field">
                        <span className="id-card-label">Full Name</span>
                        <span className="id-card-value">{selectedStudent.name}</span>
                      </div>
                      <div className="id-card-field">
                        <span className="id-card-label">NIC Number</span>
                        <span className="id-card-value" style={{ fontFamily: 'monospace' }}>{selectedStudent.nic}</span>
                      </div>
                      <div className="id-card-field">
                        <span className="id-card-label">Programme</span>
                        <span className="id-card-value">{selectedStudent.program}</span>
                      </div>
                      <div className="id-card-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <span className="id-card-label">Submitted On</span>
                          <span className="id-card-value">{selectedStudent.submitted}</span>
                        </div>
                        <div>
                          <span className="id-card-label">Email</span>
                          <span className="id-card-value" style={{ wordBreak: 'break-all' }}>{selectedStudent.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action warnings info box */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                display: 'flex',
                gap: '10px'
              }}>
                <FileText size={16} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Checklist:</strong> Review name match, confirm profile photo matches records, verify document validity dates, and validate department certification scope.
                </span>
              </div>

              {/* Approve/Reject Buttons */}
              <div className="editor-actions">
                <button className="btn-reject" onClick={handleReject}>
                  <X size={16} />
                  <span>Reject</span>
                </button>
                <button className="btn-approve" onClick={handleApprove}>
                  <Check size={16} />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showRejectModal && selectedStudent && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(2, 22, 52, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '440px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Header band */}
            <div style={{
              backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca',
              padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <ShieldAlert size={20} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>Reject Verification</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  This action will be permanently logged.
                </p>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                You are rejecting the verification request for{' '}
                <strong style={{ color: '#1e293b' }}>{selectedStudent.name}</strong>.
                Please provide a clear failure reason below.
              </p>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Failure Reason
                </label>
                <textarea
                  id="reject-reason"
                  placeholder="e.g., Expiry date passed, blurry photo, incorrect enrollment format..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: '100%', minHeight: '100px', padding: '12px 14px',
                    border: '1.5px solid #e2e8f0', borderRadius: '10px',
                    fontSize: '14px', color: '#1e293b', lineHeight: '1.6',
                    resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                    backgroundColor: '#f8fafc', boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f87171'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #f1f5f9',
              display: 'flex', gap: '12px', justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                style={{
                  padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                  border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', color: '#64748b',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                style={{
                  padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                  border: 'none', backgroundColor: '#dc2626', color: '#ffffff',
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                <ShieldAlert size={15} />
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
