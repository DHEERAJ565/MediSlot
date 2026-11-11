import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { registerSchema } from '../../validators/schemas';
import FormField from '../../components/common/FormField';
import { Activity, User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const {
    values,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validate,
  } = useFormValidation(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      gender: 'male',
      dob: '',
      bloodGroup: 'Unknown',
      address: '',
    },
    registerSchema
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, data } = validate();
    if (!isValid) return;

    setIsSubmitting(true);
    const { confirmPassword, ...submitData } = data;
    const result = await register(submitData);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/patient/dashboard');
    }
  };

  return (
    <div className="auth-stage min-h-[calc(100vh-12rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500">
            Register to book doctor appointments and view live clinic queues
          </p>
        </div>

        {/* Card */}
        <div className="auth-panel bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                label="Full Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
                placeholder="John Doe"
                icon={User}
                required
              />

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                placeholder="john@example.com"
                icon={Mail}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                label="Password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                placeholder="Min 6 characters"
                icon={Lock}
                required
              />

              <FormField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                placeholder="Repeat password"
                icon={Lock}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <FormField
                label="Phone"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone}
                placeholder="10 digits"
                icon={Phone}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={values.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
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

            <FormField
              label="Address (Optional)"
              name="address"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.address}
              placeholder="City, State"
              icon={MapPin}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs mt-2"
            >
              {isSubmitting ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
