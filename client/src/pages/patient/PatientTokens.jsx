import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Clock,
  Activity,
  Tv,
  Calendar,
  RefreshCw,
  User,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  Building2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const PatientTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchTokens = async () => {
    try {
      const { data } = await api.get('/queue/my-token-status');
      if (data.success) {
        setTokens(data.tokens || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load queue token status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Queue Polling
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Live Token Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time queue tracking for your appointments today. Watch your estimated waiting time and token calls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTokens}
            className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand-600 shadow-xs transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/queue-display"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            <span>Lobby TV View</span>
          </Link>
        </div>
      </div>

      {/* Tokens List */}
      {loading ? (
        <TableSkeleton rows={3} />
      ) : tokens.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {tokens.map((item) => {
            const isCurrentlyServingMe =
              item.status === 'in-consultation' || item.myTokenNumber === item.currentTokenBeingServed;

            return (
              <div
                key={item.appointmentId}
                className={`rounded-3xl p-6 sm:p-8 border shadow-soft transition-all relative overflow-hidden ${
                  isCurrentlyServingMe
                    ? 'bg-gradient-to-br from-brand-900 via-slate-900 to-slate-950 text-white border-brand-500 ring-2 ring-brand-500/20 shadow-xl'
                    : 'bg-white text-slate-800 border-slate-200/80 hover:border-brand-200'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Doctor & Appointment Details */}
                  <div className="lg:col-span-7 space-y-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isCurrentlyServingMe
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                            : 'bg-brand-50 text-brand-700 border border-brand-200'
                        }`}
                      >
                        {item.doctor?.specialization}
                      </span>
                      <span className={`text-xs font-mono font-semibold ${isCurrentlyServingMe ? 'text-slate-400' : 'text-slate-400'}`}>
                        {item.appointmentCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <img
                        src={item.doctor?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(item.doctor?.name || 'Doc')}`}
                        alt={item.doctor?.name}
                        className={`w-16 h-16 rounded-2xl object-cover border-2 shadow-sm ${
                          isCurrentlyServingMe ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                        }`}
                      />
                      <div className="space-y-0.5">
                        <h3 className={`text-xl font-extrabold tracking-tight ${isCurrentlyServingMe ? 'text-white' : 'text-slate-900'}`}>
                          {item.doctor?.name}
                        </h3>
                        <p className={`text-xs ${isCurrentlyServingMe ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.doctor?.clinicAddress?.name || 'MediSlot Specialist Clinic'}
                        </p>
                        <p className={`text-xs font-semibold ${isCurrentlyServingMe ? 'text-brand-300' : 'text-brand-600'}`}>
                          Date: {item.date} • Slot: <strong className="font-mono">{item.timeSlot}</strong>
                        </p>
                      </div>
                    </div>

                    {isCurrentlyServingMe && (
                      <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2.5 animate-pulse">
                        <Activity className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                        <span className="font-bold">It is your turn! Please report to the consultation chamber immediately.</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Giant Token Numbers & Wait Stats */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                    {/* Your Token Card */}
                    <div
                      className={`p-5 rounded-2xl text-center border ${
                        isCurrentlyServingMe
                          ? 'bg-slate-800/80 border-slate-700 text-white'
                          : 'bg-brand-50/70 border-brand-200 text-brand-950'
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        Your Token
                      </p>
                      <p className="text-4xl sm:text-5xl font-black font-mono my-1 tracking-tight">
                        #{item.myTokenNumber < 10 ? '0' : ''}{item.myTokenNumber}
                      </p>
                      <div className="mt-1">
                        <Badge status={item.status} size="sm" />
                      </div>
                    </div>

                    {/* Live Server Stats */}
                    <div
                      className={`p-5 rounded-2xl text-center border space-y-2.5 ${
                        isCurrentlyServingMe
                          ? 'bg-slate-800/80 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                          Now Serving
                        </p>
                        <p className="text-xl font-black font-mono text-emerald-500">
                          {item.currentTokenBeingServed > 0 ? `#${item.currentTokenBeingServed}` : 'Idle'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                          Waiting Ahead
                        </p>
                        <p className="text-base font-black font-mono text-amber-500">
                          {item.waitingAhead} (~{item.approxWaitMinutes}m)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="No Active Queue Tokens Today"
          description="You do not have any active appointments in queue for today. Book a doctor slot to generate a queue token."
          actionText="Find & Book Doctor"
          onAction={() => (window.location.href = '/doctors')}
        />
      )}
    </div>
  );
};

export default PatientTokens;
