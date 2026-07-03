const express = require('express');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/km - Registrar km del día
router.post('/', authenticateToken, (req, res) => {
  try {
    const { km_start, km_end, date, notes } = req.body;
    const conductor_id = req.user.id;

    if (km_start === undefined || km_end === undefined) {
      return res.status(400).json({ error: 'km_start y km_end son requeridos' });
    }

    if (km_end < km_start) {
      return res.status(400).json({ error: 'km_end no puede ser menor que km_start' });
    }

    const recordDate = date || new Date().toISOString().split('T')[0];

    const result = db.prepare(
      'INSERT OR REPLACE INTO daily_km (conductor_id, date, km_start, km_end, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(conductor_id, recordDate, km_start, km_end, notes || null);

    res.status(201).json({
      id: result.lastInsertRowid,
      conductor_id,
      date: recordDate,
      km_start,
      km_end,
      km_driven: km_end - km_start,
      notes
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar kilometraje' });
  }
});

// GET /api/km - Obtener registros de km
router.get('/', authenticateToken, (req, res) => {
  try {
    const { from, to, conductor_id } = req.query;

    let query = 'SELECT dk.*, u.name as conductor_name FROM daily_km dk JOIN users u ON dk.conductor_id = u.id WHERE 1=1';
    const params = [];

    if (req.user.role === 'conductor') {
      query += ' AND dk.conductor_id = ?';
      params.push(req.user.id);
    } else if (conductor_id) {
      query += ' AND dk.conductor_id = ?';
      params.push(conductor_id);
    }

    if (from) {
      query += ' AND dk.date >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND dk.date <= ?';
      params.push(to);
    }

    query += ' ORDER BY dk.date DESC';

    const records = db.prepare(query).all(...params);
    res.json(records.map(r => ({ ...r, km_driven: r.km_end - r.km_start })));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener registros' });
  }
});

// GET /api/km/today - Obtener registro de hoy
router.get('/today', authenticateToken, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const record = db.prepare(
      'SELECT * FROM daily_km WHERE conductor_id = ? AND date = ?'
    ).get(req.user.id, today);

    res.json(record || null);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener registro de hoy' });
  }
});

// GET /api/km/week-summary - Resumen semanal
router.get('/week-summary', authenticateToken, (req, res) => {
  try {
    const { week_start, week_end } = req.query;

    let query = `
      SELECT 
        conductor_id,
        MIN(km_start) as week_km_start,
        MAX(km_end) as week_km_end,
        SUM(km_end - km_start) as total_km,
        COUNT(*) as days_registered
      FROM daily_km 
      WHERE date >= ? AND date <= ?
    `;
    const params = [week_start, week_end];

    if (req.user.role === 'conductor') {
      query += ' AND conductor_id = ?';
      params.push(req.user.id);
    }

    query += ' GROUP BY conductor_id';

    const summary = db.prepare(query).all(...params);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen semanal' });
  }
});

module.exports = router;
