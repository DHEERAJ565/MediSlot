import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-4/5" />
    </div>
    <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
      <div className="h-4 bg-slate-200 rounded w-20" />
      <div className="h-8 bg-slate-200 rounded-xl w-28" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-soft animate-pulse">
    <div className="h-12 bg-slate-100 border-b border-slate-200" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-slate-200" />
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-4 bg-slate-100 rounded w-1/5" />
        <div className="h-4 bg-slate-100 rounded w-1/6" />
        <div className="h-6 bg-slate-200 rounded-full w-20 ml-auto" />
      </div>
    ))}
  </div>
);

export const MetricSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft animate-pulse flex items-center justify-between">
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 rounded w-24" />
      <div className="h-6 bg-slate-300 rounded w-16" />
    </div>
    <div className="w-12 h-12 rounded-xl bg-slate-200" />
  </div>
);

export default CardSkeleton;
