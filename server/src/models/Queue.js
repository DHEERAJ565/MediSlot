import mongoose from 'mongoose';

const activeTokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'called', 'in-consultation', 'completed', 'skipped', 'cancelled'],
      default: 'waiting',
    },
    calledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    skippedAt: {
      type: Date,
    },
  },
  { _id: true }
);

const queueSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    currentToken: {
      type: Number,
      default: 0,
    },
    totalTokensIssued: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['idle', 'in-progress', 'paused', 'completed'],
      default: 'idle',
    },
    activeTokens: [activeTokenSchema],
  },
  {
    timestamps: true,
  }
);

// Unique queue per doctor per date
queueSchema.index({ doctorId: 1, date: 1 }, { unique: true });

const Queue = mongoose.model('Queue', queueSchema);
export default Queue;
