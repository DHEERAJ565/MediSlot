import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axiosClient';
import {
  Stethoscope,
  MapPin,
  Clock,
  Save,
  Briefcase,
  IndianRupee,
  Hospital,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const { doctorProfile, updateDoctorProfileState } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualifications: '',
    experienceYears: 1,
    consultationFee: 500,
    hospitalAffiliation: '',
    bio: '',
    phone: '',
    clinicName: '',
    clinicStreet: '',
    clinicCity: '',
    clinicState: '',
    clinicZip: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doctorProfile) {
      setFormData({
        name: doctorProfile.name || '',
        specialization: doctorProfile.specialization || '',
        qualifications: doctorProfile.qualifications?.join(', ') || '',
        experienceYears: doctorProfile.experienceYears || 1,
        consultationFee: doctorProfile.consultationFee || 500,
        hospitalAffiliation: doctorProfile.hospitalAffiliation || '',
        bio: doctorProfile.bio || '',
        phone: doctorProfile.phone || '',
        clinicName: doctorProfile.clinicAddress?.name || '',
        clinicStreet: doctorProfile.clinicAddress?.street || '',
        clinicCity: doctorProfile.clinicAddress?.city || '',
        clinicState: doctorProfile.clinicAddress?.state || '',
        clinicZip: doctorProfile.clinicAddress?.zip || '',
      });
    }
  }, [doctorProfile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorProfile?._id) return;
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        specialization: formData.specialization,
        qualifications: formData.qualifications.split(',').map((s) => s.trim()).filter(Boolean),
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
        hospitalAffiliation: formData.hospitalAffiliation,
        bio: formData.bio,
        phone: formData.phone,
        clinicAddress: {
          name: formData.clinicName,
          street: formData.clinicStreet,
          city: formData.clinicCity,
          state: formData.clinicState,
          zip: formData.clinicZip,
        },
      };

      const { data } = await api.put(`/doctors/${doctorProfile._id}`, payload);
      if (data.success) {
        updateDoctorProfileState(data.doctor);
        toast.success('Doctor profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex items-center gap-4">
        <img
          src={doctorProfile?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(doctorProfile?.name || 'Doctor')}`}
          alt={doctorProfile?.name}
          className="w-20 h-20 rounded-2xl object-cover bg-slate-100 border border-slate-200"
        />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{doctorProfile?.name}</h1>
          <p className="text-xs text-brand-600 font-bold uppercase">{doctorProfile?.specialization}</p>
          <p className="text-xs text-slate-400">{doctorProfile?.hospitalAffiliation}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-5">
        <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-brand-600" />
          Professional Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Specialization *
            </label>
            <input
              type="text"
              required
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Qualifications (comma separated)
            </label>
            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="MBBS, MD - Cardiology"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Experience (Years)
            </label>
            <input
              type="number"
              min="0"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Consultation Fee (₹)
            </label>
            <input
              type="number"
              min="0"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hospital Affiliation
            </label>
            <input
              type="text"
              name="hospitalAffiliation"
              value={formData.hospitalAffiliation}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Doctor Biography
          </label>
          <textarea
            rows="3"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed"
          />
        </div>

        <h3 className="text-base font-bold text-slate-800 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-600" />
          Clinic Location & Address
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clinic / Center Name
            </label>
            <input
              type="text"
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Street & Suite
            </label>
            <input
              type="text"
              name="clinicStreet"
              value={formData.clinicStreet}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              City
            </label>
            <input
              type="text"
              name="clinicCity"
              value={formData.clinicCity}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              State
            </label>
            <input
              type="text"
              name="clinicState"
              value={formData.clinicState}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Postal Zip Code
            </label>
            <input
              type="text"
              name="clinicZip"
              value={formData.clinicZip}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;
