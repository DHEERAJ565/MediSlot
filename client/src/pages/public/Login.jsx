import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { loginSchema } from '../../validators/schemas';
import FormField from '../../components/common/FormField';
import { Activity, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    values,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    validate,
  } = useFormValidation(
    { email: '', password: '' },
    loginSchema
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, data } = validate();
    if (!isValid) return;

    setIsSubmitting(true);
    const result = await login(data.email, data.password);
    setIsSubmitting(false);

    if (result.success) {
      const returnUrl = location.state?.returnUrl;
      if (returnUrl) {
        navigate(returnUrl);
        return;
      }

      if (result.user.role === 'admin') navigate('/admin/dashboard');
      else if (result.user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    }
  };

  const handleQuickFill = (roleEmail, rolePassword) => {
    setFieldValue('email', roleEmail);
    setFieldValue('password', rolePassword);
    toast.success(`Loaded credentials for ${roleEmail}`, { duration: 1800 });
  };

  return (
    <div className="auth-stage min-h-[calc(100vh-12rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In
          </h1>
          <p className="text-xs text-slate-500">
            Enter your credentials to access your MediSlot dashboard
          </p>
        </div>

        {/* Card */}
        <div className="auth-panel bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              placeholder="name@medislot.com"
              icon={Mail}
              required
              autoComplete="email"
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              placeholder="••••••••"
              icon={Lock}
              required
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Discreet demo credentials row */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 mb-2">Demo 1-Click Access:</p>
            <div className="flex items-center justify-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('patient@medislot.com', 'patient123')}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-[11px] transition-colors"
              >
                Patient
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => handleQuickFill('doctor@medislot.com', 'doctor123')}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-[11px] transition-colors"
              >
                Doctor
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@medislot.com', 'admin123')}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-[11px] transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Register as Patient
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
