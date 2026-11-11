import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` MediSlot API Server Running on Port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` REST API URL: http://localhost:${PORT}/api`);
    console.log(`=========================================`);
  });
});
