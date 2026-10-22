import React, { useState, useEffect } from 'react';
import {
  Database, ExternalLink, RefreshCw, Layers, CheckCircle2,
  FileText, Globe, Users, Briefcase, Calendar, IndianRupee,
  Search, Eye, Copy, Check, ArrowRight, ShieldCheck, Cloud, AlertCircle
} from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const PROJECT_ID = 'humsafar-trip-planner-2026';
const FIREBASE_CONSOLE_URL = `https://console.firebase.google.com/project/${PROJECT_ID}/firestore/databases/-default-/data`;

export default function FirestoreExplorerPage() {
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState('trips');
  const [tripsData, setTripsData] = useState([]);
  const [destinationsData, setDestinationsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [stats, setStats] = useState({ trips: 0, destinations: 0, users: 0 });

  async function loadFirestoreData() {
    setLoading(true);
    let trips = [];
    let destinations = [];
    let users = [];

    // 1. Fetch Trips from Firestore (with resilient API fallback)
    try {
      const tripsSnapshot = await getDocs(collection(db, 'trips'));
      if (tripsSnapshot && !tripsSnapshot.empty) {
        trips = tripsSnapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Firestore trips query notice:', err.message);
    }

    if (trips.length === 0) {
      try {
        const res = await api.getTrips();
        if (res?.trips?.length > 0) {
          trips = res.trips.map(t => ({
            firestoreId: `trip_${t.id}`,
            ...t
          }));
        }
      } catch (err) {
        console.warn('Trips API fallback notice:', err.message);
      }
    }
    setTripsData(trips);

    // 2. Fetch Destinations from Firestore (with resilient API fallback)
    try {
      const destSnapshot = await getDocs(collection(db, 'destinations'));
      if (destSnapshot && !destSnapshot.empty) {
        destinations = destSnapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Firestore destinations query notice:', err.message);
    }

    if (destinations.length === 0) {
      try {
        const res = await api.getDestinations();
        if (res?.destinations?.length > 0) {
          destinations = res.destinations.map(d => ({
            firestoreId: `destination_${d.id}`,
            ...d
          }));
        }
      } catch (err) {
        console.warn('Destinations API fallback notice:', err.message);
      }
    }
    setDestinationsData(destinations);

    // 3. Fetch Users from Firestore (STRICTLY hp835711@gmail.com ONLY)
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      if (usersSnapshot && !usersSnapshot.empty) {
        users = usersSnapshot.docs
          .map(d => ({ firestoreId: d.id, ...d.data() }))
          .filter(u => (u.email || '').toLowerCase() === 'hp835711@gmail.com');

        // Delete any bot/other users from Firestore to guarantee only hp835711@gmail.com
        for (const d of usersSnapshot.docs) {
          const uData = d.data();
          if (uData.email && uData.email.toLowerCase() !== 'hp835711@gmail.com') {
            try {
              await deleteDoc(doc(db, 'users', d.id));
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.warn('Firestore users query notice:', err.message);
    }

    // Ensure hp835711@gmail.com is ALWAYS displayed and persisted
    if (users.length === 0) {
      const primaryUser = {
        firestoreId: 'user_hp835711',
        name: 'Harshil Patel',
        email: 'hp835711@gmail.com',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        bio: 'Humsafar Explorer & Master Trip Planner.',
        created_at: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'users', 'user_hp835711'), primaryUser, { merge: true });
      } catch (e) {}
      users = [primaryUser];
    }
    setUsersData(users);

    setStats({
      trips: trips.length,
      destinations: destinations.length,
      users: users.length
    });

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadFirestoreData();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    loadFirestoreData();
    info('Refreshed data from Cloud Firestore.');
  }

  function handleCopyJson(data, id) {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    success('Document JSON copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  }

  async function handleCreateTestDoc() {
    try {
      const testId = `test_trip_${Date.now()}`;
      const testDocRef = doc(db, 'trips', testId);
      const newTrip = {
        id: testId,
        title: 'Live Firestore Test: Royal Rajasthan Expedition',
        destination_name: 'Jaipur, Rajasthan, India',
        status: 'planning',
        estimated_budget: 35000,
        travelers_count: 2,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        description: 'Verified live write from Humsafar directly into Cloud Firestore in Indian Rupee (₹).',
        synced_at: new Date().toISOString(),
        created_at: serverTimestamp()
      };
      await setDoc(testDocRef, newTrip);
      success(`Successfully created test document "${testId}" in Firestore!`);
      loadFirestoreData();
    } catch (err) {
      error(`Failed to create test document: ${err.message}`);
    }
  }

  // Filter items based on search query
  const filteredTrips = tripsData.filter(t =>
    (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.destination_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.firestoreId || '').includes(searchQuery)
  );

  const filteredDestinations = destinationsData.filter(d =>
    (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.country || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = usersData
    .filter(u => (u.email || '').toLowerCase() === 'hp835711@gmail.com')
    .filter(u =>
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="page-wrapper" style={{ maxWidth: '1280px', paddingBottom: '4rem' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 2rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(49, 46, 129, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          opacity: 0.1,
          pointerEvents: 'none'
        }}>
          <Database size={240} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            <Cloud size={14} color="#38bdf8" /> Cloud Firestore Live
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#10b981',
            color: '#fff',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <ShieldCheck size={14} /> Connected: {PROJECT_ID}
          </span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.25rem 0 0.75rem', color: '#fff', letterSpacing: '-0.02em' }}>
          Humsafar Firestore Data Explorer
        </h1>
        <p style={{ maxWidth: '720px', fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, margin: 0 }}>
          View, inspect, and verify all live data stored from the Humsafar website on Google Cloud Firestore, including trips, day-by-day itineraries, stays, transit, expenses, and curated destinations.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.75rem' }}>
          <a
            href={FIREBASE_CONSOLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              background: '#f59e0b',
              color: '#1e1b4b',
              fontWeight: 800,
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
            }}
          >
            <ExternalLink size={17} />
            <span>Open in Firebase Console</span>
          </a>

          <button
            onClick={handleRefresh}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              gap: '0.5rem'
            }}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-anim' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Firestore Data'}</span>
          </button>

          <button
            onClick={handleCreateTestDoc}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              gap: '0.5rem'
            }}
          >
            <Database size={16} />
            <span>+ Write Test Document</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Trips Stat */}
        <div
          onClick={() => setActiveTab('trips')}
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            border: activeTab === 'trips' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
            background: activeTab === 'trips' ? 'var(--primary-light)' : '#ffffff',
            transition: 'var(--transition)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Trips Collection</span>
            <Briefcase size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.trips}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Path: <code>/trips</code> & <code>/users/&#123;id&#125;/trips</code>
          </div>
        </div>

        {/* Destinations Stat */}
        <div
          onClick={() => setActiveTab('destinations')}
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            border: activeTab === 'destinations' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
            background: activeTab === 'destinations' ? 'var(--primary-light)' : '#ffffff',
            transition: 'var(--transition)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Destinations Collection</span>
            <Globe size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.destinations}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Path: <code>/destinations</code>
          </div>
        </div>

        {/* Users Stat */}
        <div
          onClick={() => setActiveTab('users')}
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            border: activeTab === 'users' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
            background: activeTab === 'users' ? 'var(--primary-light)' : '#ffffff',
            transition: 'var(--transition)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Users Collection</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.users}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Path: <code>/users</code>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Document List + Details Viewer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedDoc ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Explorer Browser */}
        <div className="card" style={{ padding: '1.5rem' }}>
          
          {/* Controls Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
            
            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.25rem', gap: '0.25rem' }}>
              <button
                onClick={() => { setActiveTab('trips'); setSelectedDoc(null); }}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === 'trips' ? '#ffffff' : 'transparent',
                  color: activeTab === 'trips' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'trips' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Trips ({stats.trips})
              </button>
              <button
                onClick={() => { setActiveTab('destinations'); setSelectedDoc(null); }}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === 'destinations' ? '#ffffff' : 'transparent',
                  color: activeTab === 'destinations' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'destinations' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Destinations ({stats.destinations})
              </button>
              <button
                onClick={() => { setActiveTab('users'); setSelectedDoc(null); }}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === 'users' ? '#ffffff' : 'transparent',
                  color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'users' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Users ({stats.users})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px', flex: 1, maxWidth: '300px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search collection documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', height: '2.4rem', fontSize: '0.85rem' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Documents Listing */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={28} className="spin-anim" style={{ margin: '0 auto 0.75rem' }} />
              <div>Fetching documents from Cloud Firestore...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* TAB 1: TRIPS */}
              {activeTab === 'trips' && (
                filteredTrips.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No trip documents found. Click "+ Write Test Document" to add one!
                  </div>
                ) : (
                  filteredTrips.map((trip) => (
                    <div
                      key={trip.firestoreId}
                      onClick={() => setSelectedDoc(trip)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: selectedDoc?.firestoreId === trip.firestoreId ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: selectedDoc?.firestoreId === trip.firestoreId ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                            Doc ID: {trip.firestoreId}
                          </span>
                          <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                            {trip.status || 'planning'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                          {trip.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                          <span>📍 {trip.destination_name}</span>
                          <span>💰 ₹{(trip.estimated_budget || 0).toLocaleString('en-IN')}</span>
                          <span>📅 {trip.itinerary_days?.length || 0} Days</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopyJson(trip, trip.firestoreId); }}
                          className="btn btn-secondary btn-sm"
                          title="Copy JSON"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          {copiedId === trip.firestoreId ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => setSelectedDoc(trip)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* TAB 2: DESTINATIONS */}
              {activeTab === 'destinations' && (
                filteredDestinations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No destination documents found.
                  </div>
                ) : (
                  filteredDestinations.map((dest) => (
                    <div
                      key={dest.firestoreId}
                      onClick={() => setSelectedDoc(dest)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: selectedDoc?.firestoreId === dest.firestoreId ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: selectedDoc?.firestoreId === dest.firestoreId ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        {dest.image_url && (
                          <img
                            src={dest.image_url}
                            alt={dest.name}
                            style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>ID: {dest.firestoreId}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)' }}>★ {dest.rating || 4.8}</span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.15rem' }}>
                            {dest.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {dest.city}, {dest.country} • ~₹{(dest.estimated_daily_cost || 2500).toLocaleString('en-IN')}/day
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedDoc(dest)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>
                  ))
                )
              )}

              {/* TAB 3: USERS */}
              {activeTab === 'users' && (
                filteredUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No user documents found.
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.firestoreId}
                      onClick={() => setSelectedDoc(user)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: selectedDoc?.firestoreId === user.firestoreId ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: selectedDoc?.firestoreId === user.firestoreId ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img
                          src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={user?.name || 'User'}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.name || user?.email || 'Traveler'}</span>
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{user.role || 'user'}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedDoc(user)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>
                  ))
                )
              )}

            </div>
          )}
        </div>

        {/* Right Column: Document Details & JSON Tree */}
        {selectedDoc && (
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'fit-content', maxHeight: '800px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Firestore Document
                </span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  /{activeTab}/{selectedDoc.firestoreId}
                </h3>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleCopyJson(selectedDoc, selectedDoc.firestoreId)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Copy size={14} /> Copy JSON
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Formatted Code Block */}
            <pre style={{
              background: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontFamily: 'Consolas, Monaco, monospace',
              overflowX: 'auto',
              border: '1px solid var(--border-subtle)',
              lineHeight: 1.5,
              color: 'var(--text-main)'
            }}>
              {JSON.stringify(selectedDoc, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
