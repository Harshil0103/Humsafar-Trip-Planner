const { getDb } = require('../db');

async function verifyTripOwnership(db, tripId, userId, userRole) {
  const trip = await db.get('SELECT user_id FROM trips WHERE id = ?', [tripId]);
  if (!trip) return null;
  if (trip.user_id !== userId && userRole !== 'admin') return false;
  return trip;
}

async function getActivities(req, res) {
  try {
    const { tripId } = req.params;
    const db = await getDb();

    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    const activities = await db.all(
      'SELECT * FROM activities WHERE trip_id = ? ORDER BY date ASC, start_time ASC',
      [tripId]
    );

    return res.json({ activities });
  } catch (err) {
    console.error('Get activities error:', err);
    return res.status(500).json({ error: 'Failed to fetch activities.' });
  }
}

async function createActivity(req, res) {
  try {
    const { tripId } = req.params;
    const {
      name,
      category,
      location,
      latitude,
      longitude,
      date,
      start_time,
      end_time,
      cost,
      booking_ref,
      notes,
      status
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Activity name is required.' });
    }

    const db = await getDb();
    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    const result = await db.run(
      `INSERT INTO activities (
        trip_id, name, category, location, latitude, longitude,
        date, start_time, end_time, cost, booking_ref, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tripId,
        name.trim(),
        category || 'Sightseeing',
        location || '',
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        date || null,
        start_time || null,
        end_time || null,
        parseFloat(cost) || 0,
        booking_ref || '',
        notes || '',
        status || 'planned'
      ]
    );

    const newActivity = await db.get('SELECT * FROM activities WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Activity created successfully.',
      activity: newActivity
    });
  } catch (err) {
    console.error('Create activity error:', err);
    return res.status(500).json({ error: 'Failed to create activity.' });
  }
}

async function updateActivity(req, res) {
  try {
    const { tripId, id } = req.params;
    const {
      name,
      category,
      location,
      latitude,
      longitude,
      date,
      start_time,
      end_time,
      cost,
      booking_ref,
      notes,
      status
    } = req.body;

    const db = await getDb();
    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    await db.run(
      `UPDATE activities SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        location = COALESCE(?, location),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        date = COALESCE(?, date),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        cost = COALESCE(?, cost),
        booking_ref = COALESCE(?, booking_ref),
        notes = COALESCE(?, notes),
        status = COALESCE(?, status)
      WHERE id = ? AND trip_id = ?`,
      [
        name ? name.trim() : undefined,
        category,
        location,
        latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude !== undefined ? parseFloat(longitude) : undefined,
        date,
        start_time,
        end_time,
        cost !== undefined ? parseFloat(cost) : undefined,
        booking_ref,
        notes,
        status,
        id,
        tripId
      ]
    );

    const updated = await db.get('SELECT * FROM activities WHERE id = ?', [id]);

    return res.json({
      message: 'Activity updated successfully.',
      activity: updated
    });
  } catch (err) {
    console.error('Update activity error:', err);
    return res.status(500).json({ error: 'Failed to update activity.' });
  }
}

async function deleteActivity(req, res) {
  try {
    const { tripId, id } = req.params;
    const db = await getDb();

    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    await db.run('DELETE FROM activities WHERE id = ? AND trip_id = ?', [id, tripId]);

    return res.json({ message: 'Activity deleted successfully.' });
  } catch (err) {
    console.error('Delete activity error:', err);
    return res.status(500).json({ error: 'Failed to delete activity.' });
  }
}

module.exports = {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
};
