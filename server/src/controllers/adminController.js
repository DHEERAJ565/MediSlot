import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Queue from '../models/Queue.js';
import MedicalReport from '../models/MedicalReport.js';

// @desc    Get Admin Dashboard Stats & Metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);

    const [
      totalDoctors,
      activeDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      totalReports,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Doctor.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: todayStr }),
      MedicalReport.countDocuments(),
    ]);

    // Status distribution
    const statusCounts = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap = {
      scheduled: 0,
      'in-queue': 0,
      'in-consultation': 0,
      completed: 0,
      cancelled: 0,
      rescheduled: 0,
      skipped: 0,
    };
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    // Specialization breakdown
    const specializationStats = await Doctor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Last 7 days appointment trend for chart
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past7Days.push(d.toISOString().slice(0, 10));
    }

    const dailyTrend = await Promise.all(
      past7Days.map(async (day) => {
        const total = await Appointment.countDocuments({ date: day });
        const completed = await Appointment.countDocuments({ date: day, status: 'completed' });
        const cancelled = await Appointment.countDocuments({ date: day, status: 'cancelled' });
        // Format label (e.g. "Mon, Oct 26")
        const dateObj = new Date(`${day}T00:00:00`);
        const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return {
          date: day,
          label,
          total,
          completed,
          cancelled,
        };
      })
    );

    // Recent 5 appointments
    const recentAppointments = await Appointment.find()
      .populate('patientId', 'name email phone avatar')
      .populate('doctorId', 'name specialization avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalDoctors,
        activeDoctors,
        totalPatients,
        totalAppointments,
        todayAppointments,
        totalReports,
        statusMap,
        specializationStats,
        dailyTrend,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new Doctor (User + Doctor record)
// @route   POST /api/admin/doctors
// @access  Private (Admin)
export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      clinicAddress,
      hospitalAffiliation,
      bio,
      availableDays,
      workingHours,
      slotDurationMinutes,
      avatar,
    } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and specialization are required.',
      });
    }

    // Check if email taken
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Create Doctor User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'doctor',
      phone: phone || '',
      avatar: avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}`,
    });

    // Create Doctor Profile
    const doctor = await Doctor.create({
      userId: user._id,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      avatar: user.avatar,
      specialization,
      qualifications: qualifications || ['MBBS'],
      experienceYears: experienceYears || 3,
      consultationFee: consultationFee || 500,
      clinicAddress: clinicAddress || {
        name: 'MediSlot Specialty Clinic',
        street: 'Suite 204, Healthcare Boulevard',
        city: 'Metro City',
        state: 'State',
        zip: '100001',
      },
      hospitalAffiliation: hospitalAffiliation || 'Apollo / Fortis Partner Network',
      bio: bio || 'Dedicated healthcare specialist committed to patient wellness.',
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: workingHours || { start: '09:00', end: '17:00' },
      slotDurationMinutes: slotDurationMinutes || 20,
      isAvailable: true,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: `Doctor ${doctor.name} registered successfully.`,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle doctor active/inactive status
// @route   PUT /api/admin/doctors/:id/toggle-status
// @access  Private (Admin)
export const toggleDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    doctor.isActive = !doctor.isActive;
    await doctor.save();

    // Also update User account status
    await User.findByIdAndUpdate(doctor.userId, { isActive: doctor.isActive });

    res.status(200).json({
      success: true,
      message: `Doctor ${doctor.name} is now ${doctor.isActive ? 'Active' : 'Deactivated'}.`,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients with appointment count & details
// @route   GET /api/admin/patients
// @access  Private (Admin)
export const getAdminPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { role: 'patient' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await User.find(query).sort({ createdAt: -1 });

    const patientsWithStats = await Promise.all(
      patients.map(async (p) => {
        const appointmentCount = await Appointment.countDocuments({ patientId: p._id });
        const lastAppointment = await Appointment.findOne({ patientId: p._id })
          .populate('doctorId', 'name specialization')
          .sort({ date: -1 });

        return {
          ...p.toObject(),
          appointmentCount,
          lastAppointment,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: patientsWithStats.length,
      patients: patientsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle patient active/inactive status
// @route   PUT /api/admin/patients/:id/toggle-status
// @access  Private (Admin)
export const togglePatientStatus = async (req, res, next) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    patient.isActive = !patient.isActive;
    await patient.save();

    res.status(200).json({
      success: true,
      message: `Patient ${patient.name} is now ${patient.isActive ? 'Active' : 'Deactivated'}.`,
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/admin/appointments
// @access  Private (Admin)
export const getAdminAppointments = async (req, res, next) => {
  try {
    const { status, date, doctorId, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') query.status = status;
    if (date) query.date = date;
    if (doctorId && doctorId !== 'All') query.doctorId = doctorId;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    let appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone avatar')
      .populate('doctorId', 'name specialization avatar consultationFee')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Appointment.countDocuments(query);

    if (search) {
      appointments = appointments.filter(
        (apt) =>
          apt.patientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          apt.doctorId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          apt.appointmentId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};
