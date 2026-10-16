/**
 * Sync and populate `users/{userId}/trips/{tripId}` for all Firestore users
 * including Google Sign-in users (e.g., Bhargav Rana / N662oeNUl2dSgiyvKkp3CpgUpGx1)
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

async function syncUserSubcollections() {
  console.log('===========================================================');
  console.log('  Populating `users/{userId}/trips` Subcollections in Firestore');
  console.log('  Firebase Project: humsafar-trip-planner-2026');
  console.log('===========================================================\n');

  const { initializeApp } = await import('firebase/app');
  const { getFirestore, collection, doc, setDoc, getDocs } = await import('firebase/firestore');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const dbPath = path.join(__dirname, 'data', 'tripplanner.db');
  const sqlite = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // 1. Fetch all Firestore Users
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const firestoreUsers = usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Found ${firestoreUsers.length} users in Cloud Firestore:`);
  firestoreUsers.forEach(u => console.log(` - User ID: ${u.id} | Name: ${u.name || 'Traveler'} (${u.email})`));

  // 2. Fetch all trips template data from SQLite
  const rawTrips = await sqlite.all('SELECT * FROM trips');
  const fullTrips = [];

  for (const trip of rawTrips) {
    const days = await sqlite.all('SELECT * FROM itinerary_days WHERE trip_id = ? ORDER BY day_number ASC', [trip.id]);
    for (const day of days) {
      day.items = await sqlite.all('SELECT * FROM itinerary_items WHERE day_id = ? ORDER BY order_index ASC', [day.id]);
    }

    const activities = await sqlite.all('SELECT * FROM activities WHERE trip_id = ? ORDER BY date, start_time', [trip.id]);
    const accommodations = await sqlite.all('SELECT * FROM accommodations WHERE trip_id = ? ORDER BY check_in ASC', [trip.id]);
    const transportations = await sqlite.all('SELECT * FROM transportations WHERE trip_id = ? ORDER BY departure_time ASC', [trip.id]);
    const expenses = await sqlite.all('SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC', [trip.id]);
    const packingItems = await sqlite.all('SELECT * FROM packing_items WHERE trip_id = ?', [trip.id]);

    fullTrips.push({
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
      total_expenses_amount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    });
  }

  // 3. For each Firestore user, ensure their `users/{userId}/trips` collection is populated
  console.log('\nPopulating user trip subcollections...');

  for (const user of firestoreUsers) {
    const userId = String(user.id);
    console.log(`\n📁 Syncing trips for user "${user.name || 'Traveler'}" [${userId}]...`);

    const userTripsToAssign = fullTrips.filter(t => String(t.user_id) === userId);

    const tripsToSave = userTripsToAssign.length > 0
      ? userTripsToAssign
      : fullTrips.slice(0, 3).map((t, idx) => ({
          ...t,
          id: `trip_${userId}_${idx + 1}`,
          user_id: userId,
          user_name: user.name || 'Traveler',
          user_email: user.email || ''
        }));

    for (const tripDoc of tripsToSave) {
      const tripId = String(tripDoc.id);
      const tripPayload = {
        ...tripDoc,
        user_id: userId,
        user_name: user.name || 'Traveler',
        user_email: user.email || '',
        updated_at: new Date().toISOString()
      };

      // 1. Save to `users/{userId}/trips/{tripId}`
      const userTripRef = doc(db, 'users', userId, 'trips', tripId);
      await setDoc(userTripRef, tripPayload, { merge: true });

      // 2. Also save to root `trips/{tripId}`
      const rootTripRef = doc(db, 'trips', tripId);
      await setDoc(rootTripRef, tripPayload, { merge: true });

      console.log(`   ✓ Saved subcollection document: users/${userId}/trips/${tripId} ("${tripPayload.title}")`);
    }

    // Update user profile document with summary metrics
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      trips_count: tripsToSave.length,
      updated_at: new Date().toISOString()
    }, { merge: true });
  }

  await sqlite.close();

  console.log('\n===========================================================');
  console.log('  ✅ ALL User Trip Subcollections Successfully Populated!');
  console.log('===========================================================');
  process.exit(0);
}

syncUserSubcollections().catch((err) => {
  console.error('❌ Error syncing subcollections:', err);
  process.exit(1);
});
