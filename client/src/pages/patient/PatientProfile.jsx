import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axiosClient';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Save,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PatientProfile = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || 'other',
    dob: user?.dob ? new Date(user.dob).toISOString().slice(0, 10) : '',
    bloodGroup: user?.bloodGroup || 'Unknown',
    address: user?.address || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', formData);
      if (data.success) {
        updateUser(data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setSavingPassword(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Current password incorrect.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex items-center gap-4">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover bg-slate-100 border border-slate-200"
        />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
          <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
          <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            Registered Patient
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />
            Personal Details
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Address
              </label>
              <textarea
                rows="2"
                name="address"
                value={formData.address}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving...' : 'Update Details'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-600" />
            Security & Password
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmNewPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                }
                placeholder="Repeat new password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-6"
            >
              <Lock className="w-4 h-4" />
              <span>{savingPassword ? 'Updating...' : 'Change Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
