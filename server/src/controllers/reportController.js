import path from 'path';
import fs from 'fs';
import MedicalReport from '../models/MedicalReport.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { reportsStorageDir } from '../middleware/uploadMiddleware.js';

// @desc    Upload a new medical report for a patient
// @route   POST /api/reports/upload
// @access  Private (Doctor / Admin)
export const uploadMedicalReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid PDF report file to upload.',
      });
    }

    const { patientId, appointmentId, title, reportType, description, notes } = req.body;

    if (!patientId || !title) {
      // Remove uploaded file if validation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide patientId and report title.',
      });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    let doctorId;
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
      }
      doctorId = doctor._id;
    } else if (req.user.role === 'admin') {
      doctorId = req.body.doctorId;
      if (!doctorId) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Admin must specify doctorId.' });
      }
    }

    const report = await MedicalReport.create({
      patientId,
      doctorId,
      appointmentId: appointmentId || null,
      title,
      reportType: reportType || 'Lab Test',
      description: description || '',
      notes: notes || '',
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadDate: new Date(),
    });

    await report.populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', select: 'name specialization avatar' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Medical report uploaded securely and linked to patient records.',
      report,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get patient's authorized medical reports
// @route   GET /api/reports/my
// @access  Private (Patient)
export const getMyReports = async (req, res, next) => {
  try {
    const reports = await MedicalReport.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization hospitalAffiliation avatar')
      .populate('appointmentId', 'appointmentId date timeSlot reason diagnosis')
      .sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports uploaded by logged in doctor or for doctor's patient
// @route   GET /api/reports/doctor
// @access  Private (Doctor)
export const getDoctorReports = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const { patientId } = req.query;
    const query = { doctorId: doctor._id };
    if (patientId) {
      query.patientId = patientId;
    }

    const reports = await MedicalReport.find(query)
      .populate('patientId', 'name email phone gender dob bloodGroup')
      .populate('appointmentId', 'appointmentId date timeSlot reason')
      .sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download authorized medical report PDF
// @route   GET /api/reports/:id/download
// @access  Private (Authorized Patient, Doctor, Admin)
export const downloadReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found.',
      });
    }

    // Role-based security check:
    let isAuthorized = false;

    if (req.user.role === 'admin') {
      isAuthorized = true;
    } else if (req.user.role === 'patient') {
      isAuthorized = report.patientId.toString() === req.user._id.toString();
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor && report.doctorId.toString() === doctor._id.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to view or download this medical report.',
      });
    }

    const filePath = path.join(reportsStorageDir, report.fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical report file is missing on server storage.',
      });
    }

    // Send file securely with headers
    res.setHeader('Content-Type', report.mimeType || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(report.originalFileName)}"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medical report
// @route   DELETE /api/reports/:id
// @access  Private (Doctor / Admin)
export const deleteReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Medical report not found.' });
    }

    // Check authorization
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || report.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this report.' });
      }
    }

    // Remove file from disk
    const filePath = path.join(reportsStorageDir, report.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await MedicalReport.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Medical report deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
