import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-emerald-500 shrink-0" />;
      case 'danger':
      case 'error':
        return <XCircle size={18} className="text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-500 shrink-0" />;
      default:
        return <Info size={18} className="text-blue-500 shrink-0" />;
    }
  };

  const borderClasses = {
    success: 'border-emerald-200 bg-white shadow-emerald-50',
    danger: 'border-rose-200 bg-white shadow-rose-50',
    error: 'border-rose-200 bg-white shadow-rose-50',
    warning: 'border-amber-200 bg-white shadow-amber-50',
    info: 'border-blue-200 bg-white shadow-blue-50',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-md w-full animate-in fade-in slide-in-from-top-2 duration-200 ${
        borderClasses[type] || borderClasses.info
      }`}
    >
      {getIcon()}
      <span className="text-sm font-medium text-slate-800 flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Dismiss toast"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
