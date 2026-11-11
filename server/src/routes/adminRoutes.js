import express from 'express';
import {
  getAdminStats,
  createDoctor,
  toggleDoctorStatus,
  getAdminPatients,
  togglePatientStatus,
  getAdminAppointments,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.post('/doctors', createDoctor);
router.put('/doctors/:id/toggle-status', toggleDoctorStatus);
router.get('/patients', getAdminPatients);
router.put('/patients/:id/toggle-status', togglePatientStatus);
router.get('/appointments', getAdminAppointments);

export default router;
