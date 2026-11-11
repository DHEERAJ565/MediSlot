import Queue from '../models/Queue.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

/**
 * Get or create the Queue record for a doctor on a specific date
 */
export const getOrCreateDailyQueue = async (doctorId, dateStr) => {
  let queue = await Queue.findOne({ doctorId, date: dateStr });

  if (!queue) {
    queue = await Queue.create({
      doctorId,
      date: dateStr,
      currentToken: 0,
      totalTokensIssued: 0,
      status: 'idle',
      activeTokens: [],
    });
  }

  return queue;
};

/**
 * Allocate next token number for a doctor on a specific date
 * Returns { tokenNumber, queue }
 */
export const issueTokenForAppointment = async ({
  doctorId,
  dateStr,
  appointmentId,
  patientId,
  patientName,
  timeSlot,
}) => {
  // Use atomic findOneAndUpdate or fetch & push
  let queue = await getOrCreateDailyQueue(doctorId, dateStr);

  const nextTokenNumber = queue.totalTokensIssued + 1;

  queue.totalTokensIssued = nextTokenNumber;
  queue.activeTokens.push({
    tokenNumber: nextTokenNumber,
    appointmentId,
    patientId,
    patientName,
    timeSlot,
    status: 'waiting',
  });

  await queue.save();

  return {
    tokenNumber: nextTokenNumber,
    queue,
  };
};

/**
 * Mark token as cancelled when appointment is cancelled
 */
export const removeOrCancelToken = async (doctorId, dateStr, appointmentId) => {
  const queue = await Queue.findOne({ doctorId, date: dateStr });
  if (!queue) return null;

  const tokenEntry = queue.activeTokens.find(
    (t) => t.appointmentId.toString() === appointmentId.toString()
  );

  if (tokenEntry) {
    tokenEntry.status = 'cancelled';
    await queue.save();
  }

  return queue;
};

/**
 * Doctor calls the next patient in waiting queue
 */
export const callNextPatientInQueue = async (doctorId, dateStr) => {
  const queue = await getOrCreateDailyQueue(doctorId, dateStr);

  // If there's an ongoing consultation, we can check or mark as finished, but doctor can call next
  // Find next patient in waiting status
  const nextToken = queue.activeTokens.find((t) => t.status === 'waiting');

  if (!nextToken) {
    return {
      success: false,
      message: 'No waiting patients found in today\'s queue.',
      queue,
    };
  }

  nextToken.status = 'called';
  nextToken.calledAt = new Date();
  queue.currentToken = nextToken.tokenNumber;
  queue.status = 'in-progress';

  await queue.save();

  // Update appointment status to in-consultation
  await Appointment.findByIdAndUpdate(nextToken.appointmentId, {
    status: 'in-consultation',
  });

  return {
    success: true,
    message: `Token #${nextToken.tokenNumber} (${nextToken.patientName}) called for consultation.`,
    calledToken: nextToken,
    queue,
  };
};

/**
 * Doctor skips the current or specified token
 */
export const skipPatientToken = async (doctorId, dateStr, tokenNumber) => {
  const queue = await getOrCreateDailyQueue(doctorId, dateStr);

  const tokenEntry = queue.activeTokens.find((t) => t.tokenNumber === Number(tokenNumber));

  if (!tokenEntry) {
    return { success: false, message: `Token #${tokenNumber} not found in queue.` };
  }

  tokenEntry.status = 'skipped';
  tokenEntry.skippedAt = new Date();

  await queue.save();

  await Appointment.findByIdAndUpdate(tokenEntry.appointmentId, {
    status: 'skipped',
  });

  return {
    success: true,
    message: `Token #${tokenNumber} marked as skipped.`,
    token: tokenEntry,
    queue,
  };
};

/**
 * Doctor marks consultation complete and saves notes
 */
export const completePatientConsultation = async ({
  doctorId,
  dateStr,
  tokenNumber,
  consultationNotes,
  diagnosis,
  prescription,
  vitals,
}) => {
  const queue = await getOrCreateDailyQueue(doctorId, dateStr);

  const tokenEntry = queue.activeTokens.find((t) => t.tokenNumber === Number(tokenNumber));

  if (!tokenEntry) {
    return { success: false, message: `Token #${tokenNumber} not found in queue.` };
  }

  tokenEntry.status = 'completed';
  tokenEntry.completedAt = new Date();

  // Check if all tokens are processed
  const remainingWaiting = queue.activeTokens.filter((t) => t.status === 'waiting' || t.status === 'called');
  if (remainingWaiting.length === 0) {
    queue.status = 'completed';
  }

  await queue.save();

  // Update appointment
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    tokenEntry.appointmentId,
    {
      status: 'completed',
      consultationNotes: consultationNotes || '',
      diagnosis: diagnosis || '',
      prescription: prescription || '',
      vitals: vitals || {},
    },
    { new: true }
  );

  return {
    success: true,
    message: `Consultation for Token #${tokenNumber} completed successfully.`,
    appointment: updatedAppointment,
    queue,
  };
};

/**
 * Calculate full queue summary for live display / dashboard
 */
export const getQueueSummary = async (doctorId, dateStr) => {
  const doctor = await Doctor.findById(doctorId).select('name specialization avatar consultationFee clinicAddress slotDurationMinutes isAvailable');
  if (!doctor) {
    return null;
  }

  const queue = await getOrCreateDailyQueue(doctorId, dateStr);

  const waitingTokens = queue.activeTokens.filter((t) => t.status === 'waiting');
  const calledToken = queue.activeTokens.find((t) => t.status === 'called');
  const nextToken = waitingTokens.length > 0 ? waitingTokens[0] : null;
  const completedCount = queue.activeTokens.filter((t) => t.status === 'completed').length;
  const skippedCount = queue.activeTokens.filter((t) => t.status === 'skipped').length;
  const slotDuration = doctor.slotDurationMinutes || 15;

  return {
    doctor,
    date: dateStr,
    queueStatus: queue.status,
    currentToken: queue.currentToken,
    currentPatient: calledToken || null,
    nextPatient: nextToken || null,
    totalTokensIssued: queue.totalTokensIssued,
    waitingCount: waitingTokens.length,
    completedCount,
    skippedCount,
    approxWaitMinutes: waitingTokens.length * slotDuration,
    activeTokens: queue.activeTokens,
  };
};
