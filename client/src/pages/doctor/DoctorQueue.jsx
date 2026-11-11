import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axiosClient';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  Clock,
  PhoneCall,
  SkipForward,
  CheckCircle2,
  RefreshCw,
  Check,
  Calendar,
  Tv,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorQueue = () => {
  const { doctorProfile } = useAuth();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Consultation Completion Form State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [vitals, setVitals] = useState({ bp: '120/80', pulse: '72', temp: '98.6', weight: '70' });

  const fetchQueue = async () => {
    if (!doctorProfile?._id) return;
    try {
      const { data } = await api.get(`/queue/${doctorProfile._id}?date=${selectedDate}`);
      if (data.success) {
        setQueueData(data);
      }
    } catch (err) {
      console.error('Failed to load doctor queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 8000);
    return () => clearInterval(interval);
  }, [doctorProfile, selectedDate]);

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post('/queue/call-next', { date: selectedDate });
      if (data.success) {
        toast.success(data.message);
        fetchQueue();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'No waiting patients found.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipToken = async (tokenNumber) => {
    setActionLoading(true);
    try {
      const { data } = await api.post('/queue/skip', { tokenNumber, date: selectedDate });
      if (data.success) {
        toast.success(data.message);
        fetchQueue();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to skip token.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCompleteModal = () => {
    setConsultationNotes('');
    setDiagnosis('');
    setPrescription('');
    setVitals({ bp: '120/80', pulse: '72', temp: '98.6', weight: '70' });
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = async () => {
    if (!queueData?.currentPatient) return;
    setActionLoading(true);
    try {
      const { data } = await api.post('/queue/complete', {
        tokenNumber: queueData.currentPatient.tokenNumber,
        date: selectedDate,
        consultationNotes,
        diagnosis,
        prescription,
        vitals,
      });

      if (data.success) {
        toast.success(data.message);
        setCompleteModalOpen(false);
        fetchQueue();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to finish consultation.');
    } finally {
      setActionLoading(false);
    }
  };

  const currentPatient = queueData?.currentPatient;
  const waitingTokens = queueData?.activeTokens?.filter((t) => t.status === 'waiting') || [];
  const processedTokens = queueData?.activeTokens?.filter((t) => ['completed', 'skipped', 'cancelled'].includes(t.status)) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Queue Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage daily appointments, call next patients, and record consultations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
          />
          <button
            onClick={fetchQueue}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* CURRENT CHAMBER (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Consultation
              </span>
              {currentPatient && (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Token #{currentPatient.tokenNumber}
                </span>
              )}
            </div>

            {currentPatient ? (
              <div className="py-5 space-y-3">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-14 h-14 rounded-xl bg-brand-600 text-white flex items-center justify-center font-mono font-black text-xl flex-shrink-0">
                    #{currentPatient.tokenNumber}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentPatient.patientName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Scheduled Slot: <strong className="text-slate-800">{currentPatient.timeSlot}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Chamber is Empty</p>
                <p className="text-[11px] text-slate-400">Click "Call Next Patient" to summon the next queued token.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
            <button
              onClick={handleCallNext}
              disabled={actionLoading || waitingTokens.length === 0}
              className="py-2.5 px-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Next</span>
            </button>

            <button
              onClick={() => currentPatient && handleSkipToken(currentPatient.tokenNumber)}
              disabled={actionLoading || !currentPatient}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip</span>
            </button>

            <button
              onClick={handleOpenCompleteModal}
              disabled={actionLoading || !currentPatient}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
          </div>
        </div>

        {/* METRICS (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Today's Queue Stats
              </span>
              <span className="text-xs text-slate-400 font-mono">{selectedDate}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4">
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Tokens</p>
                <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                  {queueData?.totalTokensIssued || 0}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Waiting Ahead</p>
                <p className="text-2xl font-bold font-mono text-amber-600 mt-0.5">
                  {waitingTokens.length}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Completed</p>
                <p className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">
                  {queueData?.completedCount || 0}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Skipped</p>
                <p className="text-2xl font-bold font-mono text-rose-600 mt-0.5">
                  {queueData?.skippedCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Est. Backlog: <strong className="text-slate-800 font-mono">~{queueData?.approxWaitMinutes || 0}m</strong>
            </span>
            <Link
              to="/queue-display"
              className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>Reception Screen</span>
              <Tv className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Waiting List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Waiting Queue ({waitingTokens.length})
            </h3>
            <span className="text-xs text-slate-400">In Order</span>
          </div>

          {waitingTokens.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {waitingTokens.map((t, idx) => (
                <div
                  key={t.tokenNumber}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 font-mono font-bold flex items-center justify-center text-xs">
                      #{t.tokenNumber}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{t.patientName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Slot: {t.timeSlot}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSkipToken(t.tokenNumber)}
                    className="text-xs font-medium text-slate-500 hover:text-amber-600"
                  >
                    Skip
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No patients waiting"
              description="The waiting queue is currently clear."
            />
          )}
        </div>

        {/* Completed History */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Processed Tokens ({processedTokens.length})
            </h3>
            <span className="text-xs text-slate-400">Today</span>
          </div>

          {processedTokens.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {processedTokens.map((t) => (
                <div
                  key={t.tokenNumber}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 font-mono font-bold flex items-center justify-center text-xs">
                      #{t.tokenNumber}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{t.patientName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Slot: {t.timeSlot}</p>
                    </div>
                  </div>
                  <Badge status={t.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No processed tokens yet"
              description="Completed consultations will be recorded here."
            />
          )}
        </div>
      </div>

      {/* Complete Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title={`Complete Consultation — Token #${currentPatient?.tokenNumber} (${currentPatient?.patientName})`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Patient Vitals
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="BP (120/80)"
                value={vitals.bp}
                onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Pulse (bpm)"
                value={vitals.pulse}
                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Temp (°F)"
                value={vitals.temp}
                onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Weight (kg)"
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Diagnosis
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Bronchitis"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Notes
            </label>
            <textarea
              rows="3"
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              placeholder="Observations and advice..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Prescription
            </label>
            <textarea
              rows="3"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Medications, dosage, and duration..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={() => setCompleteModalOpen(false)}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmComplete}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
            >
              {actionLoading ? 'Saving...' : 'Finish Consultation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorQueue;
