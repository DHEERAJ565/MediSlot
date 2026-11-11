import Doctor from '../models/Doctor.js';
import Queue from '../models/Queue.js';
import Appointment from '../models/Appointment.js';
import {
  getQueueSummary,
  callNextPatientInQueue,
  skipPatientToken,
  completePatientConsultation,
  getOrCreateDailyQueue,
} from '../services/queueService.js';

// @desc    Get queue summary for a doctor on a specific date (Defaults to today)
// @route   GET /api/queue/:doctorId
// @access  Public (Used by doctor, patient, reception TV)
export const getDoctorQueue = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);

    const summary = await getQueueSummary(doctorId, dateStr);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    res.status(200).json({
      success: true,
      ...summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Doctor calls next patient in queue
// @route   POST /api/queue/call-next
// @access  Private (Doctor)
export const callNextPatient = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const dateStr = req.body.date || new Date().toISOString().slice(0, 10);

    const result = await callNextPatientInQueue(doctor._id, dateStr);

    if (!result.success) {
      return res.status(400).json(result);
    }

    const summary = await getQueueSummary(doctor._id, dateStr);

    res.status(200).json({
      success: true,
      message: result.message,
      calledToken: result.calledToken,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Doctor skips a token in queue
// @route   POST /api/queue/skip
// @access  Private (Doctor)
export const skipToken = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const { tokenNumber, date } = req.body;
    if (!tokenNumber) {
      return res.status(400).json({ success: false, message: 'Please provide tokenNumber to skip.' });
    }

    const dateStr = date || new Date().toISOString().slice(0, 10);
    const result = await skipPatientToken(doctor._id, dateStr, tokenNumber);

    if (!result.success) {
      return res.status(400).json(result);
    }

    const summary = await getQueueSummary(doctor._id, dateStr);

    res.status(200).json({
      success: true,
      message: result.message,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Doctor completes consultation for token
// @route   POST /api/queue/complete
// @access  Private (Doctor)
export const completeConsultation = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const { tokenNumber, date, consultationNotes, diagnosis, prescription, vitals } = req.body;
    if (!tokenNumber) {
      return res.status(400).json({ success: false, message: 'Please provide tokenNumber to complete.' });
    }

    const dateStr = date || new Date().toISOString().slice(0, 10);
    const result = await completePatientConsultation({
      doctorId: doctor._id,
      dateStr,
      tokenNumber,
      consultationNotes,
      diagnosis,
      prescription,
      vitals,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    const summary = await getQueueSummary(doctor._id, dateStr);

    res.status(200).json({
      success: true,
      message: result.message,
      appointment: result.appointment,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient's active token & position in queue
// @route   GET /api/queue/my-token-status
// @access  Private (Patient)
export const getPatientTokenStatus = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);

    // Find patient's appointment for today (or upcoming)
    const appointments = await Appointment.find({
      patientId: req.user._id,
      status: { $in: ['scheduled', 'in-queue', 'in-consultation'] },
    })
      .populate('doctorId', 'name specialization consultationFee clinicAddress hospitalAffiliation avatar slotDurationMinutes')
      .sort({ date: 1, tokenNumber: 1 });

    const tokenStatuses = [];

    for (const apt of appointments) {
      const queue = await Queue.findOne({ doctorId: apt.doctorId._id, date: apt.date });
      let currentToken = queue ? queue.currentToken : 0;
      let totalTokens = queue ? queue.totalTokensIssued : 0;
      let waitingAhead = 0;

      if (queue) {
        // Count tokens before this patient that are still waiting
        waitingAhead = queue.activeTokens.filter(
          (t) => t.status === 'waiting' && t.tokenNumber < apt.tokenNumber
        ).length;
      }

      const slotDuration = apt.doctorId.slotDurationMinutes || 15;

      tokenStatuses.push({
        appointmentId: apt._id,
        appointmentCode: apt.appointmentId,
        doctor: apt.doctorId,
        date: apt.date,
        timeSlot: apt.timeSlot,
        myTokenNumber: apt.tokenNumber,
        currentTokenBeingServed: currentToken,
        waitingAhead,
        approxWaitMinutes: waitingAhead * slotDuration,
        status: apt.status,
      });
    }

    res.status(200).json({
      success: true,
      tokens: tokenStatuses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all clinic active queues (for clinic reception lobby TV / admin)
// @route   GET /api/queue/all/live
// @access  Public
export const getClinicLiveQueues = async (req, res, next) => {
  try {
    const todayStr = req.query.date || new Date().toISOString().slice(0, 10);

    const doctors = await Doctor.find({ isActive: true }).select(
      'name specialization avatar clinicAddress slotDurationMinutes'
    );

    const liveQueues = [];

    for (const doc of doctors) {
      const summary = await getQueueSummary(doc._id, todayStr);
      if (summary) {
        liveQueues.push(summary);
      }
    }

    res.status(200).json({
      success: true,
      date: todayStr,
      queues: liveQueues,
    });
  } catch (error) {
    next(error);
  }
};
