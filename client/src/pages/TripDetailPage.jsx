import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Users, IndianRupee, Clock, Plus, Trash2, Edit3,
  Copy, ArrowLeft, CheckCircle2, AlertCircle, Compass, Sparkles,
  Plane, Hotel, Coffee, Camera, ShoppingBag, Eye, Printer, ChevronUp, ChevronDown,
  FileText, CheckSquare, Square, Share2, Layers, Tag, Phone, Heart, Image as ImageIcon, X
} from 'lucide-react';
import api from '../services/api';
import InteractiveMap from '../components/InteractiveMap';
import BudgetChart from '../components/BudgetChart';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const FAMOUS_PHOTO_PRESETS = [
  {
    title: 'Hawa Mahal Palace of Winds',
    location: 'Jaipur, Rajasthan',
    photo_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    caption: 'Intricate 953 honeycombed casements glowing under the pink city sun.'
  },
  {
    title: 'Sunrise at Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    photo_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    caption: 'Majestic ivory-white marble mausoleum glistening under golden morning dawn.'
  },
  {
    title: 'Alleppey Backwaters Houseboat',
    location: 'Alappuzha, Kerala',
    photo_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    caption: 'Cruising through lush palm-fringed canals on a traditional Kerala kettuvallam.'
  },
  {
    title: 'Ganga Aarti on Dashashwamedh Ghat',
    location: 'Varanasi, Uttar Pradesh',
    photo_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    caption: 'Spiritual evening brass lamps swirling to Vedic chants across the holy river.'
  },
  {
    title: 'Golden Temple Amrit Sarovar',
    location: 'Amritsar, Punjab',
    photo_url: 'https://images.unsplash.com/photo-1588096344356-9a4057861e69?auto=format&fit=crop&w=1200&q=80',
    caption: 'Peaceful golden reflection shimmering on the sacred pool at twilight.'
  },
  {
    title: 'Pangong Tso Crystal Blue Lake',
    location: 'Ladakh, Jammu & Kashmir',
    photo_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    caption: 'Breathtaking high-altitude saline lake shifting shades of turquoise against rugged peaks.'
  }
];

const CATEGORY_ICONS = {
  Sightseeing: Camera,
  Food: Coffee,
  Adventure: Compass,
  Culture: Sparkles,
  Entertainment: Camera,
  Shopping: ShoppingBag,
  Nature: Compass,
  Relaxation: Hotel,
  Other: Layers
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysCount(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, itinerary, activities, accommodations, transportation, budget, map, packing
  const [selectedDayId, setSelectedDayId] = useState(null);

  // Modals state
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [accModalOpen, setAccModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState(null);
  const [transModalOpen, setTransModalOpen] = useState(false);
  const [editingTrans, setEditingTrans] = useState(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);

  // Famous Photos State
  const [photos, setPhotos] = useState([]);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [photoForm, setPhotoForm] = useState({
    photo_url: '',
    title: '',
    caption: '',
    location: '',
    taken_date: new Date().toISOString().split('T')[0]
  });

  // Form States
  const [dayForm, setDayForm] = useState({ title: '', date: '', notes: '' });
  const [itemForm, setItemForm] = useState({
    day_id: '', title: '', category: 'Sightseeing', start_time: '09:00', end_time: '11:00',
    location: '', estimated_cost: '0', notes: ''
  });
  const [activityForm, setActivityForm] = useState({
    name: '', category: 'Sightseeing', location: '', date: '', start_time: '', end_time: '',
    cost: '0', booking_ref: '', notes: '', status: 'planned'
  });
  const [accForm, setAccForm] = useState({
    name: '', type: 'Hotel', location: '', check_in: '', check_out: '', nights: 1,
    price_per_night: '100', total_cost: '100', booking_ref: '', notes: ''
  });
  const [transForm, setTransForm] = useState({
    type: 'Flight', provider: '', origin: '', destination: '', departure_time: '', arrival_time: '',
    cost: '0', booking_ref: '', notes: ''
  });
  const [expenseForm, setExpenseForm] = useState({
    category: 'Food', title: '', amount: '', date: '', payment_method: 'Credit Card', notes: ''
  });
  const [newPackingItem, setNewPackingItem] = useState('');
  const [packingCategory, setPackingCategory] = useState('General');

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  async function fetchTripDetails() {
    try {
      const res = await api.getTripById(id);
      setTrip(res.trip);
      setPhotos(res.trip?.photos || []);
      if (res.trip?.itinerary && res.trip.itinerary.length > 0) {
        if (!selectedDayId) {
          setSelectedDayId(res.trip.itinerary[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load trip details:', err);
      error(err.message || 'Trip not found or unauthorized.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  // --- Photo Handlers ---
  async function handleAddPhoto(e) {
    if (e) e.preventDefault();
    if (!photoForm.photo_url) {
      error('Please select a preset photo or enter an image URL.');
      return;
    }
    setPhotoSubmitting(true);
    try {
      const res = await api.addTripPhoto(id, photoForm);
      setPhotos(prev => [res.photo, ...prev]);
      success('Famous photo added to trip memories!');
      setPhotoModalOpen(false);
      setPhotoForm({
        photo_url: '',
        title: '',
        caption: '',
        location: '',
        taken_date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      error(err.message || 'Failed to post photo.');
    } finally {
      setPhotoSubmitting(false);
    }
  }

  async function handleDeletePhoto(photoId) {
    try {
      await api.deleteTripPhoto(id, photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      if (viewingPhoto?.id === photoId) setViewingPhoto(null);
      success('Photo removed from memories.');
    } catch (err) {
      error(err.message || 'Failed to remove photo.');
    }
  }

  async function handleLikePhoto(photoId) {
    try {
      const res = await api.likeTripPhoto(id, photoId);
      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, likes_count: res.likes_count } : p));
      if (viewingPhoto?.id === photoId) {
        setViewingPhoto(prev => ({ ...prev, likes_count: res.likes_count }));
      }
    } catch (err) {
      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      await api.updateTripStatus(id, newStatus);
      success(`Trip status updated to ${newStatus}.`);
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to update status.');
    }
  }

  async function handleDeleteTrip() {
    try {
      await api.deleteTrip(id);
      success('Trip deleted successfully.');
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Failed to delete trip.');
    }
  }

  async function handleDuplicateTrip() {
    try {
      const res = await api.duplicateTrip(id);
      success('Trip duplicated successfully!');
      navigate(`/trips/${res.trip.id}`);
    } catch (err) {
      error(err.message || 'Failed to duplicate trip.');
    }
  }

  // --- Itinerary Handlers ---
  async function handleAddDay(e) {
    e.preventDefault();
    try {
      await api.addDay(id, dayForm);
      success('Itinerary day added.');
      setDayModalOpen(false);
      setDayForm({ title: '', date: '', notes: '' });
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to add day.');
    }
  }

  async function handleDeleteDay(dayId) {
    if (!window.confirm('Are you sure you want to delete this itinerary day and its items?')) return;
    try {
      await api.deleteDay(id, dayId);
      success('Day deleted.');
      setSelectedDayId(null);
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to delete day.');
    }
  }

  async function handleSaveItem(e) {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateItineraryItem(id, editingItem.id, itemForm);
        success('Itinerary item updated.');
      } else {
        await api.addItineraryItem(id, itemForm);
        success('Itinerary item added.');
      }
      setItemModalOpen(false);
      setEditingItem(null);
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to save itinerary item.');
    }
  }

  async function handleDeleteItem(itemId) {
    try {
      await api.deleteItineraryItem(id, itemId);
      success('Item removed.');
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to delete item.');
    }
  }

  async function handleMoveItem(day, index, direction) {
    const items = [...day.items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    const itemIds = items.map((it) => it.id);
    try {
      await api.reorderItineraryItems(id, itemIds);
      fetchTripDetails();
    } catch (err) {
      error('Failed to reorder items.');
    }
  }

  // --- Activities Handlers ---
  async function handleSaveActivity(e) {
    e.preventDefault();
    try {
      if (editingActivity) {
        await api.updateActivity(id, editingActivity.id, activityForm);
        success('Activity updated.');
      } else {
        await api.createActivity(id, activityForm);
        success('Activity added to trip.');
      }
      setActivityModalOpen(false);
      setEditingActivity(null);
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to save activity.');
    }
  }

  async function handleDeleteActivity(actId) {
    try {
      await api.deleteActivity(id, actId);
      success('Activity deleted.');
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to delete activity.');
    }
  }

  // --- Accommodation Handlers ---
  async function handleSaveAcc(e) {
    e.preventDefault();
    try {
      if (editingAcc) {
        await api.updateAccommodation(id, editingAcc.id, accForm);
        success('Accommodation updated.');
      } else {
        await api.createAccommodation(id, accForm);
        success('Accommodation added.');
      }
      setAccModalOpen(false);
      setEditingAcc(null);
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to save accommodation.');
    }
  }

  async function handleDeleteAcc(accId) {
    try {
      await api.deleteAccommodation(id, accId);
      success('Accommodation removed.');
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to delete accommodation.');
    }
  }

  // --- Transportation Handlers ---
  async function handleSaveTrans(e) {
    e.preventDefault();
    try {
      if (editingTrans) {
        await api.updateTransportation(id, editingTrans.id, transForm);
        success('Transportation updated.');
      } else {
        await api.createTransportation(id, transForm);
        success('Transportation record added.');
      }
      setTransModalOpen(false);
      setEditingTrans(null);
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to save transportation.');
    }
  }

  async function handleDeleteTrans(trId) {
    try {
      await api.deleteTransportation(id, trId);
      success('Transportation deleted.');
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to delete transportation.');
    }
  }

  // --- Expenses Handlers ---
  async function handleAddExpense(e) {
    e.preventDefault();
    try {
      await api.createExpense(id, expenseForm);
      success('Expense logged successfully.');
      setExpenseModalOpen(false);
      setExpenseForm({ category: 'Food', title: '', amount: '', date: '', payment_method: 'Credit Card', notes: '' });
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to log expense.');
    }
  }

  async function handleDeleteExpense(expId) {
    try {
      await api.deleteExpense(id, expId);
      success('Expense entry deleted.');
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to delete expense.');
    }
  }

  // --- Packing Items Handlers ---
  async function handleAddPackingItem(e) {
    e.preventDefault();
    if (!newPackingItem.trim()) return;
    try {
      await api.addPackingItem(id, { item_name: newPackingItem.trim(), category: packingCategory });
      setNewPackingItem('');
      fetchTripDetails();
    } catch (err) {
      error(err.message || 'Failed to add item.');
    }
  }

  async function handleTogglePacking(pId) {
    try {
      await api.togglePackingItem(id, pId);
      fetchTripDetails();
    } catch (err) {
      error('Failed to update packing status.');
    }
  }

  async function handleDeletePacking(pId) {
    try {
      await api.deletePackingItem(id, pId);
      fetchTripDetails();
    } catch (err) {
      error('Failed to remove item.');
    }
  }

  if (loading || !trip) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ color: 'var(--text-muted)' }}>Loading comprehensive trip hub...</span>
      </div>
    );
  }

  const daysCount = getDaysCount(trip.start_date, trip.end_date);
  const currentDay = trip.itinerary?.find((d) => d.id === selectedDayId) || trip.itinerary?.[0];

  // Map markers aggregation
  const mapMarkers = [
    ...(trip.accommodations || []).map((acc) => ({
      lat: acc.latitude,
      lng: acc.longitude,
      title: acc.name,
      subtitle: `${acc.type} • ${acc.location}`,
      type: 'hotel',
      cost: acc.total_cost
    })),
    ...(trip.activities || []).map((act) => ({
      lat: act.latitude,
      lng: act.longitude,
      title: act.name,
      category: act.category,
      subtitle: act.location,
      type: 'activity',
      cost: act.cost
    }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      
      {/* Hero Header with Cover Image */}
      <div style={{
        position: 'relative',
        height: '320px',
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.85) 100%), url(${trip.cover_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '2.5rem'
      }}>
        <div className="container" style={{ width: '100%' }}>
          
          <Link to="/dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#cbd5e1',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1rem',
            textDecoration: 'none'
          }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                  <MapPin size={13} color="#38bdf8" /> {trip.destination_name}
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  <Calendar size={13} /> {formatDate(trip.start_date)} – {formatDate(trip.end_date)} ({daysCount} Days)
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  <Users size={13} /> {trip.travelers_count} {trip.travelers_count > 1 ? 'Travelers' : 'Traveler'}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                {trip.title}
              </h1>
            </div>

            {/* Status Switcher & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <select
                value={trip.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.9)',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
                id="select-trip-status"
              >
                <option value="planning">Status: Planning</option>
                <option value="active">Status: Active</option>
                <option value="completed">Status: Completed</option>
                <option value="archived">Status: Archived</option>
              </select>

              <Link to={`/trips/${id}/edit`} className="btn btn-secondary btn-sm" id="btn-edit-trip-header">
                <Edit3 size={15} />
                <span>Edit</span>
              </Link>

              <button onClick={handleDuplicateTrip} className="btn btn-secondary btn-sm" title="Duplicate Trip" id="btn-duplicate-trip-header">
                <Copy size={15} />
              </button>

              <button
                onClick={() => setDeleteConfirmModal(true)}
                className="btn btn-danger btn-sm"
                title="Delete Trip"
                id="btn-delete-trip-header"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Trip Celebration & Photo Posting Banner */}
      {trip.status === 'completed' && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🎉</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'Outfit' }}>
                Trip Completed! Share your famous moments & photos
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                You've completed your journey to {trip.destination_name || trip.title}! Add your iconic shots, monument photos, and travel memories.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => { setActiveTab('photos'); setPhotoModalOpen(true); }}
              className="btn"
              style={{
                background: '#ffffff',
                color: '#059669',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              id="btn-post-famous-photo-banner"
            >
              <Camera size={18} /> Post Famous Photo
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.4)',
                fontWeight: 600
              }}
            >
              View Memories ({photos.length})
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Navigation Bar */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: '4.5rem',
        zIndex: 400
      }}>
        <div className="container" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 1.5rem' }}>
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'photos', label: `Famous Photos (${photos.length})`, icon: Camera },
            { id: 'itinerary', label: `Itinerary (${trip.itinerary?.length || 0}d)`, icon: Calendar },
            { id: 'activities', label: `Activities (${trip.activities?.length || 0})`, icon: Sparkles },
            { id: 'accommodations', label: `Stays (${trip.accommodations?.length || 0})`, icon: Hotel },
            { id: 'transportation', label: `Transit (${trip.transportations?.length || 0})`, icon: Plane },
            { id: 'budget', label: 'Budget & Spend', icon: IndianRupee },
            { id: 'map', label: 'Interactive Map', icon: MapPin },
            { id: 'packing', label: 'Packing & Notes', icon: CheckSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isTabActive ? 'var(--primary-light)' : 'transparent',
                  color: isTabActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isTabActive ? 700 : 500,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition)'
                }}
                id={`tab-${tab.id}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents Area */}
      <div className="page-wrapper" style={{ flex: 1 }}>
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Trip Duration</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Outfit', margin: '0.25rem 0' }}>{daysCount} Days</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(trip.start_date)} to {formatDate(trip.end_date)}</div>
              </div>

              <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Planned Budget</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit', margin: '0.25rem 0' }}>₹{(trip.estimated_budget || 0).toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{(trip.budget_summary?.total_spent || 0).toLocaleString('en-IN')} logged</div>
              </div>

              <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Activities Planned</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', fontFamily: 'Outfit', margin: '0.25rem 0' }}>{trip.activities?.length || 0}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Across {trip.itinerary?.length || 0} itinerary days</div>
              </div>

              <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Accommodations</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', fontFamily: 'Outfit', margin: '0.25rem 0' }}>{trip.accommodations?.length || 0} Stays</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trip.transportations?.length || 0} transit legs</div>
              </div>
            </div>

            {/* Description & Notes card if provided */}
            {trip.description && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Trip Purpose & Notes</h3>
                <p style={{ color: 'var(--text-main)', lineHeight: 1.6, fontSize: '0.95rem' }}>{trip.description}</p>
              </div>
            )}

            {/* Famous Photos & Trip Memories Highlight */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={20} color="var(--primary)" /> Famous Photos & Trip Memories ({photos.length})
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    {trip.status === 'completed'
                      ? 'Iconic moments and memories posted from this completed trip.'
                      : 'Showcase famous landmarks and photography captured during this trip.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setActiveTab('photos'); setPhotoModalOpen(true); }} className="btn btn-primary btn-sm" id="btn-add-photo-overview">
                    <Plus size={15} /> Post Photo
                  </button>
                  <button onClick={() => setActiveTab('photos')} className="btn btn-secondary btn-sm" id="btn-view-all-photos-overview">
                    View Gallery ({photos.length})
                  </button>
                </div>
              </div>

              {photos.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <Camera size={36} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No famous photos posted yet</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {trip.status === 'completed'
                      ? 'This trip is completed! Celebrate by posting your top landmark photos and memories.'
                      : 'Add your favorite trip photos and iconic landmark moments!'}
                  </div>
                  <button onClick={() => { setActiveTab('photos'); setPhotoModalOpen(true); }} className="btn btn-primary btn-sm">
                    <Camera size={15} /> Post First Famous Photo
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                  {photos.slice(0, 4).map(photo => (
                    <div
                      key={photo.id}
                      onClick={() => setViewingPhoto(photo)}
                      style={{
                        position: 'relative',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        aspectRatio: '4/3',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                      <img
                        src={photo.photo_url}
                        alt={photo.title || 'Trip Photo'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '0.75rem',
                        color: '#fff'
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {photo.title || 'Untitled Moment'}
                        </div>
                        {photo.location && (
                          <div style={{ fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={11} /> {photo.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Budget Gauge Preview */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IndianRupee size={20} color="var(--primary)" /> Budget Snapshot
                </h3>
                <button onClick={() => setActiveTab('budget')} className="btn btn-secondary btn-sm">
                  View Full Budget
                </button>
              </div>
              <BudgetChart
                estimatedBudget={trip.estimated_budget}
                expenses={trip.expenses || []}
                categoryBreakdown={trip.budget_summary?.category_breakdown || {}}
              />
            </div>

            {/* Interactive Map Preview */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} color="#ef4444" /> Location Overview
                </h3>
                <button onClick={() => setActiveTab('map')} className="btn btn-secondary btn-sm">
                  Full Screen Map
                </button>
              </div>
              <InteractiveMap
                markers={mapMarkers}
                destinationName={trip.destination_name}
                height="340px"
              />
            </div>
          </div>
        )}

        {/* TAB 2: ITINERARY (DAY-BY-DAY) */}
        {activeTab === 'itinerary' && (
          <div>
            {/* Itinerary Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Day-by-Day Itinerary</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Schedule morning, afternoon, and evening activities with times and costs</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setDayModalOpen(true)} className="btn btn-secondary" id="btn-add-day">
                  <Plus size={16} /> Add Day
                </button>
                <button
                  onClick={() => {
                    setItemForm({
                      day_id: currentDay?.id || '',
                      title: '',
                      category: 'Sightseeing',
                      start_time: '09:00',
                      end_time: '11:00',
                      location: '',
                      estimated_cost: '0',
                      notes: ''
                    });
                    setEditingItem(null);
                    setItemModalOpen(true);
                  }}
                  className="btn btn-primary"
                  disabled={!currentDay}
                  id="btn-add-itinerary-item"
                >
                  <Plus size={16} /> Add Activity Item
                </button>
              </div>
            </div>

            {/* Days Horizontal Pill Tabs */}
            {trip.itinerary && trip.itinerary.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  {trip.itinerary.map((day) => {
                    const isSelected = day.id === currentDay?.id;
                    return (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDayId(day.id)}
                        style={{
                          padding: '0.75rem 1.25rem',
                          borderRadius: 'var(--radius-lg)',
                          background: isSelected ? 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)' : '#ffffff',
                          color: isSelected ? '#ffffff' : 'var(--text-main)',
                          border: isSelected ? 'none' : '1px solid var(--border-color)',
                          boxShadow: isSelected ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          minWidth: '140px',
                          flexShrink: 0,
                          transition: 'var(--transition)'
                        }}
                        id={`day-selector-${day.day_number}`}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: isSelected ? 0.9 : 0.6, textTransform: 'uppercase' }}>
                          Day {day.day_number}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{day.title || `Day ${day.day_number}`}</div>
                        <div style={{ fontSize: '0.75rem', opacity: isSelected ? 0.85 : 0.6, marginTop: '0.2rem' }}>
                          {formatDate(day.date)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Day Card & Items Timeline */}
                {currentDay && (
                  <div className="card" style={{ padding: '2rem' }}>
                    
                    {/* Day Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                          DAY {currentDay.day_number} • {formatDate(currentDay.date)}
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentDay.title}</h3>
                        {currentDay.notes && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{currentDay.notes}</p>
                        )}
                      </div>

                      <button onClick={() => handleDeleteDay(currentDay.id)} className="btn btn-danger btn-sm" title="Delete Day">
                        <Trash2 size={15} /> Delete Day
                      </button>
                    </div>

                    {/* Timeline Items */}
                    {currentDay.items && currentDay.items.length > 0 ? (
                      <div className="timeline">
                        {currentDay.items.map((item, idx) => {
                          const CategoryIcon = CATEGORY_ICONS[item.category] || Camera;
                          return (
                            <div key={item.id} className="timeline-item">
                              <div className="timeline-dot">
                                <CategoryIcon size={12} color="var(--primary)" />
                              </div>

                              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                                      {item.start_time && (
                                        <span className="badge badge-primary" style={{ fontWeight: 700, fontSize: '0.775rem' }}>
                                          <Clock size={12} /> {item.start_time} {item.end_time ? `– ${item.end_time}` : ''}
                                        </span>
                                      )}
                                      <span className="badge badge-secondary">{item.category}</span>
                                      {item.estimated_cost > 0 && (
                                        <span className="badge badge-success">₹{(item.estimated_cost || 0).toLocaleString('en-IN')}</span>
                                      )}
                                    </div>

                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                      {item.title}
                                    </h4>

                                    {item.location && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                                        <MapPin size={14} color="#38bdf8" />
                                        <span>{item.location}</span>
                                      </div>
                                    )}

                                    {item.notes && (
                                      <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                                        {item.notes}
                                      </p>
                                    )}
                                  </div>

                                  {/* Item Actions */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <button
                                      onClick={() => handleMoveItem(currentDay, idx, 'up')}
                                      disabled={idx === 0}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '0.25rem 0.45rem' }}
                                      title="Move Up"
                                    >
                                      <ChevronUp size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleMoveItem(currentDay, idx, 'down')}
                                      disabled={idx === currentDay.items.length - 1}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '0.25rem 0.45rem' }}
                                      title="Move Down"
                                    >
                                      <ChevronDown size={14} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingItem(item);
                                        setItemForm({
                                          day_id: item.day_id,
                                          title: item.title,
                                          category: item.category || 'Sightseeing',
                                          start_time: item.start_time || '',
                                          end_time: item.end_time || '',
                                          location: item.location || '',
                                          estimated_cost: (item.estimated_cost || 0).toString(),
                                          notes: item.notes || ''
                                        });
                                        setItemModalOpen(true);
                                      }}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '0.25rem 0.45rem' }}
                                      title="Edit Activity"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="btn btn-danger btn-sm"
                                      style={{ padding: '0.25rem 0.45rem' }}
                                      title="Delete Activity"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>

                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                        <Clock size={36} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                        <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>No itinerary items for Day {currentDay.day_number}</h4>
                        <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>Add sights, food stops, or tours to build this day's schedule.</p>
                        <button
                          onClick={() => {
                            setItemForm({
                              day_id: currentDay.id,
                              title: '',
                              category: 'Sightseeing',
                              start_time: '09:00',
                              end_time: '11:00',
                              location: '',
                              estimated_cost: '0',
                              notes: ''
                            });
                            setEditingItem(null);
                            setItemModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <Plus size={16} /> Add First Activity
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Calendar size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Itinerary Days Created</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Click below to add your first day of exploration.</p>
                <button onClick={() => setDayModalOpen(true)} className="btn btn-primary">
                  <Plus size={18} /> Add Day 1
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACTIVITIES */}
        {activeTab === 'activities' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Trip Activities & Tours</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Keep track of booked tours, tickets, sightseeing, and experiences</p>
              </div>
              <button
                onClick={() => {
                  setActivityForm({
                    name: '', category: 'Sightseeing', location: '', date: trip.start_date || '',
                    start_time: '', end_time: '', cost: '0', booking_ref: '', notes: '', status: 'planned'
                  });
                  setEditingActivity(null);
                  setActivityModalOpen(true);
                }}
                className="btn btn-primary"
                id="btn-add-activity"
              >
                <Plus size={16} /> Add Activity
              </button>
            </div>

            {trip.activities && trip.activities.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {trip.activities.map((act) => {
                  const Icon = CATEGORY_ICONS[act.category] || Sparkles;
                  return (
                    <div key={act.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <span className="badge badge-secondary" style={{ fontSize: '0.725rem' }}>{act.category}</span>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.15rem' }}>{act.name}</h4>
                          </div>
                        </div>

                        <span className={`status-pill status-${act.status === 'booked' ? 'active' : act.status === 'completed' ? 'completed' : 'planning'}`}>
                          {act.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        {act.date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={14} /> {formatDate(act.date)} {act.start_time ? `at ${act.start_time}` : ''}
                          </div>
                        )}
                        {act.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MapPin size={14} color="#38bdf8" /> {act.location}
                          </div>
                        )}
                        {act.booking_ref && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 600 }}>
                            <CheckCircle2 size={14} /> Ref: {act.booking_ref}
                          </div>
                        )}
                      </div>

                      {act.notes && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', background: 'var(--bg-subtle)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', lineHeight: 1.5 }}>
                          {act.notes}
                        </p>
                      )}

                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#10b981' }}>
                          ₹{(act.cost || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => {
                              setEditingActivity(act);
                              setActivityForm({
                                name: act.name,
                                category: act.category || 'Sightseeing',
                                location: act.location || '',
                                date: act.date || '',
                                start_time: act.start_time || '',
                                end_time: act.end_time || '',
                                cost: (act.cost || 0).toString(),
                                booking_ref: act.booking_ref || '',
                                notes: act.notes || '',
                                status: act.status || 'planned'
                              });
                              setActivityModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <Sparkles size={42} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Activities Added Yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Add guided tours, museum tickets, or adventures to organize your trip schedule.</p>
                <button
                  onClick={() => {
                    setActivityForm({
                      name: '', category: 'Sightseeing', location: '', date: trip.start_date || '',
                      start_time: '', end_time: '', cost: '0', booking_ref: '', notes: '', status: 'planned'
                    });
                    setEditingActivity(null);
                    setActivityModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={16} /> Add First Activity
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACCOMMODATIONS */}
        {activeTab === 'accommodations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Accommodations & Stays</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hotels, boutique ryokans, resorts, and Airbnb reservations</p>
              </div>
              <button
                onClick={() => {
                  setAccForm({
                    name: '', type: 'Hotel', location: trip.destination_name || '', check_in: trip.start_date || '',
                    check_out: trip.end_date || '', nights: daysCount, price_per_night: '150', total_cost: '150', booking_ref: '', notes: ''
                  });
                  setEditingAcc(null);
                  setAccModalOpen(true);
                }}
                className="btn btn-primary"
                id="btn-add-accommodation"
              >
                <Plus size={16} /> Add Accommodation
              </button>
            </div>

            {trip.accommodations && trip.accommodations.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {trip.accommodations.map((acc) => (
                  <div key={acc.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Hotel size={20} />
                        </div>
                        <div>
                          <span className="badge badge-primary">{acc.type}</span>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.15rem' }}>{acc.name}</h4>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="#38bdf8" /> {acc.location}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} /> Check-in: <strong>{formatDate(acc.check_in)}</strong> → Check-out: <strong>{formatDate(acc.check_out)}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {acc.nights} {acc.nights > 1 ? 'Nights' : 'Night'} @ ₹{(acc.price_per_night || 0).toLocaleString('en-IN')}/night
                      </div>
                      {acc.booking_ref && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Confirmation: {acc.booking_ref}
                        </div>
                      )}
                    </div>

                    {acc.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', background: 'var(--bg-subtle)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', lineHeight: 1.5 }}>
                        {acc.notes}
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Stay Cost</div>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>₹{(acc.total_cost || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => {
                            setEditingAcc(acc);
                            setAccForm({
                              name: acc.name,
                              type: acc.type || 'Hotel',
                              location: acc.location || '',
                              check_in: acc.check_in || '',
                              check_out: acc.check_out || '',
                              nights: acc.nights || 1,
                              price_per_night: (acc.price_per_night || 0).toString(),
                              total_cost: (acc.total_cost || 0).toString(),
                              booking_ref: acc.booking_ref || '',
                              notes: acc.notes || ''
                            });
                            setAccModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAcc(acc.id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <Hotel size={42} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Accommodations Added</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Add hotel bookings or vacation rentals to keep check-in dates and confirmation numbers organized.</p>
                <button
                  onClick={() => {
                    setAccForm({
                      name: '', type: 'Hotel', location: trip.destination_name || '', check_in: trip.start_date || '',
                      check_out: trip.end_date || '', nights: daysCount, price_per_night: '150', total_cost: '150', booking_ref: '', notes: ''
                    });
                    setEditingAcc(null);
                    setAccModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={16} /> Add First Stay
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TRANSPORTATION */}
        {activeTab === 'transportation' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Transit & Travel Logistics</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Flights, bullet trains, car rentals, and ferry connections</p>
              </div>
              <button
                onClick={() => {
                  setTransForm({
                    type: 'Flight', provider: '', origin: '', destination: trip.destination_name || '',
                    departure_time: '', arrival_time: '', cost: '0', booking_ref: '', notes: ''
                  });
                  setEditingTrans(null);
                  setTransModalOpen(true);
                }}
                className="btn btn-primary"
                id="btn-add-transportation"
              >
                <Plus size={16} /> Add Transportation
              </button>
            </div>

            {trip.transportations && trip.transportations.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {trip.transportations.map((tr) => (
                  <div key={tr.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plane size={20} />
                        </div>
                        <div>
                          <span className="badge badge-secondary">{tr.type}</span>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.15rem' }}>{tr.provider || tr.type}</h4>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0284c7' }}>
                        ₹{(tr.cost || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Route Visualizer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-subtle)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      margin: '0.5rem 0 1rem'
                    }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Origin</div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tr.origin}</div>
                        {tr.departure_time && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr.departure_time}</div>}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--secondary)', padding: '0 0.5rem' }}>
                        <Plane size={16} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>➔</span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination</div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tr.destination}</div>
                        {tr.arrival_time && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr.arrival_time}</div>}
                      </div>
                    </div>

                    {tr.booking_ref && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Booking Reference: {tr.booking_ref}
                      </div>
                    )}

                    {tr.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                        {tr.notes}
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '0.35rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => {
                          setEditingTrans(tr);
                          setTransForm({
                            type: tr.type || 'Flight',
                            provider: tr.provider || '',
                            origin: tr.origin || '',
                            destination: tr.destination || '',
                            departure_time: tr.departure_time || '',
                            arrival_time: tr.arrival_time || '',
                            cost: (tr.cost || 0).toString(),
                            booking_ref: tr.booking_ref || '',
                            notes: tr.notes || ''
                          });
                          setTransModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTrans(tr.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <Plane size={42} color="var(--secondary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Transportation Scheduled</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Keep your flights, trains, and rental car numbers in one convenient timeline.</p>
                <button
                  onClick={() => {
                    setTransForm({
                      type: 'Flight', provider: '', origin: '', destination: trip.destination_name || '',
                      departure_time: '', arrival_time: '', cost: '0', booking_ref: '', notes: ''
                    });
                    setEditingTrans(null);
                    setTransModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={16} /> Add First Transit Leg
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: BUDGET & EXPENSES */}
        {activeTab === 'budget' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Budget & Expense Tracker</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time expense logging, category breakdown, and remaining budget meters</p>
              </div>
              <button
                onClick={() => {
                  setExpenseForm({
                    category: 'Food', title: '', amount: '', date: new Date().toISOString().split('T')[0],
                    payment_method: 'Credit Card', notes: ''
                  });
                  setExpenseModalOpen(true);
                }}
                className="btn btn-primary"
                id="btn-log-expense"
              >
                <Plus size={16} /> Log Expense
              </button>
            </div>

            {/* Visual Budget Charts */}
            <BudgetChart
              estimatedBudget={trip.estimated_budget}
              expenses={trip.expenses || []}
              categoryBreakdown={trip.budget_summary?.category_breakdown || {}}
            />

            {/* Expense Log Table */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Expense Log History</h3>
              
              {trip.expenses && trip.expenses.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Title</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Payment Method</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trip.expenses.map((exp) => (
                        <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(exp.date)}</td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                            {exp.title}
                            {exp.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{exp.notes}</div>}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span className="badge badge-primary">{exp.category}</span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{exp.payment_method}</td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                            ₹{parseFloat(exp.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                              title="Delete Expense"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  No expenses logged yet. Click "+ Log Expense" above to start recording spending.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 7: INTERACTIVE MAP */}
        {activeTab === 'map' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Interactive Destination Map</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Visual map of your accommodations (Indigo), activities (Green), and destination hub (Red).
              </p>
            </div>

            <div className="card" style={{ padding: '1rem' }}>
              <InteractiveMap
                markers={mapMarkers}
                destinationName={trip.destination_name}
                height="560px"
              />
            </div>
          </div>
        )}

        {/* TAB 8: PACKING & NOTES */}
        {activeTab === 'packing' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Packing Checklist */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={20} color="var(--primary)" /> Packing Checklist
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Never leave an essential passport or charger behind.
              </p>

              {/* Add item form */}
              <form onSubmit={handleAddPackingItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <select
                  value={packingCategory}
                  onChange={(e) => setPackingCategory(e.target.value)}
                  className="form-select"
                  style={{ width: '130px', fontSize: '0.85rem' }}
                >
                  <option value="Documents">Documents</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Toiletries">Toiletries</option>
                  <option value="General">General</option>
                </select>
                <input
                  type="text"
                  placeholder="e.g. Passport, universal adapter..."
                  value={newPackingItem}
                  onChange={(e) => setNewPackingItem(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, fontSize: '0.875rem' }}
                  id="input-packing-item"
                />
                <button type="submit" className="btn btn-primary btn-sm" id="btn-add-packing">
                  <Plus size={16} /> Add
                </button>
              </form>

              {/* Checklist Items */}
              {trip.packing_items && trip.packing_items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {trip.packing_items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: item.is_packed ? 'var(--bg-subtle)' : '#ffffff',
                        border: '1px solid var(--border-color)',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div
                        onClick={() => handleTogglePacking(item.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flex: 1 }}
                      >
                        {item.is_packed ? (
                          <CheckSquare size={18} color="var(--success)" />
                        ) : (
                          <Square size={18} color="var(--text-muted)" />
                        )}
                        <span style={{
                          fontSize: '0.9rem',
                          fontWeight: item.is_packed ? 400 : 600,
                          textDecoration: item.is_packed ? 'line-through' : 'none',
                          color: item.is_packed ? 'var(--text-muted)' : 'var(--text-main)'
                        }}>
                          {item.item_name}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {item.category}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeletePacking(item.id)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No items added. Add items above to build your packing list!
                </div>
              )}
            </div>

            {/* General Trip Notes */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="var(--primary)" /> Travel Information & Emergency Contacts
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Keep embassy numbers, local emergency contacts, and travel insurance details handy.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    Local Emergency Contact (Destination: {trip.destination_name})
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>Emergency Police & Medical Services: <strong>110 / 119</strong></div>
                  <div style={{ color: 'var(--text-muted)' }}>Tourist Assistance Hotline: <strong>+81 50-3816-2788</strong></div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    Health & Visa Reminders
                  </div>
                  <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Ensure passport validity of at least 6 months past return date. Keep electronic copy of visas and travel insurance policy on phone.
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 9: FAMOUS PHOTOS & TRIP MEMORIES */}
        {activeTab === 'photos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Header with Title, Status & Post Photo Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              background: 'linear-gradient(135deg, rgba(238, 114, 20, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)',
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className={`badge ${trip.status === 'completed' ? 'badge-success' : 'badge-primary'}`}>
                    {trip.status === 'completed' ? '🎉 Completed Trip Memories' : '📸 Trip Moments'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'} Posted
                  </span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>
                  Famous Photos & Trip Memories
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '650px' }}>
                  Capture, preserve, and showcase iconic sights, monuments, and moments from your travels to {trip.destination_name || trip.title}.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setPhotoModalOpen(true)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
                  id="btn-open-post-photo"
                >
                  <Camera size={18} /> Post Famous Photo
                </button>
              </div>
            </div>

            {/* Quick Preset Photo Inspiration Bar */}
            <div className="card" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Sparkles size={16} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Quick Landmark Preset Inspiration</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Click any famous shot to prepopulate your memory post)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {FAMOUS_PHOTO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPhotoForm({
                        photo_url: preset.photo_url,
                        title: preset.title,
                        caption: preset.caption,
                        location: preset.location,
                        taken_date: new Date().toISOString().split('T')[0]
                      });
                      setPhotoModalOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-color)',
                      background: '#ffffff',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'var(--transition)'
                    }}
                    className="preset-btn"
                  >
                    <img
                      src={preset.photo_url}
                      alt={preset.title}
                      style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span>{preset.title.split(' ')[0]} {preset.title.split(' ')[1] || ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photos Gallery Grid */}
            {photos.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{
                  width: '4.5rem',
                  height: '4.5rem',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <Camera size={34} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  No Famous Photos Added Yet
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                  {trip.status === 'completed'
                    ? "Your journey is complete! Commemorate your adventure by posting your favorite photographs from this trip."
                    : "Add photos as you explore, or post your best captures once this trip wraps up!"}
                </p>
                <button onClick={() => setPhotoModalOpen(true)} className="btn btn-primary" id="btn-post-first-famous-photo">
                  <Camera size={16} /> Post Your First Famous Photo
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem'
              }}>
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="card"
                    style={{
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 'var(--radius-lg)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {/* Image with Click to Lightbox */}
                    <div
                      onClick={() => setViewingPhoto(photo)}
                      style={{
                        position: 'relative',
                        height: '240px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        background: '#1e293b'
                      }}
                    >
                      <img
                        src={photo.photo_url}
                        alt={photo.title || 'Trip memory'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        display: 'flex',
                        gap: '0.4rem',
                        flexWrap: 'wrap'
                      }}>
                        {photo.location && (
                          <span style={{
                            background: 'rgba(15, 23, 42, 0.75)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <MapPin size={12} color="#38bdf8" /> {photo.location}
                          </span>
                        )}
                      </div>

                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        padding: '0.25rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        {photo.taken_date ? formatDate(photo.taken_date) : 'Memory'}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h4
                        onClick={() => setViewingPhoto(photo)}
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          marginBottom: '0.35rem',
                          cursor: 'pointer',
                          color: 'var(--text-main)'
                        }}
                      >
                        {photo.title || 'Iconic Moment'}
                      </h4>

                      {photo.caption && (
                        <p style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.875rem',
                          lineHeight: 1.55,
                          marginBottom: '1rem',
                          flex: 1
                        }}>
                          {photo.caption}
                        </p>
                      )}

                      {/* Card Footer: Likes & Actions */}
                      <div style={{
                        marginTop: 'auto',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleLikePhoto(photo.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-subtle)',
                            padding: '0.4rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: photo.likes_count > 0 ? '#ef4444' : 'var(--text-muted)',
                            transition: 'var(--transition)'
                          }}
                          title="Like this photo"
                          id={`btn-like-photo-${photo.id}`}
                        >
                          <Heart size={14} fill={photo.likes_count > 0 ? '#ef4444' : 'none'} color={photo.likes_count > 0 ? '#ef4444' : 'currentColor'} />
                          <span>{photo.likes_count || 0}</span>
                        </button>

                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => setViewingPhoto(photo)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            title="Expand view"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.55rem' }}
                            title="Delete photo"
                            id={`btn-delete-photo-${photo.id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* --- ALL MODALS --- */}

      {/* 1. Add Itinerary Day Modal */}
      <Modal
        isOpen={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        title="Add Itinerary Day"
        footer={
          <>
            <button onClick={() => setDayModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleAddDay} className="btn btn-primary" id="btn-submit-add-day">Add Day</button>
          </>
        }
      >
        <form onSubmit={handleAddDay}>
          <div className="form-group">
            <label className="form-label">Day Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Arashiyama Bamboo Grove & River Cruise"
              value={dayForm.title}
              onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={dayForm.date}
              onChange={(e) => setDayForm({ ...dayForm, date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Day Notes</label>
            <textarea
              className="form-textarea"
              placeholder="General plans for this day..."
              value={dayForm.notes}
              onChange={(e) => setDayForm({ ...dayForm, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* 2. Add / Edit Itinerary Item Modal */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => { setItemModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Itinerary Item' : 'Add Activity to Itinerary'}
        footer={
          <>
            <button onClick={() => { setItemModalOpen(false); setEditingItem(null); }} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveItem} className="btn btn-primary" id="btn-submit-itinerary-item">
              {editingItem ? 'Save Changes' : 'Add Item'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveItem}>
          <div className="form-group">
            <label className="form-label">Day</label>
            <select
              className="form-select"
              value={itemForm.day_id}
              onChange={(e) => setItemForm({ ...itemForm, day_id: parseInt(e.target.value, 10) })}
              required
            >
              {trip.itinerary?.map((d) => (
                <option key={d.id} value={d.id}>Day {d.day_number}: {d.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Activity Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Fushimi Inari Torii Gate Hike"
              value={itemForm.title}
              onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
              required
              id="input-itinerary-item-title"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Food">Food & Dining</option>
                <option value="Adventure">Adventure</option>
                <option value="Culture">Culture</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Nature">Nature</option>
                <option value="Relaxation">Relaxation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Cost (₹ INR)</label>
              <input
                type="number"
                min="0"
                step="5"
                className="form-input"
                value={itemForm.estimated_cost}
                onChange={(e) => setItemForm({ ...itemForm, estimated_cost: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-input"
                value={itemForm.start_time}
                onChange={(e) => setItemForm({ ...itemForm, start_time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-input"
                value={itemForm.end_time}
                onChange={(e) => setItemForm({ ...itemForm, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Fushimi Ward, Kyoto"
              value={itemForm.location}
              onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Booking Tips</label>
            <textarea
              className="form-textarea"
              placeholder="Any hints or voucher codes..."
              value={itemForm.notes}
              onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* 3. Add / Edit Activity Modal */}
      <Modal
        isOpen={activityModalOpen}
        onClose={() => { setActivityModalOpen(false); setEditingActivity(null); }}
        title={editingActivity ? 'Edit Activity' : 'Add Activity to Trip'}
        footer={
          <>
            <button onClick={() => { setActivityModalOpen(false); setEditingActivity(null); }} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveActivity} className="btn btn-primary" id="btn-submit-activity">
              {editingActivity ? 'Save Activity' : 'Add Activity'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveActivity}>
          <div className="form-group">
            <label className="form-label">Activity Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Traditional Tea Master Ceremony"
              value={activityForm.name}
              onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
              required
              id="input-activity-name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={activityForm.category}
                onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Food">Food & Dining</option>
                <option value="Adventure">Adventure</option>
                <option value="Culture">Culture</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Nature">Nature</option>
                <option value="Relaxation">Relaxation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={activityForm.status}
                onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}
              >
                <option value="planned">Planned</option>
                <option value="booked">Booked (Confirmed)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={activityForm.date}
                onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost (₹ INR)</label>
              <input
                type="number"
                min="0"
                step="5"
                className="form-input"
                value={activityForm.cost}
                onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Gion Historic District, Kyoto"
              value={activityForm.location}
              onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Booking Reference / Voucher Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. TEA-KYO-8821"
              value={activityForm.booking_ref}
              onChange={(e) => setActivityForm({ ...activityForm, booking_ref: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* 4. Add / Edit Accommodation Modal */}
      <Modal
        isOpen={accModalOpen}
        onClose={() => { setAccModalOpen(false); setEditingAcc(null); }}
        title={editingAcc ? 'Edit Accommodation' : 'Add Accommodation'}
        footer={
          <>
            <button onClick={() => { setAccModalOpen(false); setEditingAcc(null); }} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveAcc} className="btn btn-primary" id="btn-submit-accommodation">
              {editingAcc ? 'Save Stay' : 'Add Stay'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveAcc}>
          <div className="form-group">
            <label className="form-label">Property / Hotel Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Hoshinoya Luxury Ryokan"
              value={accForm.name}
              onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
              required
              id="input-acc-name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={accForm.type}
                onChange={(e) => setAccForm({ ...accForm, type: e.target.value })}
              >
                <option value="Hotel">Hotel</option>
                <option value="Resort">Resort / Ryokan</option>
                <option value="Airbnb">Airbnb / Apartment</option>
                <option value="Hostel">Hostel</option>
                <option value="Villa">Villa</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Arashiyama, Kyoto"
                value={accForm.location}
                onChange={(e) => setAccForm({ ...accForm, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Check-In Date *</label>
              <input
                type="date"
                className="form-input"
                value={accForm.check_in}
                onChange={(e) => {
                  const checkIn = e.target.value;
                  const nights = accForm.check_out ? Math.max(1, Math.round((new Date(accForm.check_out) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 1;
                  const price = parseFloat(accForm.price_per_night) || 0;
                  setAccForm({ ...accForm, check_in: checkIn, nights, total_cost: (nights * price).toString() });
                }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Check-Out Date *</label>
              <input
                type="date"
                className="form-input"
                value={accForm.check_out}
                onChange={(e) => {
                  const checkOut = e.target.value;
                  const nights = accForm.check_in ? Math.max(1, Math.round((new Date(checkOut) - new Date(accForm.check_in)) / (1000 * 60 * 60 * 24))) : 1;
                  const price = parseFloat(accForm.price_per_night) || 0;
                  setAccForm({ ...accForm, check_out: checkOut, nights, total_cost: (nights * price).toString() });
                }}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price per Night (₹ INR)</label>
              <input
                type="number"
                min="0"
                step="10"
                className="form-input"
                value={accForm.price_per_night}
                onChange={(e) => {
                  const p = parseFloat(e.target.value) || 0;
                  setAccForm({ ...accForm, price_per_night: e.target.value, total_cost: (p * accForm.nights).toString() });
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Cost (₹ INR)</label>
              <input
                type="number"
                min="0"
                step="10"
                className="form-input"
                value={accForm.total_cost}
                onChange={(e) => setAccForm({ ...accForm, total_cost: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Booking Reference Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. HOSHI-8891-JP"
              value={accForm.booking_ref}
              onChange={(e) => setAccForm({ ...accForm, booking_ref: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* 5. Add / Edit Transportation Modal */}
      <Modal
        isOpen={transModalOpen}
        onClose={() => { setTransModalOpen(false); setEditingTrans(null); }}
        title={editingTrans ? 'Edit Transportation' : 'Add Transportation'}
        footer={
          <>
            <button onClick={() => { setTransModalOpen(false); setEditingTrans(null); }} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveTrans} className="btn btn-primary" id="btn-submit-transportation">
              {editingTrans ? 'Save Transit' : 'Add Transit'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTrans}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Transit Type *</label>
              <select
                className="form-select"
                value={transForm.type}
                onChange={(e) => setTransForm({ ...transForm, type: e.target.value })}
              >
                <option value="Flight">Flight</option>
                <option value="Train">Train / Bullet Train</option>
                <option value="Bus">Bus</option>
                <option value="Car">Car</option>
                <option value="Rental Car">Rental Car</option>
                <option value="Ferry">Ferry</option>
                <option value="Taxi">Taxi / Rideshare</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Carrier / Provider</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Japan Airlines / JR Rail"
                value={transForm.provider}
                onChange={(e) => setTransForm({ ...transForm, provider: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Origin Location *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SFO San Francisco"
                value={transForm.origin}
                onChange={(e) => setTransForm({ ...transForm, origin: e.target.value })}
                required
                id="input-trans-origin"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Location *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. KIX Kansai Osaka"
                value={transForm.destination}
                onChange={(e) => setTransForm({ ...transForm, destination: e.target.value })}
                required
                id="input-trans-dest"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Departure Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2026-10-14 11:30"
                value={transForm.departure_time}
                onChange={(e) => setTransForm({ ...transForm, departure_time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Arrival Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2026-10-15 15:20"
                value={transForm.arrival_time}
                onChange={(e) => setTransForm({ ...transForm, arrival_time: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cost (₹ INR)</label>
              <input
                type="number"
                min="0"
                step="10"
                className="form-input"
                value={transForm.cost}
                onChange={(e) => setTransForm({ ...transForm, cost: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Booking / Ticket Reference</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. JAL-9921-X"
                value={transForm.booking_ref}
                onChange={(e) => setTransForm({ ...transForm, booking_ref: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 6. Log Expense Modal */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Log Trip Expense"
        footer={
          <>
            <button onClick={() => setExpenseModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleAddExpense} className="btn btn-primary" id="btn-submit-expense">Record Expense</button>
          </>
        }
      >
        <form onSubmit={handleAddExpense}>
          <div className="form-group">
            <label className="form-label">Expense Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Wagyu & Sake Dinner in Pontocho"
              value={expenseForm.title}
              onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              required
              id="input-expense-title"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount (₹ INR) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="120.00"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                required
                id="input-expense-amount"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                id="select-expense-category"
              >
                <option value="Accommodation">Accommodation</option>
                <option value="Transportation">Transportation</option>
                <option value="Food">Food & Dining</option>
                <option value="Activities">Activities & Tours</option>
                <option value="Shopping">Shopping</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={expenseForm.payment_method}
                onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Mobile Payment">Apple / Google Pay</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="Receipt details or notes..."
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* 7. Post Famous Photo Modal */}
      <Modal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Post Famous Photo & Memory"
        footer={
          <>
            <button onClick={() => setPhotoModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button
              onClick={handleAddPhoto}
              className="btn btn-primary"
              disabled={photoSubmitting}
              id="btn-submit-post-photo"
            >
              {photoSubmitting ? 'Posting...' : 'Post Famous Photo'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddPhoto}>
          {/* Preset Picker */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} color="var(--primary)" /> Choose from Iconic Indian Presets (Optional)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
              {FAMOUS_PHOTO_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPhotoForm({
                      photo_url: preset.photo_url,
                      title: preset.title,
                      caption: preset.caption,
                      location: preset.location,
                      taken_date: photoForm.taken_date || new Date().toISOString().split('T')[0]
                    });
                  }}
                  style={{
                    border: photoForm.photo_url === preset.photo_url ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: photoForm.photo_url === preset.photo_url ? 'var(--primary-light)' : '#ffffff',
                    transition: 'var(--transition)'
                  }}
                >
                  <img
                    src={preset.photo_url}
                    alt={preset.title}
                    style={{ width: '100%', height: '55px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {preset.title.split(' ')[0]} {preset.title.split(' ')[1] || ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photo URL with Live Preview */}
          <div className="form-group">
            <label className="form-label">Photo Image URL *</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/photo-..."
              value={photoForm.photo_url}
              onChange={(e) => setPhotoForm({ ...photoForm, photo_url: e.target.value })}
              required
              id="input-photo-url"
            />
          </div>

          {photoForm.photo_url && (
            <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '160px', background: '#0f172a' }}>
              <img
                src={photoForm.photo_url}
                alt="Preview"
                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Photo Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sunrise Majesty at Taj Mahal"
              value={photoForm.title}
              onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
              required
              id="input-photo-title"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Landmark / Spot Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Agra, Uttar Pradesh"
                value={photoForm.location}
                onChange={(e) => setPhotoForm({ ...photoForm, location: e.target.value })}
                id="input-photo-location"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date Taken</label>
              <input
                type="date"
                className="form-input"
                value={photoForm.taken_date}
                onChange={(e) => setPhotoForm({ ...photoForm, taken_date: e.target.value })}
                id="input-photo-date"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Story / Caption</label>
            <textarea
              className="form-textarea"
              placeholder="Tell the story behind this famous moment..."
              value={photoForm.caption}
              onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
              rows={3}
              id="input-photo-caption"
            />
          </div>
        </form>
      </Modal>

      {/* 8. Fullscreen Photo Lightbox Modal */}
      {viewingPhoto && (
        <Modal
          isOpen={!!viewingPhoto}
          onClose={() => setViewingPhoto(null)}
          title={viewingPhoto.title || 'Trip Photo'}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <button
                type="button"
                onClick={() => handleLikePhoto(viewingPhoto.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-subtle)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  color: viewingPhoto.likes_count > 0 ? '#ef4444' : 'var(--text-main)'
                }}
                id="btn-like-photo-lightbox"
              >
                <Heart size={16} fill={viewingPhoto.likes_count > 0 ? '#ef4444' : 'none'} color={viewingPhoto.likes_count > 0 ? '#ef4444' : 'currentColor'} />
                <span>{viewingPhoto.likes_count || 0} {viewingPhoto.likes_count === 1 ? 'Like' : 'Likes'}</span>
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(viewingPhoto.id)}
                  className="btn btn-danger btn-sm"
                  id="btn-delete-photo-lightbox"
                >
                  <Trash2 size={15} /> Delete Photo
                </button>
                <button onClick={() => setViewingPhoto(null)} className="btn btn-secondary btn-sm">
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '420px', background: '#0f172a' }}>
              <img
                src={viewingPhoto.photo_url}
                alt={viewingPhoto.title}
                style={{ width: '100%', height: '100%', maxHeight: '420px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {viewingPhoto.location && (
                <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={12} /> {viewingPhoto.location}
                </span>
              )}
              {viewingPhoto.taken_date && (
                <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={12} /> Captured on {formatDate(viewingPhoto.taken_date)}
                </span>
              )}
            </div>

            {viewingPhoto.caption && (
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                {viewingPhoto.caption}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Trip Confirm Modal */}
      {deleteConfirmModal && (
        <Modal
          isOpen={deleteConfirmModal}
          onClose={() => setDeleteConfirmModal(false)}
          title="Delete Entire Trip"
          footer={
            <>
              <button onClick={() => setDeleteConfirmModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDeleteTrip} className="btn btn-danger" id="btn-confirm-delete-full-trip">
                Yes, Delete Trip
              </button>
            </>
          }
        >
          <p style={{ lineHeight: 1.6 }}>
            Are you sure you want to permanently delete <strong>"{trip.title}"</strong>?
          </p>
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            All itinerary days, activities, accommodation records, and logged expenses will be lost.
          </p>
        </Modal>
      )}

    </div>
  );
}
