import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

/**
 * Format minutes since midnight into 12-hour AM/PM string (e.g. 540 -> "09:00 AM")
 */
export const formatTime12h = (totalMinutes) => {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

/**
 * Parse time string ("HH:mm") to minutes from midnight
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
};

/**
 * Get available time slots for a doctor on a specific date
 * @param {string} doctorId
 * @param {string} dateStr (YYYY-MM-DD)
 */
export const getDoctorSlotsForDate = async (doctorId, dateStr) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.isActive || !doctor.isAvailable) {
    return { available: false, reason: 'Doctor is currently unavailable or inactive', slots: [] };
  }

  // Check day of week
  const dateObj = new Date(`${dateStr}T00:00:00`);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[dateObj.getDay()];

  if (!doctor.availableDays.includes(dayOfWeek)) {
    return {
      available: false,
      reason: `Doctor does not consult on ${dayOfWeek}s. Available days: ${doctor.availableDays.join(', ')}`,
      slots: [],
    };
  }

  const startMinutes = parseTimeToMinutes(doctor.workingHours?.start || '09:00');
  const endMinutes = parseTimeToMinutes(doctor.workingHours?.end || '17:00');
  const duration = doctor.slotDurationMinutes || 20;

  // Fetch all active appointments booked for this doctor on this date
  const bookedAppointments = await Appointment.find({
    doctorId,
    date: dateStr,
    status: { $nin: ['cancelled', 'rescheduled'] },
  }).select('timeSlot tokenNumber status patientId');

  const bookedSlotsMap = new Map();
  bookedAppointments.forEach((apt) => {
    bookedSlotsMap.set(apt.timeSlot, apt);
  });

  const slots = [];
  for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
    const formatted = formatTime12h(m);
    const isBooked = bookedSlotsMap.has(formatted);
    slots.push({
      time: formatted,
      isBooked,
      tokenNumber: isBooked ? bookedSlotsMap.get(formatted).tokenNumber : null,
    });
  }

  return {
    available: true,
    dayOfWeek,
    workingHours: doctor.workingHours,
    slotDurationMinutes: duration,
    totalSlots: slots.length,
    availableSlotsCount: slots.filter((s) => !s.isBooked).length,
    slots,
  };
};
