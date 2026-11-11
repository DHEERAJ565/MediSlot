import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import Badge from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Stethoscope,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('All');
  const [date, setDate] = useState('');
  const [doctorId, setDoctorId] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get('/doctors?limit=50');
        if (data.success) {
          setDoctors(data.doctors || []);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'All') params.append('status', status);
      if (date) params.append('date', date);
      if (doctorId !== 'All') params.append('doctorId', doctorId);
      if (search) params.append('search', search);
      params.append('page', currentPage);
      params.append('limit', 15);

      const { data } = await api.get(`/admin/appointments?${params.toString()}`);
      if (data.success) {
        setAppointments(data.appointments || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [status, date, doctorId, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAppointments();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Clinic Master Appointment Ledger
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor all scheduled, active, and completed consultation bookings across the healthcare network.
        </p>

        {/* Filter Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code or name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </form>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-queue">In Queue</option>
            <option value="in-consultation">In Consultation</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="skipped">Skipped</option>
          </select>

          <select
            value={doctorId}
            onChange={(e) => {
              setDoctorId(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Doctors</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.specialization})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            />
            {date && (
              <button
                onClick={() => setDate('')}
                className="text-xs text-rose-600 font-semibold whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : appointments.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/60">
                <tr>
                  <th className="py-4 px-6">ID & Token</th>
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Consulting Doctor</th>
                  <th className="py-4 px-6">Date & Slot</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6">Fee & Pay</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-mono font-bold text-slate-800">{apt.appointmentId}</p>
                      <span className="text-[11px] font-mono text-brand-600 font-bold">
                        Token #{apt.tokenNumber}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{apt.patientId?.name || 'Patient'}</p>
                      <p className="text-[11px] text-slate-400">{apt.patientId?.email}</p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{apt.doctorId?.name}</p>
                      <p className="text-[11px] text-brand-600 font-semibold">{apt.doctorId?.specialization}</p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{apt.date}</p>
                      <p className="text-slate-400 text-[11px] font-mono">{apt.timeSlot}</p>
                    </td>

                    <td className="py-4 px-6 max-w-xs truncate text-slate-600">
                      {apt.reason}
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800">₹{apt.amount || apt.doctorId?.consultationFee}</span>
                      <p className="text-[10px] text-slate-400 uppercase">{apt.paymentStatus}</p>
                    </td>

                    <td className="py-4 px-6">
                      <Badge status={apt.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Appointments Found"
          description="Try broadening your filter criteria."
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
