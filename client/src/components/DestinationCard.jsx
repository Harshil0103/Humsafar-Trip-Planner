import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, DollarSign, Calendar, Sparkles, ArrowRight } from 'lucide-react';

export default function DestinationCard({ destination, onSelect }) {
  const navigate = useNavigate();

  function handlePlanTrip(e) {
    e.stopPropagation();
    navigate(`/trips/new?destination_id=${destination.id}&destination_name=${encodeURIComponent(destination.city + ', ' + destination.country)}&daily_cost=${destination.estimated_daily_cost || 100}`);
  }

  return (
    <div
      className="card"
      onClick={() => onSelect && onSelect(destination)}
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
      }}
    >
      {/* Cover Image */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img
          src={destination.image_url}
          alt={destination.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          loading="lazy"
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 40%, rgba(0,0,0,0.75) 100%)'
        }} />

        {/* Region Tag */}
        <div style={{ position: 'absolute', top: '0.85rem', left: '0.85rem' }}>
          <span className="badge" style={{ background: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', backdropFilter: 'blur(4px)' }}>
            {destination.region}
          </span>
        </div>

        {/* Rating Badge */}
        <div style={{ position: 'absolute', top: '0.85rem', right: '0.85rem' }}>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#b45309', fontWeight: 700 }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            {destination.rating ? destination.rating.toFixed(1) : '4.8'}
          </span>
        </div>

        {/* City & Country */}
        <div style={{ position: 'absolute', bottom: '0.85rem', left: '1rem', right: '1rem', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <MapPin size={15} color="#38bdf8" />
            <span>{destination.city}, {destination.country}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
          {destination.name}
        </h3>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {destination.description}
        </p>

        {/* Popular Sights Taglets */}
        {destination.popular_attractions && destination.popular_attractions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.2rem' }}>
            {destination.popular_attractions.slice(0, 3).map((sight, idx) => (
              <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
                {sight}
              </span>
            ))}
          </div>
        )}

        {/* Footer info & CTA */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Est. Daily Cost
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
              ${destination.estimated_daily_cost || 100}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/day</span>
            </div>
          </div>

          <button
            onClick={handlePlanTrip}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <span>Plan Trip</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
