import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Search,
  Calendar,
  FilePlus,
  Phone,
  Mail,
  Droplet,
  ChevronRight,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/doctors/my/patients');
        if (data.success) {
          setPatients(data.patients || []);
        }
      } catch (err) {
        toast.error('Failed to load patient records.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) =>
    p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.patient?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.patient?.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Patient Medical Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review patients who have consulted with you, appointment frequency, and contact records.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Patient Cards */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map(({ patient, totalAppointments, latestAppointment }) => (
            <div
              key={patient._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={patient.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(patient.name)}`}
                    alt={patient.name}
                    className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{patient.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{patient.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Consultations</span>
                    <span className="font-bold text-brand-600">{totalAppointments} visits</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Blood Group</span>
                    <span className="font-semibold">{patient.bloodGroup || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Gender</span>
                    <span className="font-semibold capitalize">{patient.gender || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Appointment</span>
                    <span className="font-semibold">{latestAppointment?.date || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <Link
                  to={`/doctor/reports?patientId=${patient._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Upload Report</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No Patients Found"
          description="Patients who book consultations with you will appear in this registry."
        />
      )}
    </div>
  );
};

export default DoctorPatients;
