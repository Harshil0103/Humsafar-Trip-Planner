const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const SEED_DESTINATIONS = [
  {
    name: 'Kyoto Cultural Discovery',
    country: 'Japan',
    city: 'Kyoto',
    region: 'Asia',
    description: 'Immerse in ancient shrines, tranquil Zen gardens, bamboo groves, and timeless tea houses in Japan’s historic cultural capital.',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Fushimi Inari Taisha', 'Kinkaku-ji (Golden Pavilion)', 'Arashiyama Bamboo Grove', 'Kiyomizu-dera', 'Gion District'],
    recommended_activities: ['Traditional Tea Ceremony in Gion', 'Kimono Rental & Photo Walk', 'Morning Meditation at Zen Temple', 'Nishiki Food Market Tasting Tour', 'Sagano Scenic Railway Ride'],
    estimated_daily_cost: 140,
    best_time_to_visit: 'March – May & October – November',
    latitude: 35.0116,
    longitude: 135.7681,
    rating: 4.9
  },
  {
    name: 'Parisian Romance & Art',
    country: 'France',
    city: 'Paris',
    region: 'Europe',
    description: 'The City of Light captivates with world-class museums, iconic monuments, tree-lined boulevards, and exquisite French gastronomy.',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Eiffel Tower', 'Louvre Museum', 'Musée d’Orsay', 'Notre-Dame Cathedral', 'Montmartre & Sacré-Cœur'],
    recommended_activities: ['Seine River Sunset Cruise', 'Pastry & Croissant Masterclass', 'Skip-the-Line Louvre Guided Tour', 'Wine & Cheese Tasting in Le Marais', 'Day Trip to Palace of Versailles'],
    estimated_daily_cost: 190,
    best_time_to_visit: 'April – June & September – November',
    latitude: 48.8566,
    longitude: 2.3522,
    rating: 4.8
  },
  {
    name: 'Eternal Wonders of Rome',
    country: 'Italy',
    city: 'Rome',
    region: 'Europe',
    description: 'Walk through thousands of years of living history, majestic Roman architecture, bustling piazzas, and authentic Italian trattorias.',
    image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Colosseum & Roman Forum', 'Vatican Museums & Sistine Chapel', 'Trevi Fountain', 'Pantheon', 'Piazza Navona'],
    recommended_activities: ['Colosseum Underground Tour', 'Handmade Pasta & Gelato Cooking Class', 'Trastevere Evening Food Safari', 'Vespa Tour around Ancient Monuments', 'Borghese Gallery Masterpieces Tour'],
    estimated_daily_cost: 160,
    best_time_to_visit: 'April – May & September – October',
    latitude: 41.9028,
    longitude: 12.4964,
    rating: 4.9
  },
  {
    name: 'Bali Tropical Haven',
    country: 'Indonesia',
    city: 'Ubud & Seminyak',
    region: 'Asia',
    description: 'A paradise of emerald rice terraces, sacred volcanic temples, holistic wellness retreats, and vibrant beach sunsets.',
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Tegallalang Rice Terraces', 'Sacred Monkey Forest', 'Uluwatu Temple', 'Mount Batur Volcano', 'Nusa Penida Island'],
    recommended_activities: ['Sunrise Trekking at Mount Batur', 'Traditional Balinese Spa & Yoga Sanctuary', 'Snorkeling with Manta Rays at Nusa Penida', 'Waterfall Hopping in North Bali', 'Sunset Seafood Dinner in Jimbaran Bay'],
    estimated_daily_cost: 75,
    best_time_to_visit: 'April – October',
    latitude: -8.4095,
    longitude: 115.1889,
    rating: 4.8
  },
  {
    name: 'Swiss Alpine Majesty',
    country: 'Switzerland',
    city: 'Interlaken & Zermatt',
    region: 'Europe',
    description: 'Snow-capped peaks, crystal clear alpine lakes, scenic train rides, and exhilarating mountain outdoor adventures.',
    image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Matterhorn', 'Jungfraujoch Top of Europe', 'Lake Geneva', 'Gornergrat Railway', 'Lauterbrunnen Valley'],
    recommended_activities: ['Glacier Express Scenic Train Ride', 'Paragliding over Interlaken', 'Swiss Fondue & Chocolate Tasting Tour', 'Hiking the Eiger Trail', 'Cable Car to Matterhorn Glacier Paradise'],
    estimated_daily_cost: 230,
    best_time_to_visit: 'June – August (Hiking) or December – March (Skiing)',
    latitude: 46.6863,
    longitude: 7.8632,
    rating: 4.9
  },
  {
    name: 'New York City Lights',
    country: 'United States',
    city: 'New York',
    region: 'North America',
    description: 'The energetic global metropolis of soaring skyscrapers, iconic Broadway theater, vibrant diverse neighborhoods, and world-class dining.',
    image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Central Park', 'Times Square', 'Empire State Building', 'Statue of Liberty', 'The High Line & Hudson Yards'],
    recommended_activities: ['Broadway Musical Evening Show', 'Helicopter Flight over Manhattan', 'Brooklyn Bridge Walking & Pizza Tour', 'The MET & MoMA Art Galleries', 'Top of the Rock Sunset Observation'],
    estimated_daily_cost: 220,
    best_time_to_visit: 'September – November & April – June',
    latitude: 40.7128,
    longitude: -74.0060,
    rating: 4.7
  },
  {
    name: 'Barcelona Coastal Artistry',
    country: 'Spain',
    city: 'Barcelona',
    region: 'Europe',
    description: 'Gothic quarters, Mediterranean beaches, Gaudí’s surreal architectural masterpieces, and lively tapas bars.',
    image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Basílica de la Sagrada Família', 'Park Güell', 'Casa Batlló', 'Gothic Quarter (Barri Gòtic)', 'La Barceloneta Beach'],
    recommended_activities: ['Gaudí Architectural Masterpieces Tour', 'Tapas & Sangria Evening Walk in El Born', 'Sunset Sailing Cruise along the Coast', 'Flamenco Show in Old Town', 'Mercat de la Boqueria Food Discovery'],
    estimated_daily_cost: 135,
    best_time_to_visit: 'May – June & September – October',
    latitude: 41.3851,
    longitude: 2.1734,
    rating: 4.8
  },
  {
    name: 'Cape Town Oceans & Peaks',
    country: 'South Africa',
    city: 'Cape Town',
    region: 'Africa',
    description: 'Where dramatic mountains meet two oceans, world-class Cape Winelands, penguin colonies, and vibrant cultural heritage.',
    image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Table Mountain Aerial Cableway', 'Cape of Good Hope', 'Boulders Beach Penguin Colony', 'Kirstenbosch Botanical Gardens', 'V&A Waterfront'],
    recommended_activities: ['Cable Car to Table Mountain Summit', 'Wine Tasting in Stellenbosch & Franschhoek', 'Boulders Beach Penguin Walk', 'Scenic Drive along Chapman’s Peak', 'Sunset Catamaran Cruise from V&A Waterfront'],
    estimated_daily_cost: 95,
    best_time_to_visit: 'November – March',
    latitude: -33.9249,
    longitude: 18.4241,
    rating: 4.9
  },
  {
    name: 'Santorini Sunset Odyssey',
    country: 'Greece',
    city: 'Santorini',
    region: 'Europe',
    description: 'Whitewashed cliffside villages, brilliant blue-domed churches, volcanic black sand beaches, and world-famous Aegean sunsets.',
    image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Oia Village Sunset Point', 'Fira to Oia Caldera Trail', 'Red Beach', 'Ancient Akrotiri', 'Santo Wines Winery'],
    recommended_activities: ['Caldera Catamaran Cruise with Hot Springs', 'Volcanic Wine Tasting Tour', 'Cliffside Photography Session in Oia', 'Traditional Greek Cooking Class', 'Sea Kayaking along South Coast'],
    estimated_daily_cost: 210,
    best_time_to_visit: 'May – October',
    latitude: 36.3932,
    longitude: 25.4615,
    rating: 4.9
  },
  {
    name: 'Sydney Harbour & Beaches',
    country: 'Australia',
    city: 'Sydney',
    region: 'Oceania',
    description: 'Glittering natural harbours, legendary golden surf beaches, the iconic Opera House, and lush coastal national parks.',
    image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Sydney Opera House', 'Sydney Harbour Bridge', 'Bondi Beach & Coastal Walk', 'Taronga Zoo', 'Manly Ferry & Beach'],
    recommended_activities: ['Sydney Harbour BridgeClimb', 'Opera House Architectural Tour', 'Bondi to Coogee Coastal Hike', 'Surfing Lesson at Manly Beach', 'Blue Mountains Day Trip & Scenic World'],
    estimated_daily_cost: 175,
    best_time_to_visit: 'September – November & March – May',
    latitude: -33.8688,
    longitude: 151.2093,
    rating: 4.8
  },
  {
    name: 'Cairo & Pyramids Legacy',
    country: 'Egypt',
    city: 'Cairo & Giza',
    region: 'Africa',
    description: 'Stand in awe before the Great Pyramids of Giza, the enigmatic Sphinx, timeless Nile river cruises, and treasure-filled museums.',
    image_url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Great Pyramids of Giza & Sphinx', 'Grand Egyptian Museum', 'Khan el-Khalili Bazaar', 'Saladin Citadel & Mosque', 'Nile River Felucca'],
    recommended_activities: ['Private Egyptologist Pyramid Tour', 'Sunset Camel Ride around Giza Plateau', 'Traditional Felucca Sailing on the Nile', 'Khan el-Khalili Market Treasure Hunt', 'Coptic & Islamic Cairo Walking Tour'],
    estimated_daily_cost: 70,
    best_time_to_visit: 'October – April',
    latitude: 30.0444,
    longitude: 31.2357,
    rating: 4.7
  },
  {
    name: 'Reykjavik & Aurora Borealis',
    country: 'Iceland',
    city: 'Reykjavik',
    region: 'Europe',
    description: 'The land of fire and ice featuring dancing Northern Lights, geothermal lagoons, roaring waterfalls, and black volcanic beaches.',
    image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Blue Lagoon Geothermal Spa', 'Golden Circle (Thingvellir, Geysir, Gullfoss)', 'Reynisfjara Black Sand Beach', 'Hallgrímskirkja Church', 'Jökulsárlón Glacier Lagoon'],
    recommended_activities: ['Northern Lights Aurora Hunt', 'Glacier Hiking & Ice Cave Exploration', 'Soaking in the Blue Lagoon Thermal Waters', 'Golden Circle Super Jeep Tour', 'Whale Watching in Faxaflói Bay'],
    estimated_daily_cost: 215,
    best_time_to_visit: 'September – March (Auroras) or June – August (Midnight Sun)',
    latitude: 64.1466,
    longitude: -21.9426,
    rating: 4.9
  },
  {
    name: 'Bangkok Street Food & Temples',
    country: 'Thailand',
    city: 'Bangkok',
    region: 'Asia',
    description: 'Gilded Buddhist temples, aromatic sizzling night markets, bustling canals, and world-renowned Thai hospitality.',
    image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['The Grand Palace', 'Wat Pho (Reclining Buddha)', 'Wat Arun (Temple of Dawn)', 'Chatuchak Weekend Market', 'Chao Phraya River'],
    recommended_activities: ['Midnight Tuk-Tuk Street Food Safari', 'Chao Phraya River Longtail Boat Tour', 'Authentic Thai Cooking Class', 'Rooftop Sky Bar Cocktail with Skyline View', 'Day Trip to Ayutthaya Ancient Ruins'],
    estimated_daily_cost: 65,
    best_time_to_visit: 'November – February',
    latitude: 13.7563,
    longitude: 100.5018,
    rating: 4.8
  },
  {
    name: 'Machu Picchu Inca Trail',
    country: 'Peru',
    city: 'Cusco & Sacred Valley',
    region: 'Americas',
    description: 'The mystical Incan citadel perched high in the Andes mountains surrounded by cloud forests and ancient terraces.',
    image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80',
    popular_attractions: ['Machu Picchu Sanctuary', 'Sacred Valley of the Incas', 'Cusco Plaza de Armas', 'Ollantaytambo Fortress', 'Rainbow Mountain (Vinicunca)'],
    recommended_activities: ['Classic Inca Trail Trek to Sun Gate', 'Scenic Vistadome Train to Aguas Calientes', 'Cusco Andean Culinary & Chocolate Tour', 'Rainbow Mountain Day Expedition', 'Salt Mines of Maras Tour'],
    estimated_daily_cost: 90,
    best_time_to_visit: 'May – September',
    latitude: -13.1631,
    longitude: -72.5450,
    rating: 4.9
  }
];

async function seedDatabase() {
  console.log('--- Starting Database Seeding ---');
  const db = await getDb();

  // Clean old data
  console.log('Cleaning existing database tables...');
  await db.exec(`
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

  // 1. Create Users (Admin and Demo User)
  console.log('Seeding users...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', salt);
  const travelerPasswordHash = await bcrypt.hash('TravelPass123!', salt);

  const adminResult = await db.run(
    `INSERT INTO users (name, email, password_hash, role, avatar_url, bio)
     VALUES (?, ?, ?, 'admin', ?, ?)`,
    [
      'Alex Vance (Administrator)',
      'admin@tripplanner.com',
      adminPasswordHash,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      'System Administrator & Master Travel Planner.'
    ]
  );
  const adminId = adminResult.lastID;

  const travelerResult = await db.run(
    `INSERT INTO users (name, email, password_hash, role, avatar_url, bio)
     VALUES (?, ?, ?, 'user', ?, ?)`,
    [
      'Sarah Jenkins',
      'traveler@tripplanner.com',
      travelerPasswordHash,
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      'Digital nomad, photographer, and world wanderer. Always searching for hidden gems and local cuisines!'
    ]
  );
  const travelerId = travelerResult.lastID;

  // 2. Seed Destinations
  console.log('Seeding destinations...');
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

  // 3. Seed Realistic Trips for Sarah (Demo User)
  console.log('Seeding trips and itineraries...');

  // Trip 1: Kyoto Japan (Active trip)
  const kyotoTripRes = await db.run(
    `INSERT INTO trips (
      user_id, destination_id, title, destination_name, start_date, end_date,
      description, travelers_count, estimated_budget, cover_image, status, is_public
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1)`,
    [
      travelerId,
      destinationMap['Kyoto'],
      'Autumn Temples & Culinary Journey in Kyoto',
      'Kyoto, Japan',
      '2026-10-15',
      '2026-10-20',
      'A 6-day immersive exploration of Kyoto’s historic shrines, Zen gardens, tea masters, and Kaiseki dining in peak autumn foliage.',
      2,
      2800,
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'
    ]
  );
  const kyotoTripId = kyotoTripRes.lastID;

  // Days & Itinerary items for Kyoto
  const kyotoDays = [
    {
      day_number: 1,
      date: '2026-10-15',
      title: 'Arrival & Gion Lanterns',
      notes: 'Check-in, evening stroll through traditional tea houses.',
      items: [
        { title: 'Check in at Hoshinoya Kyoto', category: 'Relaxation', start_time: '14:00', end_time: '15:00', location: 'Arashiyama, Kyoto', cost: 0, notes: 'River boat arrival' },
        { title: 'Nishiki Market Street Food Walk', category: 'Food', start_time: '16:00', end_time: '18:00', location: 'Nakagyo Ward, Kyoto', cost: 45, notes: 'Try octopus skewers & matcha mochi' },
        { title: 'Gion Evening Geisha District Walk', category: 'Culture', start_time: '19:00', end_time: '21:00', location: 'Gion, Higashiyama', cost: 0, notes: 'Photograph traditional wooden machiya houses' }
      ]
    },
    {
      day_number: 2,
      date: '2026-10-16',
      title: 'Iconic Shrines & Golden Pavilion',
      notes: 'Early wake-up to beat the crowds at Fushimi Inari.',
      items: [
        { title: 'Fushimi Inari Torii Gate Hike', category: 'Sightseeing', start_time: '07:30', end_time: '10:30', location: 'Fushimi Ward, Kyoto', cost: 0, notes: 'Hike to the Yotsutsuji intersection viewpoint' },
        { title: 'Kinkaku-ji (Golden Pavilion)', category: 'Sightseeing', start_time: '12:00', end_time: '13:30', location: 'Kita Ward, Kyoto', cost: 10, notes: 'Marvel at gold leaf reflection in the mirror pond' },
        { title: 'Traditional Tea Ceremony Experience', category: 'Culture', start_time: '15:00', end_time: '16:30', location: 'En Tea House, Gion', cost: 55, notes: 'Learn Cha-no-yu etiquette with a tea master' },
        { title: 'Kaiseki Dinner at Gion Karyo', category: 'Food', start_time: '19:30', end_time: '21:30', location: 'Gion, Kyoto', cost: 180, notes: 'Seasonal multi-course autumn menu' }
      ]
    },
    {
      day_number: 3,
      date: '2026-10-17',
      title: 'Arashiyama Bamboo & River Boat',
      notes: 'Explore the western mountains and Zen heritage.',
      items: [
        { title: 'Arashiyama Bamboo Grove & Tenryu-ji', category: 'Nature', start_time: '08:30', end_time: '11:00', location: 'Arashiyama, Kyoto', cost: 15, notes: 'Walk through towering emerald stalks' },
        { title: 'Iwatayama Monkey Park Hike', category: 'Adventure', start_time: '11:30', end_time: '13:00', location: 'Arashiyama', cost: 12, notes: 'Panoramic views over Kyoto valley' },
        { title: 'Sagano Romantic Scenic Train', category: 'Entertainment', start_time: '14:30', end_time: '16:00', location: 'Torokko Saga Station', cost: 25, notes: 'Autumn foliage along Hozugawa gorge' }
      ]
    }
  ];

  for (const day of kyotoDays) {
    const dayRes = await db.run(
      `INSERT INTO itinerary_days (trip_id, day_number, date, title, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [kyotoTripId, day.day_number, day.date, day.title, day.notes]
    );
    const dayId = dayRes.lastID;

    let idx = 0;
    for (const item of day.items) {
      await db.run(
        `INSERT INTO itinerary_items (
          day_id, trip_id, title, category, start_time, end_time,
          location, estimated_cost, notes, order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dayId, kyotoTripId, item.title, item.category, item.start_time, item.end_time, item.location, item.cost, item.notes, idx++]
      );
    }
  }

  // Activities for Kyoto Trip
  await db.run(
    `INSERT INTO activities (trip_id, name, category, location, date, start_time, end_time, cost, booking_ref, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kyotoTripId, 'Private Tea Master Ceremony', 'Culture', 'Gion Historic District', '2026-10-16', '15:00', '16:30', 55, 'TEA-KYO-8821', 'Confirmed reservation with Master Tanaka', 'booked']
  );
  await db.run(
    `INSERT INTO activities (trip_id, name, category, location, date, start_time, end_time, cost, booking_ref, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kyotoTripId, 'Sagano Scenic River Train', 'Entertainment', 'Torokko Station', '2026-10-17', '14:30', '16:00', 25, 'TRAIN-SAG-441', 'Car 5 open air view', 'booked']
  );
  await db.run(
    `INSERT INTO activities (trip_id, name, category, location, date, start_time, end_time, cost, booking_ref, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kyotoTripId, 'Kimono Silk Dyeing Workshop', 'Culture', 'Yuzen Studio Kyoto', '2026-10-18', '10:00', '12:00', 65, '', 'Hands-on traditional stencil craft', 'planned']
  );

  // Accommodations for Kyoto Trip
  await db.run(
    `INSERT INTO accommodations (trip_id, name, type, location, check_in, check_out, nights, price_per_night, total_cost, booking_ref, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kyotoTripId, 'Hoshinoya Kyoto Luxury Ryokan', 'Resort', 'Arashiyama, Kyoto', '2026-10-15', '2026-10-20', 5, 220, 1100, 'HOSHI-8891-JP', 'Includes daily gourmet Japanese breakfast and boat transfer']
  );

  // Transportation for Kyoto Trip
  await db.run(
    `INSERT INTO transportations (trip_id, type, provider, origin, destination, departure_time, arrival_time, cost, booking_ref, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kyotoTripId, 'Flight', 'Japan Airlines', 'SFO (San Francisco)', 'KIX (Kansai Osaka)', '2026-10-14 11:30', '2026-10-15 15:20', 780, 'JAL-9921-X', 'Flight JL001 Terminal 2']
  );
  await db.run(
    `INSERT INTO transportations (trip_id, type, provider, origin, destination, departure_time, arrival_time, cost, booking_ref, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kyotoTripId, 'Train', 'JR Haruka Express', 'KIX Airport', 'Kyoto Station', '2026-10-15 16:30', '2026-10-15 17:45', 30, 'JR-PASS-554', 'Reserved Green Car seating']
  );

  // Expenses for Kyoto Trip
  const kyotoExpenses = [
    { category: 'Transportation', title: 'Roundtrip Flights (SFO - KIX)', amount: 780, date: '2026-09-01', payment_method: 'Credit Card', notes: 'Booked via airline website' },
    { category: 'Accommodation', title: 'Hoshinoya Ryokan 50% Deposit', amount: 550, date: '2026-09-10', payment_method: 'Credit Card', notes: 'Advance booking confirmation' },
    { category: 'Activities', title: 'Tea Ceremony & Train Tickets', amount: 80, date: '2026-09-20', payment_method: 'Credit Card', notes: 'Pre-paid activity vouchers' },
    { category: 'Food', title: 'Welcome Wagyu & Sake Dinner', amount: 120, date: '2026-10-15', payment_method: 'Cash', notes: 'Dinner in Pontocho Alley' },
    { category: 'Shopping', title: 'Handcrafted Ceramic Matcha Bowl', amount: 65, date: '2026-10-16', payment_method: 'Credit Card', notes: 'Kiyomizu pottery shop' }
  ];

  for (const exp of kyotoExpenses) {
    await db.run(
      `INSERT INTO expenses (trip_id, category, title, amount, date, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [kyotoTripId, exp.category, exp.title, exp.amount, exp.date, exp.payment_method, exp.notes]
    );
  }

  // Packing list items for Kyoto
  const kyotoPacking = [
    { name: 'Passport & Rail Pass vouchers', category: 'Documents', packed: 1 },
    { name: 'Comfortable walking shoes for shrines', category: 'Clothing', packed: 1 },
    { name: 'Universal power plug adapter', category: 'Electronics', packed: 1 },
    { name: 'Light autumn jacket / layer', category: 'Clothing', packed: 0 },
    { name: 'Pocket Wi-Fi / eSIM activated', category: 'Electronics', packed: 0 }
  ];

  for (const p of kyotoPacking) {
    await db.run(
      `INSERT INTO packing_items (trip_id, item_name, category, is_packed)
       VALUES (?, ?, ?, ?)`,
      [kyotoTripId, p.name, p.category, p.packed]
    );
  }

  // Trip 2: Rome Ancient History (Planning trip)
  const romeTripRes = await db.run(
    `INSERT INTO trips (
      user_id, destination_id, title, destination_name, start_date, end_date,
      description, travelers_count, estimated_budget, cover_image, status, is_public
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning', 1)`,
    [
      travelerId,
      destinationMap['Rome'],
      'Grand Architecture & Gastronomy of Rome',
      'Rome, Italy',
      '2026-11-05',
      '2026-11-10',
      'Exploring the Colosseum, Vatican masterpieces, hidden piazzas, and savoring the best cacio e pepe and carbonara in Rome.',
      2,
      2400,
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80'
    ]
  );
  const romeTripId = romeTripRes.lastID;

  // Rome Days
  const romeDays = [
    {
      day_number: 1,
      date: '2026-11-05',
      title: 'Welcome to Ancient Rome',
      notes: 'Colosseum and Roman Forum exploration.',
      items: [
        { title: 'Check in at Hotel Raphael Relais', category: 'Relaxation', start_time: '13:00', end_time: '14:00', location: 'Piazza Navona, Rome', cost: 0, notes: 'Near Piazza Navona' },
        { title: 'Colosseum & Roman Forum VIP Tour', category: 'Sightseeing', start_time: '15:00', end_time: '18:00', location: 'Piazza del Colosseo', cost: 75, notes: 'Gladiator arena floor access' },
        { title: 'Dinner at Da Enzo al 29', category: 'Food', start_time: '20:00', end_time: '22:00', location: 'Trastevere, Rome', cost: 60, notes: 'Authentic Roman carbonara' }
      ]
    },
    {
      day_number: 2,
      date: '2026-11-06',
      title: 'Vatican Art Treasures',
      notes: 'Early entrance to Sistine Chapel.',
      items: [
        { title: 'Vatican Museums & Sistine Chapel Tour', category: 'Culture', start_time: '08:00', end_time: '12:00', location: 'Vatican City', cost: 85, notes: 'Skip the line early access' },
        { title: 'Lunch at Bonci Pizzarium', category: 'Food', start_time: '12:30', end_time: '13:30', location: 'Prati, Rome', cost: 25, notes: 'Crispy Roman pizza al taglio' },
        { title: 'Sunset at Trevi Fountain & Pantheon', category: 'Sightseeing', start_time: '17:00', end_time: '19:00', location: 'Piazza di Trevi', cost: 0, notes: 'Toss coin into Trevi Fountain' }
      ]
    }
  ];

  for (const day of romeDays) {
    const dayRes = await db.run(
      `INSERT INTO itinerary_days (trip_id, day_number, date, title, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [romeTripId, day.day_number, day.date, day.title, day.notes]
    );
    const dayId = dayRes.lastID;

    let idx = 0;
    for (const item of day.items) {
      await db.run(
        `INSERT INTO itinerary_items (
          day_id, trip_id, title, category, start_time, end_time,
          location, estimated_cost, notes, order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dayId, romeTripId, item.title, item.category, item.start_time, item.end_time, item.location, item.cost, item.notes, idx++]
      );
    }
  }

  // Rome Accommodation & Transport
  await db.run(
    `INSERT INTO accommodations (trip_id, name, type, location, check_in, check_out, nights, price_per_night, total_cost, booking_ref, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [romeTripId, 'Hotel Raphael Relais & Châteaux', 'Hotel', 'Largo Febo, Rome', '2026-11-05', '2026-11-10', 5, 180, 900, 'RAPH-ROM-772', 'Rooftop terrace with panoramic view']
  );

  await db.run(
    `INSERT INTO transportations (trip_id, type, provider, origin, destination, departure_time, arrival_time, cost, booking_ref, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [romeTripId, 'Flight', 'ITA Airways', 'JFK New York', 'FCO Rome Fiumicino', '2026-11-04 18:00', '2026-11-05 08:30', 650, 'AZ-610-CONF', 'Direct flight']
  );

  await db.run(
    `INSERT INTO expenses (trip_id, category, title, amount, date, payment_method, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [romeTripId, 'Transportation', 'Flight Tickets Deposit', 650, '2026-09-15', 'Credit Card', 'ITA Airways booking']
  );
  await db.run(
    `INSERT INTO expenses (trip_id, category, title, amount, date, payment_method, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [romeTripId, 'Activities', 'Vatican & Colosseum VIP Passes', 160, '2026-09-22', 'Credit Card', 'Authorized agency passes']
  );

  // Trip 3: Bali Tropical Paradise (Completed trip)
  const baliTripRes = await db.run(
    `INSERT INTO trips (
      user_id, destination_id, title, destination_name, start_date, end_date,
      description, travelers_count, estimated_budget, cover_image, status, is_public
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 1)`,
    [
      travelerId,
      destinationMap['Ubud & Seminyak'],
      'Bali Sacred Temples & Island Serenity',
      'Bali, Indonesia',
      '2026-06-10',
      '2026-06-18',
      'A revitalizing 8-day tropical retreat through Ubud’s sacred jungles and Seminyak’s beach clubs.',
      2,
      1800,
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'
    ]
  );
  const baliTripId = baliTripRes.lastID;

  await db.run(
    `INSERT INTO expenses (trip_id, category, title, amount, date, payment_method, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [baliTripId, 'Accommodation', 'Kamandalu Ubud Resort 8 Nights', 720, '2026-06-10', 'Credit Card', 'Pool villa booking']
  );
  await db.run(
    `INSERT INTO expenses (trip_id, category, title, amount, date, payment_method, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [baliTripId, 'Transportation', 'Flight to Denpasar (DPS)', 540, '2026-05-20', 'Credit Card', 'Qatar Airways']
  );
  await db.run(
    `INSERT INTO expenses (trip_id, category, title, amount, date, payment_method, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [baliTripId, 'Activities', 'Mount Batur Sunrise Trekking & Spa', 120, '2026-06-13', 'Cash', 'Private mountain guide']
  );

  console.log('--- Database Seeding Completed Successfully! ---');
  console.log('Demo Credentials:');
  console.log('  Admin:    admin@tripplanner.com   / AdminPass123!');
  console.log('  Traveler: traveler@tripplanner.com / TravelPass123!');
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
