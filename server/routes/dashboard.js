const express = require('express');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard - Resumen general
router.get('/', authenticateToken, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalIncome = db.prepare(
      'SELECT COALESCE(SUM(amount_paid), 0) as total FROM weekly_deliveries'
    ).get();

    const totalExpenses = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM vehicle_expenses'
    ).get();

    const totalDebt = db.prepare(
      'SELECT COALESCE(SUM(amount_due - amount_paid), 0) as total FROM weekly_deliveries WHERE status != ?'
    ).get('pagado');

    const lastDelivery = db.prepare(
      'SELECT * FROM weekly_deliveries ORDER BY week_end DESC LIMIT 1'
    ).get();

    const lastKm = db.prepare(
      'SELECT * FROM daily_km ORDER BY date DESC LIMIT 1'
    ).get();

    const upcomingAlerts = db.prepare(`
      SELECT * FROM alerts 
      WHERE status = 'activa' AND due_date <= date(?, '+30 days')
      ORDER BY due_date ASC
    `).all(today);

    const pendingMaintenance = db.prepare(
      "SELECT * FROM maintenance_schedule WHERE status = 'pendiente' ORDER BY due_date ASC LIMIT 5"
    ).all();

    const field = req.user.role === 'admin' ? 'read_by_admin' : 'read_by_conductor';
    const unreadNotes = db.prepare(
      `SELECT COUNT(*) as count FROM notes WHERE ${field} = 0`
    ).get();

    const last4Weeks = db.prepare(
      'SELECT * FROM weekly_deliveries ORDER BY week_end DESC LIMIT 4'
    ).all();

    res.json({
      income: { total: totalIncome.total, net_profit: totalIncome.total - totalExpenses.total },
      expenses: { total: totalExpenses.total },
      debt: { total: totalDebt.total },
      last_delivery: lastDelivery || null,
      last_km: lastKm || null,
      upcoming_alerts: upcomingAlerts,
      pending_maintenance: pendingMaintenance,
      unread_notes: unreadNotes.count,
      recent_weeks: last4Weeks
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
});

module.exports = router;
