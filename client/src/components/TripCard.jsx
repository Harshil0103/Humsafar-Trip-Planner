import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, IndianRupee, Copy, Trash2, Edit3, ArrowRight, Clock, Camera } from 'lucide-react';

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', options)}`;
}

function getDaysCount(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export default function TripCard({ trip, onDuplicate, onDelete }) {
  const daysCount = getDaysCount(trip.start_date, trip.end_date);
  const totalSpent = parseFloat(trip.total_spent) || 0;
  const budget = parseFloat(trip.estimated_budget) || 0;
  const budgetPercent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  return (
    <div className="card" style={{
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease'
    }}>
      {/* Cover Image Container */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img
          src={trip.cover_image || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'}
          alt={trip.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          className="trip-card-image"
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)'
        }} />

        {/* Status Pill Badge & Completed Photo Tag */}
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {trip.status === 'completed' && (
            <span style={{
              background: '#10b981',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              <Camera size={12} /> Memories
            </span>
          )}
          <span className={`status-pill status-${trip.status || 'planning'}`}>
            {trip.status || 'planning'}
          </span>
        </div>

        {/* Destination & Duration Overlay */}
        <div style={{ position: 'absolute', bottom: '0.85rem', left: '1rem', right: '1rem', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            <MapPin size={15} color="#38bdf8" />
            <span>{trip.destination_name}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/trips/${trip.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            lineHeight: 1.35,
            color: 'var(--text-main)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {trip.title}
          </h3>
        </Link>

        {/* Date & Travelers Meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} />
            {formatDateRange(trip.start_date, trip.end_date)} ({daysCount}d)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={14} />
            {trip.travelers_count || 1} {trip.travelers_count > 1 ? 'Travelers' : 'Traveler'}
          </span>
        </div>

        {/* Budget Progress Bar */}
        {budget > 0 && (
          <div style={{ marginTop: 'auto', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Budget Progress</span>
              <span style={{ color: totalSpent > budget ? 'var(--danger)' : 'var(--text-main)' }}>
                ₹{totalSpent.toLocaleString('en-IN')} / ₹{budget.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${budgetPercent}%`,
                height: '100%',
                background: totalSpent > budget ? 'var(--danger)' : 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                borderRadius: '3px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}

        {/* Card Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: budget > 0 ? '0' : 'auto'
        }}>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(trip.id)}
                className="btn btn-secondary btn-sm"
                title="Duplicate Trip"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <Copy size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(trip.id, trip.title)}
                className="btn btn-danger btn-sm"
                title="Delete Trip"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <Link to={`/trips/${trip.id}`} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
            <span>View Itinerary</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
