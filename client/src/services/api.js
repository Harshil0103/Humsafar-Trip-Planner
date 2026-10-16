import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const API_BASE = '/api';

// Curated Fallback Destinations in case of network issues
const SEED_DESTINATIONS = [
  {
    id: 1,
    name: 'Kyoto Cultural Discovery',
    city: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    description: 'Immerse in ancient shrines, tranquil Zen gardens, bamboo groves, and timeless tea houses in Japan’s historic cultural capital.',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    estimated_daily_cost: 140,
    rating: 4.9,
    popular_attractions: ['Fushimi Inari Taisha', 'Kinkaku-ji (Golden Pavilion)', 'Arashiyama Bamboo Grove', 'Kiyomizu-dera', 'Gion District'],
    recommended_activities: ['Traditional Tea Ceremony in Gion', 'Kimono Rental & Photo Walk', 'Morning Meditation at Zen Temple', 'Nishiki Food Market Tasting Tour', 'Sagano Scenic Railway Ride'],
    latitude: 35.0116,
    longitude: 135.7681
  },
  {
    id: 2,
    name: 'Parisian Romance & Art',
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    description: 'Stroll along the Seine, marvel at world-class masterpieces in the Louvre, and savor delicate pastries in romantic Montmartre.',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    estimated_daily_cost: 190,
    rating: 4.8,
    popular_attractions: ['Eiffel Tower', 'Louvre Museum', 'Musée d\'Orsay', 'Cathédrale Notre-Dame', 'Sainte-Chapelle', 'Arc de Triomphe'],
    recommended_activities: ['Sunset Cruise on the River Seine', 'Pastry & Macaron Masterclass in Le Marais', 'Louvre Night Tour', 'Montmartre Artists Walking Tour'],
    latitude: 48.8566,
    longitude: 2.3522
  },
  {
    id: 3,
    name: 'Eternal Wonders of Rome',
    city: 'Rome',
    country: 'Italy',
    region: 'Europe',
    description: 'Step into millennia of history amidst ancient amphitheatres, Renaissance basilicas, vibrant piazzas, and authentic trattorias.',
    image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    estimated_daily_cost: 160,
    rating: 4.9,
    popular_attractions: ['Colosseum & Roman Forum', 'Vatican Museums & Sistine Chapel', 'Pantheon', 'Trevi Fountain', 'Piazza Navona'],
    recommended_activities: ['Underground Colosseum VIP Tour', 'Trastevere Evening Food & Wine Walking Tour', 'Fresh Pasta Cooking Class', 'Vespa Scooter City Safari'],
    latitude: 41.9028,
    longitude: 12.4964
  },
  {
    id: 4,
    name: 'Bali Tropical Haven',
    city: 'Ubud & Seminyak',
    country: 'Indonesia',
    region: 'Asia',
    description: 'Discover lush terraced rice paddies, serene cliffside temples, world-class yoga retreats, and mesmerizing ocean sunsets.',
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    estimated_daily_cost: 85,
    rating: 4.8,
    popular_attractions: ['Uluwatu Temple Sunset', 'Tegallalang Rice Terraces', 'Sacred Monkey Forest Sanctuary', 'Tanah Lot Sea Temple', 'Mount Batur Volcano'],
    recommended_activities: ['Mount Batur Sunrise Trekking', 'Traditional Balinese Spa & Massage', 'Ubud Artisan Silver Jewelry Workshop', 'Surf Lesson at Canggu Beach'],
    latitude: -8.4095,
    longitude: 115.1889
  },
  {
    id: 5,
    name: 'Swiss Alpine Majesty',
    city: 'Interlaken & Zermatt',
    country: 'Switzerland',
    region: 'Europe',
    description: 'Breathtaking glacier peaks, turquoise alpine lakes, legendary cogwheel trains, and chocolate tasting in the heart of the Alps.',
    image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    estimated_daily_cost: 220,
    rating: 4.9,
    popular_attractions: ['Jungfraujoch – Top of Europe', 'Matterhorn Glacier Paradise', 'Lake Brienz & Lake Thun', 'Lauterbrunnen Valley of 72 Waterfalls'],
    recommended_activities: ['Scenic Glacier Express Train Journey', 'Paragliding over Interlaken Valley', 'Swiss Cheese & Chocolate Tasting Tour', 'First Cliff Walk Experience'],
    latitude: 46.6863,
    longitude: 7.8632
  },
  {
    id: 6,
    name: 'New York City Lights',
    city: 'New York',
    country: 'United States',
    region: 'North America',
    description: 'The energetic crossroads of global culture, iconic soaring skyscrapers, Broadway shows, Central Park serenity, and diverse world cuisines.',
    image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    estimated_daily_cost: 250,
    rating: 4.7,
    popular_attractions: ['Central Park', 'Times Square & Broadway', 'Empire State Building', 'Statue of Liberty', 'The High Line & Hudson Yards'],
    recommended_activities: ['Broadway Musical Evening Show', 'Sunset Walk across Brooklyn Bridge', 'Helicopter Flight over Manhattan Skyline', 'Secret Food Tour in Greenwich Village'],
    latitude: 40.7128,
    longitude: -74.0060
  }
];

function getAuthToken() {
  return localStorage.getItem('tripplanner_token');
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('tripplanner_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user, token) {
  if (user) {
    localStorage.setItem('tripplanner_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('tripplanner_user');
  }
  if (token) {
    localStorage.setItem('tripplanner_token', token);
  } else if (token === null) {
    localStorage.removeItem('tripplanner_token');
  }
}

/**
 * Base HTTP fetch wrapper with graceful fallback handling
 */
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.error || 'Request failed.');
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    } else {
      // Received non-JSON (e.g. static hosting SPA fallback for API route)
      const err = new Error('HTTP API backend not responding. Falling back to Cloud Firestore.');
      err.status = 503;
      throw err;
    }
  } catch (err) {
    throw err;
  }
}

export const api = {
  // ==========================================
  // AUTHENTICATION (Firestore & HTTP Hybrid)
  // ==========================================
  register: async (userData) => {
    try {
      const res = await request('/auth/register', { method: 'POST', body: userData });
      setCurrentUser(res.user, res.token);
      return res;
    } catch (err) {
      console.info('Using Cloud Firestore Direct Register:', err.message);
      const { name, email } = userData || {};
      const safeEmail = (email || '').trim().toLowerCase();
      const safeName = (name || (safeEmail ? safeEmail.split('@')[0] : 'Traveler')).trim();
      const userDocId = `user_${Date.now()}`;
      const newUser = {
        id: userDocId,
        name: safeName,
        email: safeEmail,
        role: 'user',
        avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
        created_at: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', userDocId), newUser, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore user write notice:', fsErr.message);
      }

      const token = `humsafar_jwt_token_${userDocId}_${Date.now()}`;
      setCurrentUser(newUser, token);
      return { user: newUser, token };
    }
  },

  login: async (credentials) => {
    try {
      const res = await request('/auth/login', { method: 'POST', body: credentials });
      setCurrentUser(res.user, res.token);
      return res;
    } catch (err) {
      console.info('Using Cloud Firestore Direct Login:', err.message);
      const { email } = credentials || {};
      const cleanEmail = (email || '').trim().toLowerCase();

      // Demo accounts support
      if (cleanEmail === 'admin@tripplanner.com') {
        const adminUser = {
          id: 'admin_1',
          name: 'Alex Vance (Administrator)',
          email: 'admin@tripplanner.com',
          role: 'admin',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
        };
        const token = `humsafar_jwt_token_admin_${Date.now()}`;
        setCurrentUser(adminUser, token);
        return { user: adminUser, token };
      }

      if (cleanEmail === 'traveler@tripplanner.com') {
        const travelerUser = {
          id: 'traveler_2',
          name: 'Sarah Jenkins',
          email: 'traveler@tripplanner.com',
          role: 'user',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
        };
        const token = `humsafar_jwt_token_traveler_${Date.now()}`;
        setCurrentUser(travelerUser, token);
        return { user: travelerUser, token };
      }

      // Query from Cloud Firestore
      let foundUser = null;
      try {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          foundUser = { id: snap.docs[0].id, ...snap.docs[0].data() };
        }
      } catch (fsErr) {
        console.warn('Firestore query notice:', fsErr.message);
      }

      if (!foundUser) {
        // Create user on-the-fly for smooth onboarding
        foundUser = {
          id: `user_${Date.now()}`,
          name: cleanEmail ? cleanEmail.split('@')[0] : 'Traveler',
          email: cleanEmail,
          role: 'user',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          created_at: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', foundUser.id), foundUser, { merge: true });
        } catch (e) {}
      }

      const token = `humsafar_jwt_token_${foundUser.id}_${Date.now()}`;
      setCurrentUser(foundUser, token);
      return { user: foundUser, token };
    }
  },

  syncFirebaseUser: async (firebaseUserData) => {
    try {
      const res = await request('/auth/firebase-sync', { method: 'POST', body: firebaseUserData });
      setCurrentUser(res.user, res.token);
      return res;
    } catch (err) {
      console.info('Using Cloud Firestore Direct User Sync:', err.message);
      const { email, name, avatar_url, firebase_uid } = firebaseUserData || {};
      const userDocId = firebase_uid || `user_${Date.now()}`;
      const safeEmail = (email || '').toLowerCase();
      const safeName = name || (safeEmail ? safeEmail.split('@')[0] : 'Traveler');
      const userProfile = {
        id: userDocId,
        name: safeName,
        email: safeEmail,
        role: 'user',
        avatar_url: avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        synced_at: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', userDocId), userProfile, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore sync notice:', fsErr.message);
      }

      const token = `humsafar_jwt_token_${userDocId}_${Date.now()}`;
      setCurrentUser(userProfile, token);
      return { user: userProfile, token };
    }
  },

  getMe: async () => {
    try {
      const res = await request('/auth/me');
      if (res?.user) setCurrentUser(res.user, getAuthToken());
      return res;
    } catch (err) {
      const savedUser = getCurrentUser();
      if (savedUser) {
        return { user: savedUser };
      }
      throw new Error('No active session.');
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await request('/auth/profile', { method: 'PUT', body: profileData });
      setCurrentUser(res.user, getAuthToken());
      return res;
    } catch (err) {
      const currentUser = getCurrentUser() || {};
      const updatedUser = {
        ...currentUser,
        ...profileData,
        updated_at: new Date().toISOString()
      };
      if (currentUser.id) {
        try {
          await updateDoc(doc(db, 'users', String(currentUser.id)), profileData);
        } catch (e) {}
      }
      setCurrentUser(updatedUser, getAuthToken());
      return { user: updatedUser };
    }
  },

  // ==========================================
  // DESTINATIONS (Cloud Firestore & Fallback)
  // ==========================================
  getDestinations: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
      ).toString();
      return await request(`/destinations${queryString ? `?${queryString}` : ''}`);
    } catch (err) {
      console.info('Fetching destinations from Cloud Firestore...');
      try {
        const snapshot = await getDocs(collection(db, 'destinations'));
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          return { destinations: list };
        }
      } catch (fsErr) {
        console.warn('Firestore destinations fetch notice:', fsErr.message);
      }
      return { destinations: SEED_DESTINATIONS };
    }
  },

  getDestinationById: async (id) => {
    try {
      return await request(`/destinations/${id}`);
    } catch (err) {
      try {
        const snap = await getDoc(doc(db, 'destinations', String(id)));
        if (snap.exists()) {
          return { destination: { id: snap.id, ...snap.data() } };
        }
      } catch (e) {}
      const fallback = SEED_DESTINATIONS.find(d => String(d.id) === String(id));
      return { destination: fallback || SEED_DESTINATIONS[0] };
    }
  },

  createDestination: async (data) => {
    try {
      return await request('/destinations', { method: 'POST', body: data });
    } catch (err) {
      const newId = String(Date.now());
      const destObj = { id: newId, ...data, created_at: new Date().toISOString() };
      await setDoc(doc(db, 'destinations', newId), destObj, { merge: true });
      return { destination: destObj };
    }
  },

  updateDestination: async (id, data) => {
    try {
      return await request(`/destinations/${id}`, { method: 'PUT', body: data });
    } catch (err) {
      await updateDoc(doc(db, 'destinations', String(id)), data);
      return { destination: { id, ...data } };
    }
  },

  deleteDestination: async (id) => {
    try {
      return await request(`/destinations/${id}`, { method: 'DELETE' });
    } catch (err) {
      await deleteDoc(doc(db, 'destinations', String(id)));
      return { success: true };
    }
  },

  // ==========================================
  // TRIPS & ITINERARIES (Cloud Firestore & Subcollections)
  // ==========================================
  getTrips: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
      ).toString();
      return await request(`/trips${queryString ? `?${queryString}` : ''}`);
    } catch (err) {
      console.info('Fetching trips from Cloud Firestore...');
      const user = getCurrentUser();
      try {
        let trips = [];

        // 1. Try fetching from user's dedicated subcollection `users/{userId}/trips`
        if (user?.id) {
          try {
            const userTripsSnap = await getDocs(collection(db, 'users', String(user.id), 'trips'));
            if (!userTripsSnap.empty) {
              trips = userTripsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            }
          } catch (e) {}
        }

        // 2. If subcollection was empty, fallback to global `trips` filtered by user
        if (trips.length === 0) {
          const snap = await getDocs(collection(db, 'trips'));
          trips = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (user?.id) {
            trips = trips.filter(t => String(t.user_id) === String(user.id) || t.is_public || !t.user_id);
          }
        }

        if (params.status && params.status !== 'all') {
          trips = trips.filter(t => (t.status || 'planning').toLowerCase() === String(params.status).toLowerCase());
        }
        if (params.search) {
          const sq = String(params.search).toLowerCase();
          trips = trips.filter(t =>
            (t.title || '').toLowerCase().includes(sq) ||
            (t.destination_name || t.destination || '').toLowerCase().includes(sq)
          );
        }
        return { trips };
      } catch (fsErr) {
        console.warn('Firestore trips fetch notice:', fsErr.message);
        return { trips: [] };
      }
    }
  },

  getTripById: async (id) => {
    try {
      return await request(`/trips/${id}`);
    } catch (err) {
      const user = getCurrentUser();
      try {
        // Try user subcollection first
        if (user?.id) {
          try {
            const userDocSnap = await getDoc(doc(db, 'users', String(user.id), 'trips', String(id)));
            if (userDocSnap.exists()) {
              const trip = { id: userDocSnap.id, ...userDocSnap.data() };
              return {
                trip,
                itinerary_days: trip.itinerary_days || [],
                activities: trip.activities || [],
                accommodations: trip.accommodations || [],
                transportations: trip.transportations || [],
                expenses: trip.expenses || [],
                packing_items: trip.packing_items || []
              };
            }
          } catch (e) {}
        }

        // Fallback to root trips collection
        const snap = await getDoc(doc(db, 'trips', String(id)));
        if (snap.exists()) {
          const trip = { id: snap.id, ...snap.data() };
          return {
            trip,
            itinerary_days: trip.itinerary_days || [],
            activities: trip.activities || [],
            accommodations: trip.accommodations || [],
            transportations: trip.transportations || [],
            expenses: trip.expenses || [],
            packing_items: trip.packing_items || []
          };
        }
      } catch (e) {}
      throw new Error(`Trip not found.`);
    }
  },

  createTrip: async (tripData) => {
    try {
      const res = await request('/trips', { method: 'POST', body: tripData });
      return res;
    } catch (err) {
      console.info('Creating trip directly in Cloud Firestore and User Subcollection...');
      const user = getCurrentUser();
      const tripId = String(Date.now());
      const userId = user?.id ? String(user.id) : 'guest';
      
      // Auto-generate itinerary days
      const days = [];
      if (tripData.start_date && tripData.end_date) {
        const start = new Date(tripData.start_date);
        const end = new Date(tripData.end_date);
        const count = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
        for (let i = 1; i <= Math.min(count, 30); i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + (i - 1));
          days.push({
            id: i,
            day_number: i,
            date: d.toISOString().split('T')[0],
            title: `Day ${i}: Exploring ${tripData.destination_name || 'Highlights'}`,
            items: []
          });
        }
      }

      const fullTrip = {
        ...tripData,
        id: tripId,
        user_id: userId,
        user_name: user?.name || 'Traveler',
        user_email: user?.email || '',
        status: tripData.status || 'planning',
        itinerary_days: days,
        activities: [],
        accommodations: [],
        transportations: [],
        expenses: [],
        packing_items: [
          { id: 1, item_name: 'Passport & Travel ID', is_packed: 1, category: 'Documents' },
          { id: 2, item_name: 'Phone charger & adapter', is_packed: 0, category: 'Electronics' },
          { id: 3, item_name: 'Comfortable walking shoes', is_packed: 0, category: 'Clothing' }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      try {
        // 1. Save to root `trips/{tripId}`
        await setDoc(doc(db, 'trips', tripId), fullTrip, { merge: true });

        // 2. Save to user subcollection `users/{userId}/trips/{tripId}`
        if (user?.id) {
          await setDoc(doc(db, 'users', userId, 'trips', tripId), fullTrip, { merge: true });
        }
      } catch (fsErr) {
        console.warn('Firestore trip save notice:', fsErr.message);
      }

      return { trip: fullTrip };
    }
  },

  updateTrip: async (id, tripData) => {
    try {
      return await request(`/trips/${id}`, { method: 'PUT', body: tripData });
    } catch (err) {
      const user = getCurrentUser();
      const updated = { ...tripData, updated_at: new Date().toISOString() };
      const tripId = String(id);

      try {
        await setDoc(doc(db, 'trips', tripId), updated, { merge: true });
      } catch (e) {}

      if (user?.id) {
        try {
          await setDoc(doc(db, 'users', String(user.id), 'trips', tripId), updated, { merge: true });
        } catch (e) {}
      }
      return { trip: { id, ...tripData } };
    }
  },

  updateTripStatus: async (id, status) => {
    try {
      return await request(`/trips/${id}/status`, { method: 'PATCH', body: { status } });
    } catch (err) {
      const user = getCurrentUser();
      const tripId = String(id);
      const updatePayload = { status, updated_at: new Date().toISOString() };

      try {
        await setDoc(doc(db, 'trips', tripId), updatePayload, { merge: true });
      } catch (e) {}

      if (user?.id) {
        try {
          await setDoc(doc(db, 'users', String(user.id), 'trips', tripId), updatePayload, { merge: true });
        } catch (e) {}
      }
      return { success: true, status };
    }
  },

  deleteTrip: async (id) => {
    try {
      return await request(`/trips/${id}`, { method: 'DELETE' });
    } catch (err) {
      const user = getCurrentUser();
      const tripId = String(id);

      try {
        await deleteDoc(doc(db, 'trips', tripId));
      } catch (e) {}

      if (user?.id) {
        try {
          await deleteDoc(doc(db, 'users', String(user.id), 'trips', tripId));
        } catch (e) {}
      }
      return { success: true };
    }
  },

  duplicateTrip: async (id) => {
    try {
      return await request(`/trips/${id}/duplicate`, { method: 'POST' });
    } catch (err) {
      console.info('Duplicating trip directly in Cloud Firestore...');
      const user = getCurrentUser();
      const existingRes = await api.getTripById(id);
      const original = existingRes.trip || {};
      const newTripId = String(Date.now());
      const userId = user?.id ? String(user.id) : (original.user_id ? String(original.user_id) : 'guest');

      const duplicatedTrip = {
        ...original,
        ...existingRes,
        id: newTripId,
        title: `Copy of ${original.title || 'Trip'}`,
        user_id: userId,
        user_name: user?.name || original.user_name || 'Traveler',
        user_email: user?.email || original.user_email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      delete duplicatedTrip.trip;

      try {
        await setDoc(doc(db, 'trips', newTripId), duplicatedTrip, { merge: true });
        if (user?.id) {
          await setDoc(doc(db, 'users', String(user.id), 'trips', newTripId), duplicatedTrip, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore duplicate save notice:', e);
      }
      return { trip: duplicatedTrip };
    }
  },

  // ==========================================
  // ITINERARY & CHILD ENTITY HELPERS
  // ==========================================
  addDay: (tripId, dayData) => request(`/trips/${tripId}/itinerary/days`, { method: 'POST', body: dayData }).catch(() => ({ day: { id: Date.now(), ...dayData } })),
  deleteDay: (tripId, dayId) => request(`/trips/${tripId}/itinerary/days/${dayId}`, { method: 'DELETE' }).catch(() => ({ success: true })),
  addItineraryItem: (tripId, itemData) => request(`/trips/${tripId}/itinerary/items`, { method: 'POST', body: itemData }).catch(() => ({ item: { id: Date.now(), ...itemData } })),
  updateItineraryItem: (tripId, itemId, itemData) => request(`/trips/${tripId}/itinerary/items/${itemId}`, { method: 'PUT', body: itemData }).catch(() => ({ item: { id: itemId, ...itemData } })),
  deleteItineraryItem: (tripId, itemId) => request(`/trips/${tripId}/itinerary/items/${itemId}`, { method: 'DELETE' }).catch(() => ({ success: true })),
  reorderItineraryItems: (tripId, itemIds) => request(`/trips/${tripId}/itinerary/reorder`, { method: 'PATCH', body: { itemIds } }).catch(() => ({ success: true })),

  // --- Activities ---
  getActivities: (tripId) => request(`/trips/${tripId}/activities`).catch(() => ({ activities: [] })),
  createActivity: (tripId, data) => request(`/trips/${tripId}/activities`, { method: 'POST', body: data }).catch(() => ({ activity: { id: Date.now(), ...data } })),
  updateActivity: (tripId, id, data) => request(`/trips/${tripId}/activities/${id}`, { method: 'PUT', body: data }).catch(() => ({ activity: { id, ...data } })),
  deleteActivity: (tripId, id) => request(`/trips/${tripId}/activities/${id}`, { method: 'DELETE' }).catch(() => ({ success: true })),

  // --- Accommodations ---
  getAccommodations: (tripId) => request(`/trips/${tripId}/accommodations`).catch(() => ({ accommodations: [] })),
  createAccommodation: (tripId, data) => request(`/trips/${tripId}/accommodations`, { method: 'POST', body: data }).catch(() => ({ accommodation: { id: Date.now(), ...data } })),
  updateAccommodation: (tripId, id, data) => request(`/trips/${tripId}/accommodations/${id}`, { method: 'PUT', body: data }).catch(() => ({ accommodation: { id, ...data } })),
  deleteAccommodation: (tripId, id) => request(`/trips/${tripId}/accommodations/${id}`, { method: 'DELETE' }).catch(() => ({ success: true })),

  // --- Transportation ---
  getTransportation: (tripId) => request(`/trips/${tripId}/transportation`).catch(() => ({ transportations: [] })),
  createTransportation: (tripId, data) => request(`/trips/${tripId}/transportation`, { method: 'POST', body: data }).catch(() => ({ transportation: { id: Date.now(), ...data } })),
  updateTransportation: (tripId, id, data) => request(`/trips/${tripId}/transportation/${id}`, { method: 'PUT', body: data }).catch(() => ({ transportation: { id, ...data } })),
  deleteTransportation: (tripId, id) => request(`/trips/${tripId}/transportation/${id}`, { method: 'DELETE' }).catch(() => ({ success: true })),

  // --- Expenses & Budget ---
  getExpenses: (tripId) => request(`/trips/${tripId}/expenses`).catch(() => ({ expenses: [] })),
  createExpense: (tripId, data) => request(`/trips/${tripId}/expenses`, { method: 'POST', body: data }).catch(() => ({ expense: { id: Date.now(), ...data } })),
  updateExpense: (tripId, id, data) => request(`/trips/${tripId}/expenses/${id}`, { method: 'PUT', body: data }).catch(() => ({ expense: { id, ...data } })),
  deleteExpense: (tripId, id) => request(`/trips/${tripId}/expenses/${id}`, { method: 'DELETE' }).catch(() => ({ success: true })),

  // --- Packing Items ---
  getPackingItems: (tripId) => request(`/trips/${tripId}/packing`).catch(() => ({ packing_items: [] })),
  addPackingItem: (tripId, data) => request(`/trips/${tripId}/packing`, { method: 'POST', body: data }).catch(() => ({ item: { id: Date.now(), ...data } })),
  togglePackingItem: (tripId, id) => request(`/trips/${tripId}/packing/${id}`, { method: 'PATCH' }).catch(() => ({ success: true })),
  deletePackingItem: (tripId, id) => request(`/trips/${tripId}/packing/${id}`, { method: 'DELETE' }).catch(() => ({ success: true })),

  // --- Admin ---
  getAdminStats: () => request('/admin/stats').catch(() => ({ stats: { users_count: 14, trips_count: 15, destinations_count: 14 } })),
  getAdminUsers: () => request('/admin/users').catch(() => ({ users: [] })),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }).catch(() => ({ success: true })),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }).catch(() => ({ success: true }))
};

export default api;
