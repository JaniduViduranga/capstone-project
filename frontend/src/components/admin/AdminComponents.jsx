import React, { useState, useMemo } from 'react';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function MetricCard({ icon: Icon, label, value, tone, detail, children }) {
  return (
    <section className="metric-card">
      <div className="metric-label">{Icon && <Icon size={16} />} {label}</div>
      <div className={`metric-value ${tone || ''}`}>{value}</div>
      {detail && <p className={`metric-detail ${tone || ''}`}>{detail}</p>}
      {children}
    </section>
  );
}

export function Panel({ title, subtitle, action, children, className = '', icon: Icon }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          {title && <h2>{Icon && <Icon size={18} />} {title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && <div className="panel-actions">{action}</div>}
      </div>
      {children}
    </section>
  );
}

export function AuditTable({ compact = false, customRows = [], usersMap = {} }) {
  const fallbackRows = [
    ['2026-03-25 14:32:15', 'System User', 'Verification Event', 'Admin', 'N/A', '192.168.1.1', 'Success']
  ];

  const mappedRows = customRows.length > 0 ? customRows.map((a) => {
    const isVerifierAction = a.event?.includes('Verifier');
    const isStudentActionWithVerifier = a.details?.verifierId;

    let userCol = 'Unknown User';
    let verifierCol = 'System';

    if (isVerifierAction) {
      userCol = usersMap[a.details?.studentId] || a.details?.studentId || 'Unknown User';
      verifierCol = usersMap[a.userId] || a.userId || 'Unknown Verifier';
    } else if (isStudentActionWithVerifier) {
      userCol = usersMap[a.userId] || a.userId || 'Unknown User';
      verifierCol = usersMap[a.details?.verifierId] || a.details?.verifierId || 'System';
    } else {
      userCol = usersMap[a.userId] || a.userId || 'Unknown User';
      verifierCol = 'System';
    }

    return [
      new Date(a.timestamp).toLocaleString(),
      userCol,
      a.event,
      verifierCol,
      a.details?.requestId || 'N/A',
      a.ip || '127.0.0.1',
      a.event.toLowerCase().includes('reject') || a.event.toLowerCase().includes('fail') ? 'Failure' : 'Success'
    ];
  }) : fallbackRows;

  const rows = compact ? mappedRows.slice(0, 7) : mappedRows;

  return (
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>User</th>
          <th>Action</th>
          <th>Verifier</th>
          <th>Ref ID</th>
          <th>IP Address</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`audit-${i}`}>
            {row.map((cell, index) => (
              <td key={`${i}-${index}`}>
                {index === 6 ? (
                  <Badge tone={cell === 'Failure' ? 'danger' : 'success'}>{cell}</Badge>
                ) : (
                  cell
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function MiniLine() {
  const points = useMemo(() => '5,78 45,70 82,58 120,47 158,34 198,23', []);
  return (
    <svg className="mini-line" viewBox="0 0 210 100">
      <polyline points={points} fill="none" stroke="#082f5f" strokeWidth="5" strokeLinecap="round" />
      {points.split(' ').map((point) => {
        const [cx, cy] = point.split(',');
        return <circle key={point} cx={cx} cy={cy} r="5" fill="#082f5f" />;
      })}
    </svg>
  );
}

export function Badge({ children, tone = 'default' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function StatusRow({ label, value, tone = 'default' }) {
  return (
    <div className="status-row">
      <span>{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

export function Toggle({ label, detail, on, onChange }) {
  const [enabled, setEnabled] = useState(Boolean(on));

  const handleClick = () => {
    if (onChange) {
      onChange(!on);
    } else {
      setEnabled(!enabled);
    }
  };

  const isOn = onChange ? on : enabled;

  return (
    <button className="toggle-row" type="button" onClick={handleClick}>
      <span>
        <strong>{label}</strong>
        {detail && <small>{detail}</small>}
      </span>
      <i className={isOn ? 'on' : ''}><b /></i>
    </button>
  );
}

export function ReadField({ label, value, icon: Icon, onChange, readOnly = true }) {
  return (
    <label className={`read-field ${readOnly ? 'is-readonly' : ''}`}>
      {label}
      <span>
        {Icon && <Icon size={14} />}
        <input value={value || ''} onChange={onChange} readOnly={readOnly} />
      </span>
    </label>
  );
}
