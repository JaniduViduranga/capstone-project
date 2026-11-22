import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminDataContext = createContext();

export function AdminDataProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [verifiers, setVerifiers] = useState([]);
  const [audits, setAudits] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const API = `http://${window.location.hostname}:5000/api`;
      const [usersRes, verifsRes, verifiersRes, auditsRes, examsRes] = await Promise.all([
        fetch(`${API}/admin/students`),
        fetch(`${API}/admin/verifications`),
        fetch(`${API}/admin/verifiers`),
        fetch(`${API}/admin/audits`),
        fetch(`${API}/exam`),
      ]);

      if (usersRes.ok) setUsers((await usersRes.json()).students || []);
      if (verifsRes.ok) setVerifications((await verifsRes.json()).verifications || []);
      if (verifiersRes.ok) setVerifiers((await verifiersRes.json()).verifiers || []);
      if (auditsRes.ok) setAudits((await auditsRes.json()).audits || []);
      if (examsRes.ok) setExams((await examsRes.json()).exams || []);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s polling for realtime updates
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  return (
    <AdminDataContext.Provider
      value={{
        users,
        setUsers,
        verifications,
        setVerifications,
        verifiers,
        setVerifiers,
        audits,
        setAudits,
        exams,
        setExams,
        fetchData,
        loading,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  return useContext(AdminDataContext) || {
    users: [],
    verifications: [],
    verifiers: [],
    audits: [],
    exams: [],
    setUsers: () => {},
    setVerifications: () => {},
    setVerifiers: () => {},
    setAudits: () => {},
    setExams: () => {},
    fetchData: () => {},
  };
}

export function exportAuditPDF(rows, usersMap, title = 'Audit Log Report') {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleString();

  doc.setFontSize(16);
  doc.setTextColor(15, 45, 85);
  doc.text('University Blockchain Identity System', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(title, 14, 28);

  doc.setFontSize(10);
  doc.text(`Generated: ${dateStr}`, 14, 34);
  doc.text(`Total Records: ${rows.length}`, 14, 40);

  const tableData = rows.map((a) => {
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

    const event = a.event || 'N/A';
    const refId = a.details?.requestId || 'N/A';
    const ip = a.ip || '127.0.0.1';
    const isFail = event.toLowerCase().includes('reject') || event.toLowerCase().includes('fail');
    const status = isFail ? 'Failure' : 'Success';
    const ts = new Date(a.timestamp).toLocaleString();

    return [ts, userCol, event, verifierCol, refId, ip, status];
  });

  doc.autoTable({
    startY: 45,
    head: [['Timestamp', 'User', 'Action', 'Verifier', 'Ref ID', 'IP Address', 'Status']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 45, 85] },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 6) {
        if (data.cell.raw === 'Failure') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  doc.save('audit_log_report.pdf');
}

export default AdminDataContext;
