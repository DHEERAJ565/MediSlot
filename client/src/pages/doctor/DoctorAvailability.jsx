import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axiosClient';
import {
  Sliders,
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorAvailability = () => {
  const { doctorProfile, updateDoctorProfileState } = useAuth();

  const [availableDays, setAvailableDays] = useState([]);
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '17:00' });
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(20);
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doctorProfile) {
      setAvailableDays(doctorProfile.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
      setWorkingHours(doctorProfile.workingHours || { start: '09:00', end: '17:00' });
      setSlotDurationMinutes(doctorProfile.slotDurationMinutes || 20);
      setIsAvailable(doctorProfile.isAvailable !== undefined ? doctorProfile.isAvailable : true);
    }
  }, [doctorProfile]);

  const handleDayToggle = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (availableDays.length === 0) {
      toast.error('Please select at least one active working day.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put(`/doctors/${doctorProfile._id}`, {
        availableDays,
        workingHours,
        slotDurationMinutes: Number(slotDurationMinutes),
        isAvailable,
      });

      if (data.success) {
        updateDoctorProfileState(data.doctor);
        toast.success('Availability schedule updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200 mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>Slot Management System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Manage Consultation Availability
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure your consultation days, working hours, and slot intervals for dynamic booking generation.
        </p>
      </div>

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
        {/* Availability Toggle Switch */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Accept New Appointments</h4>
            <p className="text-xs text-slate-500">
              When turned off, patients will see you as unavailable and slots cannot be booked.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            className={`p-2 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isAvailable ? (
              <>
                <ToggleRight className="w-6 h-6 text-emerald-600" />
                <span>Available</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-6 h-6 text-slate-500" />
                <span>Unavailable</span>
              </>
            )}
          </button>
        </div>

        {/* Available Days Checkboxes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Active Weekly Consultation Days
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {daysOfWeek.map((day) => {
              const checked = availableDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`py-3 px-4 rounded-2xl border text-xs font-semibold text-center transition-all ${
                    checked
                      ? 'bg-brand-50 text-brand-700 border-brand-300 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Working Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinic Start Time (24h format)
            </label>
            <input
              type="time"
              required
              value={workingHours.start}
              onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinic End Time (24h format)
            </label>
            <input
              type="time"
              required
              value={workingHours.end}
              onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>

        {/* Slot Duration */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Slot Duration per Patient
          </label>
          <select
            value={slotDurationMinutes}
            onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
          >
            <option value={15}>15 Minutes per Consultation</option>
            <option value={20}>20 Minutes per Consultation (Recommended)</option>
            <option value={30}>30 Minutes per Consultation</option>
            <option value={45}>45 Minutes per Consultation</option>
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Slot intervals determine token calculation and reception queue wait time estimates.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Availability Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorAvailability;
