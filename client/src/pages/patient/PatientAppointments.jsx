import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  User,
  Filter,
  XCircle,
  RotateCcw,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewAppointment, setViewAppointment] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'All' ? '/appointments/my' : `/appointments/my?status=${statusFilter}`;
      const { data } = await api.get(url);
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
  }, [statusFilter]);

  // Handle Cancel
  const handleOpenCancel = (apt) => {
    setSelectedAppointment(apt);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/appointments/${selectedAppointment._id}/cancel`, {
        cancellationReason: cancelReason || 'Cancelled by patient',
      });
      if (data.success) {
        toast.success(data.message);
        setCancelModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  // Handle Reschedule
  const handleOpenReschedule = (apt) => {
    setSelectedAppointment(apt);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    setNewDate(tomorrow);
    setNewSlot('');
    setRescheduleModalOpen(true);
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedAppointment || !newDate || !rescheduleModalOpen) return;
      setLoadingSlots(true);
      setNewSlot('');
      try {
        const docId = selectedAppointment.doctorId?._id || selectedAppointment.doctorId;
        const { data } = await api.get(`/appointments/slots/${docId}?date=${newDate}`);
        if (data.success) {
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        console.error('Error fetching reschedule slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [newDate, rescheduleModalOpen]);

  const handleConfirmReschedule = async () => {
    if (!newSlot) {
      toast.error('Please choose a new time slot.');
      return;
    }
    setRescheduling(true);
    try {
      const { data } = await api.put(`/appointments/${selectedAppointment._id}/reschedule`, {
        newDate,
        newTimeSlot: newSlot,
        reason: selectedAppointment.reason,
      });
      if (data.success) {
        toast.success(data.message);
        setRescheduleModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule appointment.');
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your consultation bookings, tokens, cancellation, and rescheduling.
          </p>
        </div>

        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {['All', 'scheduled', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              statusFilter === tab
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : appointments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((apt) => {
            const canCancelOrReschedule = ['scheduled', 'in-queue'].includes(apt.status);

            return (
              <div
                key={apt._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Doctor & Date Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <img
                    src={apt.doctorId?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(apt.doctorId?.name || 'Doctor')}`}
                    alt={apt.doctorId?.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-400">
                        {apt.appointmentId}
                      </span>
                      <Badge status={apt.status} />
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                        Token #{apt.tokenNumber}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 truncate">
                      {apt.doctorId?.name}
                    </h3>
                    <p className="text-xs text-brand-600 font-medium">
                      {apt.doctorId?.specialization} • Fee: ₹{apt.amount || apt.doctorId?.consultationFee}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{apt.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{apt.doctorId?.clinicAddress?.name || 'MediSlot Clinic'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      <strong className="text-slate-700">Reason:</strong> {apt.reason}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => {
                      setViewAppointment(apt);
                      setDetailsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Notes</span>
                  </button>

                  {canCancelOrReschedule && (
                    <>
                      <button
                        onClick={() => handleOpenReschedule(apt)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => handleOpenCancel(apt)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description={`No ${statusFilter.toLowerCase()} appointments match your selection.`}
          actionText="Book New Appointment"
          onAction={() => (window.location.href = '/doctors')}
        />
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel your appointment with{' '}
            <strong className="text-slate-800">{selectedAppointment?.doctorId?.name}</strong> on{' '}
            <strong className="text-slate-800">{selectedAppointment?.date}</strong>? Your token slot will be released.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Cancellation
            </label>
            <textarea
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g., Unavoidable personal schedule conflict..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Keep Appointment
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Rescheduling appointment with{' '}
            <strong className="text-slate-800">{selectedAppointment?.doctorId?.name}</strong>. A new token number will be issued.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Choose New Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Available Slots on Selected Date
            </label>
            {loadingSlots ? (
              <p className="text-xs text-slate-400 py-3">Loading available slots...</p>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {availableSlots.map((s) => (
                  <button
                    key={s.time}
                    disabled={s.isBooked}
                    onClick={() => setNewSlot(s.time)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      s.isBooked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        : newSlot === s.time
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-brand-50 hover:border-brand-300'
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">No available slots for this date.</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setRescheduleModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReschedule}
              disabled={rescheduling || !newSlot}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
            >
              {rescheduling ? 'Rescheduling...' : 'Confirm New Slot'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Appointment Details & Consultation Notes Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Consultation & Clinical Details"
        maxWidth="max-w-xl"
      >
        {viewAppointment && (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Appointment ID</p>
                <p className="font-mono font-bold text-slate-800">{viewAppointment.appointmentId}</p>
              </div>
              <Badge status={viewAppointment.status} size="lg" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl">
              <div>
                <span className="text-slate-400">Doctor:</span>
                <p className="font-semibold text-slate-800">{viewAppointment.doctorId?.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Specialization:</span>
                <p className="font-semibold text-slate-800">{viewAppointment.doctorId?.specialization}</p>
              </div>
              <div>
                <span className="text-slate-400">Date & Slot:</span>
                <p className="font-semibold text-slate-800">
                  {viewAppointment.date} at {viewAppointment.timeSlot}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Token Number:</span>
                <p className="font-semibold text-brand-600 font-mono">#{viewAppointment.tokenNumber}</p>
              </div>
            </div>

            {/* Reason */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Reason for Visit
              </p>
              <p className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                {viewAppointment.reason}
              </p>
            </div>

            {/* Clinical Notes (If completed) */}
            {viewAppointment.diagnosis && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Clinical Diagnosis
                </p>
                <p className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-medium border border-emerald-200">
                  {viewAppointment.diagnosis}
                </p>
              </div>
            )}

            {viewAppointment.consultationNotes && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Doctor's Consultation Notes
                </p>
                <p className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {viewAppointment.consultationNotes}
                </p>
              </div>
            )}

            {viewAppointment.prescription && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Prescription / Medications
                </p>
                <p className="p-3 bg-brand-50 text-brand-900 rounded-xl text-xs font-medium border border-brand-200 leading-relaxed whitespace-pre-line">
                  {viewAppointment.prescription}
                </p>
              </div>
            )}

            {viewAppointment.cancellationReason && (
              <div>
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                  Cancellation Reason
                </p>
                <p className="p-3 bg-rose-50 text-rose-900 rounded-xl text-xs font-medium border border-rose-200">
                  {viewAppointment.cancellationReason}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientAppointments;
