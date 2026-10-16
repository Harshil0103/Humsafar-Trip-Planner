const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function exportData() {
  const dbPath = path.join(__dirname, 'data', 'tripplanner.db');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const users = await db.all('SELECT id, name, email, role, avatar_url, bio, created_at FROM users');
  const destinations = await db.all('SELECT * FROM destinations');
  const trips = await db.all('SELECT * FROM trips');

  for (const trip of trips) {
    const days = await db.all('SELECT * FROM itinerary_days WHERE trip_id = ? ORDER BY day_number ASC', [trip.id]);
    for (const day of days) {
      day.items = await db.all('SELECT * FROM itinerary_items WHERE day_id = ? ORDER BY order_index ASC', [day.id]);
    }
    trip.itinerary_days = days;
    trip.activities = await db.all('SELECT * FROM activities WHERE trip_id = ? ORDER BY date, start_time', [trip.id]);
    trip.accommodations = await db.all('SELECT * FROM accommodations WHERE trip_id = ? ORDER BY check_in ASC', [trip.id]);
    trip.transportations = await db.all('SELECT * FROM transportations WHERE trip_id = ? ORDER BY departure_time ASC', [trip.id]);
    trip.expenses = await db.all('SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC', [trip.id]);
    trip.packing_items = await db.all('SELECT * FROM packing_items WHERE trip_id = ?', [trip.id]);
  }

  const exportObj = {
    metadata: {
      project_id: 'humsafar-trip-planner-2026',
      exported_at: new Date().toISOString(),
      counts: {
        users: users.length,
        destinations: destinations.length,
        trips: trips.length
      }
    },
    users,
    destinations,
    trips
  };

  fs.writeFileSync(path.join(__dirname, 'data', 'firestore_export.json'), JSON.stringify(exportObj, null, 2));
  console.log('Exported data successfully to server/data/firestore_export.json');
  await db.close();
}

exportData();
