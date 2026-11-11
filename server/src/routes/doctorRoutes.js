import express from 'express';
import {
  getDoctors,
  getDoctorById,
  getSpecializations,
  updateDoctorProfile,
  getDoctorPatients,
} from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/meta/specializations', getSpecializations);
router.get('/my/patients', protect, authorize('doctor'), getDoctorPatients);
router.get('/:id', getDoctorById);
router.put('/:id', protect, authorize('doctor', 'admin'), updateDoctorProfile);

export default router;
