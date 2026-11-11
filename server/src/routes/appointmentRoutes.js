import express from 'express';
import {
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  updateConsultationDetails,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/slots/:doctorId', getAvailableSlots);
router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/my', protect, authorize('patient'), getMyAppointments);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/reschedule', protect, authorize('patient', 'admin'), rescheduleAppointment);
router.put('/:id/consultation', protect, authorize('doctor'), updateConsultationDetails);

export default router;
