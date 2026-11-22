import React, { useState, useEffect } from 'react';
import { Bell, Shield, Database, KeyRound, RefreshCcw, Download } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { PageHeader, Panel, Toggle, ReadField, Info } from '../../components/admin/AdminComponents';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:5000/api/settings`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const { users, verifiers } = useAdminData();
  const activeUsers = `${users.length} students, ${verifiers.length} verifiers`;

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (section, field) => (newValue) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: newValue
      }
    }));
  };

  const handleChange = (section, field) => (e) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: e.target.value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5000/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Error saving settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

  return (
    <>
      <PageHeader title="Settings" subtitle="System configuration and preferences" />
      <div className="settings-pair">
        <Panel title="Notifications" subtitle="Configure alert preferences" icon={Bell}>
          <Toggle
            label="Email Notifications"
            detail="Receive email alerts for critical events"
            on={settings.notifications?.emailAlerts}
            onChange={handleToggle('notifications', 'emailAlerts')}
          />
          <Toggle
            label="Low Gas Balance Alert"
            detail="Alert when MATIC balance is low"
            on={settings.notifications?.lowGasAlerts}
            onChange={handleToggle('notifications', 'lowGasAlerts')}
          />
          <Toggle
            label="Verification Queue Alerts"
            detail="Notify when queue exceeds threshold"
            on={settings.notifications?.queueAlerts}
            onChange={handleToggle('notifications', 'queueAlerts')}
          />
        </Panel>
        <Panel title="Security Settings" subtitle="Access control and authentication" icon={Shield}>
          <Toggle
            label="Two-Factor Authentication"
            detail="Enable 2FA for admin access"
            on={settings.security?.twoFactor}
            onChange={handleToggle('security', 'twoFactor')}
          />
          <Toggle
            label="Session Timeout"
            detail="Auto-logout after inactivity"
            on={settings.security?.sessionTimeout}
            onChange={handleToggle('security', 'sessionTimeout')}
          />
          <Toggle
            label="IP Whitelist"
            detail="Restrict access to specific IP ranges"
            on={settings.security?.ipWhitelist}
            onChange={handleToggle('security', 'ipWhitelist')}
          />
        </Panel>
      </div>
      <Panel title="Blockchain Configuration" subtitle="Polygon network and smart contract settings" icon={Database}>
        <div className="form-grid">
          <ReadField label="Polygon RPC URL" value={settings.blockchain?.rpcUrl || ''} onChange={handleChange('blockchain', 'rpcUrl')} readOnly={false} />
          <ReadField label="Smart Contract Address" value={settings.blockchain?.contractAddress || ''} onChange={handleChange('blockchain', 'contractAddress')} readOnly={false} />
          <ReadField label="Gas Limit" value={settings.blockchain?.gasLimit || ''} onChange={handleChange('blockchain', 'gasLimit')} readOnly={false} />
          <ReadField label="Low Balance Threshold (MATIC)" value={settings.blockchain?.lowBalanceThreshold || ''} onChange={handleChange('blockchain', 'lowBalanceThreshold')} readOnly={false} />
        </div>
      </Panel>
      <Panel title="API Keys & Credentials" subtitle="Manage external service integrations" icon={KeyRound}>
        <ReadField label="Wallet Private Key (Encrypted)" value={settings.credentials?.privateKey || ''} onChange={handleChange('credentials', 'privateKey')} readOnly={false} />
        <ReadField label="AI Face Recognition API Key" value={settings.credentials?.aiApiKey || ''} onChange={handleChange('credentials', 'aiApiKey')} readOnly={false} />
        <ReadField label="Email SMTP Configuration" value={settings.credentials?.smtpConfig || ''} onChange={handleChange('credentials', 'smtpConfig')} readOnly={false} />
      </Panel>
      <Panel className="outlined" title="System Information">
        <div className="info-grid three">
          <Info label="System Version" value="v1.0.0" />
          <Info label="Last Update" value={new Date().toLocaleDateString()} />
          <Info label="Database" value="Firebase Firestore" />
          <Info label="Active Users" value={activeUsers} />
          <Info label="Session Uptime" value={(() => { const s = Math.floor(performance.now() / 1000); if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s/60)}m ${s%60}s`; return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`; })()} />
          <Info label="Server" value="Google Cloud (Firebase)" />
        </div>
      </Panel>
      <div className="button-row">
        <button type="button" className="ghost-btn" onClick={fetchSettings}>
          <RefreshCcw size={14} /> Reset to Saved
        </button>
        <button type="button" className="primary-btn" onClick={handleSave} disabled={saving}>
          <Download size={14} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </>
  );
}

