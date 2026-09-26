import React from 'react';
import { OperationStatus } from '../../types';

interface StatusBadgeProps {
  status: OperationStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'Draft':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
      break;
    case 'Waiting':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-400/20';
      break;
    case 'Ready':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-300 ring-1 ring-sky-400/20';
      break;
    case 'Done':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400/20';
      break;
    case 'Canceled':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-300';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs ${sizeClasses} ${colorClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Done'
            ? 'bg-emerald-500'
            : status === 'Ready'
            ? 'bg-sky-500 animate-pulse'
            : status === 'Waiting'
            ? 'bg-amber-500'
            : status === 'Canceled'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};
