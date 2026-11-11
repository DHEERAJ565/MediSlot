import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Doctor email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true,
    },
    qualifications: {
      type: [String],
      default: ['MBBS'],
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      default: 1,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative'],
      default: 500,
    },
    clinicAddress: {
      name: { type: String, default: 'MediSlot Specialty Clinic' },
      street: { type: String, default: 'Suite 204, Healthcare Boulevard' },
      city: { type: String, default: 'Metro City' },
      state: { type: String, default: 'State' },
      zip: { type: String, default: '100001' },
    },
    hospitalAffiliation: {
      type: String,
      default: 'Apollo / Fortis Partner Network',
    },
    bio: {
      type: String,
      default: 'Dedicated healthcare specialist committed to patient wellness and evidenced-based care.',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 48,
    },
    availableDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    workingHours: {
      start: { type: String, default: '09:00' }, // 24hr format HH:mm
      end: { type: String, default: '17:00' },
    },
    slotDurationMinutes: {
      type: Number,
      default: 20,
      min: 10,
      max: 60,
    },
    maxPatientsPerDay: {
      type: Number,
      default: 30,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for name, specialization and clinic search
doctorSchema.index({ name: 'text', specialization: 'text', bio: 'text' });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
