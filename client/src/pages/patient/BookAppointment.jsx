import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileEdit,
  Sun,
  Sunset,
  Building2,
  ChevronRight,
  BadgeCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Generate 7 upcoming day chips
  const generateUpcomingDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const weekday = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
      days.push({ iso, weekday, dayNum, monthStr });
    }
    return days;
  };

  const upcomingDays = generateUpcomingDays();
  const todayStr = upcomingDays[0].iso;
  const initialDate = searchParams.get('date') || todayStr;
  const initialSlot = searchParams.get('slot') || '';

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSlot, setSelectedSlot] = useState(initialSlot);
  const [reason, setReason] = useState('');
  const [slotsData, setSlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Doctor profile
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data } = await api.get(`/doctors/${doctorId}`);
        if (data.success) {
          setDoctor(data.doctor);
        }
      } catch (err) {
        toast.error('Doctor not found.');
        navigate('/doctors');
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoc();
  }, [doctorId, navigate]);

  // Fetch slots for selected date
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorId || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const { data } = await api.get(`/appointments/slots/${doctorId}?date=${selectedDate}`);
        if (data.success) {
          setSlotsData(data);
          // If initialSlot is in the slots and not booked, keep it; otherwise reset
          if (selectedSlot) {
            const match = data.slots?.find((s) => s.time === selectedSlot);
            if (!match || match.isBooked) {
              setSelectedSlot('');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [doctorId, selectedDate]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error('Please pick an appointment date.');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please choose an available time slot.');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please explain the reason for your consultation.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/appointments', {
        doctorId,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason: reason.trim(),
      });

      if (data.success) {
        toast.success(data.message);
        navigate(`/patient/confirmation/${data.appointment._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to book appointment. Please try another slot.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <CardSkeleton />
      </div>
    );
  }

  if (!doctor) return null;

  // Split slots into morning and afternoon/evening
  const morningSlots = (slotsData?.slots || []).filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    return hour < 12;
  });

  const afternoonSlots = (slotsData?.slots || []).filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    return hour >= 12;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/patient/dashboard" className="hover:text-brand-600 transition-colors">Portal</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/doctors" className="hover:text-brand-600 transition-colors">Doctors</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-bold">Book with {doctor.name}</span>
      </nav>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Step 1 of 2: Appointment Reservation & Queue Allocation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Book Doctor Appointment
        </h1>
        <p className="text-sm text-slate-500">
          Select date and slot, describe symptoms, and confirm your clinic token.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Doctor Info Preview Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <img
              src={doctor.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(doctor.name)}`}
              alt={doctor.name}
              className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200 shadow-sm"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 inline-flex items-center gap-1">
                <BadgeCheck className="w-3 h-3 text-brand-600" />
                {doctor.specialization}
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-1">{doctor.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{doctor.qualifications?.join(', ')}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-500 font-semibold">Consultation Fee</span>
              <span className="font-extrabold text-slate-900 text-base">₹{doctor.consultationFee}</span>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">{doctor.clinicAddress?.name}</p>
                <p className="text-slate-500 mt-0.5">{doctor.clinicAddress?.street}, {doctor.clinicAddress?.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Clock className="w-4 h-4 text-medteal-600 flex-shrink-0" />
              <span>
                Hours: <strong className="text-slate-800">{doctor.workingHours?.start} - {doctor.workingHours?.end}</strong> ({doctor.slotDurationMinutes}m slots)
              </span>
            </div>
          </div>

          <div className="p-4 bg-brand-50/70 border border-brand-200/70 rounded-2xl text-xs text-brand-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Real-time conflict prevention prevents double-booking. Your slot is reserved and token is generated immediately upon submission.
            </span>
          </div>
        </div>

        {/* Right Column (7 cols): Booking Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
          <form onSubmit={handleSubmitBooking} className="space-y-5">
            {/* 1. Date Selection with Quick Carousel */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Select Consultation Date *
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
                />
              </div>

              {/* 4 quick day selector pills */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {upcomingDays.slice(0, 4).map((d) => {
                  const isSelected = selectedDate === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setSelectedDate(d.iso)}
                      className={`py-2 px-1 text-center rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/20'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                      }`}
                    >
                      <p className={`text-[10px] uppercase font-bold ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                        {d.weekday}
                      </p>
                      <p className="text-sm font-extrabold mt-0.5">{d.dayNum}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Slot Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Choose Available Time Slot *
                </label>
                {selectedSlot && (
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                    Selected: {selectedSlot}
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <span>Checking slot availability...</span>
                </div>
              ) : slotsData && !slotsData.available ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                  <span>{slotsData.reason || 'Doctor is not consulting on this date.'}</span>
                </div>
              ) : slotsData && slotsData.slots?.length > 0 ? (
                <div className="space-y-3 max-h-56 overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                  {/* Morning Slots */}
                  {morningSlots.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-500" />
                        Morning Slots
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {morningSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={slot.isBooked}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all ${
                              slot.isBooked
                                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                                : selectedSlot === slot.time
                                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {afternoonSlots.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <p className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                        <Sunset className="w-3 h-3 text-brand-500" />
                        Afternoon & Evening Slots
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {afternoonSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={slot.isBooked}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all ${
                              slot.isBooked
                                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                                : selectedSlot === slot.time
                                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No available slots for this date.</p>
              )}
            </div>

            {/* 3. Reason for Visit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Reason for Consultation / Symptoms *
              </label>
              <textarea
                required
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms, medical concerns, or primary reason for this visit..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !selectedSlot || !reason.trim()}
                className="w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{submitting ? 'Confirming Reservation...' : 'Confirm Appointment & Generate Token'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
