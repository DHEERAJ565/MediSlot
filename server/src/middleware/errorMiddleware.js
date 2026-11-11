export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`[Error Handler] ${err.name || 'Error'}: ${err.message}`);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    let field = Object.keys(err.keyValue || {})[0] || 'field';
    // If double booking conflict
    if (err.keyPattern && err.keyPattern.doctorId && err.keyPattern.date && err.keyPattern.timeSlot) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has just been booked by another patient. Please select another time slot.',
      });
    }
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxMb = process.env.MAX_FILE_SIZE_MB || 5;
      return res.status(400).json({
        success: false,
        message: `File size exceeds the limit of ${maxMb}MB. Please upload a smaller PDF document.`,
      });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  // JSON Web Token errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid authorization token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Authorization token expired. Please log in again.' });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error. Please try again later.',
  });
};
