import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Plus, Compass, Calendar, DollarSign, Sparkles, Filter,
  Search, CheckCircle2, Clock, Globe, ArrowRight, Trash2, Copy, MapPin
} from 'lucide-react';
import api from '../services/api';
import TripCard from '../components/TripCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalTrip, setDeleteModalTrip] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    setLoading(true);
    try {
      const res = await api.getTrips();
      setTrips(res.trips || []);
    } catch (err) {
      console.error('Failed to load trips:', err);
      error('Failed to load your trips.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDuplicate(tripId) {
    try {
      const res = await api.duplicateTrip(tripId);
      success('Trip duplicated successfully!');
      fetchTrips();
    } catch (err) {
      error(err.message || 'Failed to duplicate trip.');
    }
  }

  async function confirmDeleteTrip() {
    if (!deleteModalTrip) return;
    setActionInProgress(true);
    try {
      await api.deleteTrip(deleteModalTrip.id);
      success(`Trip "${deleteModalTrip.title}" deleted.`);
      setDeleteModalTrip(null);
      fetchTrips();
    } catch (err) {
      error(err.message || 'Failed to delete trip.');
    } finally {
      setActionInProgress(false);
    }
  }

  // Filter trips locally by status tab and search query
  const filteredTrips = trips.filter((t) => {
    if (statusFilter !== 'all') {
      const tripStatus = (t.status || 'planning').toLowerCase();
      if (tripStatus !== statusFilter.toLowerCase()) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchDest = (t.destination_name || t.destination || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDest) {
        return false;
      }
    }
    return true;
  });

  // High level stats across all user trips
  const totalTrips = trips.length;
  const activeTrips = trips.filter((t) => (t.status || '').toLowerCase() === 'active').length;
  const planningTrips = trips.filter((t) => (t.status || '').toLowerCase() === 'planning').length;
  const completedTrips = trips.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
  const totalBudget = trips.reduce((sum, t) => sum + (parseFloat(t.estimated_budget) || 0), 0);
  const totalSpent = trips.reduce((sum, t) => sum + (parseFloat(t.total_spent) || 0), 0);

  return (
    <div className="page-wrapper">
      
      {/* Welcome & Stats Hero Header */}
      <div className="card" style={{
        padding: '2.5rem 2.25rem',
        marginBottom: '2.5rem',
        background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.95) 0%, rgba(240, 249, 255, 0.95) 100%)',
        border: '1px solid rgba(199, 210, 254, 0.7)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              style={{ width: '4.25rem', height: '4.25rem', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ffffff', boxShadow: 'var(--shadow-md)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                <span className="badge badge-primary">{user?.role || 'Explorer'}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {user?.bio || 'Ready to plan your next breathtaking adventure with Humsafar?'}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/destinations" className="btn btn-secondary" id="dashboard-explore-btn">
              <Globe size={18} color="var(--primary)" />
              <span>Explore Destinations</span>
            </Link>
            <Link to="/trips/new" className="btn btn-primary" id="dashboard-create-trip-btn">
              <Plus size={18} />
              <span>Plan New Trip</span>
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1.25rem',
          marginTop: '2.25rem',
          paddingTop: '1.75rem',
          borderTop: '1px solid rgba(226, 232, 240, 0.9)'
        }}>
          <div style={{ background: '#ffffff', padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>
              Total Trips
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Outfit' }}>
              {totalTrips}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>
              Active Adventures
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', fontFamily: 'Outfit' }}>
              {activeTrips}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>
              In Planning
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', fontFamily: 'Outfit' }}>
              {planningTrips}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>
              Total Budget Planned
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>
              ${totalBudget.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
        
        {/* Status Tab Pills */}
        <div className="tabs-container">
          {['all', 'active', 'planning', 'completed', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`tab-btn ${statusFilter === status ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {status === 'all' ? 'All Trips' : status}
            </button>
          ))}
        </div>

        {/* Search Filter Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <input
            type="text"
            placeholder="Search trips by title or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', fontSize: '0.9rem' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          title={
            searchQuery
              ? 'No matching trips found'
              : statusFilter !== 'all'
                ? `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Trips`
                : (totalTrips === 0 ? 'Your Travel Canvas is Clean & Ready!' : 'No trips found')
          }
          description={
            searchQuery
              ? `We couldn't find any trips matching "${searchQuery}". Try a different term.`
              : statusFilter !== 'all'
                ? `You currently don't have any trips in the "${statusFilter}" state.`
                : (totalTrips === 0
                    ? 'Welcome to Humsafar! You have 0 trips so far. Click below to start crafting your first adventure.'
                    : 'No trips available in this view.')
          }
          actionText="Plan Your First Trip"
          actionLink="/trips/new"
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDuplicate={handleDuplicate}
              onDelete={(id, title) => setDeleteModalTrip({ id, title })}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalTrip && (
        <Modal
          isOpen={!!deleteModalTrip}
          onClose={() => setDeleteModalTrip(null)}
          title="Delete Trip"
          maxWidth="460px"
          footer={
            <>
              <button onClick={() => setDeleteModalTrip(null)} className="btn btn-secondary" disabled={actionInProgress}>
                Cancel
              </button>
              <button onClick={confirmDeleteTrip} className="btn btn-danger" disabled={actionInProgress} id="btn-confirm-delete-trip">
                {actionInProgress ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </>
          }
        >
          <p style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>"{deleteModalTrip.title}"</strong>? This will permanently remove all associated itinerary days, activities, accommodation bookings, transit details, and expenses.
          </p>
        </Modal>
      )}

    </div>
  );
}
