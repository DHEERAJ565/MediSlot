import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  FileText,
  Download,
  Calendar,
  User,
  Eye,
  ShieldCheck,
  Stethoscope,
  Clock,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PatientReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/reports/my');
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (err) {
      toast.error('Failed to load medical reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = async (reportId, filename) => {
    try {
      toast.loading('Downloading verified medical report...', { id: 'rep-download' });
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename || 'Medical_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully!', { id: 'rep-download' });
    } catch (err) {
      toast.error('Unauthorized or file unavailable.', { id: 'rep-download' });
    }
  };

  const filteredReports = reports.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reportType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Encrypted Health Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Medical Reports & Records
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Access authorized diagnostic reports, lab test PDFs, and physician consultation notes.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Reports Table / Card View */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredReports.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/60">
                <tr>
                  <th className="py-4 px-6">Report Title & Type</th>
                  <th className="py-4 px-6">Consulting Doctor</th>
                  <th className="py-4 px-6">Issue Date</th>
                  <th className="py-4 px-6">File Size</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{rep.title}</p>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {rep.reportType}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800 text-xs">{rep.doctorId?.name}</p>
                      <p className="text-[11px] text-slate-400">{rep.doctorId?.specialization}</p>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      {new Date(rep.uploadDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                      {(rep.fileSize / 1024).toFixed(1)} KB
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedReport(rep);
                            setModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownload(rep._id, rep.originalFileName)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Medical Reports Found"
          description="You do not have any diagnostic or laboratory reports uploaded yet."
        />
      )}

      {/* Report Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Diagnostic Report Metadata"
        maxWidth="max-w-md"
      >
        {selectedReport && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="text-base font-bold text-slate-900">{selectedReport.title}</h3>
              <p className="text-brand-600 font-semibold">{selectedReport.reportType}</p>
              <p className="text-slate-500 leading-relaxed">{selectedReport.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400">Consulting Doctor:</span>
                <p className="font-semibold text-slate-800">{selectedReport.doctorId?.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Issue Date:</span>
                <p className="font-semibold text-slate-800">
                  {new Date(selectedReport.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedReport.notes && (
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider">Doctor Notes:</span>
                <p className="p-3 bg-brand-50 text-brand-900 rounded-xl mt-1 border border-brand-200">
                  {selectedReport.notes}
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => handleDownload(selectedReport._id, selectedReport.originalFileName)}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Signed PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientReports;
