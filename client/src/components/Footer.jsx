import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Globe, Shield, Sparkles, MapPin, Navigation } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#090d16',
      color: '#94a3b8',
      padding: '4.5rem 0 2.25rem',
      borderTop: '1px solid #1e293b',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem'
        }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0ea5e9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
              }}>
                <Compass size={22} />
              </div>
              <div>
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', color: '#ffffff' }}>
                  Hum<span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>safar</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Your Journey Companion
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#94a3b8', marginBottom: '1.5rem' }}>
              Humsafar empowers travelers and adventurers to plan seamless day-by-day itineraries, track budgets in real time, and turn dreams into lifelong memories.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#818cf8', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
                <Sparkles size={12} /> Smart Planning
              </span>
              <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                <Globe size={12} /> Global Explorer
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '1.25rem', fontFamily: 'Outfit' }}>Destinations</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link to="/destinations" style={{ color: '#cbd5e1', transition: 'var(--transition)' }}>All Curated Wonders</Link></li>
              <li><Link to="/destinations?region=Europe" style={{ color: '#cbd5e1' }}>Europe City Escapes</Link></li>
              <li><Link to="/destinations?region=Asia" style={{ color: '#cbd5e1' }}>Asia Cultural Trails</Link></li>
              <li><Link to="/destinations?region=Americas" style={{ color: '#cbd5e1' }}>Americas Expeditions</Link></li>
            </ul>
          </div>

          {/* Planning Tools */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '1.25rem', fontFamily: 'Outfit' }}>Trip Planning</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link to="/dashboard" style={{ color: '#cbd5e1' }}>My Trips Dashboard</Link></li>
              <li><Link to="/trips/new" style={{ color: '#cbd5e1' }}>Create New Itinerary</Link></li>
              <li><Link to="/profile" style={{ color: '#cbd5e1' }}>Traveler Profile & Settings</Link></li>
              <li><Link to="/admin" style={{ color: '#cbd5e1' }}>Admin Management</Link></li>
            </ul>
          </div>

          {/* Why Humsafar */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '1.25rem', fontFamily: 'Outfit' }}>The Humsafar Promise</h4>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: '#94a3b8', marginBottom: '1.25rem' }}>
              True companions never let you get lost. Built-in maps, offline notes, currency & budget progress, and activity scheduling built for real travelers.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
              <Shield size={16} color="#10b981" />
              <span>Full Data Privacy & SQLite Persistence</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.85rem'
        }}>
          <div>
            © {new Date().getFullYear()} <strong>Humsafar</strong>. Crafted with <Heart size={14} color="#ef4444" style={{ display: 'inline', verticalAlign: 'middle' }} /> for wanderers and globetrotters.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <a href="http://localhost:5000" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>API Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
