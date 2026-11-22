import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, text = '', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 p-6 ${className}`}>
      <Loader2 size={size} className="animate-spin text-[#800000]" />
      {text && <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{text}</span>}
    </div>
  );
}
