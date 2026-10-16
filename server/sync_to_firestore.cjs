/**
 * Humsafar Trip Planner - Cloud Firestore Live Data Synchronizer
 * 
 * Uses the official Firebase JS SDK to connect to Firestore project
 * `humsafar-trip-planner-2026` and upload all SQLite data (Destinations,
 * Users, Trips, Itineraries, Stays, Transit, Expenses, Checklist).
 */

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const firebaseConfig = {
  apiKey: 'AIzaSyCtpyy5KSJCgTPdqh8ad9oVT-CoTYOWxGs',
  authDomain: 'humsafar-trip-planner-2026.firebaseapp.com',
  projectId: 'humsafar-trip-planner-2026',
  storageBucket: 'humsafar-trip-planner-2026.firebasestorage.app',
  messagingSenderId: '602581372815',
  appId: '1:602581372815:web:4742bae83a3a22283145fa'
};

async function runSync() {
  console.log('=====================================================');
  console.log('   Syncing Humsafar Website Data to Cloud Firestore');
  console.log('   Firebase Project: humsafar-trip-planner-2026');
  console.log('=====================================================\n');

  // Dynamically import Firebase SDK (ESM modules)
  const { initializeApp } = await import('firebase/app');
  const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const dbPath = path.join(__dirname, 'data', 'tripplanner.db');
  const sqlite = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // 1. Sync Users
  console.log('1. 👥 Uploading Users to collection: "users"...');
  const users = await sqlite.all('SELECT id, name, email, role, avatar_url, bio, created_at FROM users');
  for (const user of users) {
    const userRef = doc(db, 'users', String(user.id));
    await setDoc(userRef, {
      ...user,
      synced_at: new Date().toISOString()
    }, { merge: true });
    console.log(`   ✓ User [${user.id}]: ${user.name} (${user.email})`);
  }

  // 2. Sync Curated Destinations
  console.log('\n2. 🏛️ Uploading Destinations to collection: "destinations"...');
  const destinations = await sqlite.all('SELECT * FROM destinations');
  for (const dest of destinations) {
    let popularAttractions = [];
    let recommendedActivities = [];
    try { popularAttractions = JSON.parse(dest.popular_attractions || '[]'); } catch(e) {}
    try { recommendedActivities = JSON.parse(dest.recommended_activities || '[]'); } catch(e) {}

    const destRef = doc(db, 'destinations', String(dest.id));
    await setDoc(destRef, {
      ...dest,
      popular_attractions: popularAttractions,
      recommended_activities: recommendedActivities,
      synced_at: new Date().toISOString()
    }, { merge: true });
    console.log(`   ✓ Destination [${dest.id}]: ${dest.name} (${dest.city}, ${dest.country})`);
  }

  // 3. Sync Trips with Full Nested Entities
  console.log('\n3. ✈️ Uploading Trips to collections: "trips" and "users/{userId}/trips"...');
  const trips = await sqlite.all('SELECT * FROM trips');

  for (const trip of trips) {
    // Fetch child entities
    const days = await sqlite.all('SELECT * FROM itinerary_days WHERE trip_id = ? ORDER BY day_number ASC', [trip.id]);
    for (const day of days) {
      day.items = await sqlite.all('SELECT * FROM itinerary_items WHERE day_id = ? ORDER BY order_index ASC', [day.id]);
    }

    const activities = await sqlite.all('SELECT * FROM activities WHERE trip_id = ? ORDER BY date, start_time', [trip.id]);
    const accommodations = await sqlite.all('SELECT * FROM accommodations WHERE trip_id = ? ORDER BY check_in ASC', [trip.id]);
    const transportations = await sqlite.all('SELECT * FROM transportations WHERE trip_id = ? ORDER BY departure_time ASC', [trip.id]);
    const expenses = await sqlite.all('SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC', [trip.id]);
    const packingItems = await sqlite.all('SELECT * FROM packing_items WHERE trip_id = ?', [trip.id]);

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

    // Save to root "trips" collection
    const globalTripRef = doc(db, 'trips', String(trip.id));
    await setDoc(globalTripRef, fullTripDocument, { merge: true });

    // Save to subcollection "users/{userId}/trips/{tripId}"
    const userTripRef = doc(db, `users/${trip.user_id}/trips`, String(trip.id));
    await setDoc(userTripRef, fullTripDocument, { merge: true });

    console.log(`   ✓ Trip [${trip.id}]: "${trip.title}" (${trip.destination_name})`);
    console.log(`     - ${days.length} Itinerary Days | ${accommodations.length} Stays | ${transportations.length} Transit | ${expenses.length} Expense logs`);
  }

  await sqlite.close();

  console.log('\n=====================================================');
  console.log('   🎉 Firestore Data Synchronization Complete!');
  console.log(`   Total Users Synced:        ${users.length}`);
  console.log(`   Total Destinations Synced: ${destinations.length}`);
  console.log(`   Total Trips Synced:        ${trips.length}`);
  console.log('=====================================================');
  console.log('\n🔗 Direct Google Cloud / Firebase Console Firestore URL:');
  console.log('   https://console.firebase.google.com/project/humsafar-trip-planner-2026/firestore/databases/-default-/data\n');

  process.exit(0);
}

runSync().catch((err) => {
  console.error('❌ Sync Failed:', err);
  process.exit(1);
});
