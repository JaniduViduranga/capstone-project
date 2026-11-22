import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="policy-footer">
      <AlertTriangle size={14} color="#f59e0b" />
      <span>Do not store personal images permanently. Review </span>
      <span className="policy-link" onClick={() => alert("Guidelines: Please ensure all uploaded physical documents are deleted from temporary memory within 24 hours of verification.")}>guidelines</span>
    </footer>
  );
}
