const { getDb } = require('../db');

async function verifyTripOwnership(db, tripId, userId, userRole) {
  const trip = await db.get('SELECT user_id FROM trips WHERE id = ?', [tripId]);
  if (!trip) return null;
  if (trip.user_id !== userId && userRole !== 'admin') return false;
  return trip;
}

async function getTransportation(req, res) {
  try {
    const { tripId } = req.params;
    const db = await getDb();

    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    const transportations = await db.all(
      'SELECT * FROM transportations WHERE trip_id = ? ORDER BY departure_time ASC',
      [tripId]
    );

    return res.json({ transportations });
  } catch (err) {
    console.error('Get transportation error:', err);
    return res.status(500).json({ error: 'Failed to fetch transportation records.' });
  }
}

async function createTransportation(req, res) {
  try {
    const { tripId } = req.params;
    const {
      type,
      provider,
      origin,
      destination,
      departure_time,
      arrival_time,
      cost,
      booking_ref,
      notes
    } = req.body;

    if (!type || !origin || !destination) {
      return res.status(400).json({ error: 'Transport type, origin, and destination are required.' });
    }

    const db = await getDb();
    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    const result = await db.run(
      `INSERT INTO transportations (
        trip_id, type, provider, origin, destination,
        departure_time, arrival_time, cost, booking_ref, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tripId,
        type,
        provider || '',
        origin.trim(),
        destination.trim(),
        departure_time || null,
        arrival_time || null,
        parseFloat(cost) || 0,
        booking_ref || '',
        notes || ''
      ]
    );

    const newTransport = await db.get('SELECT * FROM transportations WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Transportation added successfully.',
      transportation: newTransport
    });
  } catch (err) {
    console.error('Create transportation error:', err);
    return res.status(500).json({ error: 'Failed to add transportation.' });
  }
}

async function updateTransportation(req, res) {
  try {
    const { tripId, id } = req.params;
    const {
      type,
      provider,
      origin,
      destination,
      departure_time,
      arrival_time,
      cost,
      booking_ref,
      notes
    } = req.body;

    const db = await getDb();
    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    await db.run(
      `UPDATE transportations SET
        type = COALESCE(?, type),
        provider = COALESCE(?, provider),
        origin = COALESCE(?, origin),
        destination = COALESCE(?, destination),
        departure_time = COALESCE(?, departure_time),
        arrival_time = COALESCE(?, arrival_time),
        cost = COALESCE(?, cost),
        booking_ref = COALESCE(?, booking_ref),
        notes = COALESCE(?, notes)
      WHERE id = ? AND trip_id = ?`,
      [
        type,
        provider,
        origin ? origin.trim() : undefined,
        destination ? destination.trim() : undefined,
        departure_time,
        arrival_time,
        cost !== undefined ? parseFloat(cost) : undefined,
        booking_ref,
        notes,
        id,
        tripId
      ]
    );

    const updated = await db.get('SELECT * FROM transportations WHERE id = ?', [id]);

    return res.json({
      message: 'Transportation updated successfully.',
      transportation: updated
    });
  } catch (err) {
    console.error('Update transportation error:', err);
    return res.status(500).json({ error: 'Failed to update transportation.' });
  }
}

async function deleteTransportation(req, res) {
  try {
    const { tripId, id } = req.params;
    const db = await getDb();

    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    await db.run('DELETE FROM transportations WHERE id = ? AND trip_id = ?', [id, tripId]);

    return res.json({ message: 'Transportation deleted successfully.' });
  } catch (err) {
    console.error('Delete transportation error:', err);
    return res.status(500).json({ error: 'Failed to delete transportation.' });
  }
}

module.exports = {
  getTransportation,
  createTransportation,
  updateTransportation,
  deleteTransportation
};
