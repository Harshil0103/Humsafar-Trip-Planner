import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, FileText, Image as ImageIcon, Save, Shield, CheckCircle2, Database, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || AVATAR_PRESETS[0]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl
      };

      if (newPassword) {
        if (!currentPassword) {
          error('Current password is required to set a new password.');
          setSubmitting(false);
          return;
        }
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      await updateProfile(payload);
      success('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '780px' }}>
      
      <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-xl)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
          <img
            src={avatarUrl}
            alt={user?.name}
            style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: 'var(--shadow-md)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user?.name}</h1>
              <span className="badge badge-primary">{user?.role}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
          </div>
        </div>

        {/* Firestore Explorer Banner */}
        <div style={{
          marginBottom: '2rem',
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)',
          border: '1px solid #c7d2fe',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#4f46e5', color: '#fff', padding: '0.55rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#312e81' }}>Cloud Firestore Live Database</div>
              <div style={{ fontSize: '0.8rem', color: '#4338ca' }}>Connected to humsafar-trip-planner-2026 for {user?.email}</div>
            </div>
          </div>
          <Link to="/firestore" className="btn btn-sm" style={{ background: '#4f46e5', color: '#fff', fontWeight: 600, gap: '0.4rem' }}>
            Open Firestore Explorer <ArrowRight size={14} />
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Personal Information</h3>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="profile-name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-bio">Traveler Bio</label>
            <div style={{ position: 'relative' }}>
              <textarea
                id="profile-bio"
                className="form-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your travel style or favorite places..."
              />
            </div>
          </div>

          {/* Avatar Preset Selector */}
          <div className="form-group">
            <label className="form-label">Profile Avatar</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {AVATAR_PRESETS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Avatar preset ${i}`}
                  onClick={() => setAvatarUrl(url)}
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: avatarUrl === url ? '3px solid var(--primary)' : '2px solid transparent',
                    boxShadow: avatarUrl === url ? '0 0 10px var(--primary-glow)' : 'none',
                    transition: 'var(--transition)'
                  }}
                />
              ))}
            </div>
            <input
              type="url"
              className="form-input"
              placeholder="Or enter custom avatar image URL..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          {/* Security & Password */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Security & Password</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Leave blank if you do not wish to change your password.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="current-pass">Current Password</label>
                <input
                  type="password"
                  id="current-pass"
                  className="form-input"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-pass">New Password</label>
                <input
                  type="password"
                  id="new-pass"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="btn-save-profile"
            >
              <Save size={18} />
              <span>{submitting ? 'Saving Profile...' : 'Save Changes'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
