const { getDb } = require('../db');

async function getDestinations(req, res) {
  try {
    const { search, country, region, minCost, maxCost, sort } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM destinations WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR country LIKE ? OR city LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (country) {
      query += ' AND LOWER(country) = LOWER(?)';
      params.push(country.trim());
    }

    if (region) {
      query += ' AND LOWER(region) = LOWER(?)';
      params.push(region.trim());
    }

    if (minCost) {
      query += ' AND estimated_daily_cost >= ?';
      params.push(parseFloat(minCost));
    }

    if (maxCost) {
      query += ' AND estimated_daily_cost <= ?';
      params.push(parseFloat(maxCost));
    }

    // Sorting
    if (sort === 'cost_asc') {
      query += ' ORDER BY estimated_daily_cost ASC';
    } else if (sort === 'cost_desc') {
      query += ' ORDER BY estimated_daily_cost DESC';
    } else if (sort === 'name') {
      query += ' ORDER BY name ASC';
    } else if (sort === 'rating') {
      query += ' ORDER BY rating DESC';
    } else {
      query += ' ORDER BY rating DESC, name ASC';
    }

    const destinations = await db.all(query, params);

    const parsedDestinations = destinations.map(d => ({
      ...d,
      popular_attractions: d.popular_attractions ? JSON.parse(d.popular_attractions) : [],
      recommended_activities: d.recommended_activities ? JSON.parse(d.recommended_activities) : []
    }));

    return res.json({ destinations: parsedDestinations });
  } catch (err) {
    console.error('Get destinations error:', err);
    return res.status(500).json({ error: 'Failed to fetch destinations.' });
  }
}

async function getDestinationById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const destination = await db.get('SELECT * FROM destinations WHERE id = ?', [id]);
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    const parsed = {
      ...destination,
      popular_attractions: destination.popular_attractions ? JSON.parse(destination.popular_attractions) : [],
      recommended_activities: destination.recommended_activities ? JSON.parse(destination.recommended_activities) : []
    };

    return res.json({ destination: parsed });
  } catch (err) {
    console.error('Get destination error:', err);
    return res.status(500).json({ error: 'Failed to fetch destination details.' });
  }
}

async function createDestination(req, res) {
  try {
    const {
      name,
      country,
      city,
      region,
      description,
      image_url,
      popular_attractions,
      recommended_activities,
      estimated_daily_cost,
      best_time_to_visit,
      latitude,
      longitude,
      rating
    } = req.body;

    if (!name || !country || !city || !description || !image_url) {
      return res.status(400).json({ error: 'Name, country, city, description, and image URL are required.' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO destinations (
        name, country, city, region, description, image_url,
        popular_attractions, recommended_activities, estimated_daily_cost,
        best_time_to_visit, latitude, longitude, rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        country.trim(),
        city.trim(),
        region || 'Global',
        description.trim(),
        image_url.trim(),
        JSON.stringify(popular_attractions || []),
        JSON.stringify(recommended_activities || []),
        parseFloat(estimated_daily_cost) || 100,
        best_time_to_visit || 'Year-round',
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        parseFloat(rating) || 4.8
      ]
    );

    const newDest = await db.get('SELECT * FROM destinations WHERE id = ?', [result.lastID]);
    newDest.popular_attractions = JSON.parse(newDest.popular_attractions || '[]');
    newDest.recommended_activities = JSON.parse(newDest.recommended_activities || '[]');

    return res.status(201).json({
      message: 'Destination created successfully.',
      destination: newDest
    });
  } catch (err) {
    console.error('Create destination error:', err);
    return res.status(500).json({ error: 'Failed to create destination.' });
  }
}

async function updateDestination(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      country,
      city,
      region,
      description,
      image_url,
      popular_attractions,
      recommended_activities,
      estimated_daily_cost,
      best_time_to_visit,
      latitude,
      longitude,
      rating
    } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT id FROM destinations WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    await db.run(
      `UPDATE destinations SET
        name = COALESCE(?, name),
        country = COALESCE(?, country),
        city = COALESCE(?, city),
        region = COALESCE(?, region),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        popular_attractions = COALESCE(?, popular_attractions),
        recommended_activities = COALESCE(?, recommended_activities),
        estimated_daily_cost = COALESCE(?, estimated_daily_cost),
        best_time_to_visit = COALESCE(?, best_time_to_visit),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        rating = COALESCE(?, rating)
      WHERE id = ?`,
      [
        name,
        country,
        city,
        region,
        description,
        image_url,
        popular_attractions ? JSON.stringify(popular_attractions) : undefined,
        recommended_activities ? JSON.stringify(recommended_activities) : undefined,
        estimated_daily_cost ? parseFloat(estimated_daily_cost) : undefined,
        best_time_to_visit,
        latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude !== undefined ? parseFloat(longitude) : undefined,
        rating ? parseFloat(rating) : undefined,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM destinations WHERE id = ?', [id]);
    updated.popular_attractions = JSON.parse(updated.popular_attractions || '[]');
    updated.recommended_activities = JSON.parse(updated.recommended_activities || '[]');

    return res.json({
      message: 'Destination updated successfully.',
      destination: updated
    });
  } catch (err) {
    console.error('Update destination error:', err);
    return res.status(500).json({ error: 'Failed to update destination.' });
  }
}

async function deleteDestination(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const existing = await db.get('SELECT id FROM destinations WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    await db.run('DELETE FROM destinations WHERE id = ?', [id]);

    return res.json({ message: 'Destination deleted successfully.' });
  } catch (err) {
    console.error('Delete destination error:', err);
    return res.status(500).json({ error: 'Failed to delete destination.' });
  }
}

module.exports = {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
};
