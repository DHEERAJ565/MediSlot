import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Stethoscope,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Edit,
  Mail,
  Phone,
  Briefcase,
  IndianRupee,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Doctor Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Cardiology',
    qualifications: 'MBBS, MD',
    experienceYears: 5,
    consultationFee: 600,
    hospitalAffiliation: 'Apollo / Fortis Partner Network',
    bio: '',
  });
  const [creating, setCreating] = useState(false);

  const fetchDoctors = async () => {
    try {
      // Admin gets all doctors (including deactivated)
      const { data } = await api.get('/doctors?limit=100');
      if (data.success) {
        setDoctors(data.doctors || []);
      }
    } catch (err) {
      toast.error('Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleStatus = async (doctor) => {
    try {
      const { data } = await api.put(`/admin/doctors/${doctor._id}/toggle-status`);
      if (data.success) {
        toast.success(data.message);
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...formData,
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
        qualifications: formData.qualifications.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const { data } = await api.post('/admin/doctors', payload);
      if (data.success) {
        toast.success(data.message);
        setAddModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          specialization: 'Cardiology',
          qualifications: 'MBBS, MD',
          experienceYears: 5,
          consultationFee: 600,
          hospitalAffiliation: 'Apollo / Fortis Partner Network',
          bio: '',
        });
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create doctor.');
    } finally {
      setCreating(false);
    }
  };

  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Doctor Profiles & Credentialing
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register new practitioners, audit clinical specialties, and toggle active status.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Doctor</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by doctor name or specialty..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {/* Doctors Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredDoctors.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/60">
                <tr>
                  <th className="py-4 px-6">Doctor Details</th>
                  <th className="py-4 px-6">Specialization</th>
                  <th className="py-4 px-6">Experience & Fee</th>
                  <th className="py-4 px-6">Affiliation</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDoctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(doc.name)}`}
                          alt={doc.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{doc.name}</p>
                          <p className="text-slate-400 text-[11px] font-mono">{doc.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                        {doc.specialization}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{doc.experienceYears} Years Exp</p>
                      <p className="text-slate-500 font-mono">₹{doc.consultationFee} / consult</p>
                    </td>

                    <td className="py-4 px-6 max-w-xs truncate text-slate-600">
                      {doc.hospitalAffiliation || 'MediSlot Partner Center'}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          doc.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${doc.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {doc.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(doc)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          doc.isActive
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {doc.isActive ? 'Deactivate' : 'Reactivate'}
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
          icon={Stethoscope}
          title="No Doctors Found"
          description="Register a doctor or clear search filter."
          actionText="Add Doctor"
          onAction={() => setAddModalOpen(true)}
        />
      )}

      {/* Add Doctor Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Specialist Doctor"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Doctor Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Rajesh Sharma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Specialization *
              </label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Neurology">Neurology</option>
                <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Oncology">Oncology</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Login Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@medislot.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Account Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Qualifications
              </label>
              <input
                type="text"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                placeholder="MBBS, MD"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Experience (Yrs)
              </label>
              <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hospital Affiliation
            </label>
            <input
              type="text"
              value={formData.hospitalAffiliation}
              onChange={(e) => setFormData({ ...formData, hospitalAffiliation: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Doctor Bio / Summary
            </label>
            <textarea
              rows="2"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              {creating ? 'Registering...' : 'Create Doctor Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDoctors;
