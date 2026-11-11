// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import api from '../../api/axiosClient';
// import DoctorCard from '../../components/doctor/DoctorCard';
// import { CardSkeleton } from '../../components/common/LoadingSkeleton';
// import EmptyState from '../../components/common/EmptyState';
// import { useDebounce } from '../../hooks/useDebounce';
// import {
//   Search,
//   Filter,
//   SlidersHorizontal,
//   Stethoscope,
//   X,
//   ChevronLeft,
//   ChevronRight,
//   Sparkles,
//   CheckCircle2,
//   Clock,
// } from 'lucide-react';

// /**
//  * ============================================================================
//  * UNIT I, II, III & V: Doctors Directory Component
//  * ============================================================================
//  * Demonstrates:
//  * - JavaScript Refreshing Concepts: Arrow functions, block-scoped const/let,
//  *   destructuring assignments, array iteration/transformation (.map, .filter, .reduce),
//  *   spread operator, and immutability.
//  * - React Fundamentals: Declarative UI paradigm, component composition.
//  * - Performance Hooks:
//  *   - useDebounce: Custom hook preventing rapid re-render & request spam on keystrokes.
//  *   - useCallback: Preserving function referential equality across render cycles.
//  *   - useMemo: Memoizing derived state calculations (e.g., active filter counts).
//  * - Client-Side Routing: useSearchParams for URL query parameter synchronization.
//  */
// const Doctors = () => {
//   // Query parameter extraction via React Router DOM
//   const [searchParams, setSearchParams] = useSearchParams();
//   const initialSearch = searchParams.get('search') || '';
//   const initialSpecialization = searchParams.get('specialization') || 'All';

//   // Local State Management (useState)
//   const [doctors, setDoctors] = useState([]);
//   const [specializations, setSpecializations] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Controlled Filter States
//   const [search, setSearch] = useState(initialSearch);
//   const [selectedSpecialization, setSelectedSpecialization] = useState(initialSpecialization);
//   const [availability, setAvailability] = useState('');
//   const [sortBy, setSortBy] = useState('rating');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalDoctors, setTotalDoctors] = useState(0);

//   // UNIT III: Custom Hook for Debounced Search Input
//   const debouncedSearch = useDebounce(search, 350);

//   // Fetch distinct clinical specializations on mount
//   useEffect(() => {
//     let isSubscribed = true; // Effect cleanup pattern to prevent state update on unmounted component
//     const fetchSpecializations = async () => {
//       try {
//         const { data } = await api.get('/doctors/meta/specializations');
//         if (data.success && isSubscribed) {
//           setSpecializations(data.specializations || []);
//         }
//       } catch (err) {
//         console.error('Failed to load specializations:', err);
//       }
//     };

//     fetchSpecializations();
//     return () => {
//       isSubscribed = false;
//     };
//   }, []);

//   // UNIT III: useCallback ensures referential stability of fetchDoctors
//   const fetchDoctors = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (debouncedSearch) params.append('search', debouncedSearch);
//       if (selectedSpecialization && selectedSpecialization !== 'All') {
//         params.append('specialization', selectedSpecialization);
//       }
//       if (availability !== '') {
//         params.append('availability', availability);
//       }
//       params.append('sortBy', sortBy);
//       params.append('page', currentPage);
//       params.append('limit', 8);

//       const { data } = await api.get(`/doctors?${params.toString()}`);
//       if (data.success) {
//         setDoctors(data.doctors || []);
//         setTotalPages(data.totalPages || 1);
//         setTotalDoctors(data.total || 0);
//       }
//     } catch (err) {
//       console.error('Error fetching doctors:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [debouncedSearch, selectedSpecialization, availability, sortBy, currentPage]);

//   // Trigger data fetching whenever debounced filters or pagination changes
//   useEffect(() => {
//     fetchDoctors();
//   }, [fetchDoctors]);

//   // UNIT III: useMemo for Derived State (calculating applied filters count)
//   const activeFiltersCount = useMemo(() => {
//     let count = 0;
//     if (debouncedSearch) count += 1;
//     if (selectedSpecialization !== 'All') count += 1;
//     if (availability !== '') count += 1;
//     return count;
//   }, [debouncedSearch, selectedSpecialization, availability]);

//   const handleResetFilters = useCallback(() => {
//     setSearch('');
//     setSelectedSpecialization('All');
//     setAvailability('');
//     setSortBy('rating');
//     setCurrentPage(1);
//     setSearchParams({});
//   }, [setSearchParams]);

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-fadeIn">
//       {/* Page Header */}
//       <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft">
//         <div className="max-w-3xl">
//           <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 mb-3 shadow-2xs">
//             <Stethoscope className="w-3.5 h-3.5" />
//             <span>Verified Medical Specialists</span>
//           </div>
//           <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
//             Consulting Specialists Directory
//           </h1>
//           <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
//             Browse verified clinical practitioners, inspect consultation fees, check real-time availability, and reserve conflict-free appointment slots.
//           </p>
//         </div>

//         {/* Filter Controls Bar */}
//         <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
//           {/* Debounced Search Input */}
//           <div className="md:col-span-5 relative">
//             <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setCurrentPage(1);
//               }}
//               placeholder="Search by doctor name, specialty, or clinic..."
//               className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
//             />
//             {search && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setSearch('');
//                   setCurrentPage(1);
//                 }}
//                 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             )}
//           </div>

//           {/* Specialization Filter Dropdown */}
//           <div className="md:col-span-3">
//             <select
//               value={selectedSpecialization}
//               onChange={(e) => {
//                 setSelectedSpecialization(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
//             >
//               <option value="All">All Specializations</option>
//               {specializations.map((spec) => (
//                 <option key={spec} value={spec}>
//                   {spec}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Availability Toggle */}
//           <div className="md:col-span-2">
//             <select
//               value={availability}
//               onChange={(e) => {
//                 setAvailability(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
//             >
//               <option value="">Any Status</option>
//               <option value="true">Available Now</option>
//               <option value="false">Off-duty</option>
//             </select>
//           </div>

//           {/* Sort By */}
//           <div className="md:col-span-2">
//             <select
//               value={sortBy}
//               onChange={(e) => {
//                 setSortBy(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
//             >
//               <option value="rating">Top Rated ⭐</option>
//               <option value="experience">Experience (Highest)</option>
//               <option value="fee">Fee: Low to High</option>
//               <option value="name">Name (A-Z)</option>
//             </select>
//           </div>
//         </div>

//         {/* Quick Filter Horizontal Scrollable Chips */}
//         <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
//           <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex-shrink-0">
//             Departments:
//           </span>
//           <button
//             onClick={() => {
//               setSelectedSpecialization('All');
//               setCurrentPage(1);
//             }}
//             className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
//               selectedSpecialization === 'All'
//                 ? 'bg-brand-600 text-white shadow-xs'
//                 : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
//             }`}
//           >
//             All Departments
//           </button>
//           {specializations.map((spec) => (
//             <button
//               key={spec}
//               onClick={() => {
//                 setSelectedSpecialization(spec);
//                 setCurrentPage(1);
//               }}
//               className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
//                 selectedSpecialization === spec
//                   ? 'bg-brand-600 text-white shadow-xs'
//                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
//               }`}
//             >
//               {spec}
//             </button>
//           ))}
//         </div>

//         {/* Applied Filter Tags & Reset */}
//         {activeFiltersCount > 0 && (
//           <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
//             <span className="text-slate-400 font-medium">Applied Filters ({activeFiltersCount}):</span>
//             {debouncedSearch && (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-semibold">
//                 Keyword: "{debouncedSearch}"
//                 <button onClick={() => setSearch('')} className="hover:text-rose-600">
//                   <X className="w-3.5 h-3.5" />
//                 </button>
//               </span>
//             )}
//             {selectedSpecialization !== 'All' && (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 text-brand-700 font-semibold border border-brand-200">
//                 Department: {selectedSpecialization}
//                 <button onClick={() => setSelectedSpecialization('All')} className="hover:text-rose-600">
//                   <X className="w-3.5 h-3.5" />
//                 </button>
//               </span>
//             )}
//             {availability !== '' && (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
//                 Status: {availability === 'true' ? 'Available' : 'Off-duty'}
//                 <button onClick={() => setAvailability('')} className="hover:text-rose-600">
//                   <X className="w-3.5 h-3.5" />
//                 </button>
//               </span>
//             )}
//             <button
//               onClick={handleResetFilters}
//               className="text-xs text-brand-600 hover:text-brand-800 font-bold ml-auto hover:underline"
//             >
//               Clear All Filters
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Results Header Counter */}
//       <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
//         <p>
//           Showing <span className="font-extrabold text-slate-900">{doctors.length}</span> of{' '}
//           <span className="font-extrabold text-slate-900">{totalDoctors}</span> verified medical practitioners
//         </p>
//         <p>Page {currentPage} of {totalPages}</p>
//       </div>

//       {/* Doctors Grid */}
//       {loading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {Array.from({ length: 8 }).map((_, i) => (
//             <CardSkeleton key={i} />
//           ))}
//         </div>
//       ) : doctors.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {doctors.map((doctor) => (
//             <DoctorCard key={doctor._id} doctor={doctor} />
//           ))}
//         </div>
//       ) : (
//         <EmptyState
//           icon={Stethoscope}
//           title="No Doctors Found"
//           description="We couldn't find any medical practitioners matching your criteria. Try resetting your search filters."
//           actionText="Clear All Filters"
//           onAction={handleResetFilters}
//         />
//       )}

//       {/* Pagination Controls */}
//       {totalPages > 1 && (
//         <div className="flex items-center justify-center gap-3 pt-6">
//           <button
//             onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//             disabled={currentPage === 1}
//             className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Previous
//           </button>
//           <span className="text-xs font-bold text-slate-700 px-3 py-1 bg-white rounded-xl border border-slate-200">
//             {currentPage} / {totalPages}
//           </span>
//           <button
//             onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//             disabled={currentPage === totalPages}
//             className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
//           >
//             Next
//             <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Doctors;


import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { useSearchParams } from 'react-router-dom';

import api from '../../api/axiosClient';

import DoctorCard from '../../components/doctor/DoctorCard';

import { CardSkeleton } from '../../components/common/LoadingSkeleton';

import EmptyState from '../../components/common/EmptyState';

import { useDebounce } from '../../hooks/useDebounce';

import {
  Search,
  Filter,
  Stethoscope,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock3,
  HeartPulse,
  ShieldCheck,
  Activity,
  SlidersHorizontal,
  ArrowUpRight,
  CalendarDays,
  Users,
  RotateCcw,
  BadgeCheck,
  MapPin,
  ArrowRight,
} from 'lucide-react';

import './Doctors.css';


const Doctors = () => {

  // ==========================================
  // URL PARAMETERS
  // ==========================================

  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';

  const initialSpecialization =
    searchParams.get('specialization') || 'All';


  // ==========================================
  // STATES
  // ==========================================

  const [doctors, setDoctors] = useState([]);

  const [specializations, setSpecializations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState(initialSearch);

  const [selectedSpecialization, setSelectedSpecialization] =
    useState(initialSpecialization);

  const [availability, setAvailability] = useState('');

  const [sortBy, setSortBy] = useState('rating');

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalDoctors, setTotalDoctors] = useState(0);


  // ==========================================
  // DEBOUNCED SEARCH
  // ==========================================

  const debouncedSearch = useDebounce(search, 350);


  // ==========================================
  // FETCH SPECIALIZATIONS
  // ==========================================

  useEffect(() => {

    let active = true;

    const fetchSpecializations = async () => {

      try {

        const { data } = await api.get(
          '/doctors/meta/specializations'
        );

        if (active && data.success) {

          setSpecializations(
            data.specializations || []
          );

        }

      } catch (error) {

        console.error(
          'Failed to load specializations:',
          error
        );

      }

    };

    fetchSpecializations();

    return () => {
      active = false;
    };

  }, []);


  // ==========================================
  // FETCH DOCTORS
  // ==========================================

  const fetchDoctors = useCallback(async () => {

    setLoading(true);

    setLoadError('');

    try {

      const params = new URLSearchParams();

      if (debouncedSearch.trim()) {

        params.append(
          'search',
          debouncedSearch.trim()
        );

      }

      if (selectedSpecialization !== 'All') {

        params.append(
          'specialization',
          selectedSpecialization
        );

      }

      if (availability !== '') {

        params.append(
          'availability',
          availability
        );

      }

      params.append('sortBy', sortBy);

      params.append('page', currentPage);

      params.append('limit', 8);


      const { data } = await api.get(
        `/doctors?${params.toString()}`
      );


      if (data.success) {

        setDoctors(data.doctors || []);

        setTotalPages(data.totalPages || 1);

        setTotalDoctors(data.total || 0);

      } else {

        setDoctors([]);

        setTotalDoctors(0);

      }

    } catch (error) {

      console.error(
        'Error fetching doctors:',
        error
      );

      setLoadError(
        'Unable to load doctors. Please check your connection and try again.'
      );

      setDoctors([]);

      setTotalDoctors(0);

    } finally {

      setLoading(false);

    }

  }, [
    debouncedSearch,
    selectedSpecialization,
    availability,
    sortBy,
    currentPage,
  ]);


  // ==========================================
  // AUTOMATIC FETCH
  // ==========================================

  useEffect(() => {

    fetchDoctors();

  }, [fetchDoctors]);


  // ==========================================
  // ACTIVE FILTER COUNT
  // ==========================================

  const activeFiltersCount = useMemo(() => {

    let count = 0;

    if (debouncedSearch.trim()) count++;

    if (selectedSpecialization !== 'All') count++;

    if (availability !== '') count++;

    return count;

  }, [
    debouncedSearch,
    selectedSpecialization,
    availability,
  ]);


  // ==========================================
  // RESET FILTERS
  // ==========================================

  const handleResetFilters = useCallback(() => {

    setSearch('');

    setSelectedSpecialization('All');

    setAvailability('');

    setSortBy('rating');

    setCurrentPage(1);

    setSearchParams({});

  }, [setSearchParams]);


  // ==========================================
  // CLEAR INDIVIDUAL FILTERS
  // ==========================================

  const clearSearch = () => {

    setSearch('');

    setCurrentPage(1);

  };


  const clearSpecialization = () => {

    setSelectedSpecialization('All');

    setCurrentPage(1);

  };


  const clearAvailability = () => {

    setAvailability('');

    setCurrentPage(1);

  };


  // ==========================================
  // MAIN UI
  // ==========================================

  return (

    <div className="directory-page">

      {/* BACKGROUND EFFECTS */}

      <div
        className="directory-ambient directory-ambient-one"
        aria-hidden="true"
      />

      <div
        className="directory-ambient directory-ambient-two"
        aria-hidden="true"
      />


      {/* =====================================
          HERO SECTION
      ===================================== */}

      <section className="directory-hero">

        <div className="directory-hero-grid">


          {/* LEFT CONTENT */}

          <div className="directory-hero-content">

            <div className="directory-eyebrow">

              <span className="directory-live-dot"></span>

              <span>
                YOUR HEALTHCARE JOURNEY STARTS HERE
              </span>

              <Sparkles size={15} />

            </div>


            <h1>

              Discover the right

              <br />

              <span className="directory-heading-gradient">
                doctor for you.
              </span>

            </h1>


            <p className="directory-hero-description">

              Exceptional healthcare begins with
              the right specialist.

              Explore medical professionals,
              compare expertise and find
              the care you deserve.

            </p>


            {/* HERO FEATURES */}

            <div className="directory-hero-features">

              <div>

                <ShieldCheck size={18} />

                <span>
                  Trusted profiles
                </span>

              </div>


              <div>

                <Activity size={18} />

                <span>
                  Live availability
                </span>

              </div>


              <div>

                <HeartPulse size={18} />

                <span>
                  Patient-first care
                </span>

              </div>

            </div>


            {/* HERO STATISTICS */}

            <div className="directory-hero-stats">

              <div>

                <strong>
                  {totalDoctors}
                </strong>

                <span>
                  Doctors listed
                </span>

              </div>


              <div className="directory-stat-divider"></div>


              <div>

                <strong>
                  {specializations.length}
                </strong>

                <span>
                  Specialties
                </span>

              </div>


              <div className="directory-stat-divider"></div>


              <div>

                <strong>
                  <BadgeCheck size={23} />
                </strong>

                <span>
                  Verified profiles
                </span>

              </div>

            </div>

          </div>


          {/* RIGHT VISUAL */}

          <div className="directory-hero-visual">

            <div className="directory-orbit directory-orbit-one"></div>

            <div className="directory-orbit directory-orbit-two"></div>

            <div className="directory-orbit directory-orbit-three"></div>


            {/* CENTER MEDICAL ELEMENT */}

            <div className="directory-medical-core">

              <div className="directory-core-inner">

                <HeartPulse size={68} />

                <span>
                  MEDISLOT
                </span>

                <small>
                  HEALTHCARE CONNECTED
                </small>

              </div>

            </div>


            {/* FLOATING CARD 1 */}

            <div className="directory-float-card directory-float-top">

              <div className="directory-float-icon mint">
                <Stethoscope size={21} />
              </div>

              <div>

                <strong>
                  Expert Care
                </strong>

                <span>
                  Find your specialist
                </span>

              </div>

              <CheckCircle2 size={18} />

            </div>


            {/* FLOATING CARD 2 */}

            <div className="directory-float-card directory-float-bottom">

              <div className="directory-float-icon blue">
                <CalendarDays size={21} />
              </div>

              <div>

                <strong>
                  Easy Appointments
                </strong>

                <span>
                  Choose your preferred slot
                </span>

              </div>

              <ArrowUpRight size={18} />

            </div>


            {/* DECORATIVE PLUS */}

            <div className="directory-plus directory-plus-one">
              +
            </div>

            <div className="directory-plus directory-plus-two">
              +
            </div>

          </div>

        </div>


        {/* HERO BOTTOM */}

        <div className="directory-hero-bottom">

          <span>
            DISCOVER
          </span>

          <div className="directory-bottom-line"></div>

          <span>
            COMPARE
          </span>

          <div className="directory-bottom-line"></div>

          <span>
            CONNECT
          </span>

        </div>

      </section>


      {/* =====================================
          SEARCH & FILTER PANEL
      ===================================== */}

      <section className="directory-search-panel">


        <div className="directory-panel-heading">

          <div>

            <span className="directory-section-kicker">

              <SlidersHorizontal size={14} />

              SMART DOCTOR DISCOVERY

            </span>


            <h2>
              Find your perfect match.
            </h2>


            <p>
              Refine your search and discover specialists
              suited to your healthcare needs.
            </p>

          </div>


          <div className="directory-filter-indicator">

            <div className="directory-filter-indicator-icon">

              <Filter size={18} />

            </div>

            <div>

              <strong>
                {activeFiltersCount}
              </strong>

              <span>
                Active filters
              </span>

            </div>

          </div>

        </div>


        {/* SEARCH CONTROLS */}

        <div className="directory-controls-grid">


          {/* SEARCH */}

          <div className="directory-control directory-search-control">

            <label htmlFor="directory-search">
              SEARCH SPECIALISTS
            </label>

            <div className="directory-input-wrapper">

              <Search size={20} />

              <input
                id="directory-search"
                type="text"
                value={search}
                onChange={(e) => {

                  setSearch(e.target.value);

                  setCurrentPage(1);

                }}
                placeholder="Doctor name, specialty or clinic..."
              />


              {search && (

                <button
                  type="button"
                  className="directory-clear-input"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >

                  <X size={17} />

                </button>

              )}

            </div>

          </div>


          {/* SPECIALIZATION */}

          <div className="directory-control">

            <label htmlFor="directory-specialty">
              MEDICAL SPECIALTY
            </label>

            <div className="directory-select-wrapper">

              <Stethoscope size={18} />

              <select
                id="directory-specialty"
                value={selectedSpecialization}
                onChange={(e) => {

                  setSelectedSpecialization(
                    e.target.value
                  );

                  setCurrentPage(1);

                }}
              >

                <option value="All">
                  All Specialties
                </option>

                {specializations.map((spec) => (

                  <option
                    key={spec}
                    value={spec}
                  >
                    {spec}
                  </option>

                ))}

              </select>

            </div>

          </div>


          {/* AVAILABILITY */}

          <div className="directory-control">

            <label htmlFor="directory-availability">
              AVAILABILITY
            </label>

            <div className="directory-select-wrapper">

              <Clock3 size={18} />

              <select
                id="directory-availability"
                value={availability}
                onChange={(e) => {

                  setAvailability(
                    e.target.value
                  );

                  setCurrentPage(1);

                }}
              >

                <option value="">
                  Any Status
                </option>

                <option value="true">
                  Available Now
                </option>

                <option value="false">
                  Off-duty
                </option>

              </select>

            </div>

          </div>


          {/* SORT */}

          <div className="directory-control">

            <label htmlFor="directory-sort">
              SORT RESULTS
            </label>

            <div className="directory-select-wrapper">

              <Sparkles size={18} />

              <select
                id="directory-sort"
                value={sortBy}
                onChange={(e) => {

                  setSortBy(e.target.value);

                  setCurrentPage(1);

                }}
              >

                <option value="rating">
                  Top Rated
                </option>

                <option value="experience">
                  Most Experienced
                </option>

                <option value="fee">
                  Lowest Consultation Fee
                </option>

                <option value="name">
                  Name A – Z
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* DEPARTMENT CHIPS */}

        <div className="directory-departments">

          <div className="directory-department-title">

            <div className="directory-department-icon">
              <HeartPulse size={17} />
            </div>

            <span>
              EXPLORE DEPARTMENTS
            </span>

          </div>


          <div className="directory-chip-container">

            <button
              type="button"
              onClick={() => {

                setSelectedSpecialization('All');

                setCurrentPage(1);

              }}
              className={`directory-chip ${
                selectedSpecialization === 'All'
                  ? 'active'
                  : ''
              }`}
            >

              <Activity size={14} />

              All Departments

            </button>


            {specializations.map((spec) => (

              <button
                type="button"
                key={spec}
                onClick={() => {

                  setSelectedSpecialization(spec);

                  setCurrentPage(1);

                }}
                className={`directory-chip ${
                  selectedSpecialization === spec
                    ? 'active'
                    : ''
                }`}
              >

                {spec}

              </button>

            ))}

          </div>

        </div>


        {/* ACTIVE FILTERS */}

        {activeFiltersCount > 0 && (

          <div className="directory-active-filters">

            <div className="directory-active-label">

              <CheckCircle2 size={15} />

              Active filters:

            </div>


            {debouncedSearch && (

              <span className="directory-filter-tag">

                Search: {debouncedSearch}

                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Remove search filter"
                >

                  <X size={13} />

                </button>

              </span>

            )}


            {selectedSpecialization !== 'All' && (

              <span className="directory-filter-tag">

                {selectedSpecialization}

                <button
                  type="button"
                  onClick={clearSpecialization}
                  aria-label="Remove specialty filter"
                >

                  <X size={13} />

                </button>

              </span>

            )}


            {availability !== '' && (

              <span className="directory-filter-tag">

                {availability === 'true'
                  ? 'Available'
                  : 'Off-duty'}

                <button
                  type="button"
                  onClick={clearAvailability}
                  aria-label="Remove availability filter"
                >

                  <X size={13} />

                </button>

              </span>

            )}


            <button
              type="button"
              onClick={handleResetFilters}
              className="directory-reset-button"
            >

              <RotateCcw size={14} />

              Clear all

            </button>

          </div>

        )}

      </section>


      {/* =====================================
          DOCTOR RESULTS
      ===================================== */}

      <section className="directory-results-section">


        {/* RESULTS HEADER */}

        <div className="directory-results-header">


          <div>

            <span className="directory-section-kicker">

              <Users size={15} />

              YOUR CARE NETWORK

            </span>


            <h2>
              Meet your specialists.
            </h2>


            <p>
              Discover experienced professionals
              for your healthcare journey.
            </p>

          </div>


          <div className="directory-results-count">

            <div className="directory-results-count-icon">

              <Stethoscope size={23} />

            </div>

            <div>

              <strong>
                {totalDoctors}
              </strong>

              <span>
                Matching doctors
              </span>

            </div>

          </div>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="directory-doctor-grid">

            {Array.from({ length: 8 }).map((_, index) => (

              <CardSkeleton key={index} />

            ))}

          </div>

        )}


        {/* ERROR */}

        {!loading && loadError && (

          <div className="directory-error-panel">

            <div className="directory-error-icon">
              <Activity size={28} />
            </div>

            <h3>
              Something went wrong.
            </h3>

            <p>
              {loadError}
            </p>

            <button
              type="button"
              onClick={fetchDoctors}
              className="directory-primary-button"
            >

              Try again

              <ArrowRight size={17} />

            </button>

          </div>

        )}


        {/* DOCTOR CARDS */}

        {!loading &&
          !loadError &&
          doctors.length > 0 && (

            <div className="directory-doctor-grid">

              {doctors.map((doctor) => (

                <DoctorCard
                  key={doctor._id}
                  doctor={doctor}
                />

              ))}

            </div>

          )}


        {/* EMPTY STATE */}

        {!loading &&
          !loadError &&
          doctors.length === 0 && (

            <div className="directory-empty-wrapper">

              <EmptyState
                icon={Stethoscope}
                title="No Doctors Found"
                description="We couldn't find any medical practitioners matching your search. Try adjusting your filters."
                actionText="Clear All Filters"
                onAction={handleResetFilters}
              />

            </div>

          )}


        {/* =====================================
            PAGINATION
        ===================================== */}

        {!loading &&
          !loadError &&
          totalPages > 1 && (

            <div className="directory-pagination">


              <button
                type="button"
                onClick={() => {

                  setCurrentPage(
                    (page) => Math.max(1, page - 1)
                  );

                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });

                }}
                disabled={currentPage === 1}
                className="directory-page-button"
              >

                <ChevronLeft size={18} />

                Previous

              </button>


              <div className="directory-page-indicator">

                <span>
                  PAGE
                </span>

                <strong>
                  {currentPage}
                </strong>

                <span>
                  OF
                </span>

                <strong>
                  {totalPages}
                </strong>

              </div>


              <button
                type="button"
                onClick={() => {

                  setCurrentPage(
                    (page) => Math.min(totalPages, page + 1)
                  );

                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });

                }}
                disabled={currentPage === totalPages}
                className="directory-page-button next"
              >

                Next

                <ChevronRight size={18} />

              </button>

            </div>

          )}


      </section>


      {/* =====================================
          BOTTOM CTA
      ===================================== */}

      <section className="directory-bottom-cta">

        <div className="directory-bottom-cta-icon">

          <HeartPulse size={29} />

        </div>


        <div className="directory-bottom-cta-content">

          <span>
            YOUR HEALTH MATTERS
          </span>

          <h2>
            The right care makes all the difference.
          </h2>

          <p>
            Explore specialists and take the next
            step toward better healthcare.
          </p>

        </div>


        <button
          type="button"
          onClick={() => {

            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });

          }}
          className="directory-cta-button"
        >

          Explore Doctors

          <ArrowUpRight size={17} />

        </button>

      </section>

    </div>

  );

};

export default Doctors;


