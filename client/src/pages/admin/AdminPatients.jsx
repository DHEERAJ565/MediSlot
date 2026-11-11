import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Mail,
  Phone,
  Droplet,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    try {
      const url = search ? `/admin/patients?search=${encodeURIComponent(search)}` : '/admin/patients';
      const { data } = await api.get(url);
      if (data.success) {
        setPatients(data.patients || []);
      }
    } catch (err) {
      toast.error('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const handleToggleStatus = async (patient) => {
    try {
      const { data } = await api.put(`/admin/patients/${patient._id}/toggle-status`);
      if (data.success) {
        toast.success(data.message);
        fetchPatients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update patient status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Registered Patients Roster
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit registered patients, booking frequency, account statuses, and history.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Patients Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : patients.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/60">
                <tr>
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Contact & Blood</th>
                  <th className="py-4 px-6">Total Visits</th>
                  <th className="py-4 px-6">Latest Appointment</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(p.name)}`}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                          <p className="text-slate-400 text-[11px] font-mono">{p.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <p className="text-slate-700 font-medium">{p.phone || 'No phone'}</p>
                      <p className="text-brand-600 font-bold text-[11px]">Blood: {p.bloodGroup || 'Unknown'}</p>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800 text-sm">{p.appointmentCount || 0}</span>
                      <span className="text-slate-400 text-[11px]"> visits</span>
                    </td>

                    <td className="py-4 px-6">
                      {p.lastAppointment ? (
                        <div>
                          <p className="font-semibold text-slate-800">{p.lastAppointment.date}</p>
                          <p className="text-[11px] text-slate-400">Dr. {p.lastAppointment.doctorId?.name}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {p.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          p.isActive
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {p.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No Patients Found"
          description="No patients match your search term."
        />
      )}
    </div>
  );
};

export default AdminPatients;
