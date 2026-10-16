const { getDb } = require('../db');

// Helper to check trip ownership
async function verifyTripOwnership(db, tripId, userId, userRole) {
  const trip = await db.get('SELECT user_id FROM trips WHERE id = ?', [tripId]);
  if (!trip) return null;
  if (trip.user_id !== userId && userRole !== 'admin') return false;
  return trip;
}

// Add a new itinerary day
async function addDay(req, res) {
  try {
    const { tripId } = req.params;
    const { title, date, notes } = req.body;
    const db = await getDb();

    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    // Determine next day number
    const lastDay = await db.get(
      'SELECT MAX(day_number) as max_day FROM itinerary_days WHERE trip_id = ?',
      [tripId]
    );
    const day_number = (lastDay && lastDay.max_day ? lastDay.max_day : 0) + 1;

    const result = await db.run(
      `INSERT INTO itinerary_days (trip_id, day_number, date, title, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [tripId, day_number, date || new Date().toISOString().split('T')[0], title || `Day ${day_number}`, notes || '']
    );

    const newDay = await db.get('SELECT * FROM itinerary_days WHERE id = ?', [result.lastID]);
    newDay.items = [];

    return res.status(201).json({ message: 'Day added successfully.', day: newDay });
  } catch (err) {
    console.error('Add day error:', err);
    return res.status(500).json({ error: 'Failed to add day.' });
  }
}

// Delete an itinerary day
async function deleteDay(req, res) {
  try {
    const { tripId, dayId } = req.params;
    const db = await getDb();

    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    await db.run('DELETE FROM itinerary_days WHERE id = ? AND trip_id = ?', [dayId, tripId]);

    return res.json({ message: 'Day deleted successfully.' });
  } catch (err) {
    console.error('Delete day error:', err);
    return res.status(500).json({ error: 'Failed to delete day.' });
  }
}

// Add an itinerary item
async function addItem(req, res) {
  try {
    const { tripId } = req.params;
    const {
      day_id,
      title,
      category,
      start_time,
      end_time,
      location,
      latitude,
      longitude,
      estimated_cost,
      notes
    } = req.body;

    if (!day_id || !title) {
      return res.status(400).json({ error: 'Day ID and Title are required.' });
    }

    const db = await getDb();
    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    // Validate times if both provided
    if (start_time && end_time && start_time > end_time) {
      return res.status(400).json({ error: 'Start time cannot be after end time.' });
    }

    const maxOrder = await db.get(
      'SELECT MAX(order_index) as max_idx FROM itinerary_items WHERE day_id = ?',
      [day_id]
    );
    const order_index = (maxOrder && maxOrder.max_idx !== null ? maxOrder.max_idx : -1) + 1;

    const result = await db.run(
      `INSERT INTO itinerary_items (
        day_id, trip_id, title, category, start_time, end_time,
        location, latitude, longitude, estimated_cost, notes, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        day_id,
        tripId,
        title.trim(),
        category || 'Sightseeing',
        start_time || null,
        end_time || null,
        location || '',
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        parseFloat(estimated_cost) || 0,
        notes || '',
        order_index
      ]
    );

    const newItem = await db.get('SELECT * FROM itinerary_items WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Itinerary item added successfully.',
      item: newItem
    });
  } catch (err) {
    console.error('Add itinerary item error:', err);
    return res.status(500).json({ error: 'Failed to add itinerary item.' });
  }
}

// Update an itinerary item
async function updateItem(req, res) {
  try {
    const { tripId, itemId } = req.params;
    const {
      day_id,
      title,
      category,
      start_time,
      end_time,
      location,
      latitude,
      longitude,
      estimated_cost,
      notes,
      order_index
    } = req.body;

    const db = await getDb();
    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    if (start_time && end_time && start_time > end_time) {
      return res.status(400).json({ error: 'Start time cannot be after end time.' });
    }

    await db.run(
      `UPDATE itinerary_items SET
        day_id = COALESCE(?, day_id),
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        location = COALESCE(?, location),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        estimated_cost = COALESCE(?, estimated_cost),
        notes = COALESCE(?, notes),
        order_index = COALESCE(?, order_index)
      WHERE id = ? AND trip_id = ?`,
      [
        day_id,
        title ? title.trim() : undefined,
        category,
        start_time,
        end_time,
        location,
        latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude !== undefined ? parseFloat(longitude) : undefined,
        estimated_cost !== undefined ? parseFloat(estimated_cost) : undefined,
        notes,
        order_index,
        itemId,
        tripId
      ]
    );

    const updatedItem = await db.get('SELECT * FROM itinerary_items WHERE id = ?', [itemId]);

    return res.json({
      message: 'Itinerary item updated successfully.',
      item: updatedItem
    });
  } catch (err) {
    console.error('Update itinerary item error:', err);
    return res.status(500).json({ error: 'Failed to update itinerary item.' });
  }
}

// Delete an itinerary item
async function deleteItem(req, res) {
  try {
    const { tripId, itemId } = req.params;
    const db = await getDb();

    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    await db.run('DELETE FROM itinerary_items WHERE id = ? AND trip_id = ?', [itemId, tripId]);

    return res.json({ message: 'Itinerary item deleted successfully.' });
  } catch (err) {
    console.error('Delete itinerary item error:', err);
    return res.status(500).json({ error: 'Failed to delete itinerary item.' });
  }
}

// Reorder items in a day
async function reorderItems(req, res) {
  try {
    const { tripId } = req.params;
    const { itemIds } = req.body; // Array of IDs in order

    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ error: 'itemIds array is required.' });
    }

    const db = await getDb();
    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    for (let i = 0; i < itemIds.length; i++) {
      await db.run(
        'UPDATE itinerary_items SET order_index = ? WHERE id = ? AND trip_id = ?',
        [i, itemIds[i], tripId]
      );
    }

    return res.json({ message: 'Items reordered successfully.' });
  } catch (err) {
    console.error('Reorder items error:', err);
    return res.status(500).json({ error: 'Failed to reorder items.' });
  }
}

module.exports = {
  addDay,
  deleteDay,
  addItem,
  updateItem,
  deleteItem,
  reorderItems
};
