import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  FileEdit,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Consultation Notes Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', weight: '' });
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (selectedDate) params.append('date', selectedDate);
      if (search) params.append('search', search);

      const { data } = await api.get(`/appointments/doctor?${params.toString()}`);
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, selectedDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleOpenConsultationModal = (apt) => {
    setSelectedAppointment(apt);
    setDiagnosis(apt.diagnosis || '');
    setConsultationNotes(apt.consultationNotes || '');
    setPrescription(apt.prescription || '');
    setVitals(apt.vitals || { bp: '', pulse: '', temp: '', weight: '' });
    setModalOpen(true);
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setSavingNotes(true);
    try {
      const { data } = await api.put(`/appointments/${selectedAppointment._id}/consultation`, {
        diagnosis,
        consultationNotes,
        prescription,
        vitals,
        status: 'completed', // Doctor saving clinical notes marks it complete
      });

      if (data.success) {
        toast.success('Consultation records saved successfully!');
        setModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update consultation.');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Appointments Roster
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review patient appointments, examine visit reasons, and record clinical diagnosis notes.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          {['All', 'scheduled', 'in-consultation', 'completed', 'cancelled', 'skipped'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                statusFilter === tab
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </form>
      </div>

      {/* Appointments List */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : appointments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((apt) => (
            <div
              key={apt._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 border border-brand-200 font-mono font-black flex items-center justify-center text-sm flex-shrink-0">
                  #{apt.tokenNumber}
                </span>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {apt.appointmentId}
                    </span>
                    <Badge status={apt.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-800">
                    {apt.patientId?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gender: {apt.patientId?.gender || 'N/A'} • Blood: {apt.patientId?.bloodGroup || 'N/A'} • Phone: {apt.patientId?.phone || 'N/A'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {apt.timeSlot}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    <strong>Chief Complaint:</strong> {apt.reason}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => handleOpenConsultationModal(apt)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-all"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>{apt.status === 'completed' ? 'Edit Notes' : 'Record Notes'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Appointments Found"
          description="No appointments found for the selected date or status criteria."
        />
      )}

      {/* Consultation Notes Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Clinical Consultation — ${selectedAppointment?.patientId?.name} (Token #${selectedAppointment?.tokenNumber})`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveConsultation} className="space-y-4 text-xs">
          {/* Patient summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 text-sm">{selectedAppointment?.patientId?.name}</p>
              <p className="text-slate-400 text-[11px]">Reason: {selectedAppointment?.reason}</p>
            </div>
            <span className="font-mono text-xs text-brand-600 font-bold">
              Slot: {selectedAppointment?.timeSlot}
            </span>
          </div>

          {/* Vitals */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Vitals
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="BP (e.g. 120/80)"
                value={vitals.bp}
                onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Pulse (e.g. 72 bpm)"
                value={vitals.pulse}
                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Temp (e.g. 98.6 F)"
                value={vitals.temp}
                onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Weight (e.g. 70 kg)"
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Diagnosis
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Type 2 Diabetes, Acute Tonsillitis"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Doctor's Consultation Notes
            </label>
            <textarea
              rows="3"
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              placeholder="Detailed observations and patient instructions..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Prescription / Medications
            </label>
            <textarea
              rows="3"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Prescriptions with dosage and instructions..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingNotes}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              {savingNotes ? 'Saving...' : 'Save & Mark Completed'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
