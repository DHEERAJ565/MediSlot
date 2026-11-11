import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// @desc    Get all doctors with search, filters & pagination
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res, next) => {
  try {
    const {
      search,
      specialization,
      availability,
      minFee,
      maxFee,
      sortBy = 'rating',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isActive: true };

    // Search by name or specialization or bio
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospitalAffiliation: { $regex: search, $options: 'i' } },
        { 'clinicAddress.city': { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by specialization
    if (specialization && specialization !== 'All') {
      query.specialization = { $regex: new RegExp(`^${specialization}$`, 'i') };
    }

    // Filter by availability
    if (availability !== undefined && availability !== '') {
      query.isAvailable = availability === 'true' || availability === true;
    }

    // Filter by fee range
    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    // Sorting
    const sort = {};
    if (sortBy === 'experience') sort.experienceYears = order === 'asc' ? 1 : -1;
    else if (sortBy === 'fee') sort.consultationFee = order === 'asc' ? 1 : -1;
    else if (sortBy === 'name') sort.name = order === 'asc' ? 1 : -1;
    else sort.rating = order === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [doctors, total] = await Promise.all([
      Doctor.find(query).sort(sort).skip(skip).limit(limitNum),
      Doctor.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct specializations
// @route   GET /api/doctors/meta/specializations
// @access  Public
export const getSpecializations = async (req, res, next) => {
  try {
    const specializations = await Doctor.distinct('specialization', { isActive: true });
    res.status(200).json({
      success: true,
      specializations: specializations.sort(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile (for logged in doctor or admin)
// @route   PUT /api/doctors/:id
// @access  Private (Doctor/Admin)
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.',
      });
    }

    // Check authorization: doctor can only update their own profile, admin can update any
    if (req.user.role === 'doctor' && doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update another doctor\'s profile.',
      });
    }

    const {
      name,
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
      isAvailable,
      isActive,
      avatar,
      phone,
    } = req.body;

    if (name) doctor.name = name;
    if (specialization) doctor.specialization = specialization;
    if (qualifications) doctor.qualifications = qualifications;
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (clinicAddress) doctor.clinicAddress = { ...doctor.clinicAddress, ...clinicAddress };
    if (hospitalAffiliation) doctor.hospitalAffiliation = hospitalAffiliation;
    if (bio) doctor.bio = bio;
    if (availableDays) doctor.availableDays = availableDays;
    if (workingHours) doctor.workingHours = workingHours;
    if (slotDurationMinutes) doctor.slotDurationMinutes = slotDurationMinutes;
    if (isAvailable !== undefined) doctor.isAvailable = isAvailable;
    if (isActive !== undefined && req.user.role === 'admin') doctor.isActive = isActive;
    if (avatar) doctor.avatar = avatar;
    if (phone) doctor.phone = phone;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully.',
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patients associated with logged in doctor
// @route   GET /api/doctors/my/patients
// @access  Private (Doctor)
export const getDoctorPatients = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email phone gender bloodGroup dob address avatar')
      .sort({ createdAt: -1 });

    const patientMap = new Map();

    appointments.forEach((apt) => {
      if (!apt.patientId) return;
      const pid = apt.patientId._id.toString();
      if (!patientMap.has(pid)) {
        patientMap.set(pid, {
          patient: apt.patientId,
          totalAppointments: 1,
          latestAppointment: {
            id: apt._id,
            date: apt.date,
            timeSlot: apt.timeSlot,
            status: apt.status,
            reason: apt.reason,
          },
        });
      } else {
        const item = patientMap.get(pid);
        item.totalAppointments += 1;
      }
    });

    res.status(200).json({
      success: true,
      patients: Array.from(patientMap.values()),
    });
  } catch (error) {
    next(error);
  }
};
