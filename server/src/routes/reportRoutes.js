import express from 'express';
import {
  uploadMedicalReport,
  getMyReports,
  getDoctorReports,
  downloadReport,
  deleteReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { uploadReport } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post(
  '/upload',
  protect,
  authorize('doctor', 'admin'),
  uploadReport.single('reportFile'),
  uploadMedicalReport
);
router.get('/my', protect, authorize('patient'), getMyReports);
router.get('/doctor', protect, authorize('doctor'), getDoctorReports);
router.get('/:id/download', protect, downloadReport);
router.delete('/:id', protect, authorize('doctor', 'admin'), deleteReport);

export default router;
