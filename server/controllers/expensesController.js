const { getDb } = require('../db');

async function verifyTripOwnership(db, tripId, userId, userRole) {
  const trip = await db.get('SELECT user_id, estimated_budget FROM trips WHERE id = ?', [tripId]);
  if (!trip) return null;
  if (trip.user_id !== userId && userRole !== 'admin') return false;
  return trip;
}

async function getExpenses(req, res) {
  try {
    const { tripId } = req.params;
    const db = await getDb();

    const trip = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (trip === null) return res.status(404).json({ error: 'Trip not found.' });
    if (trip === false) return res.status(403).json({ error: 'Access denied.' });

    const expenses = await db.all(
      'SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC, created_at DESC',
      [tripId]
    );

    const totalSpent = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const estimatedBudget = parseFloat(trip.estimated_budget) || 0;
    const remainingBudget = estimatedBudget - totalSpent;

    const categoryBreakdown = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + (parseFloat(exp.amount) || 0);
      return acc;
    }, {});

    return res.json({
      expenses,
      summary: {
        estimated_budget: estimatedBudget,
        total_spent: totalSpent,
        remaining_budget: remainingBudget,
        is_over_budget: totalSpent > estimatedBudget,
        category_breakdown: categoryBreakdown
      }
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    return res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
}

async function createExpense(req, res) {
  try {
    const { tripId } = req.params;
    const { category, title, amount, date, payment_method, notes } = req.body;

    if (!category || !title || amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Category, title, and amount are required.' });
    }

    if (parseFloat(amount) < 0) {
      return res.status(400).json({ error: 'Expense amount cannot be negative.' });
    }

    const db = await getDb();
    const trip = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (trip === null) return res.status(404).json({ error: 'Trip not found.' });
    if (trip === false) return res.status(403).json({ error: 'Access denied.' });

    const expenseDate = date || new Date().toISOString().split('T')[0];

    const result = await db.run(
      `INSERT INTO expenses (
        trip_id, category, title, amount, date, payment_method, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tripId,
        category,
        title.trim(),
        parseFloat(amount),
        expenseDate,
        payment_method || 'Credit Card',
        notes || ''
      ]
    );

    const newExpense = await db.get('SELECT * FROM expenses WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Expense added successfully.',
      expense: newExpense
    });
  } catch (err) {
    console.error('Create expense error:', err);
    return res.status(500).json({ error: 'Failed to add expense.' });
  }
}

async function updateExpense(req, res) {
  try {
    const { tripId, id } = req.params;
    const { category, title, amount, date, payment_method, notes } = req.body;

    const db = await getDb();
    const trip = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (trip === null) return res.status(404).json({ error: 'Trip not found.' });
    if (trip === false) return res.status(403).json({ error: 'Access denied.' });

    if (amount !== undefined && parseFloat(amount) < 0) {
      return res.status(400).json({ error: 'Expense amount cannot be negative.' });
    }

    await db.run(
      `UPDATE expenses SET
        category = COALESCE(?, category),
        title = COALESCE(?, title),
        amount = COALESCE(?, amount),
        date = COALESCE(?, date),
        payment_method = COALESCE(?, payment_method),
        notes = COALESCE(?, notes)
      WHERE id = ? AND trip_id = ?`,
      [
        category,
        title ? title.trim() : undefined,
        amount !== undefined ? parseFloat(amount) : undefined,
        date,
        payment_method,
        notes,
        id,
        tripId
      ]
    );

    const updated = await db.get('SELECT * FROM expenses WHERE id = ?', [id]);

    return res.json({
      message: 'Expense updated successfully.',
      expense: updated
    });
  } catch (err) {
    console.error('Update expense error:', err);
    return res.status(500).json({ error: 'Failed to update expense.' });
  }
}

async function deleteExpense(req, res) {
  try {
    const { tripId, id } = req.params;
    const db = await getDb();

    const trip = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (trip === null) return res.status(404).json({ error: 'Trip not found.' });
    if (trip === false) return res.status(403).json({ error: 'Access denied.' });

    await db.run('DELETE FROM expenses WHERE id = ? AND trip_id = ?', [id, tripId]);

    return res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    console.error('Delete expense error:', err);
    return res.status(500).json({ error: 'Failed to delete expense.' });
  }
}

// Packing items support
async function getPackingItems(req, res) {
  try {
    const { tripId } = req.params;
    const db = await getDb();

    const trip = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (trip === null) return res.status(404).json({ error: 'Trip not found.' });
    if (trip === false) return res.status(403).json({ error: 'Access denied.' });

    const items = await db.all('SELECT * FROM packing_items WHERE trip_id = ? ORDER BY id ASC', [tripId]);
    return res.json({ items });
  } catch (err) {
    console.error('Get packing items error:', err);
    return res.status(500).json({ error: 'Failed to fetch packing items.' });
  }
}

async function addPackingItem(req, res) {
  try {
    const { tripId } = req.params;
    const { item_name, category } = req.body;
    if (!item_name) return res.status(400).json({ error: 'Item name is required.' });

    const db = await getDb();
    const trip = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (trip === null) return res.status(404).json({ error: 'Trip not found.' });
    if (trip === false) return res.status(403).json({ error: 'Access denied.' });

    const result = await db.run(
      'INSERT INTO packing_items (trip_id, item_name, category, is_packed) VALUES (?, ?, ?, 0)',
      [tripId, item_name.trim(), category || 'General']
    );

    const newItem = await db.get('SELECT * FROM packing_items WHERE id = ?', [result.lastID]);
    return res.status(201).json({ item: newItem });
  } catch (err) {
    console.error('Add packing item error:', err);
    return res.status(500).json({ error: 'Failed to add packing item.' });
  }
}

async function togglePackingItem(req, res) {
  try {
    const { tripId, id } = req.params;
    const db = await getDb();

    const trip = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (trip === null) return res.status(404).json({ error: 'Trip not found.' });
    if (trip === false) return res.status(403).json({ error: 'Access denied.' });

    const item = await db.get('SELECT is_packed FROM packing_items WHERE id = ? AND trip_id = ?', [id, tripId]);
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    const newStatus = item.is_packed ? 0 : 1;
    await db.run('UPDATE packing_items SET is_packed = ? WHERE id = ?', [newStatus, id]);

    return res.json({ message: 'Status updated.', is_packed: newStatus });
  } catch (err) {
    console.error('Toggle packing item error:', err);
    return res.status(500).json({ error: 'Failed to toggle item status.' });
  }
}

async function deletePackingItem(req, res) {
  try {
    const { tripId, id } = req.params;
    const db = await getDb();

    const trip = await verifyTripOwnership(db, tripId, req.user.id, req.user.role);
    if (trip === null) return res.status(404).json({ error: 'Trip not found.' });
    if (trip === false) return res.status(403).json({ error: 'Access denied.' });

    await db.run('DELETE FROM packing_items WHERE id = ? AND trip_id = ?', [id, tripId]);
    return res.json({ message: 'Packing item removed.' });
  } catch (err) {
    console.error('Delete packing item error:', err);
    return res.status(500).json({ error: 'Failed to delete packing item.' });
  }
}

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getPackingItems,
  addPackingItem,
  togglePackingItem,
  deletePackingItem
};
