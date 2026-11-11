import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  const getDashboard = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          You do not possess the required permission credentials to view this clinical portal.
          {user && (
            <span className="block mt-1 font-semibold text-slate-700">
              Current Role: <span className="uppercase text-brand-600">{user.role}</span>
            </span>
          )}
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={getDashboard()}
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            Go to My Dashboard
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
