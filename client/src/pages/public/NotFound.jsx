import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          The medical directory or dashboard page you were seeking does not exist or has been relocated.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
