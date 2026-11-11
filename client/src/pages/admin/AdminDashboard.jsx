import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import Badge from '../../components/common/Badge';
import { MetricSkeleton, CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  Stethoscope,
  Calendar,
  FileText,
  TrendingUp,
  ArrowRight,
  Tv,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      toast.error('Failed to load admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const specializationChartData = (stats?.specializationStats || []).map((s) => ({
    name: s._id,
    Doctors: s.count,
  }));

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform analytics, doctor rosters, and appointment metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/doctors"
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            Manage Doctors
          </Link>
          <Link
            to="/queue-display"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Tv className="w-3.5 h-3.5 text-slate-400" />
            <span>Reception Display</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Total Doctors</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {stats?.totalDoctors || 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {stats?.activeDoctors || 0} active
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Registered Patients</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {stats?.totalPatients || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified accounts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Total Bookings</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {stats?.totalAppointments || 0}
          </p>
          <p className="text-[11px] text-brand-600 font-medium mt-0.5">
            {stats?.todayAppointments || 0} scheduled today
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Medical Reports</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {stats?.totalReports || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Stored PDF files</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Trend (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Appointment Activity</h3>
              <p className="text-xs text-slate-400">Total bookings vs completed consultations</p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="total" name="Total Bookings" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#totalColor)" />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#0d9488" strokeWidth={2} fill="#0d9488" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Specialty Distribution</h3>
              <p className="text-xs text-slate-400">Doctors by clinical department</p>
            </div>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specializationChartData} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  angle={-30}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Bar dataKey="Doctors" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Appointments</h3>
            <p className="text-xs text-slate-400">Latest scheduled visits across all specialties</p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
          >
            <span>All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Doctor</th>
                <th className="py-2.5 px-3">Date & Slot</th>
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats?.recentAppointments || []).map((apt) => (
                <tr key={apt._id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                    {apt.appointmentId}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {apt.patientId?.name || 'Patient'}
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-slate-800">{apt.doctorId?.name}</p>
                    <p className="text-[10px] text-slate-400">{apt.doctorId?.specialization}</p>
                  </td>
                  <td className="py-2.5 px-3 font-medium">
                    {apt.date} · {apt.timeSlot}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    #{apt.tokenNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge status={apt.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
