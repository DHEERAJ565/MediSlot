import { z } from 'zod';

/**
 * ============================================================================
 * UNIT IV: Schema-Based Client-Side Form Validation using Zod
 * ============================================================================
 * These schemas demonstrate declarative validation rules, custom error messages,
 * regex matching, boundary constraints, and cross-field validation (e.g. password confirmation).
 */

// 1. Patient & Staff Authentication Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address (e.g., user@example.com)')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must contain at least 6 characters'),
});

// 2. Patient Registration Schema with Refinement for Password Matching
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(3, 'Name must be at least 3 characters long')
      .max(60, 'Name cannot exceed 60 characters')
      .regex(/^[a-zA-Z\s.]+$/, 'Name should only contain letters, spaces, and periods')
      .trim(),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please provide a valid email address')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(50, 'Password cannot exceed 50 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val),
        'Please enter a valid phone number (10 digits)'
      ),
    gender: z.enum(['male', 'female', 'other'], {
      errorMap: () => ({ message: 'Please select a valid gender option' }),
    }),
    dob: z.string().optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], {
      errorMap: () => ({ message: 'Please select a recognized blood group' }),
    }),
    address: z.string().max(200, 'Address cannot exceed 200 characters').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// 3. Appointment Booking Reservation Schema
export const appointmentBookingSchema = z.object({
  doctorId: z
    .string()
    .min(1, 'Valid doctor reference ID is required'),
  date: z
    .string()
    .min(1, 'Please select a consultation date')
    .refine((val) => {
      const today = new Date().toISOString().slice(0, 10);
      return val >= today;
    }, 'Appointment date cannot be in the past'),
  timeSlot: z
    .string()
    .min(1, 'Please select an available appointment time slot')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time slot must follow HH:MM format'),
  reason: z
    .string()
    .min(5, 'Please provide at least 5 characters describing your symptoms or visit reason')
    .max(500, 'Reason cannot exceed 500 characters')
    .trim(),
});

// 4. Clinical Consultation Completion & EHR Vitals Schema
export const consultationCompletionSchema = z.object({
  tokenNumber: z.number().int().positive('Token number must be a positive integer'),
  date: z.string().min(1, 'Date is required'),
  diagnosis: z
    .string()
    .min(3, 'Clinical diagnosis must be at least 3 characters (e.g., Acute Bronchitis)')
    .max(200, 'Diagnosis summary cannot exceed 200 characters')
    .trim(),
  consultationNotes: z
    .string()
    .min(5, 'Consultation notes must be at least 5 characters')
    .max(1000, 'Notes cannot exceed 1000 characters')
    .trim(),
  prescription: z
    .string()
    .min(3, 'Prescription details required (medication, dosage, and duration)')
    .trim(),
  vitals: z.object({
    bp: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{2,3}\/\d{2,3}$/.test(val), 'BP must be in format like 120/80'),
    pulse: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{2,3}$/.test(val), 'Pulse must be a valid number (e.g., 72)'),
    temp: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{2,3}(\.\d)?$/.test(val), 'Temperature in °F (e.g., 98.6)'),
    weight: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{1,3}(\.\d)?$/.test(val), 'Weight in kg (e.g., 70)'),
  }),
});

// 5. Doctor Weekly Availability Configuration Schema
export const doctorAvailabilitySchema = z.object({
  availableDays: z
    .array(z.string())
    .min(1, 'Doctor must be available on at least one day per week'),
  workingHours: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be HH:MM format'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be HH:MM format'),
  }).refine((hours) => hours.start < hours.end, {
    message: 'Clinic end time must be after start time',
    path: ['end'],
  }),
  slotDurationMinutes: z
    .number()
    .min(10, 'Slot duration must be at least 10 minutes')
    .max(60, 'Slot duration cannot exceed 60 minutes'),
  isAvailable: z.boolean(),
});
