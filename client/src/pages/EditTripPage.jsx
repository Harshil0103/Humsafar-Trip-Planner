import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase, Calendar, MapPin, Users, IndianRupee, Image as ImageIcon,
  Save, ArrowLeft, Trash2, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function EditTripPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelersCount, setTravelersCount] = useState(1);
  const [estimatedBudget, setEstimatedBudget] = useState('0');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('planning');

  useEffect(() => {
    async function loadTrip() {
      try {
        const res = await api.getTripById(id);
        const t = res.trip;
        setTitle(t.title || '');
        setDestinationName(t.destination_name || '');
        setStartDate(t.start_date || '');
        setEndDate(t.end_date || '');
        setTravelersCount(t.travelers_count || 1);
        setEstimatedBudget((t.estimated_budget || 0).toString());
        setDescription(t.description || '');
        setCoverImage(t.cover_image || '');
        setStatus(t.status || 'planning');
      } catch (err) {
        console.error('Failed to load trip for editing:', err);
        error('Trip not found or access denied.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [id]);

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
      await api.updateTrip(id, {
        title: title.trim(),
        destination_name: destinationName.trim(),
        start_date: startDate,
        end_date: endDate,
        travelers_count: parseInt(travelersCount, 10) || 1,
        estimated_budget: parseFloat(estimatedBudget) || 0,
        description: description.trim(),
        cover_image: coverImage,
        status
      });

      success('Trip settings updated successfully!');
      navigate(`/trips/${id}`);
    } catch (err) {
      console.error('Update trip error:', err);
      error(err.message || 'Failed to update trip.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>
        Loading trip settings...
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '840px' }}>
      
      <button
        onClick={() => navigate(`/trips/${id}`)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', gap: '0.4rem' }}
      >
        <ArrowLeft size={16} /> Back to Trip Details
      </button>

      <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-xl)' }}>
        
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Edit Trip Details</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Modify your trip dates, budget, description, and status
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-title">Trip Title *</label>
            <input
              type="text"
              id="edit-title"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-destination">Destination Name *</label>
              <input
                type="text"
                id="edit-destination"
                className="form-input"
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-status">Trip Status</label>
              <select
                id="edit-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="planning">Planning</option>
                <option value="active">Active (Currently Traveling)</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-start-date">Start Date *</label>
              <input
                type="date"
                id="edit-start-date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-end-date">End Date *</label>
              <input
                type="date"
                id="edit-end-date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-travelers">Travelers Count</label>
              <input
                type="number"
                id="edit-travelers"
                className="form-input"
                min="1"
                max="50"
                value={travelersCount}
                onChange={(e) => setTravelersCount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-budget">Estimated Budget (₹ INR)</label>
              <input
                type="number"
                id="edit-budget"
                className="form-input"
                min="0"
                step="500"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-cover-image">Cover Image URL</label>
            <input
              type="url"
              id="edit-cover-image"
              className="form-input"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-description">Description & Notes</label>
            <textarea
              id="edit-description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={() => navigate(`/trips/${id}`)}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="btn-edit-trip-save"
            >
              <Save size={18} />
              <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
