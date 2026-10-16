const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

let dbInstance = null;

async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'tripplanner.db');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await dbInstance.run('PRAGMA foreign_keys = ON');

  // Initialize schema
  await initSchema(dbInstance);

  return dbInstance;
}

async function initSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar_url TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      popular_attractions TEXT, -- JSON array
      recommended_activities TEXT, -- JSON array
      estimated_daily_cost REAL DEFAULT 100,
      best_time_to_visit TEXT,
      latitude REAL,
      longitude REAL,
      rating REAL DEFAULT 4.8,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      destination_id INTEGER,
      title TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      description TEXT,
      travelers_count INTEGER DEFAULT 1,
      estimated_budget REAL DEFAULT 0,
      cover_image TEXT,
      status TEXT DEFAULT 'planning', -- 'planning', 'active', 'completed', 'archived'
      is_public INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS itinerary_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      day_number INTEGER NOT NULL,
      date DATE NOT NULL,
      title TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS itinerary_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_id INTEGER NOT NULL,
      trip_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'Sightseeing',
      start_time TEXT,
      end_time TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      estimated_cost REAL DEFAULT 0,
      notes TEXT,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (day_id) REFERENCES itinerary_days(id) ON DELETE CASCADE,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Sightseeing',
      location TEXT,
      latitude REAL,
      longitude REAL,
      date DATE,
      start_time TEXT,
      end_time TEXT,
      cost REAL DEFAULT 0,
      booking_ref TEXT,
      notes TEXT,
      status TEXT DEFAULT 'planned', -- 'planned', 'booked', 'completed'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS accommodations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'Hotel', -- Hotel, Resort, Airbnb, Hostel, Villa, Other
      location TEXT,
      latitude REAL,
      longitude REAL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      nights INTEGER DEFAULT 1,
      price_per_night REAL DEFAULT 0,
      total_cost REAL DEFAULT 0,
      booking_ref TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transportations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- Flight, Train, Bus, Car, Taxi, Rental car, Ferry, Other
      provider TEXT,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      departure_time DATETIME,
      arrival_time DATETIME,
      cost REAL DEFAULT 0,
      booking_ref TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      category TEXT NOT NULL, -- Accommodation, Transportation, Food, Activities, Shopping, Miscellaneous
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATE NOT NULL,
      payment_method TEXT DEFAULT 'Credit Card',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS packing_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      category TEXT DEFAULT 'General',
      item_name TEXT NOT NULL,
      is_packed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    -- Indices for high performance queries
    CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
    CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip ON itinerary_days(trip_id);
    CREATE INDEX IF NOT EXISTS idx_itinerary_items_day ON itinerary_items(day_id);
    CREATE INDEX IF NOT EXISTS idx_activities_trip ON activities(trip_id);
    CREATE INDEX IF NOT EXISTS idx_accommodations_trip ON accommodations(trip_id);
    CREATE INDEX IF NOT EXISTS idx_transportations_trip ON transportations(trip_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
  `);
}

module.exports = { getDb };
