import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { History, ShieldCheck, ShieldAlert, Search, ExternalLink } from 'lucide-react';

export default function MyHistory(props) {
  const context = useOutletContext() || {};
  const history = props.history || context.history || [];
  const loading = props.loading !== undefined ? props.loading : context.historyLoading;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nic && item.nic.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      statusFilter === 'all' || 
      item.decision.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  if (loading && history.length === 0) {
    return (
      <div className="empty-history" style={{ padding: '100px 40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Loading History...</h3>
      </div>
    );
  }

  return (
    <div className="history-container">
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">My History</h2>
        <p className="page-subtitle">Your recent verification decisions</p>
      </div>

      {/* Filter and Search Controls (Render only when history has items to make it premium!) */}
      {history.length > 0 && (
        <div style={{
          display: 'flex', 
          gap: '16px', 
          flexWrap: 'wrap', 
          backgroundColor: '#ffffff', 
          padding: '16px 24px', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by student name or NIC..."
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Decisions</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      {/* History content */}
      {filteredHistory.length === 0 ? (
        <div className="empty-history">
          <History size={48} color="#94a3b8" style={{ strokeWidth: 1.5 }} />
          <p className="empty-history-text">
            {history.length === 0 
              ? "No verification history yet. Approved or rejected students will appear here."
              : "No historical decisions match your search filters."}
          </p>
        </div>
      ) : (
        <div className="history-card">
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>NIC Number</th>
                  <th>Decision</th>
                  <th>Reason/Note</th>
                  <th>Verified Time</th>
                  <th>Blockchain Proof</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          backgroundColor: item.decision === 'Approved' ? '#f0fdf4' : '#fef2f2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: item.decision === 'Approved' ? '#15803d' : '#b91c1c'
                        }}>
                          {item.decision === 'Approved' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                        </div>
                        <span style={{ fontWeight: '700' }}>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#5a738e', fontFamily: 'monospace', fontWeight: '600' }}>{item.nic}</td>
                    <td>
                      <span className={`history-badge ${item.decision === 'Approved' ? 'approved' : 'rejected'}`}>
                        {item.decision}
                      </span>
                    </td>
                    <td style={{ color: '#5a738e' }}>{item.notes || 'Document details verified.'}</td>
                    <td style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>{item.decidedAt}</td>
                    <td>
                      {item.polygonscanUrl ? (
                        <a
                          href={item.polygonscanUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            color: '#7c3aed', fontSize: '12px', fontWeight: '600',
                            textDecoration: 'none',
                          }}
                          onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                          <ExternalLink size={12} /> View Proof
                        </a>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
