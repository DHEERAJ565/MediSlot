import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axiosClient';
import Badge from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  PhoneCall,
  SkipForward,
  Check,
  Tv,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user, doctorProfile } = useAuth();
  const [queueSummary, setQueueSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const fetchDoctorData = async () => {
    if (!doctorProfile?._id) return;
    try {
      const [queueRes, aptRes] = await Promise.all([
        api.get(`/queue/${doctorProfile._id}?date=${todayStr}`),
        api.get(`/appointments/doctor?date=${todayStr}`),
      ]);

      if (queueRes.data.success) setQueueSummary(queueRes.data);
      if (aptRes.data.success) setAppointments(aptRes.data.appointments || []);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
    const interval = setInterval(fetchDoctorData, 8000);
    return () => clearInterval(interval);
  }, [doctorProfile]);

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post('/queue/call-next', { date: todayStr });
      if (data.success) {
        toast.success(data.message);
        fetchDoctorData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'No waiting patients.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async (tokenNumber) => {
    setActionLoading(true);
    try {
      const { data } = await api.post('/queue/skip', { tokenNumber, date: todayStr });
      if (data.success) {
        toast.success(data.message);
        fetchDoctorData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to skip token.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (tokenNumber) => {
    setActionLoading(true);
    try {
      const { data } = await api.post('/queue/complete', {
        tokenNumber,
        date: todayStr,
        consultationNotes: 'Consultation completed from quick action.',
      });
      if (data.success) {
        toast.success(data.message);
        fetchDoctorData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete consultation.');
    } finally {
      setActionLoading(false);
    }
  };

  const currentPatient = queueSummary?.currentPatient;

  return (
    <div className="space-y-6">
      {/* Clean Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Doctor Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {doctorProfile?.name || user?.name} · {doctorProfile?.specialization} · {doctorProfile?.clinicAddress?.name || 'Clinic'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/doctor/queue"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Open Queue Room</span>
          </Link>
          <Link
            to="/queue-display"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <Tv className="w-3.5 h-3.5 text-slate-400" />
            <span>Reception Display</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Today's Patients</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {queueSummary?.totalTokensIssued || appointments.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total booked today</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Waiting in Queue</p>
          <p className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {queueSummary?.waitingCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">~{queueSummary?.approxWaitMinutes || 0}m estimated backlog</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">
            {queueSummary?.completedCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Consultations finished</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Est. Revenue</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
            ₹{(queueSummary?.totalTokensIssued || appointments.length) * (doctorProfile?.consultationFee || 500)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">@ ₹{doctorProfile?.consultationFee || 500}/patient</p>
        </div>
      </div>

      {/* Main Grid: Queue Controller & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Quick Queue Control */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Current Consultation</h3>
            <Link
              to="/doctor/queue"
              className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>Full Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {currentPatient ? (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  In Chamber
                </span>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  Token #{currentPatient.tokenNumber}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">{currentPatient.patientName}</p>
                <p className="text-xs text-slate-500">Slot: {currentPatient.timeSlot}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleSkip(currentPatient.tokenNumber)}
                  disabled={actionLoading}
                  className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  Skip Token
                </button>
                <button
                  onClick={() => handleComplete(currentPatient.tokenNumber)}
                  disabled={actionLoading}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Complete
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <Clock className="w-6 h-6 mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">Chamber is Ready</p>
              <p className="text-[11px] text-slate-400">{queueSummary?.waitingCount || 0} patients waiting</p>
              <button
                onClick={handleCallNext}
                disabled={actionLoading || (queueSummary?.waitingCount || 0) === 0}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Next Patient</span>
              </button>
            </div>
          )}

          {/* Next in line */}
          <div className="pt-2 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1.5">Next Patient:</span>
            {queueSummary?.nextPatient ? (
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-800">
                  #{queueSummary.nextPatient.tokenNumber} {queueSummary.nextPatient.patientName}
                </span>
                <span className="text-slate-400 font-mono">{queueSummary.nextPatient.timeSlot}</span>
              </div>
            ) : (
              <p className="text-slate-400 text-xs">No patients waiting.</p>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Today's Schedule Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Today's Schedule</h3>
            <Link
              to="/doctor/appointments"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              All Appointments
            </Link>
          </div>

          {loading ? (
            <CardSkeleton />
          ) : appointments.length > 0 ? (
            <div className="space-y-2">
              {appointments.slice(0, 5).map((apt) => (
                <div
                  key={apt._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center text-xs">
                      #{apt.tokenNumber}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{apt.patientId?.name}</p>
                      <p className="text-slate-500 text-[11px] font-mono">Slot: {apt.timeSlot}</p>
                    </div>
                  </div>
                  <Badge status={apt.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No appointments today"
              description="No patients have booked appointments for today."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
