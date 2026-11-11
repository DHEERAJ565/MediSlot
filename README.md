# MediSlot — Doctor Appointment & Clinic Queue Management System

MediSlot is a full-stack, enterprise-grade Doctor Appointment and Real-Time Clinic Queue Management System designed as a third-year Computer Science & Engineering (CSE) semester capstone project.

The system is built entirely with **React.js, Vite, Tailwind CSS, Node.js, Express.js, and MongoDB** (with strictly **no** Next.js or server components). It eliminates traditional clinic waiting room congestion through a daily sequential token allocation algorithm, dynamic time slot conflict prevention, role-based dashboards, and HIPAA-conscious protected medical report archiving.

---

## 🌟 Key System Capabilities

### 1. Multi-Role Clinical Architecture
- **Patient Portal**:
  - Search & filter certified specialists by clinical department, fee, and availability.
  - Interactive appointment booking with real-time slot conflict prevention.
  - Live queue tracker with current token being served, position ahead, and estimated wait times.
  - Cancellation & rescheduling with automatic token reallocation.
  - Medical records dashboard with one-click authorized PDF report downloads.
- **Doctor Consultation Workspace**:
  - Live Outpatient Clinic Queue Control Room with **Call Next Patient**, **Skip Token**, and **Complete Consultation** controls.
  - Integrated electronic health record (EHR) entry: Vitals (BP, pulse, temp, weight), Clinical Diagnosis, Consultation Notes, and Prescription.
  - Manage weekly consultation availability (active days, working hours, 15/20/30 min slot intervals).
  - Secure PDF diagnostic report upload linked to patient records.
  - Patient directory with appointment visit counts and clinical histories.
- **Executive Administration Dashboard**:
  - Real-time hospital metrics and interactive Recharts graphs (7-day booking volume, specialization distribution).
  - Doctor credentialing and roster management (register doctor, activate / suspend accounts).
  - Patient registry management with activity auditing and suspension controls.
  - Centralized appointment ledger with multi-criteria filters.
  - Clinic network queue monitor for all OPD chambers.
- **Clinic Lobby / Reception TV Display Board** (`/queue-display`):
  - Dedicated waiting room display with high-contrast token numbers, doctor rooms, and auto-refresh polling (every 6 seconds).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js 18, Vite 5, JavaScript (JSX), Tailwind CSS, React Router DOM v6, Axios, React Context API, Lucide React Icons, Recharts, React Hot Toast |
| **Backend** | Node.js, Express.js (ES Modules), MongoDB, Mongoose 8, JWT (JSON Web Tokens), bcryptjs, Multer (Controlled PDF storage), Morgan |
| **Diagnostics / PDF** | PDFKit (Dynamic clinical report generator) |
| **Testing** | Node.js Built-in Test Runner (`node:test`, `node:assert`) |

---

## 📂 Project Organization

```
react project/
├── medislot/
│   ├── client/                          # React.js + Vite Frontend
│   │   ├── src/
│   │   │   ├── api/                     # Axios client & request interceptors
│   │   │   ├── contexts/                # AuthContext (JWT, user state, roles)
│   │   │   ├── components/
│   │   │   │   ├── common/              # Navbar, Sidebar, Footer, Badge, Modal, EmptyState, Skeleton
│   │   │   │   ├── layouts/             # PublicLayout, DashboardLayout (Role-Protected)
│   │   │   │   └── doctor/              # DoctorCard
│   │   │   ├── pages/
│   │   │   │   ├── public/              # Home, Doctors, DoctorDetails, Login, Register, QueueDisplay, Unauthorized, NotFound
│   │   │   │   ├── patient/             # PatientDashboard, PatientAppointments, BookAppointment, BookingConfirmation, PatientTokens, PatientReports, PatientProfile
│   │   │   │   ├── doctor/              # DoctorDashboard, DoctorAppointments, DoctorQueue, DoctorAvailability, DoctorPatients, DoctorReports, DoctorProfile
│   │   │   │   └── admin/               # AdminDashboard, AdminDoctors, AdminPatients, AdminAppointments, AdminQueues
│   │   │   ├── App.jsx                  # Main routing matrix
│   │   │   ├── main.jsx                 # Entry point
│   │   │   └── index.css                # Tailwind directives & medical UI styles
│   │   ├── vite.config.js               # Dev server & proxy config
│   │   ├── tailwind.config.js           # Healthcare color scheme (brand blues, teals)
│   │   └── package.json
│   │
│   ├── server/                          # Express.js + MongoDB Backend
│   │   ├── src/
│   │   │   ├── config/                  # MongoDB database connection (db.js)
│   │   │   ├── models/                  # User, Doctor, Appointment, Queue, MedicalReport
│   │   │   ├── middleware/              # authMiddleware, roleMiddleware, uploadMiddleware, errorMiddleware
│   │   │   ├── controllers/             # auth, doctor, appointment, queue, report, admin controllers
│   │   │   ├── routes/                  # REST API endpoints
│   │   │   ├── services/                # slotService, queueService
│   │   │   ├── seeds/                   # seed.js (Comprehensive demo dataset)
│   │   │   ├── tests/                   # api.test.js (Backend integration tests)
│   │   │   ├── utils/                   # generateToken, generateSamplePdfs
│   │   │   ├── app.js                   # Express app setup & middleware
│   │   │   └── server.js                # HTTP listener
│   │   ├── uploads/
│   │   │   └── reports/                 # Private non-public storage for medical PDFs
│   │   ├── .env.example
│   │   ├── .env
│   │   └── package.json
│   │
│   └── README.md
├── package.json                         # Workspace root orchestrator
└── README.md
```

---

## 🔑 Demo Login Accounts

Pre-seeded demo credentials for college demonstration evaluation:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medislot.com` | `admin123` | Platform Administrator (Full system metrics & doctor management) |
| **Doctor** | `doctor@medislot.com` | `doctor123` | Dr. Rajesh Sharma (Senior Interventional Cardiologist) |
| **Patient** | `patient@medislot.com` | `patient123` | Rahul Verma (Active Token #2 in queue today with clinical reports) |

> 💡 **Quick-Fill Feature**: The login screen (`/login`) includes 1-click **Quick-Fill Buttons** for Patient, Doctor, and Admin to speed up viva demonstrations.

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Node.js** (v18.x or newer, verified on Node v24)
- **MongoDB** running locally on default port `27017` (e.g., `mongodb://127.0.0.1:27017/medislot_db`)

### Step 1: Install Dependencies
Open terminal in `react project/medislot`:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables
In `medislot/server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/medislot_db
JWT_SECRET=medislot_jwt_super_secret_key_2026_cse_project_secure_hash
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=5
```

### Step 3: Seed Database with Demo Records
Run the database seed script to generate 8 specialty doctors, fictional patients, active token queues, appointments, and generate authentic PDF medical reports:

```bash
cd server
npm run seed
```

### Step 4: Run the Backend & Frontend Servers

**Terminal 1 — Express Backend**:
```bash
cd server
npm run dev
# Running on http://localhost:5000/api
```

**Terminal 2 — React Vite Frontend**:
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

---

## 🧪 Automated Backend Tests

Run the built-in test suite covering authentication, slot calculations, doctor search, and queue integrity:

```bash
cd server
npm test
```

Test Results:
```text
✔ 1. Health check endpoint responds with online status
✔ 2. Public doctor listing returns seeded doctors
✔ 3. Doctor filter by specialization works
✔ 4. Patient login succeeds with valid credentials
✔ 5. Login fails with incorrect password
✔ 6. Doctor login returns doctor profile
✔ 7. Slot availability endpoint calculates working slots
✔ 8. Live queue endpoint returns clinic queues
ℹ tests 8, pass 8, fail 0
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new patient account.
- `POST /api/auth/login` — Login user (Patient, Doctor, Admin).
- `GET /api/auth/me` — Get authenticated user & doctor profile.
- `PUT /api/auth/profile` — Update user profile details.
- `PUT /api/auth/change-password` — Change password securely.

### Doctors (`/api/doctors`)
- `GET /api/doctors` — Search, filter by specialty/availability, pagination, and sorting.
- `GET /api/doctors/:id` — Single doctor details, working hours, and reviews.
- `GET /api/doctors/meta/specializations` — List distinct medical specialties.
- `PUT /api/doctors/:id` — Update doctor profile (Authorized Doctor / Admin).
- `GET /api/doctors/my/patients` — Doctor's patient list with visit history.

### Appointments (`/api/appointments`)
- `GET /api/appointments/slots/:doctorId?date=YYYY-MM-DD` — Dynamic available slot calculation.
- `POST /api/appointments` — Book appointment slot, enforce uniqueness, and issue daily queue token.
- `GET /api/appointments/my` — Patient's appointments.
- `GET /api/appointments/doctor` — Doctor's appointments roster.
- `GET /api/appointments/:id` — Single appointment details.
- `PUT /api/appointments/:id/cancel` — Cancel appointment and remove from active queue.
- `PUT /api/appointments/:id/reschedule` — Reschedule slot and allocate new daily token.
- `PUT /api/appointments/:id/consultation` — Save vitals, diagnosis, notes, and prescription.

### Clinic Queue Management (`/api/queue`)
- `GET /api/queue/:doctorId?date=YYYY-MM-DD` — Get daily queue summary for doctor.
- `POST /api/queue/call-next` — Doctor calls next waiting patient.
- `POST /api/queue/skip` — Doctor skips absent patient token.
- `POST /api/queue/complete` — Doctor marks consultation complete.
- `GET /api/queue/my-token-status` — Patient's current position and estimated wait time.
- `GET /api/queue/all/live` — Clinic-wide live queue telemetry for lobby reception TV board.

### Medical Reports (`/api/reports`)
- `POST /api/reports/upload` — Upload PDF report with Multer (Doctor / Admin).
- `GET /api/reports/my` — Get authenticated patient's reports.
- `GET /api/reports/doctor` — Get reports uploaded by doctor.
- `GET /api/reports/:id/download` — Stream protected PDF report with strict ownership authorization.
- `DELETE /api/reports/:id` — Remove report metadata and disk file.

### Admin Dashboard (`/api/admin`)
- `GET /api/admin/stats` — Platform metrics, 7-day trend, and specialization breakdown.
- `POST /api/admin/doctors` — Register new specialist doctor.
- `PUT /api/admin/doctors/:id/toggle-status` — Toggle doctor active / deactivated status.
- `GET /api/admin/patients` — All registered patients with appointment stats.
- `PUT /api/admin/patients/:id/toggle-status` — Suspend / activate patient account.
- `GET /api/admin/appointments` — Master appointments ledger with multi-criteria filters.

---

## 🔒 Security & Data Integrity Highlights

1. **Race Condition & Double-Booking Prevention**:
   MongoDB compound index on `{ doctorId: 1, date: 1, timeSlot: 1 }` with `partialFilterExpression: { status: { $nin: ['cancelled', 'rescheduled'] } }` guarantees that no two patients can claim the same slot concurrently, while released slots immediately become available.
2. **Sequential Daily Token Numbers**:
   Token numbers strictly reset to `1` each day per doctor, ensuring predictable clinic lobby reception queues.
3. **Private Non-Public File Storage**:
   Uploaded PDFs reside in a protected directory outside Express static paths (`uploads/reports/`). Files are accessible only through authenticated streams checking ownership permissions (`patientId === req.user._id` or assigned doctor or admin).
4. **Bcrypt & JWT Bearer Security**:
   Passwords are salted and hashed with bcrypt. JWTs are signed with a server secret and validated via Express authentication middleware. Roles are never trusted from the frontend.

---

## 🎓 Third-Year CSE Project Viva Q&A Guide

- **Q: How does the queue system prevent two patients from getting the same token?**
  *A:* Daily queues are maintained per doctor in MongoDB. Token allocation is atomic using sequential numbering (`totalTokensIssued + 1`) and verified against the database.
- **Q: How are cancelled slots handled?**
  *A:* When an appointment is cancelled, its token status in the daily queue becomes `'cancelled'`, so doctors never call absent patients. The unique database index ignores cancelled appointments, allowing other patients to book that released slot.
- **Q: Why are medical reports not stored in a public folder?**
  *A:* Medical data is protected by healthcare privacy standards. Reports are stored in a private directory and streamed through a protected endpoint that checks whether the requester is the patient, the doctor, or an admin.

---

## 📚 University Curriculum & Course Outcomes Mapping (CSE Syllabus 2026-27)

MediSlot is directly designed and implemented around the university Computer Science & Engineering (CSE) React & Full-Stack Web Development curriculum:

### 1. Refreshing Modern JavaScript (ES6+)
- **Arrow Functions**: Used ubiquitously across all functional components, event handlers, and array methods (e.g., `Doctors.jsx`, `AuthContext.jsx`).
- **Block-Scoped Variables (`let` & `const`)**: Strict elimination of `var`; `const` for immutability and component declarations; `let` scoped inside loop constructs and calculations.
- **Array Transformation Methods**: Extensive usage of `.map()`, `.filter()`, `.reduce()`, `.slice()`, `.find()`, and `.some()` for live search filtering, queue categorization, and slot calculations.
- **Destructuring Assignments**: Object and array destructuring in component props, hook returns (`const { user, login } = useAuth()`), route params (`const { id } = useParams()`), and schema validation payloads.
- **Spread & Rest Operators**: Immutable state updates (`setValues(prev => ({ ...prev, [name]: val }))`) and parameter forwarding.
- **ES Modules**: Standardized `import` and `export` across all client and server files with `"type": "module"`.
- **Immutability Principles & Copying**: Never mutating state in-place; using shallow spreading (`{ ...state }`) and structured cloning for complex medical vitals and queue states.
- **Referential Equality**: Understanding object identity in React re-render cycles, leveraged via `useCallback` and `useMemo`.

### 2. React Fundamentals & Tooling (Unit I)
- **Declarative UI Paradigm**: State $\to$ Virtual DOM mapping where the UI reflects state transitions without direct DOM manipulation.
- **Single Page Application (SPA)**: Smooth instantaneous transitions without full-page browser reloads via React Router DOM.
- **Vite Tooling & HMR**: Lightning-fast hot module replacement, ESBuild compilation, and production chunk generation.
- **Feature-Based Project Architecture**: Clean modular separation:
  `src/api`, `src/components`, `src/contexts`, `src/hooks`, `src/pages`, `src/store`, `src/validators`.
- **Virtual DOM & Reconciliation**: Unique stable keys (`key={doctor._id}`, `key={token.tokenNumber}`) to optimize Fiber reconciliation.

### 3. Component Design & Utility-First Styling (Unit II)
- **Props-Driven Reusability**: Component abstractions including `DoctorCard`, `Badge`, `Modal`, `EmptyState`, `FormField`, and `LoadingSkeleton`.
- **Composition Patterns**: Utilizing the `children` prop in `Modal`, `PublicLayout`, `DashboardLayout`, and `FormField`.
- **Conditional Rendering**: Short-circuit operators (`&&`), ternary checks (`condition ? <A /> : <B />`), and early returns for loading/error states.
- **Lifting State Up**: Managing filter criteria in `Doctors.jsx` and passing state downwards to presentational cards.
- **Tailwind CSS Architecture**: Utility-first styling with responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`), bespoke shadows (`shadow-soft`, `shadow-card`), and custom color tokens (`brand-600`, `medteal-600`).
- **Semantic HTML & Accessibility**: Semantic elements (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`, `<form>`), ARIA attributes (`aria-invalid`, `aria-describedby`, `role="alert"`).

### 4. States, Events, Hooks & Side Effects (Unit III)
- **Local State (`useState`)**: Handling input values, modal visibility, and active tabs with batching-safe updates.
- **Derived State**: Calculating active filter counts and remaining slots dynamically via `useMemo` without storing redundant state.
- **Built-in Hooks**: `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`, `useRef`.
- **Side Effects & Cleanup (`useEffect`)**: Polling intervals and event listeners cleaned up on unmount to prevent memory leaks (`clearInterval(intervalId)`).
- **Custom Hooks for Logic Reuse**:
  - `useDebounce.js`: Debouncing rapid keystrokes during live doctor directory search.
  - `useQueuePolling.js`: Encapsulating auto-sync queue telemetry side-effects and cleanup.
  - `useFormValidation.js`: Integrating controlled forms with client-side Zod schemas.

### 5. Form Handling & Zod Schema Validation (Unit IV & CO4)
- **Controlled Components**: Full control over form input values through React state.
- **Schema-Based Validation with Zod** (`src/validators/schemas.js`):
  - `loginSchema`: Email validation and min length.
  - `registerSchema`: Full name regex, cross-field password matching confirmation, phone regex, and blood group enums.
  - `appointmentBookingSchema`: Date boundary validation (non-past dates) and slot regex.
  - `consultationCompletionSchema`: Doctor diagnosis, prescription, and patient vitals.
- **Accessible Error Rendering**: Field errors rendered with `<div role="alert">` linked via `aria-describedby`.

### 6. Client-Server Communication & Client-Side Routing (Unit V & CO5)
- **RESTful Axios Communication**: Centralized HTTP client with error interceptors and Bearer token injection.
- **Loading, Error & Empty States**: Comprehensive declarative state handling across all views.
- **React Router DOM v6 Navigation**:
  - Dynamic route parameters (`/doctors/:id`, `/patient/book/:doctorId`).
  - URL Query parameters (`useSearchParams` for search keywords, dates, and slots).
  - Nested layout routes (`PublicLayout`, `DashboardLayout`).
  - Protected routes with server-validated role authorization (`allowedRoles={['patient']}`).
  - **Route-Based Code Splitting**: Using `React.lazy()` and `<Suspense fallback={<PageLoader />}>` to break application into separate on-demand production chunks.

### 7. Global State Management & Production Readiness (Unit VI & CO6)
- **Context API**: `AuthContext.jsx` for persistent user session, JWT management, and role-based permissions.
- **Zustand Store** (`src/store/useAppStore.js`): Lightweight selector-based global state for reception audio chimes, notification feeds, and clinic preferences.
- **State Selection Architecture**: Clear separation of Local State (`useState`), Global State (Context/Zustand), and Server State (Axios REST polling).
- **Production Build & Environment Config**: Multi-chunk optimization using Vite (`npm run build`), environment variables (`VITE_API_URL`), and zero lint/compile warnings.

---

## 👨‍💻 Project Developed For
**MediSlot — Doctor Appointment Management System**  
Third-Year Computer Science & Engineering (CSE) Semester Project Demonstration.
