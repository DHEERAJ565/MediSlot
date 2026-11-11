import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema(
  {
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    reportType: {
      type: String,
      enum: ['Lab Test', 'Prescription', 'Radiology / X-Ray', 'Clinical Summary', 'Discharge Summary', 'Other'],
      default: 'Lab Test',
    },
    description: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    mimeType: {
      type: String,
      required: true,
      default: 'application/pdf',
    },
    fileSize: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
export default MedicalReport;
