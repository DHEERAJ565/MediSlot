import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { MetricSkeleton } from '../common/LoadingSkeleton';

const DashboardLayout = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading MediSlot Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col dashboard-canvas">
      <Navbar />
      <div className="flex flex-1 max-w-[1440px] w-full mx-auto">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
