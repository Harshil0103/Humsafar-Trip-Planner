import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, MapPin, Plus, User, LogOut, Shield, Menu, X, Globe, Briefcase, Sparkles, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleLogout() {
    logout();
    info('You have been logged out.');
    navigate('/');
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 500,
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
      boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.05)',
      transition: 'var(--transition)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.75rem' }}>
        
        {/* Humsafar Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 6px 16px rgba(79, 70, 229, 0.35)'
          }}>
            <Compass size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.45rem', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
                Hum<span style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>safar</span>
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>PRO</span>
            </div>
            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Your Journey Companion
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1.85rem' }} className="desktop-nav">
          <Link to="/destinations" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontWeight: 600,
            fontSize: '0.925rem',
            color: isActive('/destinations') ? 'var(--primary)' : 'var(--text-main)',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-md)',
            background: isActive('/destinations') ? 'var(--primary-light)' : 'transparent',
            transition: 'var(--transition)'
          }}>
            <Globe size={18} />
            <span>Destinations</span>
          </Link>

          {isAuthenticated && (
            <Link to="/dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-main)',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              background: isActive('/dashboard') ? 'var(--primary-light)' : 'transparent',
              transition: 'var(--transition)'
            }}>
              <Briefcase size={18} />
              <span>My Trips</span>
            </Link>
          )}

          <Link to="/firestore" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontWeight: 600,
            fontSize: '0.925rem',
            color: isActive('/firestore') ? '#4338ca' : 'var(--text-main)',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-md)',
            background: isActive('/firestore') ? '#ede9fe' : 'transparent',
            transition: 'var(--transition)'
          }}>
            <Database size={17} color="#4f46e5" />
            <span>Firestore Data</span>
          </Link>

          {isAdmin && (
            <Link to="/admin" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/admin') ? 'var(--accent)' : 'var(--text-main)',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              background: isActive('/admin') ? 'var(--accent-light)' : 'transparent',
              transition: 'var(--transition)'
            }}>
              <Shield size={18} />
              <span>Admin Portal</span>
            </Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="desktop-actions">
          {isAuthenticated ? (
            <>
              <Link to="/trips/new" className="btn btn-primary btn-sm" id="btn-create-trip-nav" style={{ gap: '0.4rem' }}>
                <Plus size={16} />
                <span>New Trip</span>
              </Link>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    padding: '0.35rem 0.85rem 0.35rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  id="user-profile-menu-button"
                >
                  <img
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user?.name}
                    style={{ width: '2.1rem', height: '2.1rem', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
                      {user?.name?.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {user?.role || 'Traveler'}
                    </div>
                  </div>
                </button>

                {dropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 0.5rem)',
                      width: '230px',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: '0.6rem',
                      zIndex: 600,
                      animation: 'slideUp 0.15s ease-out'
                    }}
                  >
                    <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.35rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{user?.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        borderRadius: 'var(--radius-md)',
                        textDecoration: 'none',
                        transition: 'var(--transition)'
                      }}
                      className="nav-dropdown-item"
                    >
                      <User size={16} color="var(--primary)" />
                      <span>Profile & Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.65rem 0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--accent)',
                          borderRadius: 'var(--radius-md)',
                          textDecoration: 'none',
                          transition: 'var(--transition)'
                        }}
                      >
                        <Shield size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.35rem 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--danger)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        transition: 'var(--transition)'
                      }}
                      id="logout-button"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn" style={{ gap: '0.35rem' }}>
                <Sparkles size={14} />
                <span>Join Humsafar</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--text-main)'
          }}
          className="mobile-burger"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          padding: '1.25rem 1.5rem 1.75rem',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideUp 0.2s ease-out'
        }}>
          <Link
            to="/destinations"
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: '0.5rem 0', color: 'var(--text-main)' }}
          >
            <Globe size={18} color="var(--primary)" /> Destinations
          </Link>

          <Link
            to="/firestore"
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: '0.5rem 0', color: '#4f46e5' }}
          >
            <Database size={18} color="#4f46e5" /> Firestore Cloud Data
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: '0.5rem 0', color: 'var(--text-main)' }}
              >
                <Briefcase size={18} color="var(--primary)" /> My Trips
              </Link>
              <Link
                to="/trips/new"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Plus size={18} /> Create New Trip
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: '0.5rem 0', color: 'var(--text-main)' }}
              >
                <User size={18} color="var(--primary)" /> Profile & Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--accent)' }}
                >
                  <Shield size={18} /> Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <LogOut size={18} /> Log Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ width: '100%' }}>
                Log In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-burger { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
