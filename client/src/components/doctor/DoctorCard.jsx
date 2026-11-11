import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowUpRight, CalendarCheck, BadgeCheck } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  if (!doctor) return null;

  return (
    <article className="doctor-card flex flex-col justify-between p-5">
      <div>
        <div className="flex items-start gap-3.5 mb-4">
          <div className="relative flex-shrink-0">
            <img
              src={doctor.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(doctor.name)}`}
              alt={doctor.name}
              className="w-[66px] h-[66px] rounded-[18px] object-cover border border-slate-100 bg-slate-50"
            />
            <span className="absolute -right-1.5 -bottom-1.5 grid place-items-center w-6 h-6 rounded-full border-2 border-white bg-teal-50 text-teal-700">
              <BadgeCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <span className="inline-flex max-w-full px-2 py-1 rounded-md bg-teal-50 text-teal-700 text-[9px] font-extrabold tracking-wide truncate">
              {doctor.specialization || 'General Medicine'}
            </span>
            <h3 className="mt-2 text-sm font-extrabold text-slate-900 truncate">{doctor.name}</h3>
            <p className="text-[10px] text-slate-500 truncate mt-1">{doctor.qualifications?.join(', ') || 'MBBS'}</p>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 mt-1.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{doctor.rating?.toFixed(1) || '4.9'}</span>
              <span className="text-slate-400 font-medium">({doctor.reviewCount || 40} reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl bg-[#f5faf8] px-3 py-2.5">
            <p className="text-[8px] text-slate-400 font-extrabold tracking-widest uppercase">Experience</p>
            <p className="mt-1 text-xs font-extrabold text-slate-800">{doctor.experienceYears ?? '—'} <span className="text-[9px] font-semibold text-slate-400">years</span></p>
          </div>
          <div className="rounded-xl bg-[#f5faf8] px-3 py-2.5">
            <p className="text-[8px] text-slate-400 font-extrabold tracking-widest uppercase">Consultation</p>
            <p className="mt-1 text-xs font-extrabold text-slate-800">₹{doctor.consultationFee ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-500 truncate">
          <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
          <span className="truncate">{doctor.clinicAddress?.name || doctor.clinicAddress?.city || 'MediSlot Clinic'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-100">
        <Link
          to={`/doctors/${doctor._id}`}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-extrabold transition-colors"
        >
          View profile <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to={`/patient/book/${doctor._id}`}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-extrabold shadow-sm shadow-teal-900/10 transition-colors"
        >
          <CalendarCheck className="w-3.5 h-3.5" /> Book slot
        </Link>
      </div>
    </article>
  );
};

export default DoctorCard;
