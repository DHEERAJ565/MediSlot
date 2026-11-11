import express from 'express';
import {
  getDoctorQueue,
  callNextPatient,
  skipToken,
  completeConsultation,
  getPatientTokenStatus,
  getClinicLiveQueues,
} from '../controllers/queueController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/all/live', getClinicLiveQueues);
router.get('/my-token-status', protect, authorize('patient'), getPatientTokenStatus);
router.get('/:doctorId', getDoctorQueue);
router.post('/call-next', protect, authorize('doctor'), callNextPatient);
router.post('/skip', protect, authorize('doctor'), skipToken);
router.post('/complete', protect, authorize('doctor'), completeConsultation);

export default router;
