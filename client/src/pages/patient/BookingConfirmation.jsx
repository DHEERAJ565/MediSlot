import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import Badge from '../../components/common/Badge';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Printer,
  Tv,
  ArrowRight,
  ShieldCheck,
  User,
  Share2,
  QrCode,
  Building2,
  Stethoscope,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BookingConfirmation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await api.get(`/appointments/${appointmentId}`);
        if (data.success) {
          setAppointment(data.appointment);
        }
      } catch (err) {
        toast.error('Appointment details not found.');
        navigate('/patient/appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <CardSkeleton />
      </div>
    );
  }

  if (!appointment) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 print:hidden">
        <Link to="/patient/dashboard" className="hover:text-brand-600 transition-colors">Portal</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/patient/appointments" className="hover:text-brand-600 transition-colors">Appointments</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-bold">Confirmation Slip</span>
      </nav>

      {/* Main Boarding Pass / Clinical Slip */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden print:shadow-none print:border-slate-300">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-brand-600 to-medteal-600 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mx-auto mb-3 shadow-sm border border-white/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20">
            Booking Confirmed & Verified
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Appointment Confirmed!
          </h1>
          <p className="text-xs text-brand-100 mt-1 max-w-md mx-auto">
            Your appointment has been registered in the MediSlot Hospital Database and assigned an active clinic queue token.
          </p>
        </div>

        {/* Digital Token Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-50 to-medteal-50/50 border border-brand-200/80 text-center relative overflow-hidden">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-brand-700">
              Assigned Queue Token
            </p>
            <p className="text-6xl sm:text-7xl font-black text-brand-600 font-mono tracking-tight my-2">
              #{appointment.tokenNumber < 10 ? '0' : ''}{appointment.tokenNumber}
            </p>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1 rounded-full border border-brand-200 text-xs font-semibold text-slate-700 shadow-xs">
              <span>Appointment ID:</span>
              <strong className="font-mono text-brand-700 font-bold">{appointment.appointmentId}</strong>
            </div>
          </div>

          {/* Perforated separator simulation */}
          <div className="relative flex items-center justify-between">
            <div className="w-4 h-8 bg-slate-100 -ml-8 rounded-r-full border-r border-slate-200/80" />
            <div className="w-full border-b-2 border-dashed border-slate-200 mx-2" />
            <div className="w-4 h-8 bg-slate-100 -mr-8 rounded-l-full border-l border-slate-200/80" />
          </div>

          {/* Appointment Ticket Details */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consulting Specialist</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{appointment.doctorId?.name}</p>
                <p className="text-brand-600 font-semibold">{appointment.doctorId?.specialization}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date & Slot</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{appointment.date}</p>
                <p className="text-slate-600 font-medium font-mono">Slot: {appointment.timeSlot}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">{appointment.doctorId?.clinicAddress?.name || 'MediSlot Specialist Clinic'}</p>
                  <p className="text-slate-500 mt-0.5">
                    {appointment.doctorId?.clinicAddress?.street}, {appointment.doctorId?.clinicAddress?.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Consultation Fee</span>
                <span className="font-bold text-slate-900 text-sm">
                  ₹{appointment.amount} ({appointment.paymentStatus})
                </span>
              </div>
            </div>

            {/* Check-in Guidance */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Clinic Check-in Instructions:
              </p>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                Please report to the OPD nursing desk 10-15 minutes prior to slot time ({appointment.timeSlot}). Display this confirmation slip or state your Token <strong>#{appointment.tokenNumber}</strong>.
              </p>
            </div>
          </div>

          {/* Simulated Digital Barcode */}
          <div className="pt-2 text-center">
            <div className="h-8 w-48 mx-auto bg-[repeating-linear-gradient(90deg,#0f172a,#0f172a_2px,transparent_2px,transparent_4px,#0f172a_4px,#0f172a_7px,transparent_7px,transparent_9px)] opacity-60" />
            <p className="text-[10px] font-mono text-slate-400 mt-1">*{appointment.appointmentId}*</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
            <Link
              to="/patient/tokens"
              className="w-full sm:w-auto px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-sm shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4" />
              <span>Track Live Queue Token</span>
            </Link>

            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>

            <Link
              to="/patient/appointments"
              className="w-full sm:w-auto px-4 py-3 text-slate-500 hover:text-slate-800 text-xs font-bold text-center"
            >
              My Appointments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
