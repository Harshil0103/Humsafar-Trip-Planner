import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Mail, Lock, User, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [firebaseConfigNotice, setFirebaseConfigNotice] = useState(false);

  const { register, loginWithGoogle, instantGoogleLogin } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectParam = queryParams.get('redirect');
  const from = location.state?.from
    ? (typeof location.state.from === 'string'
        ? location.state.from
        : (location.state.from.pathname || '/dashboard') + (location.state.from.search || ''))
    : (redirectParam || '/dashboard');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({ name, email, password });
      success(`Welcome to Humsafar, ${user?.name || name || 'Traveler'}! Your account is ready.`);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setErrorMessage('');
    setFirebaseConfigNotice(false);
    setGoogleSubmitting(true);
    try {
      const user = await loginWithGoogle();
      success(`Signed up with Google as ${user?.name || user?.email || 'Traveler'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      console.warn('Firebase Google Auth notice:', err);
      const isConfigIssue =
        err.code === 'auth/configuration-not-found' ||
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/popup-blocked' ||
        err.message?.includes('configuration-not-found') ||
        err.message?.includes('Google Sign-In provider has not been enabled') ||
        err.message?.includes('Instant Google');

      if (isConfigIssue) {
        setFirebaseConfigNotice(true);
        setGoogleModalOpen(true);
      } else {
        setErrorMessage(err.message || 'Google sign-up failed. You can use Instant Google Sign-Up below.');
        setGoogleModalOpen(true);
      }
    } finally {
      setGoogleSubmitting(false);
    }
  }

  async function handleInstantGoogleSubmit(e) {
    if (e) e.preventDefault();
    if (!googleEmailInput.trim()) {
      setErrorMessage('Please enter your Google email address.');
      return;
    }
    setGoogleSubmitting(true);
    try {
      const user = await instantGoogleLogin(googleEmailInput, googleNameInput || name);
      success(`Welcome to Humsafar, ${user?.name || googleNameInput || 'Traveler'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in with Google account.');
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <div className="page-wrapper" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.75rem 2.25rem',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--radius-xl)'
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)'
          }}>
            <Compass size={30} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Join <span style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Humsafar</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            {redirectParam ? 'Create an account to start planning and saving your journey' : 'Start planning smart itineraries with your lifelong travel companion'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Firebase Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleSubmitting || submitting}
          className="btn btn-secondary"
          style={{
            width: '100%',
            padding: '0.8rem 1rem',
            marginBottom: '1rem',
            gap: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem',
            fontWeight: 600,
            borderColor: '#cbd5e1'
          }}
          id="btn-google-signup"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{googleSubmitting ? 'Connecting with Google...' : 'Sign up with Google Account'}</span>
        </button>

        {/* Inline Google Quick Sign-Up Panel */}
        {googleModalOpen && (
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1.5px solid var(--primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                Instant Google Sign-Up
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Enter your Google account details to immediately create your account and start planning:
            </p>

            <form onSubmit={handleInstantGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <input
                  type="text"
                  placeholder="Your Full Name (e.g. Harshil Patel)"
                  className="form-input"
                  value={googleNameInput || name}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Google Email (e.g. yourname@gmail.com) *"
                  className="form-input"
                  value={googleEmailInput || email}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  required
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={googleSubmitting}
                  style={{ flex: 2, gap: '0.4rem', justifyContent: 'center' }}
                >
                  <span>{googleSubmitting ? 'Creating...' : '🚀 Create & Sign In'}</span>
                </button>
              </div>
            </form>

            <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Tip: To enable native Google Popups, activate Google Sign-In at{' '}
              <a
                href="https://console.firebase.google.com/project/humsafar-trip-planner-2026/authentication/providers"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                Firebase Console ↗
              </a>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Or sign up with email
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="register-name"
                className="form-input"
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                id="register-email"
                className="form-input"
                placeholder="traveler@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password (min 6 chars)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="register-password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.75rem', gap: '0.5rem' }}
            disabled={submitting || googleSubmitting}
            id="btn-register-submit"
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Creating Your Account...' : 'Create Humsafar Account'}</span>
          </button>
        </form>

        {/* Footer switch to Login */}
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
          Already have an account?{' '}
          <Link
            to={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
            style={{ color: 'var(--primary)', fontWeight: 700 }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
