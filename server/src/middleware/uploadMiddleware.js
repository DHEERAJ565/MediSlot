import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload destination for reports (private, non-public storage)
const reportsDir = path.join(__dirname, '../../uploads/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reportsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `report-${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Only accept PDF files
  const allowedMime = ['application/pdf'];
  const allowedExt = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only PDF documents are allowed for medical reports.'), false);
  }
};

const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5) * 1024 * 1024;

export const uploadReport = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
  },
  fileFilter,
});

export const reportsStorageDir = reportsDir;
