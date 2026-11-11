import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD for fast, timezone-safe querying
      required: [true, 'Appointment date is required'],
      index: true,
    },
    timeSlot: {
      type: String, // e.g., "09:20 AM"
      required: [true, 'Time slot is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for consultation is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-queue', 'in-consultation', 'completed', 'cancelled', 'rescheduled', 'skipped'],
      default: 'scheduled',
      index: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
      index: true,
    },
    consultationNotes: {
      type: String,
      default: '',
    },
    diagnosis: {
      type: String,
      default: '',
    },
    prescription: {
      type: String,
      default: '',
    },
    vitals: {
      bp: { type: String, default: '' },
      pulse: { type: String, default: '' },
      temp: { type: String, default: '' },
      weight: { type: String, default: '' },
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
    rescheduledFrom: {
      date: String,
      timeSlot: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cash-on-arrival'],
      default: 'cash-on-arrival',
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double-booking race conditions:
// Ensure doctor, date, and timeSlot are strictly unique for active appointments
appointmentSchema.index(
  { doctorId: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ['cancelled', 'rescheduled'] },
    },
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
