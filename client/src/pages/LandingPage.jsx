import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass, MapPin, Calendar, IndianRupee, Sparkles, CheckCircle, ArrowRight,
  Globe, Shield, Clock, Heart, Users, Search, Star, Plane, Hotel, ChevronRight,
  Luggage, Navigation, Award, Smile
} from 'lucide-react';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await api.getDestinations({ sort: 'rating' });
        setDestinations(res.destinations || []);
      } catch (err) {
        console.error('Failed to load featured destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/destinations');
    }
  }

  async function handleDemoLogin() {
    try {
      await login('traveler@tripplanner.com', 'TravelPass123!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login failed:', err);
      navigate('/login');
    }
  }

  const featured = destinations.slice(0, 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5.5rem', paddingBottom: '4rem' }}>
      
      {/* Luxury Hero Section */}
      <section style={{
        position: 'relative',
        padding: '6.5rem 0 7.5rem',
        background: 'linear-gradient(135deg, #090d16 0%, #131b32 45%, #24143a 100%)',
        color: '#ffffff',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {/* Ambient Glows */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '8%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '8%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '920px' }}>
          
          {/* Top Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '0.45rem 1.15rem',
            borderRadius: 'var(--radius-full)',
            marginBottom: '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}>
            <Sparkles size={16} color="#38bdf8" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.02em' }}>
              Meet <strong>Humsafar</strong> — The Ultimate Journey Companion
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.6rem, 6vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            color: '#ffffff'
          }}>
            Every Great Journey Needs A True <span style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Humsafar</span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            lineHeight: 1.65,
            color: '#cbd5e1',
            marginBottom: '2.5rem',
            maxWidth: '720px',
            margin: '0 auto 2.75rem'
          }}>
            From day-by-day itineraries and real-time budget meters to interactive map pins and flight schedules — plan, explore, and cherish your adventures with zero stress.
          </p>

          {/* Interactive Floating Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              background: '#ffffff',
              padding: '0.65rem 0.65rem 0.65rem 1.35rem',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 25px 50px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              maxWidth: '650px',
              margin: '0 auto 2.25rem',
              gap: '0.75rem'
            }}
          >
            <Search size={22} color="var(--primary)" />
            <input
              type="text"
              placeholder="Where is your heart taking you? (e.g. Kyoto, Rome, Paris, Bali...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: '1.025rem',
                color: 'var(--text-main)',
                background: 'transparent'
              }}
              id="hero-search-input"
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.8rem 1.75rem' }} id="hero-search-button">
              Explore
            </button>
          </form>

          {/* Quick CTA Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
                <span>Open My Humsafar Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/login?redirect=/trips/new" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
                  <span>Start Planning a Trip</span>
                  <ArrowRight size={18} />
                </Link>
                <button onClick={handleDemoLogin} className="btn btn-secondary btn-lg" style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.25)' }} id="btn-quick-demo-landing">
                  <Sparkles size={18} color="#38bdf8" />
                  <span>1-Click Demo Account</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Stats Counter Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1.5rem',
            marginTop: '3.75rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.85rem', color: '#38bdf8' }}>14+</div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Global Wonders</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.85rem', color: '#a78bfa' }}>100%</div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Free & Open</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.85rem', color: '#34d399' }}>Real-Time</div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Budget Tracking</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.85rem', color: '#f59e0b' }}>4.9 / 5.0</div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Traveler Satisfaction</div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
              <Globe size={16} /> Handpicked Global Escapes
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Popular Destinations</h2>
          </div>
          <Link to="/destinations" className="btn btn-secondary" style={{ gap: '0.4rem' }}>
            <span>View All Destinations</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>Loading featured destinations...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {featured.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onSelect={(d) => setSelectedDestination(d)}
              />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section style={{ background: 'var(--bg-subtle)', padding: '5.5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            <Clock size={16} /> Effortless 3-Step Journey Builder
          </div>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '1rem' }}>How Humsafar Guides You</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            From bucket-list inspiration to boarding calls, Humsafar handles the logistics so you can savor every moment.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            {/* Step 1 */}
            <div className="card" style={{ padding: '2.75rem 2rem', textAlign: 'center' }}>
              <div style={{
                width: '4.25rem',
                height: '4.25rem',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontWeight: 800,
                fontSize: '1.5rem',
                fontFamily: 'Outfit',
                boxShadow: '0 4px 12px var(--primary-glow)'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>Choose Your Destination</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65 }}>
                Browse curated locations across 5 continents with insights on best visiting seasons, daily costs, and must-see landmarks.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '2.75rem 2rem', textAlign: 'center' }}>
              <div style={{
                width: '4.25rem',
                height: '4.25rem',
                borderRadius: '50%',
                background: 'var(--secondary-light)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontWeight: 800,
                fontSize: '1.5rem',
                fontFamily: 'Outfit',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>Build Day-by-Day Timeline</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65 }}>
                Schedule mornings, afternoons, and nights with time-blocked activities, restaurant reservations, and pinpoint map locations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '2.75rem 2rem', textAlign: 'center' }}>
              <div style={{
                width: '4.25rem',
                height: '4.25rem',
                borderRadius: '50%',
                background: 'var(--success-light)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontWeight: 800,
                fontSize: '1.5rem',
                fontFamily: 'Outfit',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>Track Budget & Enjoy</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65 }}>
                Log expenses on the go, stay under budget with visual charts, and keep all hotel check-ins and transit passes in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            <Sparkles size={16} /> Comprehensive Travel Suite
          </div>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '1rem' }}>Built For Curious Explorers</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto' }}>
            Everything you need for stress-free exploration across solo backpacking, family road trips, and honeymoon getaways.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="card card-interactive" style={{ padding: '2.25rem' }}>
            <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '14px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.35rem' }}>
              <Calendar size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Smart Day-by-Day Timeline</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65 }}>
              Organize mornings, afternoons, and evenings with category icons, locations, start/end times, and note annotations.
            </p>
          </div>

          <div className="card card-interactive" style={{ padding: '2.25rem' }}>
            <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '14px', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.35rem' }}>
              <IndianRupee size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dynamic Budget Analytics</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65 }}>
              Categorized expense logging with visual progress meters, remaining balance warnings, and category breakdown charts.
            </p>
          </div>

          <div className="card card-interactive" style={{ padding: '2.25rem' }}>
            <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '14px', background: 'var(--accent-light)', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.35rem' }}>
              <MapPin size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Interactive Map Exploration</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65 }}>
              Interactive OpenStreetMap pins pinpointing your stays, must-visit sights, and dining spots with custom popup details.
            </p>
          </div>

          <div className="card card-interactive" style={{ padding: '2.25rem' }}>
            <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '14px', background: 'var(--success-light)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.35rem' }}>
              <Plane size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Multi-Modal Transit & Stays</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65 }}>
              Keep flight numbers, train tickets, rental cars, and hotel check-in times neatly accessible in one central itinerary.
            </p>
          </div>

          <div className="card card-interactive" style={{ padding: '2.25rem' }}>
            <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.12)', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.35rem' }}>
              <Luggage size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Smart Packing Checklist</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65 }}>
              Never leave your passport or charger behind. Categorized checklist with progress tracking and custom item notes.
            </p>
          </div>

          <div className="card card-interactive" style={{ padding: '2.25rem' }}>
            <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '14px', background: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.35rem' }}>
              <Shield size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>1-Click Print & PDF Ready</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65 }}>
              Export clean, printer-friendly summary sheets of your trip to take with you even when offline in remote locations.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials / Inspiration Banner */}
      <section className="container">
        <div className="card card-gradient-hero" style={{
          padding: '4.5rem 2.5rem',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={22} fill="#f59e0b" color="#f59e0b" />
            ))}
          </div>

          <blockquote style={{ fontSize: '1.45rem', fontWeight: 500, lineHeight: 1.65, maxWidth: '760px', margin: '0 auto 2.25rem', fontStyle: 'italic' }}>
            "Humsafar completely elevated how my family and I travel. Having day-by-day timings, budget tracking, and hotel reservations together in one gorgeous interface made our trip truly unforgettable."
          </blockquote>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=140&q=80"
              alt="Elena Rostova"
              style={{ width: '3.25rem', height: '3.25rem', borderRadius: '50%', objectFit: 'cover', border: '2px solid #818cf8' }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>Elena Rostova</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Global Travel Writer & Photographer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Destination Quick Preview Modal */}
      {selectedDestination && (
        <Modal
          isOpen={!!selectedDestination}
          onClose={() => setSelectedDestination(null)}
          title={selectedDestination.name}
          maxWidth="680px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Cost: </span>
                <strong style={{ color: 'var(--primary)' }}>₹{(selectedDestination.estimated_daily_cost || 2500).toLocaleString('en-IN')}/day</strong>
              </div>
              <button
                onClick={() => {
                  navigate(`/trips/new?destination_id=${selectedDestination.id}&destination_name=${encodeURIComponent(selectedDestination.city + ', ' + selectedDestination.country)}`);
                }}
                className="btn btn-primary"
                style={{ gap: '0.5rem' }}
              >
                <span>Plan a Trip with Humsafar</span>
                <ArrowRight size={16} />
              </button>
            </div>
          }
        >
          <div>
            <div style={{ height: '230px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.35rem' }}>
              <img
                src={selectedDestination.image_url}
                alt={selectedDestination.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-secondary">{selectedDestination.country}</span>
              <span className="badge badge-neutral">{selectedDestination.region}</span>
              <span className="badge badge-warning">★ {selectedDestination.rating}</span>
              <span className="badge badge-primary">Best: {selectedDestination.best_time_to_visit}</span>
            </div>

            <p style={{ lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {selectedDestination.description}
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Top Attractions</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {selectedDestination.popular_attractions?.map((att, i) => (
                  <span key={i} className="badge badge-neutral">{att}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Recommended Experiences</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {selectedDestination.recommended_activities?.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
