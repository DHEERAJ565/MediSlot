import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Clock3,
  FileText,
  UserRound,
  Users,
  Stethoscope,
  LogOut,
  SlidersHorizontal,
  Tv,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const role = user.role;
  const patientNav = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'My Appointments', path: '/patient/appointments', icon: CalendarDays },
    { name: 'Live Token Queue', path: '/patient/tokens', icon: Clock3 },
    { name: 'Medical Reports', path: '/patient/reports', icon: FileText },
    { name: 'Find Doctors', path: '/doctors', icon: Stethoscope },
    { name: 'Profile', path: '/patient/profile', icon: UserRound },
  ];
  const doctorNav = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Queue Manager', path: '/doctor/queue', icon: Clock3 },
    { name: 'Appointments', path: '/doctor/appointments', icon: CalendarDays },
    { name: 'Availability & Slots', path: '/doctor/availability', icon: SlidersHorizontal },
    { name: 'Patient Directory', path: '/doctor/patients', icon: Users },
    { name: 'Medical Reports', path: '/doctor/reports', icon: FileText },
    { name: 'Profile', path: '/doctor/profile', icon: UserRound },
  ];
  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Doctors', path: '/admin/doctors', icon: Stethoscope },
    { name: 'Manage Patients', path: '/admin/patients', icon: Users },
    { name: 'Appointments', path: '/admin/appointments', icon: CalendarDays },
    { name: 'Monitor Queues', path: '/admin/queues', icon: Clock3 },
    { name: 'Reception Display', path: '/queue-display', icon: Tv },
  ];
  const navItems = role === 'admin' ? adminNav : role === 'doctor' ? doctorNav : patientNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="dashboard-sidebar">
      <div>
        <div className="sidebar-portal-card">
          <div>
            <p>MediSlot portal</p>
            <strong>{role} workspace</strong>
          </div>
          <span className="sidebar-online-indicator" title="Workspace active" />
        </div>
        <p className="sidebar-section-label">Workspace menu</p>
        <nav className="sidebar-nav" aria-label={`${role} workspace navigation`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/doctors' || item.path.endsWith('/dashboard')}
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-user-area">
        <div className="sidebar-user-card">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.name)}`}
            alt=""
            className="sidebar-user-avatar"
          />
          <div className="sidebar-user-copy">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>
        <button type="button" onClick={handleLogout} className="sidebar-logout">
          <LogOut className="w-4 h-4" /> <span>Sign out of workspace</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
