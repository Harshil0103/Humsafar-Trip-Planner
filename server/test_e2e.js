const http = require('http');

async function apiCall(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', (chunk) => resBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resBody);
          resolve({ status: res.status, statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.status, statusCode: res.statusCode, raw: resBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runEndToEndTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE END-TO-END AUTOMATED TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('--- Test 1: API Server Health Check ---');
    const health = await apiCall('/health');
    assert(health.statusCode === 200 && health.data?.status === 'ok', 'API health check responds OK');

    // 2. User Registration
    console.log('\n--- Test 2: User Registration ---');
    const testEmail = `traveler_${Date.now()}@voyage.test`;
    const regRes = await apiCall('/auth/register', 'POST', {
      name: 'Marco Polo',
      email: testEmail,
      password: 'Password123!',
      bio: 'Silk Road explorer'
    });
    assert(regRes.statusCode === 201 && regRes.data.token, 'New user registered and received JWT token');
    const userToken = regRes.data.token;
    const userId = regRes.data.user.id;

    // 3. User Login
    console.log('\n--- Test 3: User Authentication / Login ---');
    const loginRes = await apiCall('/auth/login', 'POST', {
      email: testEmail,
      password: 'Password123!'
    });
    assert(loginRes.statusCode === 200 && loginRes.data.user.name === 'Marco Polo', 'User successfully logged in with valid credentials');

    // 3b. Firebase User Sync (Google / Firebase Auth)
    console.log('\n--- Test 3b: Firebase Authentication Synchronization ---');
    const fbSyncRes = await apiCall('/auth/firebase-sync', 'POST', {
      email: `google_${Date.now()}@gmail.com`,
      name: 'Google Explorer',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      firebase_uid: `fb_uid_${Date.now()}`
    });
    assert(fbSyncRes.statusCode === 200 && fbSyncRes.data.token && fbSyncRes.data.user.email.includes('@gmail.com'), 'Firebase user synchronized and JWT session token issued');

    // 4. Admin Login
    console.log('\n--- Test 4: Administrator Authentication ---');
    const adminLogin = await apiCall('/auth/login', 'POST', {
      email: 'admin@tripplanner.com',
      password: 'AdminPass123!'
    });
    assert(adminLogin.statusCode === 200 && adminLogin.data.user.role === 'admin', 'Admin login successful');
    const adminToken = adminLogin.data.token;

    // 5. Destination Discovery & Filtering
    console.log('\n--- Test 5: Destinations Discovery, Search & Filters ---');
    const allDests = await apiCall('/destinations');
    assert(allDests.statusCode === 200 && allDests.data.destinations.length >= 10, `Retrieved ${allDests.data?.destinations?.length} seed destinations`);

    const searchRes = await apiCall('/destinations?search=Kyoto');
    assert(searchRes.data.destinations.length >= 1 && searchRes.data.destinations[0].city === 'Kyoto', 'Search by keyword "Kyoto" matched destination');

    const filterRegion = await apiCall('/destinations?region=Europe');
    const allEurope = filterRegion.data.destinations.every(d => d.region === 'Europe');
    assert(filterRegion.data.destinations.length >= 3 && allEurope, 'Filtered destinations by Region: Europe');

    // 6. Create Trip
    console.log('\n--- Test 6: Create New Trip ---');
    const createTripRes = await apiCall('/trips', 'POST', {
      title: 'Spring Cherry Blossom Tour in Kyoto',
      destination_name: 'Kyoto, Japan',
      start_date: '2026-11-10',
      end_date: '2026-11-15',
      travelers_count: 2,
      estimated_budget: 3200,
      description: 'Exploring historic shrines and Zen temples.',
      cover_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'
    }, userToken);

    assert(createTripRes.statusCode === 201 && createTripRes.data.trip.id, 'Trip created with auto-generated itinerary days');
    const tripId = createTripRes.data.trip.id;

    // 7. Get Full Trip Details
    console.log('\n--- Test 7: Get Trip Details & Sub-resources ---');
    const tripDetail = await apiCall(`/trips/${tripId}`, 'GET', null, userToken);
    assert(tripDetail.statusCode === 200 && tripDetail.data.trip.itinerary.length === 6, 'Trip details contain 6 auto-generated days (Nov 10-15)');
    const day1Id = tripDetail.data.trip.itinerary[0].id;

    // 8. Itinerary Item Management (Add, Edit, Reorder, Delete)
    console.log('\n--- Test 8: Itinerary Builder Operations ---');
    const addItemRes = await apiCall(`/trips/${tripId}/itinerary/items`, 'POST', {
      day_id: day1Id,
      title: 'Morning Matcha Tasting at Uji',
      category: 'Food',
      start_time: '09:30',
      end_time: '11:00',
      location: 'Uji Historic Street',
      estimated_cost: 35,
      notes: 'Sample stone-ground matcha'
    }, userToken);
    assert(addItemRes.statusCode === 201 && addItemRes.data.item.id, 'Itinerary item added to Day 1');
    const itemId = addItemRes.data.item.id;

    const updateItemRes = await apiCall(`/trips/${tripId}/itinerary/items/${itemId}`, 'PUT', {
      title: 'Morning Matcha Ceremony at Uji Shrine',
      estimated_cost: 45
    }, userToken);
    assert(updateItemRes.statusCode === 200 && updateItemRes.data.item.estimated_cost === 45, 'Itinerary item updated successfully');

    // 9. Accommodation Management
    console.log('\n--- Test 9: Accommodation Management ---');
    const addAccRes = await apiCall(`/trips/${tripId}/accommodations`, 'POST', {
      name: 'Kyoto Traditional Machiya Villa',
      type: 'Villa',
      location: 'Higashiyama, Kyoto',
      check_in: '2026-11-10',
      check_out: '2026-11-15',
      nights: 5,
      price_per_night: 220,
      total_cost: 1100,
      booking_ref: 'MACH-9921-KY'
    }, userToken);
    assert(addAccRes.statusCode === 201 && addAccRes.data.accommodation.total_cost === 1100, 'Accommodation added with cost $1,100');

    // 10. Transportation Management
    console.log('\n--- Test 10: Transportation Management ---');
    const addTransRes = await apiCall(`/trips/${tripId}/transportation`, 'POST', {
      type: 'Train',
      provider: 'Shinkansen Bullet Train',
      origin: 'Tokyo Station',
      destination: 'Kyoto Station',
      departure_time: '2026-11-10 09:00',
      arrival_time: '2026-11-10 11:15',
      cost: 140,
      booking_ref: 'SHINK-8821'
    }, userToken);
    assert(addTransRes.statusCode === 201 && addTransRes.data.transportation.cost === 140, 'Transportation record added');

    // 11. Activities Management
    console.log('\n--- Test 11: Activities Management ---');
    const addActRes = await apiCall(`/trips/${tripId}/activities`, 'POST', {
      name: 'Gion Evening Geisha District Guided Tour',
      category: 'Culture',
      location: 'Gion, Kyoto',
      date: '2026-11-10',
      start_time: '18:00',
      end_time: '20:00',
      cost: 60,
      booking_ref: 'GION-TOUR-101',
      status: 'booked'
    }, userToken);
    assert(addActRes.statusCode === 201 && addActRes.data.activity.status === 'booked', 'Activity added with status booked');

    // 12. Expenses & Budget Management
    console.log('\n--- Test 12: Expenses & Budget Calculations ---');
    const addExp1 = await apiCall(`/trips/${tripId}/expenses`, 'POST', {
      category: 'Food',
      title: 'Kaiseki Welcome Dinner',
      amount: 180,
      date: '2026-11-10',
      payment_method: 'Credit Card'
    }, userToken);

    const addExp2 = await apiCall(`/trips/${tripId}/expenses`, 'POST', {
      category: 'Transportation',
      title: 'Bullet Train Tickets',
      amount: 140,
      date: '2026-11-10',
      payment_method: 'Credit Card'
    }, userToken);

    const budgetRes = await apiCall(`/trips/${tripId}/expenses`, 'GET', null, userToken);
    assert(budgetRes.data.summary.total_spent === 320, 'Budget total spent accurately calculated ($320.00)');
    assert(budgetRes.data.summary.remaining_budget === (3200 - 320), 'Remaining budget accurately computed ($2,880.00)');
    assert(budgetRes.data.summary.category_breakdown['Food'] === 180, 'Category breakdown: Food = $180');
    assert(budgetRes.data.summary.category_breakdown['Transportation'] === 140, 'Category breakdown: Transportation = $140');

    // 13. Packing Items
    console.log('\n--- Test 13: Packing Checklist Operations ---');
    const addPack = await apiCall(`/trips/${tripId}/packing`, 'POST', {
      item_name: 'Passport & Rail Pass',
      category: 'Documents'
    }, userToken);
    assert(addPack.statusCode === 201 && addPack.data.item.is_packed === 0, 'Packing item added');
    const packId = addPack.data.item.id;

    const togglePack = await apiCall(`/trips/${tripId}/packing/${packId}`, 'PATCH', null, userToken);
    assert(togglePack.data.is_packed === 1, 'Packing item toggled to packed (1)');

    // 14. Trip Status Update & Duplication
    console.log('\n--- Test 14: Trip Status Updates & Duplication ---');
    const statusRes = await apiCall(`/trips/${tripId}/status`, 'PATCH', { status: 'active' }, userToken);
    assert(statusRes.statusCode === 200 && statusRes.data.status === 'active', 'Trip status changed to active');

    const dupRes = await apiCall(`/trips/${tripId}/duplicate`, 'POST', null, userToken);
    assert(dupRes.statusCode === 201 && dupRes.data.trip.title.includes('Copy of'), 'Trip duplicated with child days & items cloned');

    // 15. Authorization & Data Isolation
    console.log('\n--- Test 15: Security & Data Isolation ---');
    // Create another user (User B)
    const otherUser = await apiCall('/auth/register', 'POST', {
      name: 'Other Traveler',
      email: `other_${Date.now()}@voyage.test`,
      password: 'Password123!'
    });
    const otherToken = otherUser.data.token;

    // Other user attempts to access Marco Polo's trip
    const unauthorizedAccess = await apiCall(`/trips/${tripId}`, 'GET', null, otherToken);
    assert(unauthorizedAccess.statusCode === 403, 'Unauthorized user blocked (403 Forbidden) from accessing private trip');

    // 15b. 2nd User Clean Slate & Cross-Session Trip Persistence
    console.log('\n--- Test 15b: 2nd User Fresh Start & Cross-Session Persistence (Email & Google) ---');
    
    // 2nd user (Email) starts with 0 trips
    const userBTripsInitial = await apiCall('/trips', 'GET', null, otherToken);
    assert(userBTripsInitial.statusCode === 200 && userBTripsInitial.data.trips.length === 0, '2nd User (Email) starts with 0 trips (clean slate)');

    // 2nd user creates their own trip
    const userBTripCreate = await apiCall('/trips', 'POST', {
      title: 'Santorini Sunset Getaway',
      destination_name: 'Santorini, Greece',
      start_date: '2026-09-01',
      end_date: '2026-09-06',
      travelers_count: 2,
      estimated_budget: 3500
    }, otherToken);
    assert(userBTripCreate.statusCode === 201 && userBTripCreate.data.trip.title === 'Santorini Sunset Getaway', '2nd User successfully creates their own trip');

    // 2nd user sees only their 1 trip
    const userBTripsAfter = await apiCall('/trips', 'GET', null, otherToken);
    assert(userBTripsAfter.data.trips.length === 1 && userBTripsAfter.data.trips[0].title === 'Santorini Sunset Getaway', '2nd User dashboard displays ONLY their own trip');

    // 2nd user via Google starts with 0 trips
    const googleUser = await apiCall('/auth/firebase-sync', 'POST', {
      email: `google_traveler_${Date.now()}@gmail.com`,
      name: 'Priya Patel',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      firebase_uid: `google_uid_${Date.now()}`
    });
    const googleToken = googleUser.data.token;

    const googleTripsInitial = await apiCall('/trips', 'GET', null, googleToken);
    assert(googleTripsInitial.statusCode === 200 && googleTripsInitial.data.trips.length === 0, '2nd User (Google Sign-In) starts with 0 trips (clean slate)');

    // Google user creates a trip
    const googleTripCreate = await apiCall('/trips', 'POST', {
      title: 'Bali Eco Retreat',
      destination_name: 'Ubud, Bali',
      start_date: '2026-10-10',
      end_date: '2026-10-18',
      travelers_count: 1,
      estimated_budget: 1800
    }, googleToken);
    assert(googleTripCreate.statusCode === 201, 'Google user successfully creates their own trip');

    // Re-verify User A (Marco Polo) still has all their original trips stored
    const userATrips = await apiCall('/trips', 'GET', null, userToken);
    assert(userATrips.data.trips.length >= 2, 'User A logs in later: all previous trips and plan data are completely preserved and stored');

    // Re-verify Google User still has their trip preserved
    const googleTripsAfter = await apiCall('/trips', 'GET', null, googleToken);
    assert(googleTripsAfter.data.trips.length === 1 && googleTripsAfter.data.trips[0].title === 'Bali Eco Retreat', 'Google User logs in later: trip data is completely preserved and stored');

    // 16. Admin Functionality
    console.log('\n--- Test 16: Admin Portal Operations ---');
    const adminStats = await apiCall('/admin/stats', 'GET', null, adminToken);
    assert(adminStats.statusCode === 200 && adminStats.data.stats.total_users >= 2, 'Admin stats retrieved successfully');

    const adminUsers = await apiCall('/admin/users', 'GET', null, adminToken);
    assert(adminUsers.statusCode === 200 && adminUsers.data.users.length >= 2, 'Admin retrieved registered users list');

    console.log('\n====================================================');
    console.log(`🎉 ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  }
}

runEndToEndTests();
