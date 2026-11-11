import React from 'react';
import { CalendarX2 } from 'lucide-react';

const EmptyState = ({
  icon: Icon = CalendarX2,
  title = 'No items found',
  description = 'There are no records matching your current criteria.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-soft my-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
