/**
 * Humsafar Trip Planner - Cloud Firestore Sync Utility
 * 
 * Synchronizes local SQLite database entities (Users, Destinations, Trips,
 * Itineraries, Accommodations, Transportations, Expenses, Checklist)
 * directly to Google Cloud Firestore (humsafar-trip-planner-2026).
 */

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const PROJECT_ID = 'humsafar-trip-planner-2026';
const API_KEY = 'AIzaSyCtpyy5KSJCgTPdqh8ad9oVT-CoTYOWxGs';
const BASE_FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') {
    // Try parsing JSON if it looks like array or object
    if ((val.startsWith('[') && val.endsWith(']')) || (val.startsWith('{') && val.endsWith('}'))) {
      try {
        const parsed = JSON.parse(val);
        return toFirestoreValue(parsed);
      } catch (e) {
        // Fallback as normal string
      }
    }
    return { stringValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return { fields };
}

async function upsertDocument(collectionPath, docId, data) {
  const url = `${BASE_FIRESTORE_URL}/${collectionPath}/${encodeURIComponent(docId)}?key=${API_KEY}`;
  const payload = toFirestoreFields(data);

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore sync failed for ${collectionPath}/${docId}: ${res.status} ${errText}`);
  }

  return await res.json();
}

async function syncAll() {
  console.log('=====================================================');
  console.log('   Syncing Humsafar Website Data to Cloud Firestore');
  console.log(`   Project ID: ${PROJECT_ID}`);
  console.log('=====================================================\n');

  const dbPath = path.join(__dirname, 'data', 'tripplanner.db');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // 1. Sync Users
  console.log('1. Syncing Users to Firestore "users" collection...');
  const users = await db.all('SELECT id, name, email, role, avatar_url, bio, created_at FROM users');
  for (const user of users) {
    await upsertDocument('users', String(user.id), {
      ...user,
      synced_at: new Date().toISOString()
    });
    console.log(`   ✓ User [${user.id}]: ${user.name} (${user.email})`);
  }

  // 2. Sync Curated Destinations
  console.log('\n2. Syncing Destinations to Firestore "destinations" collection...');
  const destinations = await db.all('SELECT * FROM destinations');
  for (const dest of destinations) {
    let popularAttractions = [];
    let recommendedActivities = [];
    try { popularAttractions = JSON.parse(dest.popular_attractions || '[]'); } catch(e) {}
    try { recommendedActivities = JSON.parse(dest.recommended_activities || '[]'); } catch(e) {}

    await upsertDocument('destinations', String(dest.id), {
      ...dest,
      popular_attractions: popularAttractions,
      recommended_activities: recommendedActivities,
      synced_at: new Date().toISOString()
    });
    console.log(`   ✓ Destination [${dest.id}]: ${dest.name} (${dest.city}, ${dest.country})`);
  }

  // 3. Sync Trips with Full Nested Entities
  console.log('\n3. Syncing Trips, Itineraries, Stays, Transit, Budget to Firestore "trips" collection...');
  const trips = await db.all('SELECT * FROM trips');

  for (const trip of trips) {
    // Fetch child entities
    const days = await db.all('SELECT * FROM itinerary_days WHERE trip_id = ? ORDER BY day_number ASC', [trip.id]);
    for (const day of days) {
      day.items = await db.all('SELECT * FROM itinerary_items WHERE day_id = ? ORDER BY order_index ASC', [day.id]);
    }

    const activities = await db.all('SELECT * FROM activities WHERE trip_id = ? ORDER BY date, start_time', [trip.id]);
    const accommodations = await db.all('SELECT * FROM accommodations WHERE trip_id = ? ORDER BY check_in ASC', [trip.id]);
    const transportations = await db.all('SELECT * FROM transportations WHERE trip_id = ? ORDER BY departure_time ASC', [trip.id]);
    const expenses = await db.all('SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC', [trip.id]);
    const packingItems = await db.all('SELECT * FROM packing_items WHERE trip_id = ?', [trip.id]);

    const fullTripDocument = {
      ...trip,
      itinerary_days: days,
      activities,
      accommodations,
      transportations,
      expenses,
      packing_items: packingItems,
      total_planned_activities: activities.length,
      total_accommodations: accommodations.length,
      total_transportations: transportations.length,
      total_expense_records: expenses.length,
      total_expenses_amount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      synced_at: new Date().toISOString()
    };

    // Save to global trips collection
    await upsertDocument('trips', String(trip.id), fullTripDocument);
    // Also save to user's personal trips subcollection
    await upsertDocument(`users/${trip.user_id}/trips`, String(trip.id), fullTripDocument);

    console.log(`   ✓ Trip [${trip.id}]: "${trip.title}" (${trip.destination_name}) - ${days.length} Days, $${trip.estimated_budget} Budget`);
  }

  await db.close();

  console.log('\n=====================================================');
  console.log('   🎉 Firestore Data Synchronization Complete!');
  console.log(`   Total Users:        ${users.length}`);
  console.log(`   Total Destinations: ${destinations.length}`);
  console.log(`   Total Trips:        ${trips.length}`);
  console.log('=====================================================');
  console.log('\n🔗 Direct Firebase Console URL:');
  console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/firestore/databases/-default-/data\n`);
}

syncAll().catch(err => {
  console.error('❌ Sync Error:', err);
  process.exit(1);
});
