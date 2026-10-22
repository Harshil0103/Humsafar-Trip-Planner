import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase, Calendar, MapPin, Users, IndianRupee, Image as ImageIcon,
  Sparkles, ArrowLeft, Check, Compass, Info
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { saveTripToFirestore } from '../services/firebase';

const CURATED_COVERS = [
  { name: 'Jaipur Hawa Mahal', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Agra Taj Mahal', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Kerala Backwaters', url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Varanasi Ghats', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Amritsar Golden Temple', url: 'https://images.unsplash.com/photo-1588096344356-9a4057861e69?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Ladakh Pangong Tso', url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Udaipur Lake Palace', url: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Goa Palm Beach', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80' }
];

export default function CreateTripPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();

  const prefillDestId = searchParams.get('destination_id');
  const prefillDestName = searchParams.get('destination_name') || '';
  const prefillDailyCost = searchParams.get('daily_cost');

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [title, setTitle] = useState(prefillDestName ? `Adventure to ${prefillDestName.split(',')[0]}` : '');
  const [destinationName, setDestinationName] = useState(prefillDestName);
  const [destinationId, setDestinationId] = useState(prefillDestId || '');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [travelersCount, setTravelersCount] = useState(2);
  const [estimatedBudget, setEstimatedBudget] = useState('25000');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(CURATED_COVERS[0].url);
  const [destinationsList, setDestinationsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const res = await api.getDestinations();
        setDestinationsList(res.destinations || []);
      } catch (err) {
        console.error('Failed to load destination list:', err);
      }
    }
    loadDestinations();
  }, []);

  function handleDestinationSelect(e) {
    const val = e.target.value;
    if (!val) {
      setDestinationId('');
      return;
    }
    const found = destinationsList.find((d) => d.id === parseInt(val, 10));
    if (found) {
      setDestinationId(found.id);
      const name = `${found.city}, ${found.country}`;
      setDestinationName(name);
      if (!title || title.startsWith('Adventure to')) {
        setTitle(`Adventure to ${found.city}`);
      }
      if (found.image_url) {
        setCoverImage(found.image_url);
      }
      // Calculate suggested budget
      const days = getDaysDifference(startDate, endDate);
      const daily = found.estimated_daily_cost || 120;
      setEstimatedBudget(Math.round(days * daily * (travelersCount || 1)).toString());
    }
  }

  function getDaysDifference(start, end) {
    if (!start || !end) return 1;
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !destinationName.trim() || !startDate || !endDate) {
      error('Please complete all required fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      error('Start date cannot be after end date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createTrip({
        title: title.trim(),
        destination_name: destinationName.trim(),
        destination_id: destinationId ? parseInt(destinationId, 10) : null,
        start_date: startDate,
        end_date: endDate,
        travelers_count: parseInt(travelersCount, 10) || 1,
        estimated_budget: parseFloat(estimatedBudget) || 0,
        description: description.trim(),
        cover_image: coverImage
      });

      success(`Trip "${res.trip.title}" created successfully!`);
      // Sync with Firestore in background if available
      saveTripToFirestore(user?.id, res.trip).catch(() => {});
      navigate(`/trips/${res.trip.id}`);
    } catch (err) {
      console.error('Create trip error:', err);
      error(err.message || 'Failed to create trip.');
    } finally {
      setSubmitting(false);
    }
  }

  const daysCount = getDaysDifference(startDate, endDate);

  return (
    <div className="page-wrapper" style={{ maxWidth: '840px' }}>
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', gap: '0.4rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-xl)' }}>
        
        {/* Title Header */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            <Briefcase size={16} /> Itinerary Creation
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Plan a New Journey</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Set up your trip details to generate your day-by-day itinerary and budget dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Trip Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="trip-title">Trip Name *</label>
            <input
              type="text"
              id="trip-title"
              className="form-input"
              placeholder="e.g. Autumn Temples & Culinary Journey in Kyoto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Destination Selector & Custom Input */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="destination-select">Choose Destination</label>
              <select
                id="destination-select"
                className="form-select"
                value={destinationId}
                onChange={handleDestinationSelect}
              >
                <option value="">-- Select from Curated Destinations --</option>
                {destinationsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.city}, {d.country})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="destination-name">Destination Location *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="destination-name"
                  className="form-input"
                  placeholder="e.g. Kyoto, Japan"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                  required
                  style={{ paddingLeft: '2.4rem' }}
                />
                <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          {/* Dates & Duration */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="start-date">Start Date *</label>
              <input
                type="date"
                id="start-date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="end-date">End Date *</label>
              <input
                type="date"
                id="end-date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration</label>
              <div style={{
                padding: '0.75rem 1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                color: 'var(--primary)',
                textAlign: 'center'
              }}>
                {daysCount} Days
              </div>
            </div>
          </div>

          {/* Travelers & Estimated Budget */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="travelers-count">Number of Travelers</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  id="travelers-count"
                  className="form-input"
                  min="1"
                  max="50"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                />
                <Users size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="estimated-budget">Estimated Budget (₹ INR)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  id="estimated-budget"
                  className="form-input"
                  min="0"
                  step="500"
                  placeholder="25000"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                />
                <IndianRupee size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="trip-description">Trip Notes & Description</label>
            <textarea
              id="trip-description"
              className="form-textarea"
              placeholder="What are the main goals of this trip? (e.g. food tours, museum passes, relaxing escapes...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Cover Image Gallery Selector */}
          <div className="form-group">
            <label className="form-label">Select Cover Image</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              {CURATED_COVERS.map((cov, i) => (
                <div
                  key={i}
                  onClick={() => setCoverImage(cov.url)}
                  style={{
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    border: coverImage === cov.url ? '3px solid var(--primary)' : '2px solid transparent',
                    boxShadow: coverImage === cov.url ? 'var(--shadow-glow)' : 'none',
                    transition: 'var(--transition)'
                  }}
                >
                  <img src={cov.url} alt={cov.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {coverImage === cov.url && (
                    <div style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'var(--primary)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={12} />
                    </div>
                  )}
                  <span style={{
                    position: 'absolute',
                    bottom: 2,
                    left: 4,
                    fontSize: '0.65rem',
                    color: '#fff',
                    fontWeight: 700,
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                  }}>
                    {cov.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom URL Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                className="form-input"
                placeholder="Or paste custom image URL..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                id="custom-cover-image-input"
              />
              <ImageIcon size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Form Submit Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            marginTop: '1.5rem'
          }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
              id="btn-create-trip-submit"
            >
              <Sparkles size={18} />
              <span>{submitting ? 'Creating Itinerary...' : 'Create Trip & Start Planning'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
