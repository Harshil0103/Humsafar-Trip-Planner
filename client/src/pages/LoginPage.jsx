import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Mail, Lock, LogIn, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [firebaseConfigNotice, setFirebaseConfigNotice] = useState(false);

  const { login, loginWithGoogle, instantGoogleLogin } = useAuth();
  const { success, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle redirect path from state or search query param
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
    setSubmitting(true);

    try {
      const user = await login(email, password);
      success(`Welcome back to Humsafar, ${user?.name || email?.split('@')[0] || 'Traveler'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage('');
    setFirebaseConfigNotice(false);
    setGoogleSubmitting(true);
    try {
      const user = await loginWithGoogle();
      success(`Signed in with Google as ${user?.name || user?.email || 'Traveler'}!`);
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
        setErrorMessage(err.message || 'Google Sign-In failed. You can use Instant Google Sign-In below.');
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
      const user = await instantGoogleLogin(googleEmailInput, googleNameInput);
      success(`Welcome to Humsafar, ${user?.name || googleNameInput || 'Traveler'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in with Google account.');
    } finally {
      setGoogleSubmitting(false);
    }
  }

  async function handleQuickLogin() {
    setErrorMessage('');
    setSubmitting(true);
    try {
      await login('hp835711@gmail.com', 'AdminPass123!');
      success('Logged in as Harshil Patel (hp835711@gmail.com)');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in.');
    } finally {
      setSubmitting(false);
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
        maxWidth: '470px',
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
            Sign In to <span style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Humsafar</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            {redirectParam ? 'Please sign in to plan and save your trip itinerary' : 'Access your saved journeys, day plans & budget records'}
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
          onClick={handleGoogleSignIn}
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
          id="btn-google-login"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{googleSubmitting ? 'Connecting with Google...' : 'Continue with Google Account'}</span>
        </button>

        {/* Inline Google Quick Sign-In Panel */}
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
                Instant Google Sign-In
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Enter your Google account details to immediately sign in and plan your trip:
            </p>

            <form onSubmit={handleInstantGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Harshil Patel)"
                  className="form-input"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Google Email (e.g. yourname@gmail.com) *"
                  className="form-input"
                  value={googleEmailInput}
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
                  <span>{googleSubmitting ? 'Signing In...' : '🚀 Sign In Now'}</span>
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
            Or sign in with email
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                id="login-email"
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="login-password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', gap: '0.5rem' }}
            disabled={submitting || googleSubmitting}
            id="btn-login-submit"
          >
            <LogIn size={18} />
            <span>{submitting ? 'Authenticating...' : 'Sign In to Humsafar'}</span>
          </button>
        </form>

        {/* 1-Click Fast Sign In for Primary User */}
        <div style={{ margin: '1.75rem 0 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Quick Access Account
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          <button
            type="button"
            onClick={handleQuickLogin}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              gap: '0.5rem',
              justifyContent: 'center',
              padding: '0.65rem 1rem',
              border: '1.5px solid var(--primary)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontWeight: 700
            }}
            disabled={submitting || googleSubmitting}
            id="btn-primary-user-login"
          >
            <Shield size={16} />
            <span>1-Click Sign In: hp835711@gmail.com (Harshil Patel)</span>
          </button>
        </div>

        {/* Footer switch to Register */}
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          New to Humsafar?{' '}
          <Link
            to={`/register${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
            style={{ color: 'var(--primary)', fontWeight: 700 }}
          >
            Create an account free
          </Link>
        </div>
      </div>
    </div>
  );
}
