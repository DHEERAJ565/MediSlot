import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axiosClient';
import Badge from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  Download,
  CheckCircle2,
  ChevronRight,
  Tv,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [tokenStatuses, setTokenStatuses] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [aptRes, tokenRes, reportRes] = await Promise.all([
        api.get('/appointments/my'),
        api.get('/queue/my-token-status'),
        api.get('/reports/my'),
      ]);

      if (aptRes.data.success) setAppointments(aptRes.data.appointments || []);
      if (tokenRes.data.success) setTokenStatuses(tokenRes.data.tokens || []);
      if (reportRes.data.success) setReports(reportRes.data.reports || []);
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadPdf = async (reportId, filename) => {
    try {
      toast.loading('Downloading report...', { id: 'download' });
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'MediSlot_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded.', { id: 'download' });
    } catch (err) {
      toast.error('Download failed.', { id: 'download' });
    }
  };

  const upcomingAppointments = appointments.filter((a) =>
    ['scheduled', 'in-queue', 'in-consultation'].includes(a.status)
  );

  const activeTodayToken = tokenStatuses.length > 0 ? tokenStatuses[0] : null;

  return (
    <div className="space-y-6">
      {/* Clean Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your consultations, tokens, and medical records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </Link>
          <Link
            to="/patient/tokens"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <Tv className="w-3.5 h-3.5 text-slate-400" />
            <span>Queue Status</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Active Token</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {activeTodayToken ? `#${activeTodayToken.myTokenNumber}` : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {activeTodayToken ? `${activeTodayToken.waitingAhead} patients ahead` : 'No queue today'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Upcoming Visits</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {upcomingAppointments.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Confirmed bookings</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {appointments.filter((a) => a.status === 'completed').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Past consultations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Medical Reports</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {reports.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Authorized PDFs</p>
        </div>
      </div>

      {/* Active Queue Card (If active today) */}
      {activeTodayToken && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                Today's Clinic Queue
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Dr. {activeTodayToken.doctor?.name} ({activeTodayToken.doctor?.specialization})
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled Slot: {activeTodayToken.timeSlot} · Appointment Code: {activeTodayToken.appointmentCode}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="text-center pr-3 border-r border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Your Token</p>
                <p className="text-2xl font-bold font-mono text-brand-600">
                  #{activeTodayToken.myTokenNumber}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Now Serving</p>
                <p className="text-2xl font-bold font-mono text-emerald-600">
                  {activeTodayToken.currentTokenBeingServed > 0 ? `#${activeTodayToken.currentTokenBeingServed}` : '—'}
                </p>
              </div>
              <div className="text-center pl-3 border-l border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Est. Wait</p>
                <p className="text-sm font-bold font-mono text-slate-800">
                  ~{activeTodayToken.approxWaitMinutes}m
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Upcoming Appointments & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appointments (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Upcoming Appointments</h3>
            <Link
              to="/patient/appointments"
              className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton />
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-2">
              {upcomingAppointments.slice(0, 3).map((apt) => (
                <div
                  key={apt._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{apt.doctorId?.name}</p>
                    <p className="text-slate-500">{apt.doctorId?.specialization} · Slot: {apt.timeSlot}</p>
                    <p className="text-slate-400 text-[11px]">Date: {apt.date} · Token #{apt.tokenNumber}</p>
                  </div>
                  <Badge status={apt.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming visits"
              description="You have no appointments currently scheduled."
              actionText="Book a Doctor"
              onAction={() => (window.location.href = '/doctors')}
            />
          )}
        </div>

        {/* Reports (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Medical Reports</h3>
            <Link
              to="/patient/reports"
              className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton />
          ) : reports.length > 0 ? (
            <div className="space-y-2">
              {reports.slice(0, 3).map((rep) => (
                <div
                  key={rep._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{rep.title}</p>
                    <p className="text-slate-500 text-[11px] truncate">Dr. {rep.doctorId?.name}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadPdf(rep._id, rep.originalFileName)}
                    className="p-1.5 text-brand-600 hover:bg-white rounded-lg transition-colors flex-shrink-0"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No reports available"
              description="Medical documents will appear here once uploaded by your doctor."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
