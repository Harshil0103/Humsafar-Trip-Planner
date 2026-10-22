import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Globe, Search, Filter, Star, MapPin, IndianRupee, Calendar, Sparkles,
  ArrowRight, X, SlidersHorizontal
} from 'lucide-react';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Filters
  const searchInitial = searchParams.get('search') || '';
  const regionInitial = searchParams.get('region') || 'All';
  const sortInitial = searchParams.get('sort') || 'rating';

  const [searchTerm, setSearchTerm] = useState(searchInitial);
  const [selectedRegion, setSelectedRegion] = useState(regionInitial);
  const [selectedSort, setSelectedSort] = useState(sortInitial);
  const [maxCost, setMaxCost] = useState(10000);

  useEffect(() => {
    fetchDestinations();
  }, [selectedRegion, selectedSort, maxCost]);

  async function fetchDestinations() {
    setLoading(true);
    try {
      const params = {
        sort: selectedSort,
        maxCost: maxCost < 10000 ? maxCost : undefined,
        region: selectedRegion !== 'All' ? selectedRegion : undefined,
        search: searchTerm.trim() || undefined
      };
      const res = await api.getDestinations(params);
      setDestinations(res.destinations || []);
    } catch (err) {
      console.error('Failed to load destinations:', err);
      error('Failed to fetch destinations.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchDestinations();
  }

  function clearFilters() {
    setSearchTerm('');
    setSelectedRegion('All');
    setSelectedSort('rating');
    setMaxCost(10000);
  }

  const regions = ['All', 'North India', 'South India', 'West India', 'East India', 'Himalayas'];

  return (
    <div className="page-wrapper">
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          <Sparkles size={16} /> Incredible India Discovery
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Explore Iconic Indian Destinations</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Discover handpicked royal heritage cities, serene tropical backwaters, and Himalayan escapes with local highlights and INR estimates.
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Top Search Input & Sort */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '260px', display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search city, country, or keyword (e.g. Kyoto, temples, beaches)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                id="destination-search-input"
              />
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="btn btn-primary" id="btn-search-destinations">
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={18} color="var(--text-muted)" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="form-select"
              style={{ width: 'auto' }}
              id="destination-sort-select"
            >
              <option value="rating">Highest Rated</option>
              <option value="cost_asc">Daily Cost: Low to High</option>
              <option value="cost_desc">Daily Cost: High to Low</option>
              <option value="name">Destination Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Region Filter Buttons & Cost Slider */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Regions */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`btn btn-sm ${selectedRegion === reg ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
                id={`region-btn-${reg.toLowerCase().replace(' ', '-')}`}
              >
                {reg === 'All' ? 'All Regions' : reg}
              </button>
            ))}
          </div>

          {/* Max Cost Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Max Daily Cost: <strong style={{ color: 'var(--primary)' }}>₹{maxCost.toLocaleString('en-IN')}</strong>
            </span>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={maxCost}
              onChange={(e) => setMaxCost(parseInt(e.target.value, 10))}
              style={{ width: '130px', cursor: 'pointer' }}
            />
            {(searchTerm || selectedRegion !== 'All' || maxCost < 10000) && (
              <button onClick={clearFilters} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : destinations.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {destinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              onSelect={(d) => setSelectedDestination(d)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Globe}
          title="No destinations matched your criteria"
          description="Try broadening your search term, resetting region filters, or increasing the max daily budget."
          actionText="Reset All Filters"
          onAction={clearFilters}
        />
      )}

      {/* Destination Detailed View Modal */}
      {selectedDestination && (
        <Modal
          isOpen={!!selectedDestination}
          onClose={() => setSelectedDestination(null)}
          title={selectedDestination.name}
          maxWidth="720px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Daily Cost: </span>
                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>₹{(selectedDestination.estimated_daily_cost || 2500).toLocaleString('en-IN')}/day</strong>
              </div>
              <button
                onClick={() => {
                  navigate(`/trips/new?destination_id=${selectedDestination.id}&destination_name=${encodeURIComponent(selectedDestination.city + ', ' + selectedDestination.country)}&daily_cost=${selectedDestination.estimated_daily_cost || 100}`);
                }}
                className="btn btn-primary"
                style={{ gap: '0.5rem' }}
                id="btn-plan-trip-from-modal"
              >
                <span>Plan Trip to {selectedDestination.city}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          }
        >
          <div>
            <div style={{ height: '260px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <img
                src={selectedDestination.image_url}
                alt={selectedDestination.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span className="badge badge-secondary">{selectedDestination.city}, {selectedDestination.country}</span>
              <span className="badge badge-neutral">{selectedDestination.region}</span>
              <span className="badge badge-warning">★ {selectedDestination.rating} Rating</span>
              <span className="badge badge-primary">Best Seasons: {selectedDestination.best_time_to_visit}</span>
            </div>

            <p style={{ lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
              {selectedDestination.description}
            </p>

            {/* Popular Attractions */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.65rem' }}>Must-Visit Attractions & Sights</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedDestination.popular_attractions?.map((att, i) => (
                  <span key={i} className="badge badge-neutral" style={{ padding: '0.4rem 0.75rem', fontSize: '0.825rem' }}>
                    {att}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Activities */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.65rem' }}>Recommended Activities & Experiences</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
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
