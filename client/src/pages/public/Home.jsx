// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import api from '../../api/axiosClient';
// import DoctorCard from '../../components/doctor/DoctorCard';
// import { CardSkeleton } from '../../components/common/LoadingSkeleton';
// import {
//   Search,
//   CalendarDays,
//   Clock3,
//   ShieldCheck,
//   ArrowRight,
//   ArrowUpRight,
//   CheckCircle2,
//   Stethoscope,
//   ChevronRight,
//   HeartPulse,
//   Brain,
//   Baby,
//   Bone,
//   Sparkles,
//   Activity,
//   CalendarCheck,
//   ClipboardList,
//   MoveRight,
//   Heart,
//   Plus,
//   ScanHeart,
//   ShieldPlus,
//   Smartphone,
// } from 'lucide-react';

// const departmentList = [
//   { name: 'Cardiology', label: 'Cardiology', icon: HeartPulse, detail: 'Heart & circulation', tint: 'rose' },
//   { name: 'Dermatology', label: 'Dermatology', icon: Sparkles, detail: 'Skin & wellness', tint: 'violet' },
//   { name: 'Pediatrics', label: 'Pediatrics', icon: Baby, detail: 'Care for little ones', tint: 'amber' },
//   { name: 'Orthopedics', label: 'Orthopedics', icon: Bone, detail: 'Bones & mobility', tint: 'sky' },
//   { name: 'Neurology', label: 'Neurology', icon: Brain, detail: 'Brain & nerves', tint: 'indigo' },
//   { name: 'General Medicine', label: 'General care', icon: Stethoscope, detail: 'Everyday healthcare', tint: 'teal' },
// ];

// const Home = () => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedSpecialty, setSelectedSpecialty] = useState('All');
//   const [featuredDoctors, setFeaturedDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let active = true;
//     const fetchDoctors = async () => {
//       try {
//         const { data } = await api.get('/doctors?limit=4');
//         if (active && data.success) setFeaturedDoctors(data.doctors || []);
//       } catch (err) {
//         console.error('Error fetching featured doctors:', err);
//       } finally {
//         if (active) setLoading(false);
//       }
//     };
//     fetchDoctors();
//     return () => { active = false; };
//   }, []);

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     const params = new URLSearchParams();
//     if (searchQuery.trim()) params.append('search', searchQuery.trim());
//     if (selectedSpecialty !== 'All') params.append('specialization', selectedSpecialty);
//     navigate(`/doctors?${params.toString()}`);
//   };

//   return (
//     <div className="home-page">
//       {/* HERO */}
//       <section className="hero-shell">
//         <div className="hero-orb hero-orb-one" />
//         <div className="hero-orb hero-orb-two" />
//         <div className="hero-grid-pattern" />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hero-inner">
//           <div className="hero-copy">
//             <div className="hero-eyebrow">
//               <span className="hero-eyebrow-pulse"><Activity className="w-3.5 h-3.5" /></span>
//               <span>YOUR HEALTH, IN BETTER HANDS</span>
//               <span className="hero-eyebrow-line" />
//             </div>
//             <h1>
//               Better care starts with <span className="hero-heading-accent">a simpler</span> appointment.
//             </h1>
//             <p className="hero-description">
//               Discover trusted specialists, reserve a time that works for you, and follow your clinic queue — all from one calm, connected space.
//             </p>

//             <form onSubmit={handleSearchSubmit} className="hero-search-card">
//               <div className="hero-search-main">
//                 <div className="hero-search-icon"><Search className="w-5 h-5" /></div>
//                 <div className="min-w-0 flex-1">
//                   <label htmlFor="doctor-search" className="hero-search-label">Find your specialist</label>
//                   <input
//                     id="doctor-search"
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Doctor name, condition or specialty"
//                     className="hero-search-input"
//                   />
//                 </div>
//               </div>
//               <div className="hero-search-divider" />
//               <div className="hero-specialty-wrap">
//                 <label htmlFor="specialty-select" className="hero-search-label">Department</label>
//                 <select
//                   id="specialty-select"
//                   value={selectedSpecialty}
//                   onChange={(e) => setSelectedSpecialty(e.target.value)}
//                   className="hero-specialty-select"
//                 >
//                   <option value="All">All specialties</option>
//                   {departmentList.map((department) => (
//                     <option key={department.name} value={department.name}>{department.name}</option>
//                   ))}
//                 </select>
//               </div>
//               <button type="submit" className="hero-search-button">
//                 Find doctors <ArrowRight className="w-4 h-4" />
//               </button>
//             </form>

//             <div className="hero-assurances">
//               <span><CheckCircle2 className="w-4 h-4" /> Verified doctor profiles</span>
//               <span><CheckCircle2 className="w-4 h-4" /> Live queue updates</span>
//               <span><CheckCircle2 className="w-4 h-4" /> Private health records</span>
//             </div>
//             <div className="hero-quick-links">
//               <span>Explore:</span>
//               <Link to="/doctors">Find a doctor <ArrowUpRight className="w-3 h-3" /></Link>
//               <Link to="/queue-display">Clinic queue <ArrowUpRight className="w-3 h-3" /></Link>
//             </div>
//           </div>

//           {/* Product-inspired visual: illustrative preview, not live appointment data */}
//           <div className="hero-visual" aria-label="Illustration of the MediSlot appointment experience">
//             <div className="hero-visual-glow" />
//             <div className="visual-orbit visual-orbit-a" />
//             <div className="visual-orbit visual-orbit-b" />
//             <div className="visual-plus visual-plus-a"><Plus className="w-5 h-5" /></div>
//             <div className="visual-plus visual-plus-b"><Plus className="w-4 h-4" /></div>
//             <div className="visual-main-card">
//               <div className="visual-card-topline">
//                 <div className="visual-brand-mark"><Activity className="w-4 h-4" /></div>
//                 <div>
//                   <p className="visual-mini-title">MediSlot care</p>
//                   <p className="visual-mini-subtitle">Your health, organized</p>
//                 </div>
//                 <span className="visual-live-pill"><span /> PREVIEW</span>
//               </div>
//               <div className="visual-greeting">
//                 <p className="visual-muted">YOUR NEXT STEP</p>
//                 <h2>Care that fits<br />your day.</h2>
//                 <p>Appointments and queue details, together.</p>
//               </div>
//               <div className="visual-appointment-card">
//                 <div className="visual-doctor-avatar"><Stethoscope className="w-6 h-6" /></div>
//                 <div className="flex-1 min-w-0">
//                   <p className="visual-muted">SPECIALIST VISIT</p>
//                   <h3>Consultation</h3>
//                   <p>Choose a doctor and a time</p>
//                 </div>
//                 <span className="visual-check"><CheckCircle2 className="w-4 h-4" /></span>
//               </div>
//               <div className="visual-card-bottom">
//                 <div className="visual-bottom-icon"><Clock3 className="w-4 h-4" /></div>
//                 <div className="flex-1">
//                   <p className="visual-bottom-title">Queue updates</p>
//                   <p className="visual-bottom-copy">Know when it is your turn</p>
//                 </div>
//                 <ArrowUpRight className="w-4 h-4 text-teal-600" />
//               </div>
//               <div className="visual-card-progress"><span /></div>
//             </div>
//             <div className="floating-note floating-note-top">
//               <div className="floating-note-icon mint"><CalendarCheck className="w-4 h-4" /></div>
//               <div><strong>Easy booking</strong><span>Pick a convenient slot</span></div>
//             </div>
//             <div className="floating-note floating-note-bottom">
//               <div className="floating-note-icon peach"><Heart className="w-4 h-4" /></div>
//               <div><strong>Care comes first</strong><span>One connected experience</span></div>
//             </div>
//             <div className="visual-roundel"><ScanHeart className="w-7 h-7" /><span>CARE<br />CONNECTED</span></div>
//           </div>
//         </div>
//         <div className="hero-bottom-wave" />
//       </section>

//       {/* BENEFIT STRIP */}
//       <section className="benefit-strip-wrap max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="benefit-strip">
//           <div className="benefit-item">
//             <div className="benefit-icon"><CalendarDays className="w-5 h-5" /></div>
//             <div><h3>Simple scheduling</h3><p>Book without the back-and-forth</p></div>
//           </div>
//           <div className="benefit-separator" />
//           <div className="benefit-item">
//             <div className="benefit-icon teal"><Clock3 className="w-5 h-5" /></div>
//             <div><h3>Queue visibility</h3><p>Follow your token in real time</p></div>
//           </div>
//           <div className="benefit-separator" />
//           <div className="benefit-item">
//             <div className="benefit-icon violet"><ShieldCheck className="w-5 h-5" /></div>
//             <div><h3>One secure space</h3><p>Keep your records organized</p></div>
//           </div>
//         </div>
//       </section>

//       {/* SPECIALTIES */}
//       <section className="section-block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="section-heading-row">
//           <div>
//             <span className="section-kicker">CARE, YOUR WAY</span>
//             <h2>Find the right kind<br className="hidden sm:block" /> of specialist.</h2>
//             <p>Start with a department and discover care tailored to your needs.</p>
//           </div>
//           <Link to="/doctors" className="section-link">Explore all doctors <ArrowUpRight className="w-4 h-4" /></Link>
//         </div>
//         <div className="specialty-grid">
//           {departmentList.map((department, index) => {
//             const Icon = department.icon;
//             return (
//               <Link
//                 key={department.name}
//                 to={`/doctors?specialization=${encodeURIComponent(department.name)}`}
//                 className={`specialty-card specialty-${department.tint}`}
//               >
//                 <div className="specialty-card-top"><span className="specialty-number">0{index + 1}</span><ArrowUpRight className="w-4 h-4 specialty-arrow" /></div>
//                 <div className="specialty-icon"><Icon className="w-6 h-6" /></div>
//                 <h3>{department.label}</h3>
//                 <p>{department.detail}</p>
//               </Link>
//             );
//           })}
//         </div>
//       </section>

//       {/* FEATURED DOCTORS */}
//       <section className="doctors-showcase">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-block">
//           <div className="section-heading-row">
//             <div>
//               <span className="section-kicker">MEET YOUR CARE TEAM</span>
//               <h2>Specialists who put<br className="hidden sm:block" /> your wellbeing first.</h2>
//               <p>Explore doctor profiles and find a consultation that works for you.</p>
//             </div>
//             <Link to="/doctors" className="section-link">View doctor directory <ArrowUpRight className="w-4 h-4" /></Link>
//           </div>
//           {loading ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
//           ) : featuredDoctors.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
//               {featuredDoctors.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} />)}
//             </div>
//           ) : (
//             <div className="doctor-empty-panel">
//               <div className="doctor-empty-icon"><Stethoscope className="w-6 h-6" /></div>
//               <h3>Doctor profiles are being prepared</h3>
//               <p>Explore the directory to check available specialists.</p>
//               <Link to="/doctors" className="section-link">Open doctor directory <ArrowRight className="w-4 h-4" /></Link>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* HOW IT WORKS */}
//       <section className="section-block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="workflow-panel">
//           <div className="workflow-intro">
//             <span className="section-kicker">A CLEARER JOURNEY</span>
//             <h2>Three steps.<br />More peace of mind.</h2>
//             <p>From finding a specialist to arriving at the clinic, keep each step in one place.</p>
//             <Link to="/doctors" className="workflow-cta">Get started <MoveRight className="w-4 h-4" /></Link>
//             <div className="workflow-shield"><ShieldPlus className="w-7 h-7" /><span>Thoughtful care<br />starts here</span></div>
//           </div>
//           <div className="workflow-steps">
//             <div className="workflow-step">
//               <div className="workflow-step-index">01</div>
//               <div className="workflow-step-icon"><Search className="w-5 h-5" /></div>
//               <div><h3>Discover a doctor</h3><p>Explore verified doctor profiles, specialties, consultation fees and available slots.</p></div>
//               <span className="workflow-step-line" />
//             </div>
//             <div className="workflow-step">
//               <div className="workflow-step-index">02</div>
//               <div className="workflow-step-icon"><CalendarCheck className="w-5 h-5" /></div>
//               <div><h3>Reserve your visit</h3><p>Choose a suitable appointment time and receive your booking details.</p></div>
//               <span className="workflow-step-line" />
//             </div>
//             <div className="workflow-step">
//               <div className="workflow-step-index">03</div>
//               <div className="workflow-step-icon"><ClipboardList className="w-5 h-5" /></div>
//               <div><h3>Follow your queue</h3><p>Check your token status and stay informed as the clinic queue moves.</p></div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* QUEUE FEATURE CTA */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
//         <div className="queue-feature-card">
//           <div className="queue-feature-art"><div className="queue-art-circle"><Smartphone className="w-10 h-10" /></div><span className="queue-art-dot dot-one" /><span className="queue-art-dot dot-two" /><span className="queue-art-dot dot-three" /></div>
//           <div className="queue-feature-content">
//             <span className="queue-feature-kicker">LESS GUESSWORK. MORE CLARITY.</span>
//             <h2>Your turn, without<br className="hidden sm:block" /> the uncertainty.</h2>
//             <p>Use the live reception display to follow clinic token progress and help make waiting more predictable.</p>
//             <Link to="/queue-display" className="queue-feature-button">Explore live queue <ArrowUpRight className="w-4 h-4" /></Link>
//           </div>
//           <div className="queue-feature-watermark"><Activity className="w-44 h-44" /></div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../../api/axiosClient';
import DoctorCard from '../../components/doctor/DoctorCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

import {
  Search,
  CalendarDays,
  Clock3,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Brain,
  Baby,
  Bone,
  Sparkles,
  Activity,
  CalendarCheck,
  ClipboardList,
  MoveRight,
  Heart,
  ScanHeart,
  ShieldPlus,
  Smartphone,
  Play,
  CircleCheck,
} from 'lucide-react';

// ========================================
// DEPARTMENT DATA
// ========================================

const departmentList = [
  {
    name: 'Cardiology',
    label: 'Cardiology',
    icon: HeartPulse,
    detail: 'Heart & circulation',
    tint: 'rose',
  },
  {
    name: 'Dermatology',
    label: 'Dermatology',
    icon: Sparkles,
    detail: 'Skin & wellness',
    tint: 'violet',
  },
  {
    name: 'Pediatrics',
    label: 'Pediatrics',
    icon: Baby,
    detail: 'Care for little ones',
    tint: 'amber',
  },
  {
    name: 'Orthopedics',
    label: 'Orthopedics',
    icon: Bone,
    detail: 'Bones & mobility',
    tint: 'sky',
  },
  {
    name: 'Neurology',
    label: 'Neurology',
    icon: Brain,
    detail: 'Brain & nerves',
    tint: 'indigo',
  },
  {
    name: 'General Medicine',
    label: 'General care',
    icon: Stethoscope,
    detail: 'Everyday healthcare',
    tint: 'teal',
  },
];

// ========================================
// HOME COMPONENT
// ========================================

const Home = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========================================
  // FETCH FEATURED DOCTORS
  // ========================================

  useEffect(() => {
    let active = true;

    const fetchDoctors = async () => {
      try {
        const { data } = await api.get('/doctors?limit=4');

        if (active && data.success) {
          setFeaturedDoctors(data.doctors || []);
        }
      } catch (error) {
        console.error('Error fetching featured doctors:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDoctors();

    return () => {
      active = false;
    };
  }, []);

  // ========================================
  // DOCTOR SEARCH
  // ========================================

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    if (selectedSpecialty !== 'All') {
      params.append('specialization', selectedSpecialty);
    }

    navigate(`/doctors?${params.toString()}`);
  };

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="home-page">

      {/* ==================================
          CINEMATIC VIDEO HERO SECTION
      ================================== */}

      <section className="cinematic-hero">

        {/* Background Video */}

        <video
          className="hero-background-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source
            src="/videos/medical-hero.mp4"
            type="video/mp4"
          />

          Your browser does not support background videos.
        </video>

        {/* Dark cinematic overlay */}

        <div className="hero-video-overlay"></div>

        {/* Background glow effects */}

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        {/* Decorative circles */}

        <div className="hero-decoration hero-decoration-one"></div>
        <div className="hero-decoration hero-decoration-two"></div>

        {/* Main content */}

        <div className="cinematic-hero-content">

          {/* Small badge */}

          <div className="cinematic-badge">

            <span className="live-dot"></span>

            <span>THE FUTURE OF HEALTHCARE</span>

            <Sparkles size={14} />

          </div>

          {/* Main heading */}

          <h1 className="cinematic-heading">

            Healthcare

            <br />

            <span className="hero-gradient-text">
              Without Limits.
            </span>

          </h1>

          <p className="cinematic-description">

            Experience a smarter way to manage your health.

            Discover trusted specialists, book appointments,
            and follow your clinic queue — all in one
            connected healthcare experience.

          </p>

          {/* Search form */}

          <form
            onSubmit={handleSearchSubmit}
            className="cinematic-search-box"
          >

            {/* Doctor search */}

            <div className="cinematic-search-field">

              <div className="search-field-icon">
                <Search size={22} />
              </div>

              <div className="search-field-content">

                <label htmlFor="doctor-search">
                  Find a Specialist
                </label>

                <input
                  id="doctor-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Doctor, disease or specialty"
                />

              </div>

            </div>

            <div className="cinematic-search-divider"></div>

            {/* Department selection */}

            <div className="cinematic-search-field">

              <div className="search-field-icon">
                <Stethoscope size={22} />
              </div>

              <div className="search-field-content">

                <label htmlFor="specialty-select">
                  Medical Department
                </label>

                <select
                  id="specialty-select"
                  value={selectedSpecialty}
                  onChange={(e) =>
                    setSelectedSpecialty(e.target.value)
                  }
                >

                  <option value="All">
                    All Specialties
                  </option>

                  {departmentList.map((department) => (
                    <option
                      key={department.name}
                      value={department.name}
                    >
                      {department.name}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            {/* Search button */}

            <button
              type="submit"
              className="cinematic-search-button"
            >

              Explore Doctors

              <ArrowRight size={19} />

            </button>

          </form>

          {/* Trust indicators */}

          <div className="cinematic-trust">

            <span>
              <ShieldCheck size={17} />
              Verified Specialists
            </span>

            <span>
              <Activity size={17} />
              Live Queue Tracking
            </span>

            <span>
              <HeartPulse size={17} />
              Patient First Care
            </span>

          </div>

          {/* Quick navigation */}

          <div className="cinematic-links">

            <Link to="/doctors">
              Find a Doctor
              <ArrowUpRight size={15} />
            </Link>

            <Link to="/queue-display">
              Live Queue
              <ArrowUpRight size={15} />
            </Link>

          </div>

        </div>

        {/* Floating card 1 */}

        <div className="cinematic-floating-card floating-card-one">

          <div className="floating-card-icon">
            <CalendarCheck size={23} />
          </div>

          <div>

            <strong>Smart Booking</strong>

            <p>Appointments made simple</p>

          </div>

          <CircleCheck className="floating-check" size={19} />

        </div>

        {/* Floating card 2 */}

        <div className="cinematic-floating-card floating-card-two">

          <div className="floating-card-icon">
            <HeartPulse size={23} />
          </div>

          <div>

            <strong>Better Healthcare</strong>

            <p>Care that puts you first</p>

          </div>

          <CircleCheck className="floating-check" size={19} />

        </div>

        {/* Bottom scroll indicator */}

        <a
          href="#medi-benefits"
          className="hero-scroll-indicator"
          aria-label="Scroll to explore"
        >

          <span className="scroll-mouse">
            <span></span>
          </span>

          SCROLL TO EXPLORE

        </a>

      </section>


      {/* ==================================
          BENEFIT STRIP
      ================================== */}

      <section
        id="medi-benefits"
        className="benefit-strip-wrap max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >

        <div className="benefit-strip">

          <div className="benefit-item">

            <div className="benefit-icon">
              <CalendarDays className="w-5 h-5" />
            </div>

            <div>

              <h3>Simple Scheduling</h3>

              <p>Book without the back-and-forth</p>

            </div>

          </div>

          <div className="benefit-separator"></div>

          <div className="benefit-item">

            <div className="benefit-icon teal">
              <Clock3 className="w-5 h-5" />
            </div>

            <div>

              <h3>Queue Visibility</h3>

              <p>Follow your token in real time</p>

            </div>

          </div>

          <div className="benefit-separator"></div>

          <div className="benefit-item">

            <div className="benefit-icon violet">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>

              <h3>One Secure Space</h3>

              <p>Keep your records organized</p>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================
          MEDICAL SPECIALTIES
      ================================== */}

      <section className="section-block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="section-heading-row">

          <div>

            <span className="section-kicker">
              CARE, YOUR WAY
            </span>

            <h2>
              Find the right kind
              <br className="hidden sm:block" />
              of specialist.
            </h2>

            <p>
              Start with a department and discover
              care tailored to your needs.
            </p>

          </div>

          <Link
            to="/doctors"
            className="section-link"
          >

            Explore all doctors

            <ArrowUpRight className="w-4 h-4" />

          </Link>

        </div>

        <div className="specialty-grid">

          {departmentList.map((department, index) => {

            const Icon = department.icon;

            return (

              <Link
                key={department.name}
                to={`/doctors?specialization=${encodeURIComponent(
                  department.name
                )}`}
                className={`specialty-card specialty-${department.tint}`}
              >

                <div className="specialty-card-top">

                  <span className="specialty-number">
                    0{index + 1}
                  </span>

                  <ArrowUpRight className="w-4 h-4 specialty-arrow" />

                </div>

                <div className="specialty-icon">
                  <Icon className="w-6 h-6" />
                </div>

                <h3>{department.label}</h3>

                <p>{department.detail}</p>

              </Link>

            );

          })}

        </div>

      </section>


      {/* ==================================
          FEATURED DOCTORS
      ================================== */}

      <section className="doctors-showcase">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-block">

          <div className="section-heading-row">

            <div>

              <span className="section-kicker">
                MEET YOUR CARE TEAM
              </span>

              <h2>
                Specialists who put
                <br className="hidden sm:block" />
                your wellbeing first.
              </h2>

              <p>
                Explore doctor profiles and find
                a consultation that works for you.
              </p>

            </div>

            <Link
              to="/doctors"
              className="section-link"
            >

              View doctor directory

              <ArrowUpRight className="w-4 h-4" />

            </Link>

          </div>

          {loading ? (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {Array.from({ length: 4 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}

            </div>

          ) : featuredDoctors.length > 0 ? (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {featuredDoctors.map((doctor) => (

                <DoctorCard
                  key={doctor._id}
                  doctor={doctor}
                />

              ))}

            </div>

          ) : (

            <div className="doctor-empty-panel">

              <div className="doctor-empty-icon">
                <Stethoscope className="w-6 h-6" />
              </div>

              <h3>
                Doctor profiles are being prepared
              </h3>

              <p>
                Explore the directory to check available specialists.
              </p>

              <Link
                to="/doctors"
                className="section-link"
              >

                Open doctor directory

                <ArrowRight className="w-4 h-4" />

              </Link>

            </div>

          )}

        </div>

      </section>


      {/* ==================================
          HOW IT WORKS
      ================================== */}

      <section className="section-block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="workflow-panel">

          <div className="workflow-intro">

            <span className="section-kicker">
              A CLEARER JOURNEY
            </span>

            <h2>
              Three steps.
              <br />
              More peace of mind.
            </h2>

            <p>
              From finding a specialist to arriving
              at the clinic, keep each step in one place.
            </p>

            <Link
              to="/doctors"
              className="workflow-cta"
            >

              Get started

              <MoveRight className="w-4 h-4" />

            </Link>

            <div className="workflow-shield">

              <ShieldPlus className="w-7 h-7" />

              <span>
                Thoughtful care
                <br />
                starts here
              </span>

            </div>

          </div>

          <div className="workflow-steps">

            <div className="workflow-step">

              <div className="workflow-step-index">
                01
              </div>

              <div className="workflow-step-icon">
                <Search className="w-5 h-5" />
              </div>

              <div>

                <h3>Discover a doctor</h3>

                <p>
                  Explore verified doctor profiles, specialties,
                  consultation fees and available slots.
                </p>

              </div>

              <span className="workflow-step-line"></span>

            </div>

            <div className="workflow-step">

              <div className="workflow-step-index">
                02
              </div>

              <div className="workflow-step-icon">
                <CalendarCheck className="w-5 h-5" />
              </div>

              <div>

                <h3>Reserve your visit</h3>

                <p>
                  Choose a suitable appointment time
                  and receive your booking details.
                </p>

              </div>

              <span className="workflow-step-line"></span>

            </div>

            <div className="workflow-step">

              <div className="workflow-step-index">
                03
              </div>

              <div className="workflow-step-icon">
                <ClipboardList className="w-5 h-5" />
              </div>

              <div>

                <h3>Follow your queue</h3>

                <p>
                  Check your token status and stay informed
                  as the clinic queue moves.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================
          LIVE QUEUE FEATURE
      ================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        <div className="queue-feature-card">

          <div className="queue-feature-art">

            <div className="queue-art-circle">
              <Smartphone className="w-10 h-10" />
            </div>

            <span className="queue-art-dot dot-one"></span>

            <span className="queue-art-dot dot-two"></span>

            <span className="queue-art-dot dot-three"></span>

          </div>

          <div className="queue-feature-content">

            <span className="queue-feature-kicker">
              LESS GUESSWORK. MORE CLARITY.
            </span>

            <h2>
              Your turn, without
              <br className="hidden sm:block" />
              the uncertainty.
            </h2>

            <p>
              Use the live reception display to follow
              clinic token progress and help make waiting
              more predictable.
            </p>

            <Link
              to="/queue-display"
              className="queue-feature-button"
            >

              Explore live queue

              <ArrowUpRight className="w-4 h-4" />

            </Link>

          </div>

          <div className="queue-feature-watermark">
            <Activity className="w-44 h-44" />
          </div>

        </div>

      </section>

    </div>
  );
};

export default Home;
