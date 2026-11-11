import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import {
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Clock,
  ArrowLeft,
} from 'lucide-react';

const QueueDisplay = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const fetchQueues = async () => {
    try {
      const { data } = await api.get('/queue/all/live');
      if (data.success) {
        setQueues(data.queues || []);
      }
    } catch (err) {
      console.error('Queue poll error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 6000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between select-none">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Return to Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">
                MediSlot Clinic Reception
              </h1>
              <p className="text-xs text-slate-400">
                Outpatient Department & Waiting Lobby
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xl font-bold font-mono text-emerald-400">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-[11px] text-slate-400">
                {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Queues Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-brand-500 animate-spin" />
              <p className="text-sm text-slate-400">Connecting to queue servers...</p>
            </div>
          ) : queues.length === 0 ? (
            <div className="py-24 text-center text-slate-500 text-sm">
              No active doctor queues found for today.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {queues.map((item, idx) => {
                const doc = item.doctor;
                const roomNumber = 100 + (idx + 1) * 2;

                return (
                  <div
                    key={doc._id}
                    className="bg-slate-850 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Doctor header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <h3 className="text-sm font-bold text-white line-clamp-1">{doc.name}</h3>
                          <p className="text-xs text-brand-400 font-medium">{doc.specialization}</p>
                        </div>
                        <span className="text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                          Chamber #{roomNumber}
                        </span>
                      </div>

                      {/* Token Serving */}
                      <div className="py-6 text-center">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Now Serving
                        </p>
                        <p className="text-5xl font-black font-mono text-emerald-400 tracking-tight">
                          {item.currentToken > 0 ? `#${item.currentToken < 10 ? '0' : ''}${item.currentToken}` : '--'}
                        </p>
                        <p className="text-xs text-slate-300 mt-2 truncate px-1">
                          {item.currentPatient ? item.currentPatient.patientName : 'Chamber Ready'}
                        </p>
                      </div>
                    </div>

                    {/* Next & Waiting */}
                    <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-slate-800/50 p-2.5 rounded-xl">
                        <p className="text-[10px] text-slate-400">Next</p>
                        <p className="font-mono font-bold text-amber-400 text-sm mt-0.5">
                          {item.nextPatient ? `#${item.nextPatient.tokenNumber}` : 'None'}
                        </p>
                      </div>
                      <div className="bg-slate-800/50 p-2.5 rounded-xl">
                        <p className="text-[10px] text-slate-400">Waiting</p>
                        <p className="font-mono font-bold text-white text-sm mt-0.5">
                          {item.waitingCount} patients
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <p>Please report to the nurse station when your token is called.</p>
        <p className="font-mono text-[11px]">Auto-refreshing every 6s</p>
      </div>
    </div>
  );
};

export default QueueDisplay;
