import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';

export default function SystemAlerts(props) {
  const context = useOutletContext() || {};
  const alerts = props.alerts || context.alerts || [];
  const onDismissAlert = props.onDismissAlert || context.handleDismissAlert || (() => {});
  const getAlertIcon = (type) => {
    switch (type) {
      case 'high-volume':
        return <AlertTriangle size={20} className="alert-icon" />;
      case 'network-delay':
        return <ShieldAlert size={20} className="alert-icon" />;
      default:
        return <Info size={20} className="alert-icon" />;
    }
  };

  return (
    <div className="alerts-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="alerts-header-row">
          <h2 className="page-title">System Alerts</h2>
          <span className="alerts-count">
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="page-subtitle">Critical updates and system statuses</p>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {alerts.length === 0 ? (
          <div className="empty-history" style={{ padding: '60px' }}>
            <span className="empty-history-text">All clear! No active system alerts at the moment.</span>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`alert-card ${alert.type}`}>
              <div className="alert-icon-wrapper">
                {getAlertIcon(alert.type)}
              </div>
              <div className="alert-content">
                <h3 className="alert-headline">{alert.headline}</h3>
                <p className="alert-message">{alert.message}</p>
                <span className="alert-date">{alert.date}</span>
              </div>
              <button 
                className="alert-dismiss-btn" 
                onClick={() => onDismissAlert(alert.id, alert.headline)}
                title="Dismiss alert"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
