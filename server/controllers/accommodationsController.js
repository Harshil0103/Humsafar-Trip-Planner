const { getDb } = require('../db');

async function verifyTripOwnership(db, tripId, userId, userRole) {
  const trip = await db.get('SELECT user_id FROM trips WHERE id = ?', [tripId]);
  if (!trip) return null;
  if (trip.user_id !== userId && userRole !== 'admin') return false;
  return trip;
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  return diff;
}

async function getAccommodations(req, res) {
  try {
    const { tripId } = req.params;
    const db = await getDb();

    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    const accommodations = await db.all(
      'SELECT * FROM accommodations WHERE trip_id = ? ORDER BY check_in ASC',
      [tripId]
    );

    return res.json({ accommodations });
  } catch (err) {
    console.error('Get accommodations error:', err);
    return res.status(500).json({ error: 'Failed to fetch accommodations.' });
  }
}

async function createAccommodation(req, res) {
  try {
    const { tripId } = req.params;
    const {
      name,
      type,
      location,
      latitude,
      longitude,
      check_in,
      check_out,
      nights,
      price_per_night,
      total_cost,
      booking_ref,
      notes
    } = req.body;

    if (!name || !check_in || !check_out) {
      return res.status(400).json({ error: 'Hotel name, check-in, and check-out dates are required.' });
    }

    if (new Date(check_in) > new Date(check_out)) {
      return res.status(400).json({ error: 'Check-in date cannot be after check-out date.' });
    }

    const db = await getDb();
    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    const computedNights = nights ? parseInt(nights, 10) : calculateNights(check_in, check_out);
    const nightlyPrice = parseFloat(price_per_night) || 0;
    const computedTotal = total_cost !== undefined && total_cost !== null && total_cost !== '' 
      ? parseFloat(total_cost) 
      : (nightlyPrice * computedNights);

    const result = await db.run(
      `INSERT INTO accommodations (
        trip_id, name, type, location, latitude, longitude,
        check_in, check_out, nights, price_per_night, total_cost,
        booking_ref, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tripId,
        name.trim(),
        type || 'Hotel',
        location || '',
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        check_in,
        check_out,
        computedNights,
        nightlyPrice,
        computedTotal,
        booking_ref || '',
        notes || ''
      ]
    );

    const newAcc = await db.get('SELECT * FROM accommodations WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Accommodation added successfully.',
      accommodation: newAcc
    });
  } catch (err) {
    console.error('Create accommodation error:', err);
    return res.status(500).json({ error: 'Failed to add accommodation.' });
  }
}

async function updateAccommodation(req, res) {
  try {
    const { tripId, id } = req.params;
    const {
      name,
      type,
      location,
      latitude,
      longitude,
      check_in,
      check_out,
      nights,
      price_per_night,
      total_cost,
      booking_ref,
      notes
    } = req.body;

    const db = await getDb();
    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    if (check_in && check_out && new Date(check_in) > new Date(check_out)) {
      return res.status(400).json({ error: 'Check-in date cannot be after check-out date.' });
    }

    const current = await db.get('SELECT * FROM accommodations WHERE id = ? AND trip_id = ?', [id, tripId]);
    if (!current) return res.status(404).json({ error: 'Accommodation not found.' });

    const newCheckIn = check_in || current.check_in;
    const newCheckOut = check_out || current.check_out;
    const computedNights = nights !== undefined ? parseInt(nights, 10) : calculateNights(newCheckIn, newCheckOut);
    const nightlyPrice = price_per_night !== undefined ? parseFloat(price_per_night) : current.price_per_night;
    const computedTotal = total_cost !== undefined ? parseFloat(total_cost) : (nightlyPrice * computedNights);

    await db.run(
      `UPDATE accommodations SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        location = COALESCE(?, location),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        check_in = COALESCE(?, check_in),
        check_out = COALESCE(?, check_out),
        nights = ?,
        price_per_night = ?,
        total_cost = ?,
        booking_ref = COALESCE(?, booking_ref),
        notes = COALESCE(?, notes)
      WHERE id = ? AND trip_id = ?`,
      [
        name ? name.trim() : undefined,
        type,
        location,
        latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude !== undefined ? parseFloat(longitude) : undefined,
        check_in,
        check_out,
        computedNights,
        nightlyPrice,
        computedTotal,
        booking_ref,
        notes,
        id,
        tripId
      ]
    );

    const updated = await db.get('SELECT * FROM accommodations WHERE id = ?', [id]);

    return res.json({
      message: 'Accommodation updated successfully.',
      accommodation: updated
    });
  } catch (err) {
    console.error('Update accommodation error:', err);
    return res.status(500).json({ error: 'Failed to update accommodation.' });
  }
}

async function deleteAccommodation(req, res) {
  try {
    const { tripId, id } = req.params;
    const db = await getDb();

    const ownership = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (ownership === null) return res.status(404).json({ error: 'Trip not found.' });
    if (ownership === false) return res.status(403).json({ error: 'Access denied.' });

    await db.run('DELETE FROM accommodations WHERE id = ? AND trip_id = ?', [id, tripId]);

    return res.json({ message: 'Accommodation deleted successfully.' });
  } catch (err) {
    console.error('Delete accommodation error:', err);
    return res.status(500).json({ error: 'Failed to delete accommodation.' });
  }
}

module.exports = {
  getAccommodations,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation
};
