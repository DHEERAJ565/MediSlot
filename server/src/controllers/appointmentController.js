import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { getDoctorSlotsForDate } from '../services/slotService.js';
import { issueTokenForAppointment, removeOrCancelToken } from '../services/queueService.js';

// Helper to generate a unique human-friendly appointment ID
const generateAppointmentCode = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MS-${dateStr}-${randomSuffix}`;
};

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/appointments/slots/:doctorId
// @access  Public
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date in YYYY-MM-DD format as a query parameter.',
      });
    }

    const slotInfo = await getDoctorSlotsForDate(doctorId, date);

    res.status(200).json({
      success: true,
      ...slotInfo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
export const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;

    if (!doctorId || !date || !timeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, date, timeSlot, and reason for consultation.',
      });
    }

    // Prevent past date bookings
    const todayStr = new Date().toISOString().slice(0, 10);
    if (date < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates.',
      });
    }

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive || !doctor.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'The selected doctor is currently unavailable for booking.',
      });
    }

    // Check if slot is already booked for this doctor on this date
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $nin: ['cancelled', 'rescheduled'] },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: `The ${timeSlot} slot on ${date} has already been reserved. Please select another slot.`,
      });
    }

    // Check if patient already has an active appointment with the same doctor on the same date
    const patientExisting = await Appointment.findOne({
      patientId: req.user._id,
      doctorId,
      date,
      status: { $nin: ['cancelled', 'completed'] },
    });

    if (patientExisting) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active appointment scheduled with this doctor on this date.',
      });
    }

    const appointmentCode = generateAppointmentCode();

    // Create appointment instance
    const appointment = new Appointment({
      appointmentId: appointmentCode,
      patientId: req.user._id,
      doctorId,
      date,
      timeSlot,
      reason,
      status: 'scheduled',
      amount: doctor.consultationFee || 500,
      paymentStatus: 'cash-on-arrival',
      tokenNumber: 0, // Placeholder, updated atomically below
    });

    // Save appointment first to trigger MongoDB unique constraint protection
    await appointment.save();

    // Issue daily token from Queue service
    const { tokenNumber } = await issueTokenForAppointment({
      doctorId,
      dateStr: date,
      appointmentId: appointment._id,
      patientId: req.user._id,
      patientName: req.user.name,
      timeSlot,
    });

    appointment.tokenNumber = tokenNumber;
    await appointment.save();

    // Populate for response
    await appointment.populate([
      { path: 'doctorId', select: 'name specialization consultationFee clinicAddress hospitalAffiliation avatar' },
      { path: 'patientId', select: 'name email phone' },
    ]);

    res.status(201).json({
      success: true,
      message: `Appointment booked successfully! Your queue token is #${tokenNumber}.`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/my
// @access  Private (Patient)
export const getMyAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const query = { patientId: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }
    if (date) {
      query.date = date;
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name specialization consultationFee clinicAddress hospitalAffiliation avatar rating phone')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments for logged in doctor
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const { status, date, search } = req.query;
    const query = { doctorId: doctor._id };

    if (status && status !== 'All') {
      query.status = status;
    }
    if (date) {
      query.date = date;
    }

    let appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone gender bloodGroup dob address avatar')
      .sort({ date: 1, tokenNumber: 1 });

    if (search) {
      appointments = appointments.filter((apt) =>
        apt.patientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        apt.appointmentId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId', 'name specialization consultationFee clinicAddress hospitalAffiliation avatar phone bio')
      .populate('patientId', 'name email phone gender bloodGroup dob address avatar');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Permission check: only the patient, the doctor, or an admin can view
    const isPatient = appointment.patientId && appointment.patientId._id.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'doctor'; // doctor can view if assigned
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this appointment.',
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient/Doctor/Admin)
export const cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an appointment that has already been completed.',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is already cancelled.',
      });
    }

    // Permission check
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isDoctor = req.user.role === 'doctor';

    if (!isPatient && !isAdmin && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment.',
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason || `Cancelled by ${req.user.role} (${req.user.name})`;
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Ensure cancelled appointment is cleanly removed/marked in active queue
    await removeOrCancelToken(appointment.doctorId, appointment.date, appointment._id);

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully. The slot is now released.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule an appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (Patient/Admin)
export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { newDate, newTimeSlot, reason } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both newDate and newTimeSlot for rescheduling.',
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule an appointment that is already ${appointment.status}.`,
      });
    }

    // Check if new slot is free
    const conflict = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: newDate,
      timeSlot: newTimeSlot,
      status: { $nin: ['cancelled', 'rescheduled'] },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `The slot ${newTimeSlot} on ${newDate} is already booked. Please choose another slot.`,
      });
    }

    // Cancel old queue token
    await removeOrCancelToken(appointment.doctorId, appointment.date, appointment._id);

    const oldDate = appointment.date;
    const oldSlot = appointment.timeSlot;

    // Issue new token in new date's queue
    const patientUser = await User.findById(appointment.patientId);
    const { tokenNumber: newTokenNumber } = await issueTokenForAppointment({
      doctorId: appointment.doctorId,
      dateStr: newDate,
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      patientName: patientUser ? patientUser.name : 'Patient',
      timeSlot: newTimeSlot,
    });

    appointment.rescheduledFrom = { date: oldDate, timeSlot: oldSlot };
    appointment.date = newDate;
    appointment.timeSlot = newTimeSlot;
    appointment.tokenNumber = newTokenNumber;
    appointment.status = 'scheduled';
    if (reason) appointment.reason = reason;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment successfully rescheduled to ${newDate} at ${newTimeSlot}. New Token #${newTokenNumber}.`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consultation details (notes, diagnosis, prescription)
// @route   PUT /api/appointments/:id/consultation
// @access  Private (Doctor)
export const updateConsultationDetails = async (req, res, next) => {
  try {
    const { consultationNotes, diagnosis, prescription, vitals, status } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (consultationNotes !== undefined) appointment.consultationNotes = consultationNotes;
    if (diagnosis !== undefined) appointment.diagnosis = diagnosis;
    if (prescription !== undefined) appointment.prescription = prescription;
    if (vitals) appointment.vitals = { ...appointment.vitals, ...vitals };
    if (status) appointment.status = status;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Consultation notes and prescription saved successfully.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
