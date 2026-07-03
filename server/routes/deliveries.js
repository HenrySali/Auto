const express = require('express');
const db = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/deliveries - Crear entrega semanal
router.post('/', authenticateToken, (req, res) => {
  try {
    const { week_start, week_end, km_total, amount_paid, notes } = req.body;
    const conductor_id = req.user.role === 'conductor' ? req.user.id : req.body.conductor_id;

    if (!week_start || !week_end) {
      return res.status(400).json({ error: 'week_start y week_end son requeridos' });
    }

    const amount_due = 420000;
    const paid = amount_paid || 0;
    let status = 'pendiente';
    if (paid >= amount_due) status = 'pagado';
    else if (paid > 0) status = 'parcial';

    const result = db.prepare(`
      INSERT INTO weekly_deliveries (conductor_id, week_start, week_end, km_total, amount_due, amount_paid, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(conductor_id, week_start, week_end, km_total || 0, amount_due, paid, status, notes || null);

    res.status(201).json({
      id: result.lastInsertRowid,
      conductor_id,
      week_start,
      week_end,
      km_total,
      amount_due,
      amount_paid: paid,
      status,
      notes
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear entrega semanal' });
  }
});

// GET /api/deliveries - Listar entregas
router.get('/', authenticateToken, (req, res) => {
  try {
    let query = `
      SELECT wd.*, u.name as conductor_name 
      FROM weekly_deliveries wd 
      JOIN users u ON wd.conductor_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'conductor') {
      query += ' AND wd.conductor_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY wd.week_end DESC';

    const deliveries = db.prepare(query).all(...params);
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener entregas' });
  }
});

// PUT /api/deliveries/:id/confirm - Admin confirma entrega
router.put('/:id/confirm', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { amount_paid } = req.body;

    const delivery = db.prepare('SELECT * FROM weekly_deliveries WHERE id = ?').get(id);
    if (!delivery) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    const paid = amount_paid !== undefined ? amount_paid : delivery.amount_paid;
    let status = 'pendiente';
    if (paid >= delivery.amount_due) status = 'pagado';
    else if (paid > 0) status = 'parcial';

    db.prepare(`
      UPDATE weekly_deliveries 
      SET confirmed_by_admin = 1, amount_paid = ?, status = ?
      WHERE id = ?
    `).run(paid, status, id);

    res.json({ message: 'Entrega confirmada', status, amount_paid: paid });
  } catch (error) {
    res.status(500).json({ error: 'Error al confirmar entrega' });
  }
});

// GET /api/deliveries/balance - Balance de deudas
router.get('/balance', authenticateToken, (req, res) => {
  try {
    let query = `
      SELECT 
        conductor_id,
        SUM(amount_due) as total_due,
        SUM(amount_paid) as total_paid,
        SUM(amount_due - amount_paid) as total_debt,
        COUNT(*) as total_weeks
      FROM weekly_deliveries
    `;
    const params = [];

    if (req.user.role === 'conductor') {
      query += ' WHERE conductor_id = ?';
      params.push(req.user.id);
    }

    query += ' GROUP BY conductor_id';

    const balance = db.prepare(query).all(...params);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener balance' });
  }
});

module.exports = router;
