const { getDb } = require('../db');

async function getStats(req, res) {
  try {
    const db = await getDb();

    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    const destinationsCount = await db.get('SELECT COUNT(*) as count FROM destinations');
    const tripsCount = await db.get('SELECT COUNT(*) as count FROM trips');
    const activeTripsCount = await db.get("SELECT COUNT(*) as count FROM trips WHERE status = 'active'");
    const totalExpenses = await db.get('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
    const totalActivities = await db.get('SELECT COUNT(*) as count FROM activities');

    const topDestinations = await db.all(`
      SELECT destination_name, COUNT(*) as trip_count
      FROM trips
      GROUP BY destination_name
      ORDER BY trip_count DESC
      LIMIT 5
    `);

    const recentUsers = await db.all(`
      SELECT id, name, email, role, avatar_url, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);

    return res.json({
      stats: {
        total_users: usersCount.count,
        total_destinations: destinationsCount.count,
        total_trips: tripsCount.count,
        active_trips: activeTripsCount.count,
        total_expenses: totalExpenses.total,
        total_activities: totalActivities.count,
        top_destinations: topDestinations,
        recent_users: recentUsers
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
}

async function getUsers(req, res) {
  try {
    const db = await getDb();
    const users = await db.all(`
      SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.bio, u.created_at,
        (SELECT COUNT(*) FROM trips WHERE user_id = u.id) as trips_count
      FROM users u
      ORDER BY u.created_at DESC
    `);

    return res.json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "user" or "admin".' });
    }

    const db = await getDb();
    const user = await db.get('SELECT id, email FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent removing admin from own account if sole admin
    if (user.id === req.user.id && role !== 'admin') {
      const adminCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
      if (adminCount.count <= 1) {
        return res.status(400).json({ error: 'Cannot demote the last remaining administrator.' });
      }
    }

    await db.run('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [role, id]);

    return res.json({ message: `User role updated to ${role}.` });
  } catch (err) {
    console.error('Admin update role error:', err);
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const user = await db.get('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account from the admin dashboard.' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [id]);

    return res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
}

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser
};
