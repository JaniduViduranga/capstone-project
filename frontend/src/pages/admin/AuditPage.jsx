import React, { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import { useAdminData, exportAuditPDF } from '../../context/AdminDataContext';
import { PageHeader, MetricCard, Panel, AuditTable } from '../../components/admin/AdminComponents';

export default function AuditPage() {
  const { audits, verifiers, users } = useAdminData();
  const successful = useMemo(
    () => audits.filter((a) => !a.event?.toLowerCase().includes('reject') && !a.event?.toLowerCase().includes('fail')).length,
    [audits]
  );
  const activeVerifiers = verifiers.length;

  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((s) => { map[s.id] = s.name; });
    verifiers.forEach((v) => { map[v.id] = v.name; });
    return map;
  }, [users, verifiers]);

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const actionTypes = useMemo(() => {
    return [...new Set(audits.map((a) => a.event).filter(Boolean))];
  }, [audits]);

  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      const q = searchQuery.toLowerCase();
      const userName = (usersMap[a.userId] || a.userId || '').toLowerCase();
      const event = (a.event || '').toLowerCase();
      const refId = (a.details?.requestId || '').toLowerCase();
      const matchesSearch = !q || userName.includes(q) || event.includes(q) || refId.includes(q);

      const matchesAction = actionFilter === 'All Actions' || a.event === actionFilter;

      const isFail = a.event?.toLowerCase().includes('reject') || a.event?.toLowerCase().includes('fail');
      const statusLabel = isFail ? 'Failure' : 'Success';
      const matchesStatus = statusFilter === 'All Status' || statusLabel === statusFilter;

      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [audits, usersMap, searchQuery, actionFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setActionFilter('All Actions');
    setStatusFilter('All Status');
  };

  const handleExport = () => {
    exportAuditPDF(filteredAudits, usersMap, 'Complete Audit Trail Report');
  };

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Complete system activity history and compliance tracking" />
      <div className="stats-row four">
        <MetricCard label="Total Events Logged" value={audits.length.toString()} />
        <MetricCard label="Successful Actions" value={successful.toString()} tone="success" />
        <MetricCard label="Failed Actions" value={(audits.length - successful).toString()} tone="danger" />
        <MetricCard label="Active Verifiers" value={activeVerifiers.toString()} />
      </div>
      <Panel
        title="Complete Audit Trail"
        subtitle={`All system events with detailed tracking ${filteredAudits.length !== audits.length ? `â€” showing ${filteredAudits.length} of ${audits.length}` : ''}`}
        action={
          <button type="button" className="primary-btn" onClick={handleExport}>
            <Download size={14} /> Export Report (PDF)
          </button>
        }
      >
        <div className="filters">
          <div className="table-search">
            <Search size={14} />
            <input
              placeholder="Search by event, user, or ref ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option>All Actions</option>
            {actionTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Success</option>
            <option>Failure</option>
          </select>
          <button
            type="button"
            className="ghost-btn"
            onClick={handleClearFilters}
            disabled={!searchQuery && actionFilter === 'All Actions' && statusFilter === 'All Status'}
          >
            Clear Filters
          </button>
        </div>
        <AuditTable customRows={filteredAudits} usersMap={usersMap} />
      </Panel>
    </>
  );
}

