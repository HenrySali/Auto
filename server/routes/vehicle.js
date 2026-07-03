const express = require('express');
const db = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// === MANTENIMIENTOS PROGRAMADOS ===

// POST /api/vehicle/maintenance
router.post('/maintenance', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, description, due_date, due_km } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    const result = db.prepare(`
      INSERT INTO maintenance_schedule (title, description, due_date, due_km)
      VALUES (?, ?, ?, ?)
    `).run(title, description || null, due_date || null, due_km || null);

    res.status(201).json({ id: result.lastInsertRowid, title, description, due_date, due_km, status: 'pendiente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al programar mantenimiento' });
  }
});

// GET /api/vehicle/maintenance
router.get('/maintenance', authenticateToken, (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM maintenance_schedule WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY due_date ASC';
    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mantenimientos' });
  }
});

// PUT /api/vehicle/maintenance/:id
router.put('/maintenance/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    if (!['pendiente', 'completado', 'vencido'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    db.prepare('UPDATE maintenance_schedule SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Mantenimiento actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar mantenimiento' });
  }
});

// === ALERTAS Y VENCIMIENTOS ===

// POST /api/vehicle/alerts
router.post('/alerts', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, description, due_date, type } = req.body;

    if (!title || !due_date || !type) {
      return res.status(400).json({ error: 'title, due_date y type son requeridos' });
    }

    const result = db.prepare(`
      INSERT INTO alerts (title, description, due_date, type)
      VALUES (?, ?, ?, ?)
    `).run(title, description || null, due_date, type);

    res.status(201).json({ id: result.lastInsertRowid, title, description, due_date, type, status: 'activa' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear alerta' });
  }
});

// GET /api/vehicle/alerts
router.get('/alerts', authenticateToken, (req, res) => {
  try {
    const alerts = db.prepare(
      'SELECT * FROM alerts WHERE status = ? ORDER BY due_date ASC'
    ).all('activa');
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

// PUT /api/vehicle/alerts/:id
router.put('/alerts/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE alerts SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Alerta actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar alerta' });
  }
});

module.exports = router;
