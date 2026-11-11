import React from 'react';

const Badge = ({ status, text, size = 'sm' }) => {
  const normStatus = (status || '').toLowerCase();

  const styles = {
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    'in-queue': 'bg-purple-50 text-purple-700 border-purple-200 badge-pulse pl-5',
    'in-consultation': 'bg-emerald-50 text-emerald-700 border-emerald-300 badge-pulse pl-5 font-semibold',
    completed: 'bg-teal-50 text-teal-700 border-teal-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    skipped: 'bg-amber-50 text-amber-700 border-amber-200',
    rescheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    waiting: 'bg-amber-50 text-amber-700 border-amber-200',
    called: 'bg-emerald-50 text-emerald-700 border-emerald-300 badge-pulse pl-5 font-semibold',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const displayText =
    text ||
    {
      scheduled: 'Scheduled',
      'in-queue': 'In Queue',
      'in-consultation': 'In Consultation',
      completed: 'Completed',
      cancelled: 'Cancelled',
      skipped: 'Skipped',
      rescheduled: 'Rescheduled',
      waiting: 'Waiting',
      called: 'Called',
      active: 'Active',
      inactive: 'Inactive',
    }[normStatus] ||
    status;

  const currentStyle = styles[normStatus] || 'bg-slate-50 text-slate-700 border-slate-200';
  const sizeStyle = size === 'lg' ? 'px-3.5 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium transition-colors ${currentStyle} ${sizeStyle}`}
    >
      {displayText}
    </span>
  );
};

export default Badge;
