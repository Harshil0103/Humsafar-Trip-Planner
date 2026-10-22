const { getDb } = require('../db');

// Helper to calculate days between dates
function getDaysDifference(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Generate default itinerary days for a trip
async function generateDaysForTrip(db, tripId, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysCount = Math.max(1, Math.min(30, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1));

  for (let i = 1; i <= daysCount; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + (i - 1));
    const dateString = dayDate.toISOString().split('T')[0];

    await db.run(
      `INSERT INTO itinerary_days (trip_id, day_number, date, title)
       VALUES (?, ?, ?, ?)`,
      [tripId, i, dateString, `Day ${i} Exploration`]
    );
  }
}

async function getUserTrips(req, res) {
  try {
    const { status, search } = req.query;
    const db = await getDb();

    let query = `
      SELECT t.*,
        (SELECT COUNT(*) FROM activities WHERE trip_id = t.id) as activities_count,
        (SELECT COUNT(*) FROM itinerary_items WHERE trip_id = t.id) as items_count,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE trip_id = t.id) as total_spent
      FROM trips t
      WHERE t.user_id = ?
    `;
    const params = [req.user.id];

    if (status && status !== 'all') {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (t.title LIKE ? OR t.destination_name LIKE ? OR t.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY t.start_date ASC, t.created_at DESC';

    const trips = await db.all(query, params);

    return res.json({ trips });
  } catch (err) {
    console.error('Get user trips error:', err);
    return res.status(500).json({ error: 'Failed to fetch trips.' });
  }
}

async function getTripById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const trip = await db.get('SELECT * FROM trips WHERE id = ?', [id]);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    // Check ownership
    if (trip.user_id !== req.user.id && req.user.role !== 'admin' && !trip.is_public) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to view this trip.' });
    }

    // Fetch related entities
    const days = await db.all(
      'SELECT * FROM itinerary_days WHERE trip_id = ? ORDER BY day_number ASC',
      [id]
    );

    const items = await db.all(
      'SELECT * FROM itinerary_items WHERE trip_id = ? ORDER BY day_id ASC, order_index ASC, start_time ASC',
      [id]
    );

    // Group items into days
    const daysWithItems = days.map(day => ({
      ...day,
      items: items.filter(item => item.day_id === day.id)
    }));

    const activities = await db.all(
      'SELECT * FROM activities WHERE trip_id = ? ORDER BY date ASC, start_time ASC',
      [id]
    );

    const accommodations = await db.all(
      'SELECT * FROM accommodations WHERE trip_id = ? ORDER BY check_in ASC',
      [id]
    );

    const transportations = await db.all(
      'SELECT * FROM transportations WHERE trip_id = ? ORDER BY departure_time ASC',
      [id]
    );

    const expenses = await db.all(
      'SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC, created_at DESC',
      [id]
    );

    const packingItems = await db.all(
      'SELECT * FROM packing_items WHERE trip_id = ? ORDER BY id ASC',
      [id]
    );

    const photos = await db.all(
      'SELECT * FROM trip_photos WHERE trip_id = ? ORDER BY created_at DESC',
      [id]
    );

    // Budget analytics
    const totalSpent = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const estimatedBudget = parseFloat(trip.estimated_budget) || 0;
    const remainingBudget = estimatedBudget - totalSpent;

    const categoryBreakdown = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + (parseFloat(exp.amount) || 0);
      return acc;
    }, {});

    return res.json({
      trip: {
        ...trip,
        itinerary: daysWithItems,
        activities,
        accommodations,
        transportations,
        expenses,
        packing_items: packingItems,
        photos,
        budget_summary: {
          estimated_budget: estimatedBudget,
          total_spent: totalSpent,
          remaining_budget: remainingBudget,
          is_over_budget: totalSpent > estimatedBudget,
          category_breakdown: categoryBreakdown
        }
      }
    });
  } catch (err) {
    console.error('Get trip by ID error:', err);
    return res.status(500).json({ error: 'Failed to fetch trip details.' });
  }
}

async function createTrip(req, res) {
  try {
    const {
      title,
      destination_name,
      destination_id,
      start_date,
      end_date,
      description,
      travelers_count,
      estimated_budget,
      cover_image,
      is_public
    } = req.body;

    if (!title || !destination_name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Title, destination, start date, and end date are required.' });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ error: 'Start date cannot be after end date.' });
    }

    const db = await getDb();

    // Default image if none provided
    const defaultCover = cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

    const result = await db.run(
      `INSERT INTO trips (
        user_id, destination_id, title, destination_name, start_date, end_date,
        description, travelers_count, estimated_budget, cover_image, status, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning', ?)`,
      [
        req.user.id,
        destination_id || null,
        title.trim(),
        destination_name.trim(),
        start_date,
        end_date,
        description || '',
        parseInt(travelers_count, 10) || 1,
        parseFloat(estimated_budget) || 0,
        defaultCover,
        is_public ? 1 : 0
      ]
    );

    const tripId = result.lastID;

    // Automatically create initial itinerary days
    await generateDaysForTrip(db, tripId, start_date, end_date);

    const createdTrip = await db.get('SELECT * FROM trips WHERE id = ?', [tripId]);

    return res.status(201).json({
      message: 'Trip created successfully.',
      trip: createdTrip
    });
  } catch (err) {
    console.error('Create trip error:', err);
    return res.status(500).json({ error: 'Failed to create trip.' });
  }
}

async function updateTrip(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      destination_name,
      destination_id,
      start_date,
      end_date,
      description,
      travelers_count,
      estimated_budget,
      cover_image,
      status,
      is_public
    } = req.body;

    const db = await getDb();
    const trip = await db.get('SELECT * FROM trips WHERE id = ?', [id]);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You do not own this trip.' });
    }

    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ error: 'Start date cannot be after end date.' });
    }

    await db.run(
      `UPDATE trips SET
        title = COALESCE(?, title),
        destination_name = COALESCE(?, destination_name),
        destination_id = COALESCE(?, destination_id),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        description = COALESCE(?, description),
        travelers_count = COALESCE(?, travelers_count),
        estimated_budget = COALESCE(?, estimated_budget),
        cover_image = COALESCE(?, cover_image),
        status = COALESCE(?, status),
        is_public = COALESCE(?, is_public),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        title ? title.trim() : undefined,
        destination_name ? destination_name.trim() : undefined,
        destination_id !== undefined ? destination_id : undefined,
        start_date,
        end_date,
        description !== undefined ? description : undefined,
        travelers_count !== undefined ? parseInt(travelers_count, 10) : undefined,
        estimated_budget !== undefined ? parseFloat(estimated_budget) : undefined,
        cover_image,
        status,
        is_public !== undefined ? (is_public ? 1 : 0) : undefined,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM trips WHERE id = ?', [id]);

    return res.json({
      message: 'Trip updated successfully.',
      trip: updated
    });
  } catch (err) {
    console.error('Update trip error:', err);
    return res.status(500).json({ error: 'Failed to update trip.' });
  }
}

async function updateTripStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['planning', 'active', 'completed', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const db = await getDb();
    const trip = await db.get('SELECT * FROM trips WHERE id = ?', [id]);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await db.run('UPDATE trips SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

    return res.json({ message: `Trip status updated to ${status}.`, status });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ error: 'Failed to update trip status.' });
  }
}

async function deleteTrip(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const trip = await db.get('SELECT * FROM trips WHERE id = ?', [id]);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await db.run('DELETE FROM trips WHERE id = ?', [id]);

    return res.json({ message: 'Trip deleted successfully.' });
  } catch (err) {
    console.error('Delete trip error:', err);
    return res.status(500).json({ error: 'Failed to delete trip.' });
  }
}

async function duplicateTrip(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const original = await db.get('SELECT * FROM trips WHERE id = ?', [id]);
    if (!original) {
      return res.status(404).json({ error: 'Original trip not found.' });
    }

    if (original.user_id !== req.user.id && req.user.role !== 'admin' && !original.is_public) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Insert new trip copy
    const result = await db.run(
      `INSERT INTO trips (
        user_id, destination_id, title, destination_name, start_date, end_date,
        description, travelers_count, estimated_budget, cover_image, status, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning', 0)`,
      [
        req.user.id,
        original.destination_id,
        `Copy of ${original.title}`,
        original.destination_name,
        original.start_date,
        original.end_date,
        original.description,
        original.travelers_count,
        original.estimated_budget,
        original.cover_image
      ]
    );

    const newTripId = result.lastID;

    // Copy itinerary days & items
    const originalDays = await db.all('SELECT * FROM itinerary_days WHERE trip_id = ? ORDER BY day_number ASC', [id]);
    for (const day of originalDays) {
      const dayResult = await db.run(
        `INSERT INTO itinerary_days (trip_id, day_number, date, title, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [newTripId, day.day_number, day.date, day.title, day.notes]
      );
      const newDayId = dayResult.lastID;

      const originalItems = await db.all('SELECT * FROM itinerary_items WHERE day_id = ?', [day.id]);
      for (const item of originalItems) {
        await db.run(
          `INSERT INTO itinerary_items (
            day_id, trip_id, title, category, start_time, end_time,
            location, latitude, longitude, estimated_cost, notes, order_index
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newDayId, newTripId, item.title, item.category, item.start_time, item.end_time,
            item.location, item.latitude, item.longitude, item.estimated_cost, item.notes, item.order_index
          ]
        );
      }
    }

    // Copy activities
    const originalActivities = await db.all('SELECT * FROM activities WHERE trip_id = ?', [id]);
    for (const act of originalActivities) {
      await db.run(
        `INSERT INTO activities (
          trip_id, name, category, location, latitude, longitude,
          date, start_time, end_time, cost, booking_ref, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newTripId, act.name, act.category, act.location, act.latitude, act.longitude,
          act.date, act.start_time, act.end_time, act.cost, act.booking_ref, act.notes, act.status
        ]
      );
    }

    // Copy accommodations
    const originalAccommodations = await db.all('SELECT * FROM accommodations WHERE trip_id = ?', [id]);
    for (const acc of originalAccommodations) {
      await db.run(
        `INSERT INTO accommodations (
          trip_id, name, type, location, latitude, longitude,
          check_in, check_out, nights, price_per_night, total_cost, booking_ref, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newTripId, acc.name, acc.type, acc.location, acc.latitude, acc.longitude,
          acc.check_in, acc.check_out, acc.nights, acc.price_per_night, acc.total_cost, acc.booking_ref, acc.notes
        ]
      );
    }

    // Copy transportations
    const originalTransports = await db.all('SELECT * FROM transportations WHERE trip_id = ?', [id]);
    for (const tr of originalTransports) {
      await db.run(
        `INSERT INTO transportations (
          trip_id, type, provider, origin, destination,
          departure_time, arrival_time, cost, booking_ref, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newTripId, tr.type, tr.provider, tr.origin, tr.destination,
          tr.departure_time, tr.arrival_time, tr.cost, tr.booking_ref, tr.notes
        ]
      );
    }

    const newTrip = await db.get('SELECT * FROM trips WHERE id = ?', [newTripId]);

    return res.status(201).json({
      message: 'Trip duplicated successfully.',
      trip: newTrip
    });
  } catch (err) {
    console.error('Duplicate trip error:', err);
    return res.status(500).json({ error: 'Failed to duplicate trip.' });
  }
}

async function getTripPhotos(req, res) {
  try {
    const { tripId } = req.params;
    const db = await getDb();
    const photos = await db.all(
      `SELECT p.*, u.name as user_name, u.avatar_url as user_avatar
       FROM trip_photos p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.trip_id = ?
       ORDER BY p.created_at DESC`,
      [tripId]
    );
    return res.json({ photos });
  } catch (err) {
    console.error('Get trip photos error:', err);
    return res.status(500).json({ error: 'Failed to fetch trip photos.' });
  }
}

async function addTripPhoto(req, res) {
  try {
    const { tripId } = req.params;
    const { photo_url, title, caption, location, taken_date } = req.body;

    if (!photo_url || !photo_url.trim()) {
      return res.status(400).json({ error: 'Photo URL is required.' });
    }

    const db = await getDb();
    const trip = await db.get('SELECT id, status FROM trips WHERE id = ?', [tripId]);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const result = await db.run(
      `INSERT INTO trip_photos (trip_id, user_id, photo_url, title, caption, location, taken_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tripId,
        req.user.id,
        photo_url.trim(),
        (title || 'Memorable Moment').trim(),
        (caption || '').trim(),
        (location || '').trim(),
        taken_date || new Date().toISOString().split('T')[0]
      ]
    );

    const newPhoto = await db.get(
      `SELECT p.*, u.name as user_name, u.avatar_url as user_avatar
       FROM trip_photos p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      message: 'Trip photo added successfully!',
      photo: newPhoto
    });
  } catch (err) {
    console.error('Add trip photo error:', err);
    return res.status(500).json({ error: 'Failed to post trip photo.' });
  }
}

async function deleteTripPhoto(req, res) {
  try {
    const { tripId, photoId } = req.params;
    const db = await getDb();

    const photo = await db.get('SELECT * FROM trip_photos WHERE id = ? AND trip_id = ?', [photoId, tripId]);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    if (photo.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied to delete this photo.' });
    }

    await db.run('DELETE FROM trip_photos WHERE id = ?', [photoId]);

    return res.json({ message: 'Trip photo deleted successfully.' });
  } catch (err) {
    console.error('Delete trip photo error:', err);
    return res.status(500).json({ error: 'Failed to delete photo.' });
  }
}

async function likeTripPhoto(req, res) {
  try {
    const { photoId } = req.params;
    const db = await getDb();

    await db.run('UPDATE trip_photos SET likes_count = likes_count + 1 WHERE id = ?', [photoId]);
    const updated = await db.get('SELECT id, likes_count FROM trip_photos WHERE id = ?', [photoId]);

    return res.json({ success: true, likes_count: updated?.likes_count || 0 });
  } catch (err) {
    console.error('Like trip photo error:', err);
    return res.status(500).json({ error: 'Failed to like photo.' });
  }
}

module.exports = {
  getUserTrips,
  getTripById,
  createTrip,
  updateTrip,
  updateTripStatus,
  deleteTrip,
  duplicateTrip,
  getTripPhotos,
  addTripPhoto,
  deleteTripPhoto,
  likeTripPhoto
};
