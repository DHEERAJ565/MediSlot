import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorReports = () => {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') || '';

  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [patientId, setPatientId] = useState(preselectedPatientId);
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState('Lab Test');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchReportsAndPatients = async () => {
    try {
      const [repRes, patRes] = await Promise.all([
        api.get('/reports/doctor'),
        api.get('/doctors/my/patients'),
      ]);

      if (repRes.data.success) setReports(repRes.data.reports || []);
      if (patRes.data.success) setPatients(patRes.data.patients || []);
    } catch (err) {
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsAndPatients();
  }, []);

  useEffect(() => {
    if (preselectedPatientId) {
      setPatientId(preselectedPatientId);
      setUploadModalOpen(true);
    }
  }, [preselectedPatientId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF documents are permitted for medical reports.');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB maximum limit.');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      toast.error('Please choose a recipient patient.');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a descriptive report title.');
      return;
    }
    if (!selectedFile) {
      toast.error('Please attach a PDF document file.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('patientId', patientId);
      formData.append('title', title.trim());
      formData.append('reportType', reportType);
      formData.append('description', description.trim());
      formData.append('notes', notes.trim());
      formData.append('reportFile', selectedFile);

      const { data } = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        toast.success(data.message);
        setUploadModalOpen(false);
        setTitle('');
        setDescription('');
        setNotes('');
        setSelectedFile(null);
        fetchReportsAndPatients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (reportId, filename) => {
    try {
      toast.loading('Downloading report...', { id: 'rep-dl' });
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename || 'Doctor_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded successfully!', { id: 'rep-dl' });
    } catch (err) {
      toast.error('Failed to download report.', { id: 'rep-dl' });
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this medical report?')) return;
    try {
      const { data } = await api.delete(`/reports/${reportId}`);
      if (data.success) {
        toast.success('Report deleted successfully.');
        fetchReportsAndPatients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Medical Reports & Uploads
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload official PDF laboratory findings and diagnostic reports securely tied to patient records.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Patient Report</span>
        </button>
      </div>

      {/* Reports Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : reports.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/60">
                <tr>
                  <th className="py-4 px-6">Report Title & Type</th>
                  <th className="py-4 px-6">Recipient Patient</th>
                  <th className="py-4 px-6">Upload Date</th>
                  <th className="py-4 px-6">Size</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rep) => (
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
                      <p className="font-semibold text-slate-800 text-xs">{rep.patientId?.name}</p>
                      <p className="text-[11px] text-slate-400">{rep.patientId?.email}</p>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      {new Date(rep.uploadDate).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                      {(rep.fileSize / 1024).toFixed(1)} KB
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(rep._id, rep.originalFileName)}
                          className="p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(rep._id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
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
          title="No Reports Uploaded"
          description="Upload clinical diagnostic findings or pathology PDFs for your authorized patients."
          actionText="Upload First Report"
          onAction={() => setUploadModalOpen(true)}
        />
      )}

      {/* Upload Report Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Authorized Patient PDF Report"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Patient *
            </label>
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(({ patient }) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} ({patient.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Report Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lipid Profile & Rest ECG Analysis"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Report Classification
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="Lab Test">Lab Test</option>
              <option value="Prescription">Prescription</option>
              <option value="Radiology / X-Ray">Radiology / X-Ray</option>
              <option value="Clinical Summary">Clinical Summary</option>
              <option value="Discharge Summary">Discharge Summary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Brief Description
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context or indications for this test..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Attach PDF File (Max 5MB) *
            </label>
            <input
              type="file"
              required
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              {uploading ? 'Encrypting & Uploading...' : 'Upload & Issue Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorReports;
