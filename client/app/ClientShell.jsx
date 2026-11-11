'use client';

import dynamic from 'next/dynamic';

// The existing application uses browser storage and React Router. Load it only
// in the browser while the route migration is kept compatible with all screens.
const LegacyReactApp = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f7fbfa]">
      <div className="h-10 w-10 rounded-full border-4 border-teal-100 border-t-teal-700 animate-spin" />
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loading MediSlot…</p>
    </div>
  ),
});

export default function ClientShell() {
  return <LegacyReactApp />;
}
