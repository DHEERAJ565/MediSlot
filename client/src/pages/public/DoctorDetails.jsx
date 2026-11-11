import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Briefcase,
  Building2,
  ArrowRight,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slotsData, setSlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await api.get(`/doctors/${id}`);
        if (data.success) {
          setDoctor(data.doctor);
        }
      } catch (err) {
        toast.error('Doctor profile not found.');
        navigate('/doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, navigate]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!id || !selectedDate) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const { data } = await api.get(`/appointments/slots/${id}?date=${selectedDate}`);
        if (data.success) {
          setSlotsData(data);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate]);

  const handleProceedToBook = () => {
    if (!selectedSlot) {
      toast.error('Please select an available time slot.');
      return;
    }
    if (!isAuthenticated) {
      toast('Please sign in to confirm your appointment.', { icon: '🔐' });
      navigate('/login', { state: { returnUrl: `/patient/book/${id}?date=${selectedDate}&slot=${selectedSlot}` } });
      return;
    }
    navigate(`/patient/book/${id}?date=${selectedDate}&slot=${selectedSlot}`);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <CardSkeleton />
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-slate-800">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/doctors" className="hover:text-slate-800">Doctors</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold">{doctor.name}</span>
      </nav>

      {/* Doctor Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={doctor.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(doctor.name)}`}
            alt={doctor.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-50 border border-slate-200"
          />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-brand-600 block">
              {doctor.specialization}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {doctor.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {doctor.qualifications?.join(' · ')}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {doctor.rating?.toFixed(1) || '4.9'}
              </span>
              <span>·</span>
              <span>{doctor.experienceYears} Years Experience</span>
              <span>·</span>
              <span className="text-slate-500">{doctor.hospitalAffiliation || 'MediSlot Partner Center'}</span>
            </div>
          </div>
        </div>

        {/* Fee */}
        <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 w-full md:w-auto">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Consultation Fee</p>
          <p className="text-2xl font-bold text-slate-900">₹{doctor.consultationFee}</p>
          <p className="text-[11px] text-slate-500">Pay at reception</p>
        </div>
      </div>

      {/* Grid: Doctor Info on Left, Slot Selector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Bio & Practice Location */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">About Doctor</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {doctor.bio || 'Dedicated medical practitioner focused on comprehensive clinical care and patient safety.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Practice Location & Timings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <p className="font-semibold text-slate-800">{doctor.clinicAddress?.name || 'MediSlot Specialist Clinic'}</p>
                <p className="text-slate-500">{doctor.clinicAddress?.street}</p>
                <p className="text-slate-500">{doctor.clinicAddress?.city}, {doctor.clinicAddress?.state}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <p className="font-semibold text-slate-800">Working Hours</p>
                <p className="text-slate-500">{doctor.workingHours?.start} - {doctor.workingHours?.end}</p>
                <p className="text-slate-500">{doctor.slotDurationMinutes || 20}m per consultation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Clean Slot Picker */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Select Date & Time</h3>
            <span className="text-xs text-slate-400">Step 1 of 2</span>
          </div>

          {/* Date Picker Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Slot Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Available Slots</span>
              {slotsData && (
                <span>{slotsData.availableSlotsCount || 0} open</span>
              )}
            </div>

            {loadingSlots ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading available slots...</div>
            ) : slotsData && !slotsData.available ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>{slotsData.reason || 'Doctor is not available on this date.'}</span>
              </div>
            ) : slotsData && slotsData.slots?.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {slotsData.slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={slot.isBooked}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all ${
                      slot.isBooked
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                        : selectedSlot === slot.time
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No slots available for this date.</p>
            )}
          </div>

          {/* Proceed Button */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {selectedSlot && (
              <p className="text-xs text-brand-600 font-semibold text-center">
                Selected: {selectedSlot} on {selectedDate}
              </p>
            )}
            <button
              onClick={handleProceedToBook}
              disabled={!selectedSlot}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Continue to Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
