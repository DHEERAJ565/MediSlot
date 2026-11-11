import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Activity,
  UserRound,
  LogOut,
  LayoutDashboard,
  CalendarDays,
  Tv,
  Menu,
  X,
  ChevronDown,
  Clock3,
  Stethoscope,
  ArrowUpRight,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  const isActive = (path) => location.pathname === path;
  const navClass = (path) => `nav-link ${isActive(path) ? 'nav-link-active' : ''}`;
  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-brand" onClick={closeMobile} aria-label="MediSlot home">
          <span className="site-brand-icon"><Activity className="w-5 h-5" strokeWidth={2.5} /></span>
          <span className="site-brand-name">Medi<span>Slot</span><small>CARE, CONNECTED</small></span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link to="/" className={navClass('/')}>Home</Link>
          <Link to="/doctors" className={navClass('/doctors')}><Stethoscope className="w-3.5 h-3.5" /> Find doctors</Link>
          <Link to="/queue-display" className={navClass('/queue-display')}><Tv className="w-3.5 h-3.5" /> Queue display</Link>
        </nav>

        <div className="desktop-nav-actions">
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className={`user-menu-trigger ${dropdownOpen ? 'user-menu-trigger-open' : ''}`}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.name)}`}
                  alt=""
                  className="user-menu-avatar"
                />
                <span className="user-menu-copy"><strong>{user.name}</strong><small>{user.role} account</small></span>
                <ChevronDown className={`w-4 h-4 user-menu-chevron ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <button className="dropdown-backdrop" onClick={() => setDropdownOpen(false)} aria-label="Close account menu" />
                  <div className="user-dropdown" role="menu">
                    <div className="user-dropdown-head">
                      <p>{user.name}</p>
                      <span>{user.email}</span>
                    </div>
                    <Link to={getDashboardLink()} role="menuitem" onClick={() => setDropdownOpen(false)}><LayoutDashboard className="w-4 h-4" /> Dashboard <ArrowUpRight className="w-3.5 h-3.5 ml-auto" /></Link>
                    {user.role === 'patient' && (
                      <>
                        <Link to="/patient/appointments" role="menuitem" onClick={() => setDropdownOpen(false)}><CalendarDays className="w-4 h-4" /> My appointments</Link>
                        <Link to="/patient/tokens" role="menuitem" onClick={() => setDropdownOpen(false)}><Clock3 className="w-4 h-4" /> Queue status</Link>
                      </>
                    )}
                    {user.role === 'doctor' && <Link to="/doctor/queue" role="menuitem" onClick={() => setDropdownOpen(false)}><Clock3 className="w-4 h-4" /> Queue manager</Link>}
                    <Link
                      to={user.role === 'doctor' ? '/doctor/profile' : user.role === 'admin' ? '/admin/dashboard' : '/patient/profile'}
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    ><UserRound className="w-4 h-4" /> Profile</Link>
                    <div className="user-dropdown-divider" />
                    <button type="button" onClick={handleLogout} className="user-dropdown-logout"><LogOut className="w-4 h-4" /> Sign out</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-signin">Sign in</Link>
              <Link to="/register" className="nav-register">Get started <ArrowUpRight className="w-3.5 h-3.5" /></Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav-panel">
          <Link to="/" onClick={closeMobile} className={navClass('/')}>Home</Link>
          <Link to="/doctors" onClick={closeMobile} className={navClass('/doctors')}><Stethoscope className="w-4 h-4" /> Find doctors</Link>
          <Link to="/queue-display" onClick={closeMobile} className={navClass('/queue-display')}><Tv className="w-4 h-4" /> Queue display</Link>
          <div className="mobile-nav-divider" />
          {isAuthenticated ? (
            <>
              <div className="mobile-user-summary">
                <img src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.name)}`} alt="" />
                <div><strong>{user.name}</strong><span>{user.role} account</span></div>
              </div>
              <Link to={getDashboardLink()} onClick={closeMobile} className="mobile-dashboard-link"><LayoutDashboard className="w-4 h-4" /> Go to dashboard</Link>
              <button type="button" onClick={handleLogout} className="mobile-signout"><LogOut className="w-4 h-4" /> Sign out</button>
            </>
          ) : (
            <div className="mobile-auth-actions">
              <Link to="/login" onClick={closeMobile} className="mobile-login">Sign in</Link>
              <Link to="/register" onClick={closeMobile} className="mobile-register">Create account <ArrowUpRight className="w-4 h-4" /></Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
