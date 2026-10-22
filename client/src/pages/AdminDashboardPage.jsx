import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Users, Globe, Briefcase, IndianRupee, Plus, Trash2, Edit3,
  CheckCircle2, AlertCircle, Sparkles, Star, MapPin, X, Database
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function AdminDashboardPage() {
  const { success, error, info } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, destinations, users

  // Destination Modal States
  const [destModalOpen, setDestModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  const [destForm, setDestForm] = useState({
    name: '', country: 'India', city: '', region: 'North India', description: '', image_url: '',
    popular_attractions: '', recommended_activities: '', estimated_daily_cost: '3000',
    best_time_to_visit: 'October – March', rating: '4.8'
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    try {
      const [statsRes, usersRes, destsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getDestinations()
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users || []);
      setDestinations(destsRes.destinations || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      error('Failed to fetch administrative records.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.updateUserRole(userId, newRole);
      success(`User role updated to ${newRole}.`);
      fetchAdminData();
    } catch (err) {
      error(err.message || 'Failed to update user role.');
    }
  }

  async function handleDeleteUser(userId, userName) {
    if (!window.confirm(`Are you sure you want to delete user "${userName}" and all their trips?`)) return;
    try {
      await api.deleteUser(userId);
      success(`User "${userName}" deleted.`);
      fetchAdminData();
    } catch (err) {
      error(err.message || 'Failed to delete user.');
    }
  }

  async function handleSaveDestination(e) {
    e.preventDefault();
    try {
      const payload = {
        name: destForm.name.trim(),
        country: destForm.country.trim(),
        city: destForm.city.trim(),
        region: destForm.region,
        description: destForm.description.trim(),
        image_url: destForm.image_url.trim(),
        popular_attractions: typeof destForm.popular_attractions === 'string'
          ? destForm.popular_attractions.split(',').map((s) => s.trim()).filter(Boolean)
          : destForm.popular_attractions,
        recommended_activities: typeof destForm.recommended_activities === 'string'
          ? destForm.recommended_activities.split(',').map((s) => s.trim()).filter(Boolean)
          : destForm.recommended_activities,
        estimated_daily_cost: parseFloat(destForm.estimated_daily_cost) || 100,
        best_time_to_visit: destForm.best_time_to_visit,
        rating: parseFloat(destForm.rating) || 4.8
      };

      if (editingDest) {
        await api.updateDestination(editingDest.id, payload);
        success('Destination updated successfully.');
      } else {
        await api.createDestination(payload);
        success('New destination added.');
      }

      setDestModalOpen(false);
      setEditingDest(null);
      fetchAdminData();
    } catch (err) {
      error(err.message || 'Failed to save destination.');
    }
  }

  async function handleDeleteDestination(destId, destName) {
    if (!window.confirm(`Are you sure you want to delete destination "${destName}"?`)) return;
    try {
      await api.deleteDestination(destId);
      success(`Destination "${destName}" deleted.`);
      fetchAdminData();
    } catch (err) {
      error(err.message || 'Failed to delete destination.');
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 0' }}>
        Loading administrative console...
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            <Shield size={16} /> Administrative Command Center
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Platform Administration</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Manage worldwide destinations, inspect registered users, and review platform metrics
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            id="admin-tab-overview"
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`btn ${activeTab === 'destinations' ? 'btn-primary' : 'btn-secondary'}`}
            id="admin-tab-destinations"
          >
            Destinations ({destinations.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            id="admin-tab-users"
          >
            Users ({users.length})
          </button>
          <Link
            to="/firestore"
            className="btn btn-secondary"
            style={{
              gap: '0.45rem',
              background: '#ede9fe',
              color: '#4338ca',
              border: '1px solid #c7d2fe'
            }}
            id="admin-firestore-btn"
          >
            <Database size={16} color="#4f46e5" />
            <span>Firestore Data</span>
          </Link>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                <Users size={16} color="var(--primary)" /> Registered Users
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.5rem' }}>
                {stats?.total_users || 0}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                <Globe size={16} color="#0ea5e9" /> Catalog Destinations
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.5rem' }}>
                {stats?.total_destinations || 0}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                <Briefcase size={16} color="#10b981" /> Total Trips Planned
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.5rem' }}>
                {stats?.total_trips || 0}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                <IndianRupee size={16} color="#f59e0b" /> Logged Spend Total
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.5rem' }}>
                ₹{(stats?.total_expenses || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Top Destination Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Most Popular Trip Destinations</h3>
              {stats?.top_destinations && stats.top_destinations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {stats.top_destinations.map((td, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
                      <span style={{ fontWeight: 600 }}>{td.destination_name}</span>
                      <span className="badge badge-primary">{td.trip_count} Trips</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>No destination analytics yet.</div>
              )}
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Platform Users</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats?.recent_users?.map((u) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt={u?.name || 'User'} style={{ width: '2rem', height: '2rem', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u?.name || u?.email || 'User'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                    <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: DESTINATIONS MANAGEMENT */}
      {activeTab === 'destinations' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Manage Destinations Catalog</h3>
            <button
              onClick={() => {
                setDestForm({
                  name: '', country: '', city: '', region: 'Europe', description: '',
                  image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
                  popular_attractions: 'Main Sight 1, Main Sight 2',
                  recommended_activities: 'Activity 1, Activity 2',
                  estimated_daily_cost: '130',
                  best_time_to_visit: 'May – October',
                  rating: '4.8'
                });
                setEditingDest(null);
                setDestModalOpen(true);
              }}
              className="btn btn-primary"
              id="btn-admin-add-destination"
            >
              <Plus size={16} /> Add New Destination
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Destination</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Region</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Daily Cost</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Rating</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={d.image_url} alt={d.name} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '8px', objectFit: 'cover' }} />
                      <span style={{ fontWeight: 700 }}>{d.name}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{d.city}, {d.country}</td>
                    <td style={{ padding: '0.85rem 1rem' }}><span className="badge badge-neutral">{d.region}</span></td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--primary)' }}>₹{(d.estimated_daily_cost || 2500).toLocaleString('en-IN')}/day</td>
                    <td style={{ padding: '0.85rem 1rem' }}>★ {d.rating}</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                        <button
                          onClick={() => {
                            setEditingDest(d);
                            setDestForm({
                              name: d.name,
                              country: d.country,
                              city: d.city,
                              region: d.region,
                              description: d.description,
                              image_url: d.image_url,
                              popular_attractions: Array.isArray(d.popular_attractions) ? d.popular_attractions.join(', ') : d.popular_attractions,
                              recommended_activities: Array.isArray(d.recommended_activities) ? d.recommended_activities.join(', ') : d.recommended_activities,
                              estimated_daily_cost: d.estimated_daily_cost.toString(),
                              best_time_to_visit: d.best_time_to_visit || '',
                              rating: d.rating.toString()
                            });
                            setDestModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem' }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(d.id, d.name)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.3rem 0.5rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Manage Registered Users</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Trips Count</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Role Switch</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt={u?.name || 'User'} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{u?.name || u?.email || 'User'}</div>
                        {u.bio && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.bio}</div>}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{u.trips_count} Trips</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.775rem' }}
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Destination Add / Edit Modal */}
      <Modal
        isOpen={destModalOpen}
        onClose={() => { setDestModalOpen(false); setEditingDest(null); }}
        title={editingDest ? 'Edit Destination' : 'Add New Destination'}
        maxWidth="680px"
        footer={
          <>
            <button onClick={() => { setDestModalOpen(false); setEditingDest(null); }} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveDestination} className="btn btn-primary" id="btn-submit-admin-dest">
              {editingDest ? 'Save Changes' : 'Create Destination'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveDestination}>
          <div className="form-group">
            <label className="form-label">Destination Name *</label>
            <input
              type="text"
              className="form-input"
              value={destForm.name}
              onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
              required
              id="input-dest-name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                value={destForm.city}
                onChange={(e) => setDestForm({ ...destForm, city: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <input
                type="text"
                className="form-input"
                value={destForm.country}
                onChange={(e) => setDestForm({ ...destForm, country: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Region</label>
              <select
                className="form-select"
                value={destForm.region}
                onChange={(e) => setDestForm({ ...destForm, region: e.target.value })}
              >
                <option value="North India">North India</option>
                <option value="South India">South India</option>
                <option value="West India">West India</option>
                <option value="East India">East India</option>
                <option value="Himalayas">Himalayas</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Est. Daily Cost (₹ INR)</label>
              <input
                type="number"
                min="500"
                step="100"
                className="form-input"
                value={destForm.estimated_daily_cost}
                onChange={(e) => setDestForm({ ...destForm, estimated_daily_cost: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL *</label>
            <input
              type="url"
              className="form-input"
              value={destForm.image_url}
              onChange={(e) => setDestForm({ ...destForm, image_url: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              value={destForm.description}
              onChange={(e) => setDestForm({ ...destForm, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Popular Attractions (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Eiffel Tower, Louvre Museum, Notre Dame"
              value={destForm.popular_attractions}
              onChange={(e) => setDestForm({ ...destForm, popular_attractions: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Recommended Activities (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Seine River Cruise, Pastry Masterclass"
              value={destForm.recommended_activities}
              onChange={(e) => setDestForm({ ...destForm, recommended_activities: e.target.value })}
            />
          </div>
        </form>
      </Modal>

    </div>
  );
}
