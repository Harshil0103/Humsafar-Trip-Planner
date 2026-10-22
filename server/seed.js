const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const SEED_DESTINATIONS = [
  {
    name: 'Jaipur Royal Heritage & Forts',
    country: 'India',
    city: 'Jaipur',
    region: 'North India',
    description: 'The legendary Pink City of Rajasthan, adorned with magnificent royal hill forts, opulent sandstone palaces, vibrant bazaars, and exquisite Rajasthani cuisine.',
    image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Hawa Mahal (Palace of Winds)', 'Amer Fort & Maota Lake', 'City Palace & Museum', 'Jantar Mantar Observatory', 'Nahargarh Fort Sunset Point'],
    recommended_activities: ['Hot Air Balloon Ride over Amber Fort', 'Heritage Walking Tour of Old Pink City', 'Traditional Rajasthani Thali Dining at Chokhi Dhani', 'Shopping Hand-block Textiles at Johari Bazaar', 'Elephant Village Sanctuary Visit'],
    estimated_daily_cost: 3500,
    best_time_to_visit: 'October – March',
    latitude: 26.9124,
    longitude: 75.7873,
    rating: 4.9
  },
  {
    name: 'Kerala Backwaters & Tea Gardens',
    country: 'India',
    city: 'Alleppey & Munnar',
    region: 'South India',
    description: 'God’s Own Country, famed for emerald backwater canals, traditional slow-paced houseboats, misty aromatic tea gardens, and rejuvenating Ayurvedic wellness.',
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Vembanad Lake Backwaters', 'Munnar Tea Plantations', 'Eravikulam National Park (Nilgiri Tahr)', 'Marari Beach', 'Athirappilly Waterfalls'],
    recommended_activities: ['Overnight Luxury Houseboat Cruise', 'Kathakali Traditional Dance Performance', 'Authentic Kerala Ayurvedic Spa Therapy', 'Tea Factory Tasting Tour in Munnar', 'Canoeing through Village Canals'],
    estimated_daily_cost: 4200,
    best_time_to_visit: 'September – March',
    latitude: 9.4981,
    longitude: 76.3388,
    rating: 4.9
  },
  {
    name: 'Varanasi Eternal Ghats & Ganges',
    country: 'India',
    city: 'Varanasi',
    region: 'North India',
    description: 'One of the world’s oldest continuously inhabited spiritual cities, situated on the sacred banks of the Holy River Ganga with soul-stirring evening aartis.',
    image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Dashashwamedh Ghat', 'Kashi Vishwanath Golden Temple', 'Assi Ghat', 'Manikarnika Ghat', 'Sarnath Buddhist Sanctuary'],
    recommended_activities: ['Sunrise Boat Ride on the Holy Ganges', 'Witnessing Grand Evening Ganga Aarti', 'Silk Saree Weaving Studio Exploration', 'Street Food Tasting: Banarasi Kachori & Paan', 'Heritage Morning Yoga by the Ghats'],
    estimated_daily_cost: 2400,
    best_time_to_visit: 'October – March',
    latitude: 25.3176,
    longitude: 82.9739,
    rating: 4.8
  },
  {
    name: 'Goa Golden Shores & Heritage',
    country: 'India',
    city: 'Panaji & South Goa',
    region: 'West India',
    description: 'India’s ultimate sun-kissed coastal haven featuring golden sandy beaches, Portuguese heritage churches, lively beach shacks, water adventures, and vibrant music.',
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Palolem Beach & Butterfly Beach', 'Basilica of Bom Jesus (UNESCO)', 'Dudhsagar Four-Tiered Waterfall', 'Fort Aguada & Lighthouse', 'Fontainhas Latin Quarter'],
    recommended_activities: ['Sunset Catamaran & Dolphin Cruise', 'Scuba Diving at Grande Island', 'Fontainhas Portuguese Heritage Walk', 'Spice Plantation Tour with Goan Lunch', 'Beach Shack Candlelight Dinner'],
    estimated_daily_cost: 3800,
    best_time_to_visit: 'November – March',
    latitude: 15.2993,
    longitude: 74.1240,
    rating: 4.8
  },
  {
    name: 'Agra City of the Taj Mahal',
    country: 'India',
    city: 'Agra',
    region: 'North India',
    description: 'Home to the immortal Taj Mahal—the world’s ultimate monument of eternal love—surrounded by majestic Mughal citadels, gardens, and royal tombs.',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['The Taj Mahal', 'Agra Fort (Red Sandstone Citadel)', 'Fatehpur Sikri Imperial Ruins', 'Mehtab Bagh Moonlight Garden', 'Itmad-ud-Daulah (Baby Taj)'],
    recommended_activities: ['Sunrise Photography Tour at Taj Mahal', 'Sunset Reflection View from Mehtab Bagh', 'Mughlai Culinary & Petha Sweets Safari', 'Excursion to Fatehpur Sikri Ghost City', 'Marble Inlay Craft Workshop'],
    estimated_daily_cost: 3200,
    best_time_to_visit: 'October – March',
    latitude: 27.1767,
    longitude: 78.0081,
    rating: 4.9
  },
  {
    name: 'Leh-Ladakh Land of High Passes',
    country: 'India',
    city: 'Leh',
    region: 'Himalayas',
    description: 'The enchanting high-altitude desert surrounded by soaring snow peaks, sapphire glacial lakes, dramatic mountain passes, and ancient cliffside Buddhist monasteries.',
    image_url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Pangong Tso Blue Lake', 'Nubra Valley & Hunder Sand Dunes', 'Khardung La Pass (17,982 ft)', 'Thiksey & Hemis Monasteries', 'Magnetic Hill & Confluence'],
    recommended_activities: ['Double-Humped Bactrian Camel Ride in Nubra', 'Star-Gazing Camping under Himalayan Skies', 'Rafting on Zanskar River Rapids', 'Riding Motorbike across Khardung La', 'Morning Chants at Thiksey Monastery'],
    estimated_daily_cost: 4800,
    best_time_to_visit: 'May – September',
    latitude: 34.1526,
    longitude: 77.5771,
    rating: 4.9
  },
  {
    name: 'Udaipur Romantic City of Lakes',
    country: 'India',
    city: 'Udaipur',
    region: 'West India',
    description: 'The romantic City of Lakes and Venice of the East, famed for white marble palaces rising from shimmering waters, royal courtyards, and sunset boat rides.',
    image_url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['City Palace Complex', 'Lake Pichola & Jag Mandir', 'Saheliyon-ki-Bari Royal Garden', 'Sajjangarh (Monsoon Palace)', 'Bagore Ki Haveli'],
    recommended_activities: ['Sunset Royal Boat Cruise on Lake Pichola', 'Dharohar Folk Dance Show at Bagore Ki Haveli', 'Heritage Walk through Old Mewar Quarters', 'Rooftop Dining Overlooking Illuminated Palaces', 'Vintage Car Museum Tour'],
    estimated_daily_cost: 4500,
    best_time_to_visit: 'October – March',
    latitude: 24.5854,
    longitude: 73.7125,
    rating: 4.9
  },
  {
    name: 'Manali & Solang Alpine Valleys',
    country: 'India',
    city: 'Manali',
    region: 'Himalayas',
    description: 'Nestled along the Beas River under cedar pine forests and alpine peaks, offering thrilling snow sports, roaring waterfalls, and serene mountain cafes.',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Solang Valley Snow Point', 'Rohtang Pass (13,058 ft)', 'Hadimba Devi Ancient Wooden Temple', 'Jogini Waterfalls', 'Old Manali Apple Orchards'],
    recommended_activities: ['Paragliding over Solang Valley', 'White Water River Rafting on Beas River', 'Trek to Jogini Waterfall & Vashisht Hot Springs', 'Atal Tunnel Drive to Lahaul Valley', 'Cafe Hopping in Old Manali'],
    estimated_daily_cost: 3600,
    best_time_to_visit: 'October – February & March – June',
    latitude: 32.2396,
    longitude: 77.1887,
    rating: 4.8
  },
  {
    name: 'Rishikesh Yoga Capital of the World',
    country: 'India',
    city: 'Rishikesh',
    region: 'North India',
    description: 'Where the emerald Holy Ganga emerges from the Himalayas, blending adrenaline river rafting, spirituality, cliff jumps, and peaceful riverside ashrams.',
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Laxman Jhula & Ram Jhula', 'Triveni Ghat Evening Aarti', 'Beatles Ashram (Chaurasi Kutia)', 'Neer Garh Waterfall', 'Shivpuri River Camps'],
    recommended_activities: ['White Water River Rafting (Grade III & IV)', 'Bungee Jumping from India’s Highest Platform (83m)', 'Sunset Ganga Aarti at Triveni Ghat', 'Sunrise Yoga & Sound Meditation Session', 'Cliff Jumping & Camping by the River'],
    estimated_daily_cost: 2800,
    best_time_to_visit: 'September – November & March – May',
    latitude: 30.0869,
    longitude: 78.2676,
    rating: 4.8
  },
  {
    name: 'Darjeeling Queen of the Hills',
    country: 'India',
    city: 'Darjeeling',
    region: 'East India',
    description: 'Celebrated for world-famous aromatic muscatel tea gardens, breathtaking sunrise panoramas over Mount Kanchenjunga, and the UNESCO Toy Train.',
    image_url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Tiger Hill Kanchenjunga Sunrise', 'Darjeeling Himalayan Railway (UNESCO Toy Train)', 'Batasia Loop & War Memorial', 'Happy Valley Tea Estate', 'Peace Pagoda & Japanese Temple'],
    recommended_activities: ['Dawn Sunrise Viewing over Kanchenjunga', 'Heritage Steam Engine Toy Train Ride to Ghoom', 'Tea Plucking & Tasting Workshop', 'Himalayan Mountaineering Institute Visit', 'Strolling through Mall Road & Glenary’s Bakery'],
    estimated_daily_cost: 3000,
    best_time_to_visit: 'March – May & October – December',
    latitude: 27.0410,
    longitude: 88.2663,
    rating: 4.8
  },
  {
    name: 'Amritsar Golden Temple & Heritage',
    country: 'India',
    city: 'Amritsar',
    region: 'North India',
    description: 'The spiritual heart of Punjab, radiating peaceful divine energy at the golden Harmandir Sahib, electrifying patriotic Wagah Border ceremonies, and legendary food.',
    image_url: 'https://images.unsplash.com/photo-1588096344356-9a572a1532fb?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Harmandir Sahib (The Golden Temple)', 'Wagah Border Flag Lowering Ceremony', 'Jallianwala Bagh Memorial', 'Partition Museum', 'Gobindgarh Fort'],
    recommended_activities: ['Holy Dip & Seva Volunteer Service at Golden Temple', 'Tasting Famous Amritsari Kulcha & Lassi', 'Experiencing Wagah Border Retreat Ceremony', 'Night Illuminations at Sarovar (Sacred Pool)', 'Heritage Street Night Stroll'],
    estimated_daily_cost: 2600,
    best_time_to_visit: 'October – March',
    latitude: 31.6340,
    longitude: 74.8723,
    rating: 4.9
  },
  {
    name: 'Hampi Ancient Vijayanagara Ruins',
    country: 'India',
    city: 'Hampi',
    region: 'South India',
    description: 'An awe-inspiring open-air museum and UNESCO World Heritage wonderland of giant granite boulders, ancient 14th-century empire temples, and Tungabhadra riverbanks.',
    image_url: 'https://images.unsplash.com/photo-1600100397608-f010f444f434?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Virupaksha Temple', 'Vittala Temple & Iconic Stone Chariot', 'Lotus Mahal & Elephant Stables', 'Matanga Hill Viewpoint', 'Tungabhadra River Coracle Boats'],
    recommended_activities: ['Sunrise Hike to Matanga Hill Panoramic Summit', 'Traditional Round Coracle Boat Ride on Tungabhadra', 'Cycling through Ancient Vijayanagara Ruins', 'Sunset Chill at Sanapur Lake', 'Rock Climbing & Bouldering Expedition'],
    estimated_daily_cost: 2500,
    best_time_to_visit: 'October – March',
    latitude: 15.3350,
    longitude: 76.4600,
    rating: 4.9
  },
  {
    name: 'Mumbai City of Dreams',
    country: 'India',
    city: 'Mumbai',
    region: 'West India',
    description: 'The dynamic City of Dreams, where grand Victorian Gothic architecture meets the Arabian Sea coast, Bollywood glamour, and pulsating night energy.',
    image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Gateway of India', 'Marine Drive (Queen’s Necklace)', 'Chhatrapati Shivaji Maharaj Terminus (UNESCO)', 'Elephanta Island Rock Caves', 'Colaba Causeway & Kala Ghoda Art District'],
    recommended_activities: ['Evening Sunset Walk along Marine Drive Promenade', 'Ferry Ride to Ancient Elephanta Caves', 'Street Food Crawl: Pav Bhaji, Vada Pav & Bhelpuri', 'Heritage Colonial Architecture Walk', 'Art Gallery Stroll in Kala Ghoda'],
    estimated_daily_cost: 4200,
    best_time_to_visit: 'October – March',
    latitude: 18.9220,
    longitude: 72.8347,
    rating: 4.8
  },
  {
    name: 'Meghalaya Living Root Bridges & Waterfalls',
    country: 'India',
    city: 'Shillong & Cherrapunji',
    region: 'East India',
    description: 'The mystical Abode of Clouds in Northeast India, boasting UNESCO bio-engineered double-decker living root bridges, turquoise crystalline rivers, and roaring monsoon waterfalls.',
    image_url: 'https://images.unsplash.com/photo-1598463844677-4b95f1e84738?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Double Decker Living Root Bridge (Nongriat)', 'Nohkalikai Falls (India’s tallest plunge)', 'Dawki Umngot Crystal Clear River', 'Mawlynnong (Asia’s Cleanest Village)', 'Mawsmai Limestone Caves'],
    recommended_activities: ['Trek Down 3,000 Steps to Living Root Bridges', 'Transparent Boating on Dawki River', 'Spelunking in Ancient Limestone Mawsmai Caves', 'Ziplining across Cherrapunji Valleys', 'Sampling Khasi Smoked Delicacies in Shillong'],
    estimated_daily_cost: 3600,
    best_time_to_visit: 'October – April',
    latitude: 25.5788,
    longitude: 91.8933,
    rating: 4.9
  }
];

async function seedDatabase() {
  console.log('--- Starting Database Seeding ---');
  const db = await getDb();

  // Clean old data (purge all bot users, foreign destinations, and old records)
  console.log('Cleaning existing database tables and purging bot users...');
  await db.exec(`
    DELETE FROM trip_photos;
    DELETE FROM packing_items;
    DELETE FROM expenses;
    DELETE FROM transportations;
    DELETE FROM accommodations;
    DELETE FROM activities;
    DELETE FROM itinerary_items;
    DELETE FROM itinerary_days;
    DELETE FROM trips;
    DELETE FROM destinations;
    DELETE FROM users;
  `);

  // 1. Create ONLY ONE user: hp835711@gmail.com (No bot users!)
  console.log('Seeding primary user: hp835711@gmail.com...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('AdminPass123!', salt);

  const userResult = await db.run(
    `INSERT INTO users (name, email, password_hash, role, avatar_url, bio)
     VALUES (?, ?, ?, 'admin', ?, ?)`,
    [
      'Harshil Patel',
      'hp835711@gmail.com',
      passwordHash,
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      'Humsafar Explorer & Master Trip Planner. Exploring the rich cultural tapestry and landscapes of Incredible India.'
    ]
  );
  const primaryUserId = userResult.lastID;

  // 2. Seed Famous Indian Destinations
  console.log('Seeding 14 iconic Indian destinations...');
  const destinationMap = {};
  for (const d of SEED_DESTINATIONS) {
    const res = await db.run(
      `INSERT INTO destinations (
        name, country, city, region, description, image_url,
        popular_attractions, recommended_activities, estimated_daily_cost,
        best_time_to_visit, latitude, longitude, rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.name,
        d.country,
        d.city,
        d.region,
        d.description,
        d.image_url,
        JSON.stringify(d.popular_attractions),
        JSON.stringify(d.recommended_activities),
        d.estimated_daily_cost,
        d.best_time_to_visit,
        d.latitude,
        d.longitude,
        d.rating
      ]
    );
    destinationMap[d.city] = res.lastID;
  }

  // 3. Seed Realistic Indian Trips for hp835711@gmail.com
  console.log('Seeding trips and itineraries in Indian Rupees (₹)...');

  // ==========================================
  // TRIP 1: Jaipur, Rajasthan (Active Trip)
  // ==========================================
  const jaipurTripRes = await db.run(
    `INSERT INTO trips (
      user_id, destination_id, title, destination_name, start_date, end_date,
      description, travelers_count, estimated_budget, cover_image, status, is_public
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1)`,
    [
      primaryUserId,
      destinationMap['Jaipur'],
      'Royal Heritage & Forts of Jaipur',
      'Jaipur, Rajasthan',
      '2026-10-25',
      '2026-10-30',
      'A 6-day royal exploration of Amber Fort, Hawa Mahal, bustling gemstone bazaars, and traditional Rajasthani royal feasts.',
      2,
      35000,
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80'
    ]
  );
  const jaipurTripId = jaipurTripRes.lastID;

  // Jaipur Itinerary Days
  const jaipurDays = [
    {
      day_number: 1,
      date: '2026-10-25',
      title: 'Arrival & Pink City Sunset',
      notes: 'Check-in at Haveli, evening stroll through Johari Bazaar.',
      items: [
        { title: 'Check in at Alsisar Haveli Heritage Hotel', category: 'Relaxation', start_time: '13:00', end_time: '14:30', location: 'Sansar Chandra Road, Jaipur', cost: 0, notes: 'Welcome marigold garland and masala chai' },
        { title: 'Hawa Mahal & Johari Bazaar Walk', category: 'Sightseeing', start_time: '15:30', end_time: '18:00', location: 'Badi Choupad, Jaipur', cost: 200, notes: 'Photograph the honeycomb facade and buy block prints' },
        { title: 'Nahargarh Fort Sunset Viewpoint', category: 'Sightseeing', start_time: '18:30', end_time: '20:30', location: 'Nahargarh Hills', cost: 150, notes: 'Panoramic night skyline view of Jaipur city' }
      ]
    },
    {
      day_number: 2,
      date: '2026-10-26',
      title: 'Mighty Forts & Sheesh Mahal',
      notes: 'Early trip to Amber Fort to explore mirror palaces and Maota Lake.',
      items: [
        { title: 'Amer Fort & Sheesh Mahal Tour', category: 'Sightseeing', start_time: '08:30', end_time: '12:00', location: 'Amer, Jaipur', cost: 500, notes: 'Marvel at millions of convex Belgian glass mirrors' },
        { title: 'Jaigarh Fort & Jaivana Cannon', category: 'Sightseeing', start_time: '12:30', end_time: '14:00', location: 'Cheel ka Teela', cost: 200, notes: 'World largest wheeled cannon' },
        { title: 'Grand Rajasthani Thali at Chokhi Dhani', category: 'Food', start_time: '19:00', end_time: '22:00', location: 'Tonk Road', cost: 1800, notes: 'Dal baati churma, folk dance and puppet show' }
      ]
    },
    {
      day_number: 3,
      date: '2026-10-27',
      title: 'City Palace & Astronomical Jantar Mantar',
      notes: 'Royal courtyards, Peacock Gate, and world’s largest stone sundial.',
      items: [
        { title: 'City Palace Private Courtyards Tour', category: 'Culture', start_time: '09:30', end_time: '12:30', location: 'Old City, Jaipur', cost: 700, notes: 'Pritam Niwas Chowk peacock doors' },
        { title: 'Jantar Mantar UNESCO Observatory', category: 'Sightseeing', start_time: '14:00', end_time: '15:30', location: 'Gangori Bazaar', cost: 250, notes: 'Vrihat Samrat Yantra giant sundial' },
        { title: 'Lassiwala Traditional Clay Cup Lassi', category: 'Food', start_time: '16:00', end_time: '17:00', location: 'MI Road', cost: 160, notes: 'Thick malai topped curd lassi' }
      ]
    }
  ];

  for (const day of jaipurDays) {
    const dayRes = await db.run(
      `INSERT INTO itinerary_days (trip_id, day_number, date, title, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [jaipurTripId, day.day_number, day.date, day.title, day.notes]
    );
    const dayId = dayRes.lastID;

    let idx = 0;
    for (const item of day.items) {
      await db.run(
        `INSERT INTO itinerary_items (
          day_id, trip_id, title, category, start_time, end_time,
          location, estimated_cost, notes, order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dayId, jaipurTripId, item.title, item.category, item.start_time, item.end_time, item.location, item.cost, item.notes, idx++]
      );
    }
  }

  // Jaipur Activities
  await db.run(
    `INSERT INTO activities (trip_id, name, category, location, date, start_time, end_time, cost, booking_ref, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [jaipurTripId, 'Hot Air Balloon Ride over Amber Fort', 'Adventure', 'Amer Valley', '2026-10-27', '06:00', '08:00', 9500, 'SKY-JAI-4412', 'SkyWaltz balloon safari confirmed', 'booked']
  );
  await db.run(
    `INSERT INTO activities (trip_id, name, category, location, date, start_time, end_time, cost, booking_ref, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [jaipurTripId, 'Bagru Block Printing Hands-on Workshop', 'Culture', 'Bagru Artisans Village', '2026-10-28', '11:00', '13:30', 1200, 'BAGRU-882', 'Create personalized cotton scarf', 'planned']
  );

  // Jaipur Accommodations
  await db.run(
    `INSERT INTO accommodations (trip_id, name, type, location, check_in, check_out, nights, price_per_night, total_cost, booking_ref, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [jaipurTripId, 'Alsisar Haveli Heritage Mansion', 'Hotel', 'Sansar Chandra Road, Jaipur', '2026-10-25', '2026-10-30', 5, 4200, 21000, 'ALSISAR-JAI-991', 'Heritage suite with courtyard pool and breakfast']
  );

  // Jaipur Transportation
  await db.run(
    `INSERT INTO transportations (trip_id, type, provider, origin, destination, departure_time, arrival_time, cost, booking_ref, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [jaipurTripId, 'Flight', 'IndiGo Airlines', 'BOM (Mumbai T2)', 'JAI (Jaipur T2)', '2026-10-25 09:30', '2026-10-25 11:15', 7200, '6E-481-JAI', 'Roundtrip booked']
  );

  // Jaipur Expenses (in ₹ INR)
  const jaipurExpenses = [
    { category: 'Transportation', title: 'Roundtrip IndiGo Flights (BOM – JAI)', amount: 7200, date: '2026-10-01', payment_method: 'UPI / GPay', notes: 'IndiGo booking ref 6E-481' },
    { category: 'Accommodation', title: 'Alsisar Haveli 50% Advance Booking', amount: 10500, date: '2026-10-05', payment_method: 'Credit Card', notes: 'Heritage suite deposit' },
    { category: 'Activities', title: 'Amber Fort Elephant & Guide Ticket', amount: 1200, date: '2026-10-26', payment_method: 'Cash', notes: 'Government authorized guide' },
    { category: 'Food', title: 'Chokhi Dhani Royal Dinner Buffet', amount: 1800, date: '2026-10-26', payment_method: 'UPI', notes: 'Traditional feast with sweets' }
  ];

  for (const exp of jaipurExpenses) {
    await db.run(
      `INSERT INTO expenses (trip_id, category, title, amount, date, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [jaipurTripId, exp.category, exp.title, exp.amount, exp.date, exp.payment_method, exp.notes]
    );
  }

  // Jaipur Packing list
  const jaipurPacking = [
    { name: 'Aadhaar / ID Card for monument entries', category: 'Documents', packed: 1 },
    { name: 'Breathable cotton kurta and comfortable walking footwear', category: 'Clothing', packed: 1 },
    { name: 'Sun hat & sunglasses for fort courtyards', category: 'Clothing', packed: 1 },
    { name: 'Camera with extra SD card & portable power bank', category: 'Electronics', packed: 1 },
    { name: 'Reusable water bottle & ORS sachets', category: 'General', packed: 0 }
  ];

  for (const p of jaipurPacking) {
    await db.run(
      `INSERT INTO packing_items (trip_id, item_name, category, is_packed)
       VALUES (?, ?, ?, ?)`,
      [jaipurTripId, p.name, p.category, p.packed]
    );
  }

  // ==========================================
  // TRIP 2: Kerala Backwaters (COMPLETED TRIP)
  // Has famous user photos attached!
  // ==========================================
  const keralaTripRes = await db.run(
    `INSERT INTO trips (
      user_id, destination_id, title, destination_name, start_date, end_date,
      description, travelers_count, estimated_budget, cover_image, status, is_public
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 1)`,
    [
      primaryUserId,
      destinationMap['Alleppey & Munnar'],
      'Kerala Serene Backwaters & Tea Gardens',
      'Alleppey & Munnar, Kerala',
      '2026-09-10',
      '2026-09-17',
      'An unforgettable 7-day journey across Alleppey’s emerald canals on a private houseboat and walking through misty tea estates in Munnar.',
      2,
      45000,
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80'
    ]
  );
  const keralaTripId = keralaTripRes.lastID;

  // Kerala Days
  const keralaDays = [
    {
      day_number: 1,
      date: '2026-09-10',
      title: 'Boarding Luxury Houseboat in Alleppey',
      notes: 'Cruising Vembanad Lake, authentic Karimeen fish curry lunch.',
      items: [
        { title: 'Check in at Spice Coast Luxury Kettuvallam', category: 'Relaxation', start_time: '12:00', end_time: '13:00', location: 'Finishing Point, Alleppey', cost: 0, notes: 'Private single bedroom air-conditioned houseboat' },
        { title: 'Backwater Canal Cruise & Village Life', category: 'Nature', start_time: '14:00', end_time: '17:30', location: 'Kuttanad Canals', cost: 0, notes: 'Paddy fields below sea level' },
        { title: 'Sunset Fishing & Coconut Water by the Lagoon', category: 'Relaxation', start_time: '18:00', end_time: '19:30', location: 'Vembanad Lake', cost: 150, notes: 'Fresh tender coconuts' }
      ]
    },
    {
      day_number: 2,
      date: '2026-09-11',
      title: 'Munnar Misty Hills & Tea Museum',
      notes: 'Scenic drive to Western Ghats with stops at Valara and Cheeyappara waterfalls.',
      items: [
        { title: 'Drive to Munnar & Cheeyappara Falls', category: 'Sightseeing', start_time: '09:00', end_time: '12:30', location: 'NH 85, Munnar Road', cost: 0, notes: 'Spectacular seven-tiered cascade' },
        { title: 'KDHP Tea Museum & Factory Experience', category: 'Culture', start_time: '14:30', end_time: '16:30', location: 'Nullatanni, Munnar', cost: 400, notes: 'CTC tea processing and tasting session' }
      ]
    }
  ];

  for (const day of keralaDays) {
    const dayRes = await db.run(
      `INSERT INTO itinerary_days (trip_id, day_number, date, title, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [keralaTripId, day.day_number, day.date, day.title, day.notes]
    );
    const dayId = dayRes.lastID;

    let idx = 0;
    for (const item of day.items) {
      await db.run(
        `INSERT INTO itinerary_items (
          day_id, trip_id, title, category, start_time, end_time,
          location, estimated_cost, notes, order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dayId, keralaTripId, item.title, item.category, item.start_time, item.end_time, item.location, item.cost, item.notes, idx++]
      );
    }
  }

  // Kerala Expenses
  const keralaExpenses = [
    { category: 'Accommodation', title: 'Spice Coast Houseboat (2 Nights)', amount: 16000, date: '2026-09-10', payment_method: 'UPI', notes: 'Full board meals included' },
    { category: 'Accommodation', title: 'Tea County Resort Munnar (3 Nights)', amount: 14500, date: '2026-09-12', payment_method: 'Credit Card', notes: 'Valley view cottage' },
    { category: 'Transportation', title: 'Private Innova Chauffeur Car (7 Days)', amount: 12000, date: '2026-09-10', payment_method: 'Cash', notes: 'Kochi - Alleppey - Munnar - Kochi' },
    { category: 'Activities', title: 'Ayurvedic Abhyanga Spa & Kathakali Show', amount: 3200, date: '2026-09-13', payment_method: 'UPI', notes: 'Authentic herbal oil massage' }
  ];

  for (const exp of keralaExpenses) {
    await db.run(
      `INSERT INTO expenses (trip_id, category, title, amount, date, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [keralaTripId, exp.category, exp.title, exp.amount, exp.date, exp.payment_method, exp.notes]
    );
  }

  // 4. Seed Famous Trip Photos for Completed Kerala Trip!
  console.log('Seeding famous trip photos for completed Kerala trip...');
  const famousPhotos = [
    {
      title: 'Dawn Reflections on Vembanad Lake',
      photo_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      caption: 'Waking up at 5:45 AM on our wooden houseboat with stillness on the water and fishermen casting their morning nets. Pure heaven in God’s Own Country.',
      location: 'Alleppey Backwaters, Kerala',
      taken_date: '2026-09-11',
      likes_count: 42
    },
    {
      title: 'Endless Emerald Slopes of Munnar Tea Plantations',
      photo_url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
      caption: 'The morning mist rolling through the hills at 6,000 feet. The aroma of fresh tea leaves and eucalyptus was in the air as the sun broke through.',
      location: 'Kolukkumalai Tea Estate, Munnar',
      taken_date: '2026-09-13',
      likes_count: 58
    },
    {
      title: 'Dramatic Kathakali Face Art & Expression',
      photo_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
      caption: 'Fascinating 90-minute live makeup transformation of the Chuvanna Thadi character before the epic Mahabharata dance theater.',
      location: 'Kalaripayattu & Kathakali Center, Munnar',
      taken_date: '2026-09-14',
      likes_count: 36
    },
    {
      title: 'Golden Sunset at Marari Palm Coast',
      photo_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      caption: 'Final evening dipping our toes in the warm Arabian Sea waters under swaying coconut palms as the sky turned fiery crimson.',
      location: 'Marari Beach, Alappuzha',
      taken_date: '2026-09-16',
      likes_count: 64
    }
  ];

  for (const fp of famousPhotos) {
    await db.run(
      `INSERT INTO trip_photos (trip_id, user_id, photo_url, title, caption, location, taken_date, likes_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [keralaTripId, primaryUserId, fp.photo_url, fp.title, fp.caption, fp.location, fp.taken_date, fp.likes_count]
    );
  }

  // ==========================================
  // TRIP 3: Varanasi (Planning Trip)
  // ==========================================
  const varanasiTripRes = await db.run(
    `INSERT INTO trips (
      user_id, destination_id, title, destination_name, start_date, end_date,
      description, travelers_count, estimated_budget, cover_image, status, is_public
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning', 1)`,
    [
      primaryUserId,
      destinationMap['Varanasi'],
      'Spiritual Awakening & Holy Ghats of Varanasi',
      'Varanasi, Uttar Pradesh',
      '2026-11-12',
      '2026-11-16',
      'Immersing in ancient spirituality, evening Ganga Aarti, sunrise boat rituals on Dashashwamedh Ghat, and Sarnath relics.',
      2,
      22000,
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80'
    ]
  );
  const varanasiTripId = varanasiTripRes.lastID;

  await db.run(
    `INSERT INTO expenses (trip_id, category, title, amount, date, payment_method, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [varanasiTripId, 'Accommodation', 'BrijRama Palace Heritage Deposit', 6500, '2026-10-18', 'UPI', 'Heritage palace directly on Darbhanga Ghat']
  );
  await db.run(
    `INSERT INTO expenses (trip_id, category, title, amount, date, payment_method, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [varanasiTripId, 'Transportation', 'Vande Bharat Express Train Tickets (Del - Bsb)', 3800, '2026-10-15', 'IRCTC', 'Executive Chair Car 2 seats']
  );

  console.log('--- Database Seeding Completed Successfully! ---');
  console.log('Active User:');
  console.log('  Email:    hp835711@gmail.com');
  console.log('  Password: AdminPass123!');
  console.log('  All Bot Users Deleted.');
  console.log('  14 Indian Famous Destinations Loaded in Indian Rupee (₹).');
  console.log('  Completed Kerala Trip includes famous photos feature demonstration!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
