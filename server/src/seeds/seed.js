import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Queue from '../models/Queue.js';
import MedicalReport from '../models/MedicalReport.js';
import { createPdfReport } from '../utils/generateSamplePdfs.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medislot_db';

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected.');

    // Clear existing collections
    console.log('[Seed] Cleaning existing data...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Appointment.deleteMany({}),
      Queue.deleteMany({}),
      MedicalReport.deleteMany({}),
    ]);

    console.log('[Seed] Creating Users...');

    // 1. Admin User
    const adminUser = await User.create({
      name: 'Dr. Arthur Harris (Chief Admin)',
      email: 'admin@medislot.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 00001',
      gender: 'male',
      address: 'MediSlot Admin Headquarters, Healthcare Tech Park, Suite 500',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    });

    // 2. Demo Patients
    const patientRahul = await User.create({
      name: 'Rahul Verma',
      email: 'patient@medislot.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 98200 11223',
      gender: 'male',
      dob: new Date('1995-04-12'),
      bloodGroup: 'B+',
      address: 'Flat 402, Sunshine Heights, Mumbai',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    });

    const patientSneha = await User.create({
      name: 'Sneha Roy',
      email: 'sneha@medislot.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 98200 44556',
      gender: 'female',
      dob: new Date('1998-09-22'),
      bloodGroup: 'O+',
      address: '22 Park Street, Kolkata',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    });

    const patientAmit = await User.create({
      name: 'Amit Joshi',
      email: 'amit@medislot.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 98200 77889',
      gender: 'male',
      dob: new Date('1990-11-05'),
      bloodGroup: 'A+',
      address: '77 Deccan Gymkhana, Pune',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=400',
    });

    const patientAnanya = await User.create({
      name: 'Ananya Gupta',
      email: 'ananya@medislot.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 98200 99001',
      gender: 'female',
      dob: new Date('2001-02-17'),
      bloodGroup: 'AB+',
      address: '14 Vasant Kunj, New Delhi',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    });

    const patientVikas = await User.create({
      name: 'Vikas Reddy',
      email: 'vikas@medislot.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 98200 33445',
      gender: 'male',
      dob: new Date('1987-07-30'),
      bloodGroup: 'O-',
      address: '88 Jubilee Hills, Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    });

    // 3. Doctors List (8 Fictional Doctors across various specializations)
    console.log('[Seed] Creating Doctors and Doctor user accounts...');

    const doctorsRaw = [
      {
        user: {
          name: 'Dr. Rajesh Sharma',
          email: 'doctor@medislot.com', // Primary demo doctor login
          password: 'doctor123',
          role: 'doctor',
          phone: '+91 98111 22334',
          gender: 'male',
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
        },
        profile: {
          specialization: 'Cardiology',
          qualifications: ['MBBS', 'MD - General Medicine', 'DM - Cardiology (AIIMS)', 'FACC (USA)'],
          experienceYears: 16,
          consultationFee: 800,
          clinicAddress: {
            name: 'HeartCare Center of Excellence',
            street: '4th Floor, Metro Medical Plaza',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400001',
          },
          hospitalAffiliation: 'Lilavati Hospital & Asian Heart Institute',
          bio: 'Senior Consultant Interventional Cardiologist specializing in preventive cardiology, coronary artery disease management, hypertension, and advanced cardiac diagnostics.',
          rating: 4.9,
          reviewCount: 230,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          workingHours: { start: '09:00', end: '16:00' },
          slotDurationMinutes: 20,
          isAvailable: true,
          isActive: true,
        },
      },
      {
        user: {
          name: 'Dr. Priya Nair',
          email: 'priya.nair@medislot.com',
          password: 'doctor123',
          role: 'doctor',
          phone: '+91 98111 33445',
          gender: 'female',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        },
        profile: {
          specialization: 'Dermatology',
          qualifications: ['MBBS', 'MD - Dermatology, Venereology & Leprosy', 'Fellow in Dermato-Surgery'],
          experienceYears: 10,
          consultationFee: 650,
          clinicAddress: {
            name: 'DermaGlow Skin & Laser Clinic',
            street: '12 Linking Road, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400050',
          },
          hospitalAffiliation: 'Hinduja Healthcare Surgical',
          bio: 'Renowned clinical and cosmetic dermatologist specializing in chronic dermatoses, acne scar resurfacing, laser aesthetics, and pediatric dermatology.',
          rating: 4.8,
          reviewCount: 185,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: { start: '10:00', end: '18:00' },
          slotDurationMinutes: 20,
          isAvailable: true,
          isActive: true,
        },
      },
      {
        user: {
          name: 'Dr. Anita Desai',
          email: 'anita.desai@medislot.com',
          password: 'doctor123',
          role: 'doctor',
          phone: '+91 98111 44556',
          gender: 'female',
          avatar: 'https://images.unsplash.com/photo-1594824813560-63951fcf5499?auto=format&fit=crop&q=80&w=400',
        },
        profile: {
          specialization: 'Pediatrics',
          qualifications: ['MBBS', 'DCH', 'MD - Pediatrics', 'IAP Fellowship in Neonatology'],
          experienceYears: 12,
          consultationFee: 500,
          clinicAddress: {
            name: 'Little Stars Children Clinic',
            street: 'Block C, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            zip: '560038',
          },
          hospitalAffiliation: 'Rainbow Children’s Hospital',
          bio: 'Compassionate pediatrician focusing on childhood immunization, neonatal critical care, adolescent growth milestones, and pediatric nutritional counseling.',
          rating: 4.9,
          reviewCount: 310,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          workingHours: { start: '09:00', end: '15:00' },
          slotDurationMinutes: 15,
          isAvailable: true,
          isActive: true,
        },
      },
      {
        user: {
          name: 'Dr. Vikram Malhotra',
          email: 'vikram.malhotra@medislot.com',
          password: 'doctor123',
          role: 'doctor',
          phone: '+91 98111 55667',
          gender: 'male',
          avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
        },
        profile: {
          specialization: 'Orthopedics',
          qualifications: ['MBBS', 'MS - Orthopaedics (PGI Chandigarh)', 'MCh Ortho (UK)'],
          experienceYears: 15,
          consultationFee: 900,
          clinicAddress: {
            name: 'Joint & Spine Mobility Center',
            street: '45 Connaught Place, Central Wing',
            city: 'New Delhi',
            state: 'Delhi',
            zip: '110001',
          },
          hospitalAffiliation: 'Max Super Speciality Hospital',
          bio: 'Orthopedic surgeon with extensive international expertise in computer-assisted total knee/hip replacement, sports ligament reconstructions, and spine disc rehabilitation.',
          rating: 4.7,
          reviewCount: 142,
          availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
          workingHours: { start: '10:00', end: '17:00' },
          slotDurationMinutes: 30,
          isAvailable: true,
          isActive: true,
        },
      },
      {
        user: {
          name: 'Dr. Sanjay Verma',
          email: 'sanjay.verma@medislot.com',
          password: 'doctor123',
          role: 'doctor',
          phone: '+91 98111 66778',
          gender: 'male',
          avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
        },
        profile: {
          specialization: 'Neurology',
          qualifications: ['MBBS', 'MD - Medicine', 'DM - Neurology (NIMHANS)'],
          experienceYears: 18,
          consultationFee: 1200,
          clinicAddress: {
            name: 'NeuroCare Brain & Spine Clinic',
            street: 'Apex Towers, SG Highway',
            city: 'Ahmedabad',
            state: 'Gujarat',
            zip: '380015',
          },
          hospitalAffiliation: 'Apollo Hospitals Ahmedabad',
          bio: 'Senior Neurologist with 18+ years of dedicated service in diagnosing complex stroke syndromes, epilepsy disorders, migraine headaches, and Parkinson’s management.',
          rating: 4.9,
          reviewCount: 98,
          availableDays: ['Tuesday', 'Thursday', 'Saturday'],
          workingHours: { start: '11:00', end: '18:00' },
          slotDurationMinutes: 30,
          isAvailable: true,
          isActive: true,
        },
      },
      {
        user: {
          name: 'Dr. Sunita Kulkarni',
          email: 'sunita.kulkarni@medislot.com',
          password: 'doctor123',
          role: 'doctor',
          phone: '+91 98111 77889',
          gender: 'female',
          avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400',
        },
        profile: {
          specialization: 'Gynecology & Obstetrics',
          qualifications: ['MBBS', 'MS - Obstetrics & Gynecology', 'FICOG', 'Dip. Laparoscopy (Germany)'],
          experienceYears: 13,
          consultationFee: 700,
          clinicAddress: {
            name: 'MatruCare Women’s Wellness Center',
            street: '18 FC Road, Shivajinagar',
            city: 'Pune',
            state: 'Maharashtra',
            zip: '411005',
          },
          hospitalAffiliation: 'Sahyadri Specialty Hospitals',
          bio: 'Dedicated obstetrician and minimally invasive laparoscopic gynecologist providing holistic maternal care, high-risk pregnancy monitoring, and fertility guidance.',
          rating: 4.8,
          reviewCount: 215,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: { start: '09:30', end: '16:30' },
          slotDurationMinutes: 20,
          isAvailable: true,
          isActive: true,
        },
      },
      {
        user: {
          name: 'Dr. Arvind Patel',
          email: 'arvind.patel@medislot.com',
          password: 'doctor123',
          role: 'doctor',
          phone: '+91 98111 88990',
          gender: 'male',
          avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
        },
        profile: {
          specialization: 'General Medicine',
          qualifications: ['MBBS', 'MD - Internal Medicine'],
          experienceYears: 8,
          consultationFee: 450,
          clinicAddress: {
            name: 'Patel Wellness Polyclinic',
            street: '102 City Center, Station Road',
            city: 'Surat',
            state: 'Gujarat',
            zip: '395003',
          },
          hospitalAffiliation: 'Sunshine Global Hospital',
          bio: 'Primary care physician treating common acute and chronic lifestyle illnesses including Type 2 diabetes, viral fevers, seasonal allergies, and metabolic disorders.',
          rating: 4.7,
          reviewCount: 175,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          workingHours: { start: '08:30', end: '14:30' },
          slotDurationMinutes: 15,
          isAvailable: true,
          isActive: true,
        },
      },
      {
        user: {
          name: 'Dr. Meera Nambiar',
          email: 'meera.nambiar@medislot.com',
          password: 'doctor123',
          role: 'doctor',
          phone: '+91 98111 99001',
          gender: 'female',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        },
        profile: {
          specialization: 'Oncology',
          qualifications: ['MBBS', 'MD - Radiotherapy', 'DM - Medical Oncology (Tata Memorial Hospital)'],
          experienceYears: 17,
          consultationFee: 1500,
          clinicAddress: {
            name: 'Hope Comprehensive Cancer Care',
            street: '7 Anna Salai, Guindy',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zip: '600032',
          },
          hospitalAffiliation: 'Cancer Institute (WIA) & Gleneagles Global Health City',
          bio: 'Senior Medical Oncologist specializing in targeted immunotherapy, solid organ tumor staging, palliative oncology support, and genetic cancer risk counseling.',
          rating: 4.9,
          reviewCount: 88,
          availableDays: ['Monday', 'Wednesday', 'Friday'],
          workingHours: { start: '10:00', end: '16:00' },
          slotDurationMinutes: 30,
          isAvailable: true,
          isActive: true,
        },
      },
    ];

    const createdDoctors = [];
    for (const item of doctorsRaw) {
      const userDoc = await User.create(item.user);
      const doctorDoc = await Doctor.create({
        ...item.profile,
        userId: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        avatar: userDoc.avatar,
      });
      createdDoctors.push({ user: userDoc, doctor: doctorDoc });
    }

    const docRajesh = createdDoctors[0].doctor;
    const docPriya = createdDoctors[1].doctor;
    const docAnita = createdDoctors[2].doctor;
    const docVikram = createdDoctors[3].doctor;

    // Today's date string
    const todayStr = new Date().toISOString().slice(0, 10);
    // Tomorrow's date string
    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = tomorrowObj.toISOString().slice(0, 10);
    // 2 days later
    const dayAfterObj = new Date();
    dayAfterObj.setDate(dayAfterObj.getDate() + 2);
    const dayAfterStr = dayAfterObj.toISOString().slice(0, 10);

    // Yesterday's date string
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = yesterdayObj.toISOString().slice(0, 10);

    console.log('[Seed] Generating Appointments & Clinic Queues...');

    // 1. Appointments for Dr. Rajesh Sharma (Today)
    // Token 1: Vikas Reddy - Completed
    const apt1 = await Appointment.create({
      appointmentId: 'MS-20261028-1001',
      patientId: patientVikas._id,
      doctorId: docRajesh._id,
      date: todayStr,
      timeSlot: '09:00 AM',
      reason: 'Routine post-angioplasty review and BP checkup',
      status: 'completed',
      tokenNumber: 1,
      diagnosis: 'Stable post-PCI condition; Grade 1 essential hypertension well-controlled.',
      consultationNotes: 'Patient reports no chest tightness or exertional dyspnea. Exercise tolerance is normal.',
      prescription: 'Tab. Telmisartan 40mg once daily in morning. Tab. Ecosprin 75mg post lunch.',
      vitals: { bp: '124/82 mmHg', pulse: '72 bpm', temp: '98.4 F', weight: '74 kg' },
      amount: docRajesh.consultationFee,
      paymentStatus: 'paid',
    });

    // Token 2: Rahul Verma (Our main demo patient) - In Consultation / Called!
    const apt2 = await Appointment.create({
      appointmentId: 'MS-20261028-1002',
      patientId: patientRahul._id,
      doctorId: docRajesh._id,
      date: todayStr,
      timeSlot: '09:20 AM',
      reason: 'Palpitations after mild aerobic workout and intermittent dizziness',
      status: 'in-consultation',
      tokenNumber: 2,
      vitals: { bp: '138/88 mmHg', pulse: '86 bpm', temp: '98.6 F', weight: '68 kg' },
      amount: docRajesh.consultationFee,
      paymentStatus: 'cash-on-arrival',
    });

    // Token 3: Sneha Roy - Waiting
    const apt3 = await Appointment.create({
      appointmentId: 'MS-20261028-1003',
      patientId: patientSneha._id,
      doctorId: docRajesh._id,
      date: todayStr,
      timeSlot: '09:40 AM',
      reason: 'Periodic cholesterol and lipid profile review consultation',
      status: 'scheduled',
      tokenNumber: 3,
      amount: docRajesh.consultationFee,
      paymentStatus: 'cash-on-arrival',
    });

    // Token 4: Amit Joshi - Waiting
    const apt4 = await Appointment.create({
      appointmentId: 'MS-20261028-1004',
      patientId: patientAmit._id,
      doctorId: docRajesh._id,
      date: todayStr,
      timeSlot: '10:00 AM',
      reason: 'Follow-up for familial hypercholesterolemia management',
      status: 'scheduled',
      tokenNumber: 4,
      amount: docRajesh.consultationFee,
      paymentStatus: 'cash-on-arrival',
    });

    // Token 5: Ananya Gupta - Waiting
    const apt5 = await Appointment.create({
      appointmentId: 'MS-20261028-1005',
      patientId: patientAnanya._id,
      doctorId: docRajesh._id,
      date: todayStr,
      timeSlot: '10:20 AM',
      reason: 'Family history of coronary disease evaluation and baseline ECG screening',
      status: 'scheduled',
      tokenNumber: 5,
      amount: docRajesh.consultationFee,
      paymentStatus: 'cash-on-arrival',
    });

    // Create Queue for Dr. Rajesh Sharma (Today)
    await Queue.create({
      doctorId: docRajesh._id,
      date: todayStr,
      currentToken: 2,
      totalTokensIssued: 5,
      status: 'in-progress',
      activeTokens: [
        {
          tokenNumber: 1,
          appointmentId: apt1._id,
          patientId: patientVikas._id,
          patientName: patientVikas.name,
          timeSlot: '09:00 AM',
          status: 'completed',
          calledAt: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 1800000),
        },
        {
          tokenNumber: 2,
          appointmentId: apt2._id,
          patientId: patientRahul._id,
          patientName: patientRahul.name,
          timeSlot: '09:20 AM',
          status: 'called',
          calledAt: new Date(Date.now() - 600000),
        },
        {
          tokenNumber: 3,
          appointmentId: apt3._id,
          patientId: patientSneha._id,
          patientName: patientSneha.name,
          timeSlot: '09:40 AM',
          status: 'waiting',
        },
        {
          tokenNumber: 4,
          appointmentId: apt4._id,
          patientId: patientAmit._id,
          patientName: patientAmit.name,
          timeSlot: '10:00 AM',
          status: 'waiting',
        },
        {
          tokenNumber: 5,
          appointmentId: apt5._id,
          patientId: patientAnanya._id,
          patientName: patientAnanya.name,
          timeSlot: '10:20 AM',
          status: 'waiting',
        },
      ],
    });

    // 2. Upcoming appointments for demo patient Rahul
    const aptRahulTomorrow = await Appointment.create({
      appointmentId: 'MS-20261029-2001',
      patientId: patientRahul._id,
      doctorId: docPriya._id,
      date: tomorrowStr,
      timeSlot: '10:40 AM',
      reason: 'Severe contact dermatitis rash on forearm and allergic patch testing',
      status: 'scheduled',
      tokenNumber: 1,
      amount: docPriya.consultationFee,
      paymentStatus: 'cash-on-arrival',
    });

    await Queue.create({
      doctorId: docPriya._id,
      date: tomorrowStr,
      currentToken: 0,
      totalTokensIssued: 1,
      status: 'idle',
      activeTokens: [
        {
          tokenNumber: 1,
          appointmentId: aptRahulTomorrow._id,
          patientId: patientRahul._id,
          patientName: patientRahul.name,
          timeSlot: '10:40 AM',
          status: 'waiting',
        },
      ],
    });

    // 3. Past Completed Appointment for Rahul (Yesterday) with Dr. Anita Desai
    const aptRahulPast = await Appointment.create({
      appointmentId: 'MS-20261027-3001',
      patientId: patientRahul._id,
      doctorId: docAnita._id,
      date: yesterdayStr,
      timeSlot: '11:00 AM',
      reason: 'Seasonal viral influenza, mild fever and sore throat checkup',
      status: 'completed',
      tokenNumber: 4,
      diagnosis: 'Acute Upper Respiratory Tract Infection (URTI)',
      consultationNotes: 'Bilateral tonsillar congestion noted. Chest clear on auscultation. Hydration advised.',
      prescription: 'Tab. Paracetamol 650mg SOS. Azithromycin 500mg once daily for 3 days. Warm saline gargles.',
      vitals: { bp: '120/80 mmHg', pulse: '78 bpm', temp: '99.2 F', weight: '68 kg' },
      amount: docAnita.consultationFee,
      paymentStatus: 'paid',
    });

    // Generate Real Sample PDF Reports in server/uploads/reports
    console.log('[Seed] Generating valid Medical Report PDF files with PDFKit...');

    // Report 1: Rahul's Cardiac Lipid & ECG Panel
    const report1Filename = `report-Lipid_ECG_Panel-${Date.now()}-101.pdf`;
    await createPdfReport(
      report1Filename,
      'Comprehensive Lipid Profile & 12-Lead Resting ECG',
      patientRahul.name,
      docRajesh.name,
      todayStr,
      {
        findings:
          '12-Lead ECG demonstrates normal sinus rhythm with heart rate of 74 bpm. No pathological ST-T changes or Q waves. PR and QTc intervals within physiological limits.',
        parameters: [
          { name: 'Total Cholesterol', value: '185 mg/dL', refRange: '125 - 200 mg/dL' },
          { name: 'HDL (Good Cholesterol)', value: '48 mg/dL', refRange: '> 40 mg/dL' },
          { name: 'LDL (Bad Cholesterol)', value: '110 mg/dL', refRange: '< 100 mg/dL (Borderline)' },
          { name: 'Triglycerides', value: '135 mg/dL', refRange: '< 150 mg/dL' },
          { name: 'Resting Heart Rate', value: '74 bpm', refRange: '60 - 100 bpm' },
        ],
        advice:
          'Maintain low-sodium Mediterranean diet. Aerobic exercise 30 minutes daily 5 times a week. Repeat lipid panel in 6 months.',
      }
    );

    await MedicalReport.create({
      patientId: patientRahul._id,
      doctorId: docRajesh._id,
      appointmentId: apt2._id,
      title: 'Comprehensive Lipid Profile & 12-Lead ECG',
      reportType: 'Lab Test',
      description: 'Baseline cardio-metabolic evaluation and resting electrical conduction profiling.',
      fileName: report1Filename,
      originalFileName: 'Lipid_Profile_ECG_Report_RahulVerma.pdf',
      mimeType: 'application/pdf',
      fileSize: 42500,
      uploadDate: new Date(),
      notes: 'Reviewed and certified by Dr. Rajesh Sharma. Advised to reduce refined carbohydrates.',
    });

    // Report 2: Rahul's Complete Blood Count (CBC) from Dr. Anita
    const report2Filename = `report-CBC_Influenza_Panel-${Date.now()}-102.pdf`;
    await createPdfReport(
      report2Filename,
      'Automated Complete Blood Count (CBC) & ESR',
      patientRahul.name,
      docAnita.name,
      yesterdayStr,
      {
        findings:
          'Mild reactive leukocytosis consistent with acute viral upper respiratory infection. Platelet count and red cell indices are preserved.',
        parameters: [
          { name: 'Hemoglobin (Hb)', value: '14.8 g/dL', refRange: '13.5 - 17.5 g/dL' },
          { name: 'Total Leukocyte Count (WBC)', value: '9,400 /cu.mm', refRange: '4,000 - 11,000 /cu.mm' },
          { name: 'Platelet Count', value: '2.6 Lakhs /cu.mm', refRange: '1.5 - 4.5 Lakhs' },
          { name: 'Erythrocyte Sedimentation Rate (ESR)', value: '14 mm/1st hr', refRange: '0 - 15 mm/1st hr' },
        ],
        advice:
          'Ensure oral hydration with electrolyte soups. Complete 3-day course of prescribed medication.',
      }
    );

    await MedicalReport.create({
      patientId: patientRahul._id,
      doctorId: docAnita._id,
      appointmentId: aptRahulPast._id,
      title: 'Automated Complete Blood Count (CBC)',
      reportType: 'Lab Test',
      description: 'Hematology panel for viral infection differential diagnosis.',
      fileName: report2Filename,
      originalFileName: 'CBC_Report_RahulVerma.pdf',
      mimeType: 'application/pdf',
      fileSize: 39800,
      uploadDate: new Date(Date.now() - 86400000),
      notes: 'Normal hemoglobin and platelets. No signs of bacterial superinfection.',
    });

    // Report 3: Sneha Roy's Dermatology Skin Allergy Test
    const report3Filename = `report-Skin_Allergy_Panel-${Date.now()}-103.pdf`;
    await createPdfReport(
      report3Filename,
      'Skin Prick Allergen Screening Panel',
      patientSneha.name,
      docPriya.name,
      yesterdayStr,
      {
        findings:
          'Positive wheal-and-flare reaction observed towards dermatophagoides pteronyssinus (house dust mite). No systemic anaphylaxis.',
        parameters: [
          { name: 'Dust Mite Extract', value: 'Positive (++++)', refRange: 'Negative' },
          { name: 'Grass Pollen Mix', value: 'Negative', refRange: 'Negative' },
          { name: 'Animal Dander', value: 'Negative', refRange: 'Negative' },
        ],
        advice: 'Use hypoallergenic mattress protectors. Avoid woolens directly against the dermis.',
      }
    );

    await MedicalReport.create({
      patientId: patientSneha._id,
      doctorId: docPriya._id,
      title: 'Skin Prick Allergen Screening Panel',
      reportType: 'Lab Test',
      description: 'Comprehensive 20-allergen sensitivity mapping.',
      fileName: report3Filename,
      originalFileName: 'Allergy_Panel_SnehaRoy.pdf',
      mimeType: 'application/pdf',
      fileSize: 41200,
      uploadDate: new Date(Date.now() - 86400000),
      notes: 'Reviewed by Dr. Priya Nair.',
    });

    console.log('====================================================');
    console.log(' [MediSlot Seed Script Completed Successfully!]');
    console.log('====================================================');
    console.log(' Demo Accounts Created:');
    console.log(' ----------------------------------------------------');
    console.log(' 1. ADMIN:');
    console.log('    Email:    admin@medislot.com');
    console.log('    Password: admin123');
    console.log(' ----------------------------------------------------');
    console.log(' 2. DOCTOR (Cardiologist):');
    console.log('    Email:    doctor@medislot.com');
    console.log('    Password: doctor123');
    console.log(' ----------------------------------------------------');
    console.log(' 3. PATIENT (Rahul Verma):');
    console.log('    Email:    patient@medislot.com');
    console.log('    Password: patient123');
    console.log(' ----------------------------------------------------');
    console.log(` Seeded: 8 Doctors, 5 Patients, 8 Appointments, Queues & 3 Valid PDF Reports.`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during database seeding:', error);
    process.exit(1);
  }
};

seedData();
