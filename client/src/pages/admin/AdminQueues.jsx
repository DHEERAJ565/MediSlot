import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Clock,
  Tv,
  RefreshCw,
  Users,
  Activity,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminQueues = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchQueues = async () => {
    try {
      const { data } = await api.get(`/queue/all/live?date=${selectedDate}`);
      if (data.success) {
        setQueues(data.queues || []);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load clinic queues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 8000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Clinic Network Telemetry
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Synced: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Clinic Queue Monitor
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time status of all outpatient consulting chambers, tokens in service, and patient waiting backlogs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          />
          <Link
            to="/queue-display"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            <span>Launch Lobby TV Board</span>
          </Link>
        </div>
      </div>

      {/* Queues Grid */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : queues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queues.map((item) => {
            const doc = item.doctor;
            return (
              <div
                key={doc._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <img
                      src={doc.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(doc.name)}`}
                      alt={doc.name}
                      className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                      <p className="text-xs text-brand-600 font-semibold">{doc.specialization}</p>
                    </div>
                  </div>

                  {/* Token Status */}
                  <div className="py-5 text-center bg-slate-50 rounded-2xl my-4 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Current Token Serving</p>
                    <p className="text-4xl font-black font-mono text-brand-600 mt-1">
                      {item.currentToken > 0 ? `#${item.currentToken}` : '--'}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 mt-1 truncate px-2">
                      {item.currentPatient ? item.currentPatient.patientName : 'No patient currently inside'}
                    </p>
                  </div>

                  {/* Stat Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
                      <p className="font-bold text-slate-800 text-sm font-mono mt-0.5">
                        {item.totalTokensIssued}
                      </p>
                    </div>
                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-amber-700 uppercase font-bold">Waiting</span>
                      <p className="font-bold text-amber-800 text-sm font-mono mt-0.5">
                        {item.waitingCount}
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 uppercase font-bold">Done</span>
                      <p className="font-bold text-emerald-800 text-sm font-mono mt-0.5">
                        {item.completedCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Est. Backlog: ~{item.approxWaitMinutes} mins</span>
                  <span className="font-semibold text-brand-600">
                    Next: {item.nextPatient ? `#${item.nextPatient.tokenNumber}` : 'None'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="No Active Queues"
          description="There are no active doctor queues registered for the selected date."
        />
      )}
    </div>
  );
};

export default AdminQueues;
